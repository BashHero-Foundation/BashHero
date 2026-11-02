"use client";
import { useState } from "react";
import { Command } from "../types";
import { normalizePath, getDirectoryNode, getPrefix, getAutocompleteMatches, getCommandMatches } from "../autocompleteMatches";
import { mockFileSystem } from "../types/mockFileSystem";
import { pathCommands } from "../commandOptions";

export function useTypingLevel(commands: Command[]) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);
    const [errors, setErrors] = useState(0);
    const [typedChars, setTypedChars] = useState(0);
    const [tabCount, setTabCount] = useState(0);
    const [currentDirectory, setCurrentDirectory] = useState("/home");

    const currentCommand = commands[currentIndex];
    const targetText = currentCommand?.text || "";

    const isFinished = currentIndex >= commands.length || (currentIndex === commands.length - 1 && duration > 0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isFinished || !currentCommand) return; // do not allow to change text if level is finished
        
        const newText = e.target.value;

        if (newText.length > 2 * targetText.length) return; // not allow to write more

        // start with first character
        if (startTime === null && newText.length === 1) {
            setStartTime(Date.now());
        }

        if (newText.length > text.length) {

            const newCharIndex = newText.length - 1;
            const typedChar = newText[newCharIndex];
            const expectedChar = currentCommand.text[newCharIndex];

            if (typedChar !== expectedChar) {
                setErrors(prev => prev + 1);
            }

            setTypedChars(prev => prev + (newText.length - text.length));
        }

        setText(newText);
    };

    // TAB AUTOCOMPLETE
    const handleAutocomplete = () => {
        if (isFinished || !currentCommand || text.length === 0) return;

        // start of actual word
        const lastSpaceIndex = text.lastIndexOf(" ");
        const wordStart = lastSpaceIndex + 1;
        const currentWord = text.slice(wordStart);

        // do not complete command arguments
        if (currentWord.startsWith("-")) {
            return;
        }

        if (currentWord.length === 0) return;

        const isCommand = wordStart === 0;


        // COMMANDS
        if (isCommand) {
            const matches = getCommandMatches(currentWord);

            if (matches.length === 0) return;

            // one match: complete whole word
            // many matches: complete only prefix
            const completion =
                matches.length === 1
                    ? matches[0]
                    : getPrefix(matches);

            if (completion.length > currentWord.length) {
                setText(completion);
                setTabCount(prev => prev + 1);
            }

            return;
        }
        
        // --- FILE SYSTEM ---
        // prevent "/" to command bug
        if (isCommand && (currentWord.startsWith("/") || currentWord.startsWith("."))) {
            return;
        }

        const commandName = text.split(" ")[0];

        if (!pathCommands.includes(commandName)) {
            return;
        }

        const matches = getAutocompleteMatches(text, currentDirectory);

        if (matches.length === 0) return;

        const lastSlashIndex = currentWord.lastIndexOf("/");
        const currentFragment = currentWord.slice(lastSlashIndex + 1);

        // one match: complete whole word
        // many matches: complete only prefix
        const completion =
            matches.length === 1
                ? matches[0]
                : getPrefix(matches);


        if (completion.startsWith(currentFragment) && completion.length > currentFragment.length) {
            const pathPrefix =
            lastSlashIndex === -1
                ? ""
                : currentWord.slice(0, lastSlashIndex + 1);

            const completedWord = pathPrefix + completion;
            const newText = text.slice(0, wordStart) + completedWord;

            if (newText !== text) {
                setText(newText);
                setTabCount(prev => prev + 1);
            }
        }
        
        return;

        }


    // return matches - current directories and commands
    const getCurrentAutocompleteMatches = () => {
        if (!text) return [];

        const lastSpaceIndex = text.lastIndexOf(" ");
        const wordStart = lastSpaceIndex + 1;
        const currentWord = text.slice(wordStart);

        if (!currentWord || currentWord.startsWith("-")) return [];

        const isCommand = wordStart === 0;

        if (isCommand) {
            return getCommandMatches(currentWord);
        }

        const commandName = text.split(" ")[0];

        // autocomplete for commands allowed to have paths
        if (!pathCommands.includes(commandName)) {
            return [];
        }

        return getAutocompleteMatches(text, currentDirectory);
    };


    const handleEnter = () => {
        if (isFinished || !currentCommand) return; //  not allow to change text if finished

        // ------------->  text.trim() will allow spaces at start and end of text <------ to discuss on next meeting
        if (text !== targetText) return; // nothing when not correct 

        // check is it cd command
        const cdMatch = targetText.match(/^cd(?:\s+(.+))?$/);

        if (cdMatch) {
        const destination = cdMatch[1] ?? "/home";

        const nextDirectory = normalizePath(
            destination.startsWith("/")
                ? destination
                : `${currentDirectory}/${destination}`
        );

        // change directory if exists
        const directoryNode = getDirectoryNode(
            nextDirectory,
            mockFileSystem
        );

        if (directoryNode) {
            setCurrentDirectory(nextDirectory);
        }
    }
        
        if (currentIndex < commands.length - 1) {
            // next command
            setCurrentIndex(prev => prev + 1);
            setText('');
            } else {
            // end of level
                if (startTime) {
                    const end = Date.now();
                    setDuration(Number(((end - startTime) / 1000).toFixed(2)));
                }
            }
        
    };

    const reset = () => {
        setText('');
        setCurrentIndex(0);
        setStartTime(null);
        setDuration(0);
        setErrors(0);
        setTypedChars(0);
        setTabCount(0);
        setCurrentDirectory("/home");
    };

    return {
        text,
        errors,
        typedChars,
        tabCount,
        currentDirectory,
        getCurrentAutocompleteMatches,
        handleChange,
        handleEnter,
        handleAutocomplete,
        reset,
        duration,
        startTime,
        currentCommand,
        currentIndex,
        totalCommands: commands.length,
        isFinished
    };
}
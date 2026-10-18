"use client";
import { useState } from "react";
import { Command } from "../types";

export function useTypingLevel(commands: Command[]) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);
    const [errors, setErrors] = useState(0);
    const [typedChars, setTypedChars] = useState(0);
    const [tabCount, setTabCount] = useState(0);

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
        console.log("Znaki wpisane ręcznie:", typedChars + (newText.length - text.length));
    };

    // TAB AUTOCOMPLETE
    const handleAutocomplete = () => {
        if (isFinished || !currentCommand || text.length === 0) return;

        // start of actual word
        const lastSpaceIndex = text.lastIndexOf(" ");
        const wordStart = lastSpaceIndex + 1;

        const currentWord = text.slice(wordStart);

        if (currentWord.length === 0) return;

        // check if word has a slash in it
        const lastSlashIndex = currentWord.lastIndexOf("/");

        if (lastSlashIndex === currentWord.length - 1) return;

        const currentFragment = currentWord.slice(lastSlashIndex + 1);

        const targetWordStart = targetText.lastIndexOf(" ", wordStart - 1) + 1;
        const targetWordEnd = targetText.indexOf(" ", targetWordStart);

        const targetWord = targetText.slice(
            targetWordStart,
            targetWordEnd === -1 ? undefined : targetWordEnd
        );

        // split target and current words by slashes to get the last segment
        const targetParts = targetWord.split("/");
        const currentParts = currentWord.split("/");
        const segmentIndex = currentParts.length - 1;
        const targetFragment = targetParts[segmentIndex];

        if (
            targetFragment === undefined ||
            !targetFragment.startsWith(currentFragment) ||
            targetFragment.length <= currentFragment.length
        ) {
            return;
        }

        // keep path prefix 
        const pathPrefix = lastSlashIndex === -1
            ? ""
            : currentWord.slice(0, lastSlashIndex + 1);

        const isDirectory = segmentIndex < targetParts.length - 1;

        // whole constructed word
        const completedWord = pathPrefix + targetFragment + (isDirectory ? "/" : "");
        const newText = text.slice(0, wordStart) + completedWord;

        // count tab only when text changed
        if (newText !== text) {
            setText(newText);
            setTabCount(prev => prev + 1);
        }

    };


    const handleEnter = () => {
        if (isFinished || !currentCommand) return; //  not allow to change text if finished

        // ------------->  text.trim() will allow spaces at start and end of text <------ to discuss on next meeting
        if (text !== targetText) return; // nothing when not correct 
        
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
    };

    return {
        text,
        errors,
        typedChars,
        tabCount,
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
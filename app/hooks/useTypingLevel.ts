"use client";
import { useState } from "react";
import { Command } from "../types";
import { start } from "repl";

export function useTypingLevel(commands: Command[]) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);

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

        setText(newText);

        if (startTime !== null && newText === targetText) {
            if (currentIndex < commands.length - 1) {
            // next command
            setCurrentIndex(prev => prev + 1);
            setText('');
            } else {
            // end of level
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
        };

        return {
            text,
            handleChange,
            duration,
            startTime,
            currentCommand,
            currentIndex,
            totalCommands: commands.length,
            isFinished,
            reset
        };
}
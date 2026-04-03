"use client";
import { useState } from "react";
import { Command } from "../types";

export function useTypingLevel(commands: Command[]) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);

    const currentCommand = commands[currentIndex];
    if (!currentCommand) {
        return {
            text: '',
            handleChange: () => {},
            duration: 0,
            currentCommand: { text: '' },
            currentIndex: 0,
            totalCommands: 0,
            isFinished: false,
            reset: () => {}
        };
    }

    const targetText = currentCommand?.text || "";

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    if (newText.length > targetText.length) return; // not allow to write more

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
        currentCommand,
        currentIndex,
        totalCommands: commands.length,
        isFinished: duration > 0,
        reset
    };
}
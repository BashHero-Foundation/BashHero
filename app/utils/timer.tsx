"use client";
import { useState } from "react";

export function useTimer() {
    const [text, setText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // start with first character 
    if (startTime === null && newText.length === 1) {
      setStartTime(Date.now());
    }
    
    setText(newText);
  };

  const handleStop = () => {
    const end = Date.now();
    setEndTime(end);
    if (startTime) {
      setDuration(Number(((end - startTime) / 1000).toFixed(2))); 
    }
  };

  return { text, handleChange, handleStop, duration };

}
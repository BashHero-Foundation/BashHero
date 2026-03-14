import { useState } from "react";
import { start } from "repl";

export function useTimer() {
    const targetText = "cd /home/bashhero ls -la";

    const [text, setText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    if (newText.length > targetText.length) return; // not allow to write more
    
    // start with first character 
    if (startTime === null && newText.length === 1) {
      setStartTime(Date.now());
    }

    setText(newText);

    if (startTime !== null && newText === targetText) {
      const end = Date.now();
      setDuration(Number(((end - startTime) / 1000).toFixed(2))); 
      setStartTime(null);
    }
  };


  return { text, handleChange, duration, targetText };

}
"use client";
import { useKeyboardSchortcuts } from "../hooks/useKeyboardShortcuts";
import { useTimer } from "../hooks/useTimer";

export default function TypingArea() {
  const { text, handleChange, duration, targetText } = useTimer();
  const { handleKeyDown } = useKeyboardSchortcuts();

  return (
    <div className="flex flex-col items-center-safe justify-center p-10">
        <h2> Tekst do wpisywania</h2>
        <p className="font-bold text-xl"> {targetText} </p>
        <div className="flex flex-col p-4 w-full max-w-md mx-auto">
        <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Zacznij pisać..."
            className="border-2 border-gray-300 rounded-md p-3 mb-4 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-amber-100 transition duration-200"
            rows={2}
        />

        </div>
        {duration > 0 && 
        <div className="flex flex-col items-center"> 
            <h3 className="font-bold text-2xl text-green-600 mb-3"> Gratulacje !!</h3> 
            <p className="font-semibold text-xl tracking-wider">Czas pisania: {duration} sekund</p>
        </div> }
        </div>
  );
}
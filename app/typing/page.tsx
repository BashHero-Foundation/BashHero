"use client";
import { useKeyboardSchortcuts } from "../hooks/useKeyboardShortcuts";
import { useTimer } from "../hooks/useTimer";

export default function TypingArea() {
  const { text, handleChange, handleStop, duration } = useTimer();
  const { handleKeyDown } = useKeyboardSchortcuts();

  return (
    <div className="flex flex-col items-center-safe justify-center p-10">
        <h2> Tekst do wpisywania: <p className="font-bold text-xl">cd /home/projekt ls </p></h2>
        <div className="flex flex-col p-4 w-full max-w-md mx-auto">
        <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Zacznij pisać..."
            className="border-2 border-gray-300 rounded-md p-3 mb-4 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-amber-100 transition duration-200"
            rows={2}
        />
        <button
            onClick={handleStop}
            className="bg-red-300 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 active:bg-red-700 transition duration-200"
        >
            Stop
        </button>
        </div>
        {duration > 0 && <p>Czas pisania: {duration} sekund</p>}
        <div className="mt-500">
            <h3> Jestem daleko </h3>
        </div>
    </div>
  );
}
"use client";
import { useKeyboardSchortcuts } from "../hooks/useKeyboardShortcuts";
import { useTimer } from "../hooks/useTimer";
import { useLevel } from "../hooks/useLevel";

export default function TypingArea() {
  const { text, handleChange, duration } = useTimer();
  const { handleKeyDown } = useKeyboardSchortcuts();
  const { level } = useLevel("level-1");

  if (!level) return null;

  const targetText = level.commands[4].text;

  return (
    <div className="flex flex-col items-center-safe justify-center p-10">
        <div className="flex flex-col items-center mb-10 gap-2">
            <h1 className="text-3xl font-bold text-blue-800"> { level?.title } </h1>
            <p> { level?.description }</p>
            <div className="flex gap-2 items-center font-sans">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {level?.difficulty}
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {level?.category}
            </span>
            </div>
        </div>
        <h2> Tekst do wpisywania</h2>
        <p className="font-bold text-xl"> {targetText} </p>
        <div className="flex flex-col p-4 w-full max-w-md mx-auto">
        <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Zacznij pisać..."
            className="border-2 border-gray-300 rounded-md p-3 mb-4 resize-none shadow-sm 
            focus:outline-none focus:ring-3 focus:ring-gray-100 focus:border-blue-900 transition duration-200"
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
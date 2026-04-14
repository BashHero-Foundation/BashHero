"use client";
import { useKeyboardSchortcuts } from "../app/hooks/useKeyboardShortcuts";
import { useTypingLevel } from "../app/hooks/useTypingLevel";
import { Menu } from "./menu";
import { Level } from "@/app/types";
import  TextCorrecter  from "./TextCorrecter";

export function TypingView({ level }: { level: Level }) {

    const {
        text,
        handleChange,
        duration,
        currentCommand,
        currentIndex,
        totalCommands,
        isFinished
    } = useTypingLevel(level?.commands || []);
  const { handleKeyDown } = useKeyboardSchortcuts();

  if (!level) return <div className="flex items-center text-5xl text-gray-500 justify-center h-screen"> Level not found :( </div>;

  return (
    <div className="flex h-screen">
        <div className="w-1/6 p-4 border-r border-gray-300">
            <Menu />
        </div>

        <div className="w-5/6 flex flex-col items-center mt-20">

        {/* LEVEL INFO */}    

        <div className="flex flex-col items-center mb-10 gap-2">
            <h1 className="text-3xl font-bold text-blue-800"> { level.title } </h1>
            <p> { level.description }</p>
            <div className="flex gap-2 items-center font-sans">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {level.difficulty}
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {level.category}
            </span>
            </div>
        </div>
        <div className="flex flex-col p-4 w-full max-w-md mx-auto">

        {/* TYPING AREA - future terminal style */}    
        
        <div className="relative font-mono text-xl p-4 border-2 border-gray-300 rounded-md shadow-sm focus-within:border-blue-900 transition duration-200">
            
            {/* Text to be typed */}
            <div className="absolute inset-0 p-4 text-gray-300 pointer-events-none whitespace-pre-wrap">
            <TextCorrecter text={text} currentCommand={currentCommand} />
            </div>

            {/* Actual typing text */}
            <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            className="relative z-10 w-full bg-transparent text-black focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
            rows={2}
            />
        </div>

        </div>

        {isFinished && 
        <div className="flex flex-col items-center mt-7"> 
            <h3 className="font-bold text-2xl text-blue-800 mb-3"> Gratulacje !!</h3> 
            <p className="font-semibold text-xl tracking-wider">Czas pisania: {duration} sekund</p>

            <div className="mt-9 font-extrabold tracking-wider"> 
                <span className="flex items-baseline gap-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> 
                    <span className=" text-3xl"> +{level.points}</span>
                    <span className="text-xl"> points</span>
                </span>
            </div>
        </div> }
        </div>
    </div>
  );
}
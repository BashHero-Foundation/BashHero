"use client";
import { useKeyboardSchortcuts } from "../app/hooks/useKeyboardShortcuts";
import { useTypingLevel } from "../app/hooks/useTypingLevel";
import { useLevelMetrics } from '@/app/hooks/useLevelMetrics';
import { Menu } from "./menu";
import { Level } from "@/app/types";
import  TextCorrecter  from "./TextCorrecter";
import FinishedLevelButtons from './FinishedLevelButtons';
import { useLiveTimer } from "@/app/hooks/useLiveTimer";
import { useLevelStatsState } from "@/app/hooks/useLevelStatsState";

export function TypingView({ level }: { level: Level }) {

    // main typing (level) logic hook
    const typing = useTypingLevel(level?.commands || []);
        
    // realtime timer hook  
    const liveTime = useLiveTimer(typing.startTime, typing.isFinished);
    
    // blocking shortcuts hook
    const { handleKeyDown } = useKeyboardSchortcuts();

    // metrics hook
    const WPM = useLevelMetrics({commands: level?.commands || [], duration: typing.duration});

    // save stats hook
    useLevelStatsState({
        isFinished: typing.isFinished,
        duration: typing.duration,
        wpm: WPM,
        level: {
            id: level.id,
            title: level.title
        }
    });

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


            {/* Total commands and timer */} 

            <div className="flex justify-between items-center mb-2 text-sm text-gray-500 font-mono">
            <span>
                {typing.currentIndex + 1}/{typing.totalCommands}
            </span>

            <span className="text-xl">
                ⏱️ {typing.startTime
                ? `${typing.isFinished ? typing.duration : liveTime.toFixed(1)}s`
                : "0.0s"}
            </span>
            </div>

            {/* TYPING AREA - future terminal style */}    
            
            <div className="relative font-mono text-xl p-4 border-2 border-gray-300 rounded-md shadow-sm focus-within:border-blue-900 transition duration-200">
                
                {/* Text to be typed */}
                <div className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap">
                <TextCorrecter text={typing.text} currentCommand={typing.currentCommand} />
                </div>

                {/* Actual typing text */}
                <textarea
                value={typing.text}
                onChange={typing.handleChange}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                className="relative z-10 w-full bg-transparent text-transparent caret-black focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                rows={2}
                />
            </div>

            </div>
            
            <FinishedLevelButtons levelId={level.id}/>

            {typing.isFinished && 
            <div className="flex flex-col items-center mt-7"> 
                <h3 className="font-bold text-2xl text-blue-800"> Gratulacje !!</h3> 

                {/* Points*/}
                <div className="mt-5 font-extrabold tracking-wider"> 
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
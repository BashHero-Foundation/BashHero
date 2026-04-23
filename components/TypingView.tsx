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
import ThemeSwitcher from "./ThemeSwitcher";

export function TypingView({ level }: { level: Level }) {

    // main typing (level) logic hook
    const typing = useTypingLevel(level?.commands || []);
        
    // realtime timer hook  
    const liveTime = useLiveTimer(typing.startTime, typing.isFinished);
    
    // blocking shortcuts hook
    const { handleKeyDown } = useKeyboardSchortcuts();

    // metrics hook
    const metrics = useLevelMetrics({commands: level?.commands || [], duration: typing.duration, userText: typing.text});

    // save stats hook
    useLevelStatsState({
        isFinished: typing.isFinished,
        duration: typing.duration,
        wpm: metrics.WPM,
        errors: metrics.errors,
        accuracy: metrics.accuracy,
        level: {
            id: level.id,
            title: level.title
        }
    });


    if (!level) return <div className="flex items-center text-5xl text-gray-500 justify-center h-screen"> Level not found :( </div>;

    return (
        <div className="flex h-screen">
            <div className="w-1/6 p-4 border-r border-border-separator">
                <Menu />
            </div>

            <div className="w-5/6 flex flex-col items-center mt-20">

            {/* LEVEL INFO */}    

            <div className="flex flex-col items-center mb-10 gap-2">
                <h1 className="text-3xl font-bold text-text-secondary"> { level.title } </h1>
                <p className="text-text-neutral"> { level.description }</p>
                <div className="flex gap-2 mt-2 items-center font-sans">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-badge-primary-to text-badge-primary-text border border-badge-primary-border uppercase tracking-wider">
                    {level.difficulty}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-badge-neutral-bg text-badge-neutral-text border border-badge-neutral-border">
                    {level.category}
                </span>
                </div>
            </div>
            <div className="flex flex-col p-4 w-full max-w-md mx-auto">


            {/* Total commands and timer */} 

            <div className="flex justify-between items-center mb-2 text-sm text-text-neutral font-mono">
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
            
            <div className="relative font-mono text-xl p-4 border-2 border-border-separator rounded-md shadow-sm focus-within:border-btn-primary-bg transition duration-200">
                
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
                className="relative z-10 w-full bg-transparent text-transparent focus:outline-none resize-none overflow-hidden whitespace-pre-wrap"
                rows={2}
                />
            </div>

            </div>

            <FinishedLevelButtons levelId={level.id}/>
            <ThemeSwitcher/>

            {typing.isFinished && 
            <div className="flex flex-col items-center mt-7"> 
                <h3 className="font-bold text-2xl text-text-secondary"> Gratulacje !!</h3> 

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
"use client";
import { useKeyboardShortcuts } from "../app/hooks/useKeyboardShortcuts";
import { useTypingLevel } from "../app/hooks/useTypingLevel";
import { useLevelMetrics } from '@/app/hooks/useLevelMetrics';
import { Menu } from "./menu";
import { Level } from "@/app/types";
import FinishedLevelButtons from './FinishedLevelButtons';
import { useLiveTimer } from "@/app/hooks/useLiveTimer";
import { useLevelStatsState } from "@/app/hooks/useLevelStatsState";
import TextCorrecter from "./TextCorrecter";
import SettingsSidebar from "./settings";
import { useRef, useState, UIEvent } from "react";

export function TypingView({ level, nextLevelId }: { level: Level; nextLevelId: string | null }) {

    // main typing (level) logic hook
    const typing = useTypingLevel(level?.commands || []);
        
    // realtime timer hook  
    const liveTime = useLiveTimer(typing.startTime, typing.isFinished);
    
    // blocking shortcuts hook
    const { handleKeyDown } = useKeyboardShortcuts({
        handleEnter: typing.handleEnter,
        }
    );

    // settings sidebar
    const [settingsOpen, setSettingsOpen] = useState(false);

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

    return (
        <div className="flex h-screen">
            <div className="w-1/6 p-4 border-r border-border-separator">
                <Menu />
            </div>

            <div className="w-5/6 flex flex-col items-center mt-20">

            <SettingsSidebar
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onOpen={() => setSettingsOpen(true)}
            />

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

            {/* TYPING AREA */}
            <div className="flex flex-col w-full max-w-2xl mx-auto">

            {/* Total commands and timer */} 

            <div className="flex justify-between items-center px-4 mb-3 text-lg text-text-neutral font-mono">
            <span>
                {typing.currentIndex + 1}/{typing.totalCommands}
            </span>

            <span className="text-xl">
                ⏱️ {typing.startTime
                ? `${typing.isFinished ? typing.duration : liveTime.toFixed(1)}s`
                : "0.0s"}
            </span>
            </div>

            {/* TYPING AREA - terminal */}    
            <div className="flex flex-col w-full h-full max-h-60 bg-terminal-bg rounded-xl overflow-hidden">

                {/* Top bar */} 
                <div className="flex items-center gap-2 px-4 py-3 bg-[#363636]">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>

                {/* Container for terminal workspace */} 
                <div className="font-mono text-xl px-4 py-6 overflow-auto">

                    <div className="flex">
                        <span className="text-green-600 mr-4 shrink-0 select-none whitespace-pre">❯❯</span>

                        <div className="relative grow"> 
                            {/* Text to be typed */}
                            <div className="absolute inset-0 pointer-events-none whitespace-pre caret-terminal-caret">
                            <TextCorrecter text={typing.text} currentCommand={typing.currentCommand} />
                            </div>

                            {/* Actual typing text */}
                            <div className="">
                            <textarea
                            value={typing.text}
                            onChange={typing.handleChange}
                            onKeyDown={handleKeyDown}
                            spellCheck="false"
                            className="relative z-10 w-max min-w-full bg-transparent text-transparent focus:outline-none resize-none 
                            whitespace-pre caret-terminal-caret overflow-hidden mb-20
                            "
                            style={{
                                width: `${typing.text.length + 1}ch`,
                            }}
                            rows={1}
                            />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            </div>

            <FinishedLevelButtons levelId={level.id} nextLevelId={nextLevelId}/>
            

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
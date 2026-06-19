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
import CalculatePoints from "@/components/CalculatePoints";
import { useRef, useState, useEffect } from "react";
import { Timer } from "lucide-react";
import TutorialPopup from "@/components/TutorialPopup";
import { useRouter} from "next/navigation";
import { scormify_path } from "@/app/scorm/scorm_utils";

export function TypingView({ level, nextLevelId }: { level: Level; nextLevelId: string | null }) {

    // router for navigation with enter
    const router = useRouter();

    // main typing (level) logic hook
    const typing = useTypingLevel(level?.commands || []);
        
    // realtime timer hook  
    const liveTime = useLiveTimer(typing.startTime, typing.isFinished);
    
    // blocking shortcuts hook
    const { handleKeyDown } = useKeyboardShortcuts({
        handleEnter: () => {
        if (typing.isFinished && nextLevelId) {
            router.push(scormify_path(`/game/${nextLevelId}`));
        }
        else {
            typing.handleEnter();
        }
        }
    });

    // settings sidebar
    const [settingsOpen, setSettingsOpen] = useState(false);

    // metrics hook
    const metrics = useLevelMetrics({commands: level?.commands || [], duration: typing.duration, errors: typing.errors});

    // save stats hook
    useLevelStatsState({
        isFinished: typing.isFinished,
        duration: typing.duration,
        wpm: metrics.WPM,
        errors: typing.errors,
        accuracy: metrics.accuracy,
        level: {
            id: level.id,
            title: level.title
        }
    });

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    return (
        <div className="flex">
            <Menu />

             <SettingsSidebar
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onOpen={() => setSettingsOpen(true)}
            />

            <div className="flex-1 flex-col items-center mt-20 w-full">

            <TutorialPopup
                storageKey="tutorial-popup"
                title="Witaj w Bash Hero!"
                message="Wykonuj zadania, wpisując komendy w terminalu na środku ekranu. 
                    Twoim celem jest jak najszybsze i poprawne przepisanie wszystkich komend.
                    Po lewej stronie znajdziesz listę poziomów.
                    Możesz ją rozwinąć i wybrać zadanie.
                    Po prawej stronie możesz zmienić motyw.
                    Podczas zadania działa timer - zatrzyma się automatycznie po wpisaniu wszystkich komend.
                    Po ukończeniu zobaczysz swoje statystyki (czas, WPM, liczba błędów, dokładność, zdobyte punkty).
                    Powodzenia i baw się dobrze!"
            />

            {/* LEVEL INFO */}    

            <div className="flex flex-col items-center mb-10 gap-2">
                <h1 className="text-3xl font-bold text-text-secondary"> { level.title } </h1>
                <p className="text-text-neutral"> { level.description }</p>
                 
                {/* BADGES */}
                <div className="flex flex-wrap gap-2 mt-4 items-center font-mono text-xs">

                    <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/60 text-text-secondary border border-badge-neutral-border/40 uppercase tracking-wider">
                        {level.difficulty}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/50 text-text-secondary border border-badge-neutral-border/30">
                        {level.category}
                    </span>

                    <span className="text-text-neutral/30 mx-1 text-md">|</span>

                    <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/40 text-text-secondary border border-badge-neutral-border/20 flex items-center gap-1">
                        <span className="opacity-70">WPM: </span>
                        <span className="font-semibold text-text-secondary">{level.min_wpm}</span>
                    </span>

                    <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/40 text-text-secondary border border-badge-neutral-border/20 flex items-center gap-1">
                        <span className="opacity-70">ACC: </span>
                        <span className="font-semibold text-text-secondary">{level.min_accuracy}%</span>
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

            <div className="flex flex-row items-center justify-center gap-3">
            
            <Timer size={25} strokeWidth={2} /> 
            <span className="leading-none">
            {typing.startTime
                ? `${typing.isFinished ? typing.duration : liveTime.toFixed(1)}s`
                : "0.0s"}
            </span>
            
            </div>
            
            </div>

            {/* TYPING AREA - terminal */}    
            <div 
            className="flex flex-col w-full h-full max-h-60  rounded-xl overflow-hidden 
            bg-terminal-bg shadow-2xl focus-within:shadow-sm transition duration-300"
            onMouseDown={(e) => {
                e.preventDefault();
                textareaRef.current?.focus();
            }}
            >

                {/* Top bar */} 
                <div className="flex items-center gap-2 px-4 py-3 bg-[#363636]">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>

                {/* Container for terminal workspace */} 
                <div className="font-mono text-xl px-4 py-6 overflow-y-auto overflow-x-hidden">

                    <div className="flex">
                        <span className="text-green-600 mr-4 shrink-0 select-none whitespace-pre">❯❯</span>

                        <div className="relative grow"> 
                            {/* Text to be typed */}
                            <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-all caret-terminal-caret">
                            <TextCorrecter text={typing.text} currentCommand={typing.currentCommand} />
                            </div>

                            {/* Actual typing text */}
                            <div className="">
                            <textarea
                            ref={textareaRef}
                            value={typing.text}
                            onChange={typing.handleChange}
                            onKeyDown={handleKeyDown}
                            spellCheck="false"
                            wrap="soft"
                            className="relative z-10 w-full bg-transparent text-transparent focus:outline-none resize-none 
                            whitespace-pre-wrap break-all caret-terminal-caret overflow-hidden mb-20
                            "
                            rows={Math.ceil((typing.currentCommand.text.length+1)/48)}
                            />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <FinishedLevelButtons levelId={level.id} nextLevelId={nextLevelId}/>
            </div>
            
            {typing.isFinished && 
            <div className="flex flex-col items-center mt-7"> 
                <h3 className="font-bold text-base text-text-neutral"> Aby przejść dalej nacisnij ENTER lub strzałkę</h3> 
                <h3 className="font-bold text-2xl text-text-secondary"> Gratulacje !!</h3> 
                {/* Points*/}
                <div className="mt-5 font-extrabold tracking-wider"> 
                    <span className="flex items-baseline gap-2 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> 
                        <span className=" text-3xl"> {CalculatePoints(metrics.accuracy, metrics.WPM, level.points, level.min_wpm, level.min_accuracy)}/{level.points}</span>
                        <span className="text-xl"> punktów</span>
                    </span>
                </div>
            </div> }
            </div>
            
        </div>
    );
}

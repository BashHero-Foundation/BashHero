"use client";
import { useKeyboardShortcuts } from "../app/hooks/useKeyboardShortcuts";
import { useTypingLevel } from "../app/hooks/useTypingLevel";
import { useLevelMetrics } from '@/app/hooks/useLevelMetrics';
import { Menu } from "./menu";
import { Chapter, Level, NavigateFn } from "@/app/types";
import FinishedLevelButtons from './FinishedLevelButtons';
import { useLiveTimer } from "@/app/hooks/useLiveTimer";
import { useLevelStatsState } from "@/app/hooks/useLevelStatsState";
import TextCorrecter from "./TextCorrecter";
import SettingsSidebar from "./settings";
import CalculatePoints from "@/components/CalculatePoints";
import { useRef, useState, useEffect } from "react";
import { Bug, Timer } from "lucide-react";
import TutorialPopup from "@/components/TutorialPopup";
import { navigateToFn } from "@/app/scorm/scorm_utils";

export function TypingView({ level, nextLevelId, chapters, navigateFn }: { level: Level; nextLevelId: string | null, chapters: Chapter[], navigateFn: NavigateFn }) {

    // main typing (level) logic hook
    const typing = useTypingLevel(level?.commands || [], level?.autocomplete !== false);
        
    // realtime timer hook  
    const liveTime = useLiveTimer(typing.startTime, typing.isFinished);

    // blocking shortcuts hook
    const { handleKeyDown } = useKeyboardShortcuts({
        handleEnter: () => {
            if (isShutdown) return;

            if (typing.text.trim() === "shutdown") {
                setIsShutdown(true);
                setShowShutdownMessage(true);
                setSuggestionsOpen(false);


                setTimeout(() => {
                    setShowShutdownMessage(false);
                }, 5000);


                setTimeout(() => {
                    typing.reset();
                    setIsShutdown(false);
                }, 10000);

                return;
            }

            if (typing.isFinished && nextLevelId) {
                navigateToFn(nextLevelId, false, navigateFn);
            }
            else {
                if (typing.text === typing.currentCommand?.text) {
                    setSuggestionsOpen(false);
                }

                typing.handleEnter();
            }
        },

        handleCtrlA: () => {
            const textarea = textareaRef.current;

            if (!textarea) return;

            textarea.setSelectionRange(0, 0);
        },

        handleCtrlE: () => {
            const textarea = textareaRef.current;

            if (!textarea) return;

            const end = textarea.value.length;
            textarea.setSelectionRange(end, end);
        },

        handleAutocomplete: () => {
            if (level.autocomplete === false) {
                setSuggestionsOpen(false);
                return;
            }

            const targetText = typing.currentCommand?.text ?? "";

            // do not allow to autocomplete when correct command
            if ((typing.text === targetText)) {
                setSuggestionsOpen(false);
                return;
            }

            const matches = typing.getCurrentAutocompleteMatches();

            setSuggestionsOpen(matches.length > 1);

            typing.handleAutocomplete();
        }

    });

    const [isShutdown, setIsShutdown] = useState(false);
    const [showShutdownMessage, setShowShutdownMessage] = useState(false);

    // settings sidebar
    const [settingsOpen, setSettingsOpen] = useState(false);

    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const autocompletePaths = typing.getCurrentAutocompleteMatches();

    // metrics hook
    const metrics = useLevelMetrics({commands: level?.commands || [], duration: typing.duration, errors: typing.errors, typedChars: typing.typedChars});

    const earnedPoints = CalculatePoints(
        metrics.accuracy,
        metrics.WPM,
        typing.tabCount,
        level.points,
        level.min_wpm,
        level.min_accuracy,
        level.min_tab_count ?? 0
    );

    // save stats hook
    useLevelStatsState({
        isFinished: typing.isFinished,
        duration: typing.duration,
        wpm: metrics.WPM,
        errors: typing.errors,
        accuracy: metrics.accuracy,
        earnedPoints,
        Tabs: typing.tabCount,
        level: {
            id: level.id,
            title: level.title,
            category: level.category
        }
    });

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);


    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    // Set initial cursor position
    useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || level.initial_cursor === undefined) return;

    const position = level.initial_cursor === "start" ? 0 : textarea.value.length;
    textarea.setSelectionRange(position, position);
    }, [level.id, level.initial_cursor, typing.currentIndex]);

    return (
        <div className="flex">
            <a
                href="https://forms.gle/B2dqfYC1xFTrgpau7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Report a bug"
                title="Report a bug"
                className="
                    fixed bottom-8 right-4 z-50
                    inline-flex items-center justify-center gap-2
                    rounded-full
                    bg-btn-primary-bg text-text-primary
                    px-3 py-2.5
                    shadow-xl
                    hover:opacity-80 hover:scale-105
                    active:scale-95
                    transition-all duration-200
                "
            >
                <Bug size={24} />
                <span className="text-sm font-semibold">
                    Report a bug
                </span>
            </a>
            <Menu chapters={chapters} navigateFn={navigateFn} resetLevelFn={typing.reset} />

             <SettingsSidebar
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onOpen={() => setSettingsOpen(true)}
            />

            <div className="flex-1 flex-col items-center mt-20 w-full">

            <TutorialPopup
                storageKey="tutorial-popup"
                title="Witaj w Bash Hero!"
                message={`Wykonuj zadania, wpisując komendy w terminalu na środku ekranu. 
                    Twoim celem jest jak najszybsze i poprawne przepisanie wszystkich komend.
                    Po lewej stronie znajdziesz listę poziomów.
                    Możesz ją rozwinąć i wybrać zadanie.
                    Po prawej stronie możesz zmienić motyw.
                    Podczas zadania działa timer - zatrzyma się automatycznie po wpisaniu wszystkich komend.
                    Po ukończeniu zobaczysz swoje statystyki (czas, WPM, liczba błędów, dokładność, zdobyte punkty).
                    Powodzenia i baw się dobrze!`}
            />

            {/* LEVEL INFO */}

            <div className="flex flex-col items-center mb-5 gap-2">
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
                    
                    
                    {level.category !== "shortcuts" && (
                        <>
                            <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/40 text-text-secondary border border-badge-neutral-border/20 flex items-center gap-1">
                                <span className="opacity-70">WPM: </span>
                                <span className="font-semibold text-text-secondary">{level.min_wpm}</span>
                            </span>

                            <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/40 text-text-secondary border border-badge-neutral-border/20 flex items-center gap-1">
                                <span className="opacity-70">ACC: </span>
                                <span className="font-semibold text-text-secondary">{level.min_accuracy}%</span>
                            </span>
                        </>
                    )}

                    {level.min_tab_count !== undefined && (
                    <span className="px-3 py-1 rounded-full bg-badge-neutral-bg/40 text-text-secondary border border-badge-neutral-border/20 flex items-center gap-1">
                        <span className="opacity-70">TAB: </span>
                        <span className="font-semibold text-text-secondary">{level.min_tab_count}</span>
                    </span>
                    )}

                </div>

                {level.category === "shortcuts" && (
                <div className="flex flex-col items-center justify-center gap-2 mt-5 w-full">
                    <div className="flex flex-wrap gap-2 items-center justify-center"> 
                    <p className="text-text-neutral font-medium">Wykorzystaj: </p>
                    {level.required_shortcuts?.map((shortcut) => (
                        <span
                            key={shortcut}
                            className="px-3 py-1 rounded-full bg-badge-neutral-bg/40 text-text-secondary border border-badge-neutral-border/20 flex items-center gap-1"
                        >
                            <span className="font-bold text-lg text-text-secondary">
                                {shortcut}
                            </span>
                        </span>
                    ))}
                    </div>
                </div>
                )}
            </div>

            {/* TYPING AREA */}
            <div className="flex flex-col w-full max-w-2xl mx-auto">

            {/* Total commands and timer */}

            <div className="flex justify-between items-center px-4 mb-3 text-lg text-text-neutral font-bold tracking-wide">
                <div className="flex items-center gap-3">
                    <span>
                        {typing.currentIndex + 1}/{typing.totalCommands}
                    </span>

                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl">
                        <span className="text-lg font-semibold text-text-neutral tracking-wide">TAB:</span>
                        <span className="inline-flex items-center justify-center w-10 h-8 text-md
                                         font-bold text-text-secondary bg-bg-body rounded-full border border-border-separator shadow-xl"
                        >
                            {typing.tabCount}
                        </span>

                    </div>


                </div>

            <div className="flex flex-row items-center justify-center gap-3">

            <Timer size={25} strokeWidth={2} />
            <span className="leading-none">
            {typing.startTime
                ? `${typing.isFinished ? typing.duration : liveTime.toFixed(1)}s`
                : "0.0s"}
            </span>

            </div>

            </div>
            
            {/* SUGGESTION PANEL */}
            <div className="relative"> 
                 {suggestionsOpen && (
                <div className="absolute z-50 left-5 top-24
                                rounded-md border border-white/10
                                bg-[#252525]/95 px-3 py-2
                                shadow-lg font-mono text-gray-300
                                w-max max-w-[min(90vw,40rem)]
                                max-h-60 overflow-y-auto">

                    <span className="text-gray-500 text-sm mr-2">
                        Dostępne:
                    </span>

                    <div className="flex flex-wrap gap-x-4.5 gap-y-1.5 mt-2 pr-5">
                        {autocompletePaths.map((path) => (
                            <div 
                                key={path} 
                                className="text-ellipsis text-md whitespace-nowrap
                                            max-w-full truncate"
                            >
                                {path}
                            </div>
                        ))}
                    </div>
                </div>
                )}
            </div>

            {/* TYPING AREA - terminal */}    
            <div 
            className="relative flex flex-col w-full h-full max-h-60  rounded-xl overflow-hidden 
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

                {typing.currentCommand?.initialText !== undefined && (
                    <p className="relative mt-2 ml-10 text-md font-medium text-terminal-main-text/60">
                        Wymagana komenda:
                        <span className="pl-2 font-mono">{typing.currentCommand.text}</span>
                    </p>
                )}

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

            <FinishedLevelButtons levelId={level.id} nextLevelId={nextLevelId} navigateFn={navigateFn} resetLevelFn={typing.reset}/>
            </div>

            {typing.isFinished &&
            <div className="flex flex-col items-center mt-7">
                <h3 className="font-bold text-base text-text-neutral"> Aby przejść dalej nacisnij ENTER lub strzałkę</h3>
                <h3 className="font-bold text-2xl text-text-secondary"> Gratulacje !!</h3>
                {/* Points*/}
                <div className="mt-5 font-extrabold tracking-wider"> 
                    <span className="flex items-baseline gap-2 bg-red-700 bg-clip-text text-transparent"> 
                        <span className=" text-3xl"> {earnedPoints}/{level.points}</span>
                        <span className="text-xl"> punktów</span>
                    </span>
                </div>
            </div> }
            </div>

            {isShutdown && (
                <div className="fixed inset-0 z-9999 bg-black
                                flex items-center justify-center">

                    {showShutdownMessage && (
                        <div className="text-center font-mono text-white animate-pulse">
                            <span className="text-4xl mb-2">
                                Wyłączanie komputera
                            </span>
                        </div>
                    )}

                </div>
            )}
            
        </div>
    );
}
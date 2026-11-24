"use client";
import { useState, useRef, useEffect } from "react";
import { navigateToFn, navigateToUrl } from "@/app/scorm/scorm_utils";
import { ChevronRight, Circle, CircleCheck, CircleDashed } from "lucide-react";
import { Chapter, NavigateFn } from "@/app/types";
import { useLevelProgress } from "@/app/hooks/useLevelProgress";
import { isLevelPassed, getLevelStatus } from "./persistentStats";

export function Menu ({ chapters, navigateFn, resetLevelFn, currentLevelId }: { chapters: Chapter[], navigateFn: NavigateFn, resetLevelFn: () => void, currentLevelId?: string }) {

  const [open,setOpen] = useState(false);
  const allStats = useLevelProgress();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
            setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      }; }, []);

  return (
    <div ref={sidebarRef} className={`fixed left-0 z-40 w-80 transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`} style={{top: "var(--header-height, 0px)",height: "calc(100dvh - var(--header-height, 0px))",}}>
      <button onClick={() => setOpen((s) => !s)}
        className="absolute -right-13 top-5 bg-btn-primary-bg text-text-primary px-3 py-2.5 rounded-r-md shadow-lg hover:opacity-90 transition"
        aria-expanded={open}
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}>
          <ChevronRight
            size={28}
            strokeWidth={3}
            className={`transition-transform duration-300 ease-in-out ${open ? "rotate-180" : "rotate-0"}`}
            />
        </button>
    <aside className="w-80 h-full bg-bg-body border-r border-border-separator  shadow-2xl overflow-auto pb-25">
    <div className="px-4 py-3 border-b border-border-separator">
      <h3 className="text-2xl font-bold text-text-secondary mb-3">Statystyki</h3>
        <a
            href={navigateToUrl(null, true)}
            onClick={(e) => {
                e.preventDefault();
                navigateToFn(null, true, navigateFn);
            }}
            className="block w-full rounded-xl bg-btn-primary-bg border border-btn-primary-border px-4 py-3 text-text-primary font-semibold hover:bg-badge-primary-to transition text-center">Moje statystyki</a>
    </div>
    <div className="px-4 py-3 border-b border-border-separator flex items-center justify-between">
      <h3 className="text-2xl font-bold text-text-secondary">Poziomy</h3>
    </div>
      <div className="mt-3 flex flex-col gap-6 rounded-xl px-3">

        {chapters.map((chapter) => {
          const passedCount = chapter.levels.filter((l) => isLevelPassed(l, allStats)).length;
          const chapterDone = chapter.levels.length > 0 && passedCount === chapter.levels.length;

          return (
          <details
          key={chapter.chapterId}
          className="group/chapter rounded-xl bg-btn-primary-bg border border-btn-primary-border"
          >
          <summary className="flex items-center cursor-pointer select-none justify-between list-none
           px-4 py-2 text-text-primary font-bold gap-2">
          <span>{chapter.chapterTitle}</span>
          <span className="flex items-center gap-2 shrink-0">
            <span
              className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full ${chapterDone ? "bg-terminal-success text-white" : "bg-text-primary/20"}`}
              title={`Zaliczone poziomy: ${passedCount} z ${chapter.levels.length}`}
            >
              {chapterDone && <CircleCheck size={12} strokeWidth={3} />}
              {passedCount}/{chapter.levels.length}
            </span>
            <span className="transition-transform duration-300 group-open/chapter:rotate-180">▼</span>
          </span>
          </summary>


      <div className="p-3 flex flex-col gap-3 border-t border-border-separator">
        {chapter.levels.map((level) => {
          const status = getLevelStatus(level, allStats);
          const isActive = level.id === currentLevelId;

          return (
          <a
                key={level.id}
                href={navigateToUrl(level.id, false)}
                onClick={(e) => {
                    e.preventDefault();
                    resetLevelFn();
                    navigateToFn(level.id, false, navigateFn);
                }}
                aria-current={isActive ? "page" : undefined}
            className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-2 font-semibold transition
              ${isActive
                ? "border-text-tertiary bg-text-tertiary text-text-primary shadow-md hover:opacity-90"
                : "border-btn-primary-border bg-bg-body text-text-secondary hover:bg-badge-primary-to"}`}
          >
            <span>{level.title}</span>
            {status === "passed" ? (
              <CircleCheck size={20} strokeWidth={2.5} className={`shrink-0 ${isActive ? "text-text-primary" : "text-terminal-success"}`} aria-label="Zaliczony" />
            ) : status === "partial" ? (
              <CircleDashed size={20} strokeWidth={2.5} className={`shrink-0 ${isActive ? "text-text-primary" : "text-amber-500"}`} aria-label="Zaliczony częściowo" />
            ) : (
              <Circle size={20} strokeWidth={2} className={`shrink-0 ${isActive ? "text-text-primary/60" : "text-text-neutral/40"}`} aria-label="Niezaliczony" />
            )}
          </a>
          );
        })}
          </div>
        </details>
          );
        })}
      </div>
    </aside>
    </div>
  );
};

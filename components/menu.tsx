"use client";
import { useState, useRef, useEffect } from "react";
import { scormify_path } from "@/app/scorm/scorm_utils";
import chapter1 from "@/app/levels/chapter1.json";
import chapter2 from "@/app/levels/chapter2.json";
import chapter3 from "@/app/levels/chapter3.json";
import chapter4 from "@/app/levels/chapter4.json";
import chapter5 from "@/app/levels/chapter5.json";
import { ChevronRight } from "lucide-react";

const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5];


export const Menu = () => {

  const [open,setOpen] = useState(false);
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
      <a href={scormify_path(`/game/stats`)} className="block w-full rounded-xl bg-btn-primary-bg border border-btn-primary-border px-4 py-3 text-text-primary font-semibold hover:bg-badge-primary-to transition text-center">Moje statystyki</a>
    </div>
    <div className="px-4 py-3 border-b border-border-separator flex items-center justify-between">
      <h3 className="text-2xl font-bold text-text-secondary">Poziomy</h3>
    </div>
      <div className="mt-3 flex flex-col gap-6 rounded-xl px-3">

        {chapters.map((chapter) => (
          <details
          key={chapter.chapterId}
          className="group/chapter rounded-xl bg-btn-primary-bg border border-btn-primary-border" 
          >
          <summary className="flex items-center cursor-pointer select-none justify-between list-none 
           px-4 py-2 text-text-primary font-bold">
          <span>{chapter.chapterTitle}</span>
          <span className="transition-transform duration-300 group-open/chapter:rotate-180">▼</span>
          </summary>
          
        
      <div className="p-3 flex flex-col gap-3 border-t border-border-separator">
        {chapter.levels.map((level) => (
          <a
            key={level.id}
            href={scormify_path(`/game/${level.id}`)}
            className="rounded-xl border border-btn-primary-border bg-bg-body px-4 py-2 text-text-secondary font-semibold hover:bg-badge-primary-to transition"
          >
            {level.title}
          </a>
        ))}
          </div>
        </details>
        ))}
      </div>
    </aside>
    </div>
  );
};
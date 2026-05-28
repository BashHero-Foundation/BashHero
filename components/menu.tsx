"use client";
import { useState, useRef, useEffect } from "react";
import { scormify_path } from "@/app/scorm/scorm_utils";
import chapter1 from "@/app/levels/chapter1.json";
import chapter2 from "@/app/levels/chapter2.json";
import chapter3 from "@/app/levels/chapter3.json";

const chapters = [chapter1, chapter2, chapter3];


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
    <div ref={sidebarRef} className={`fixed left-0 z-40 w-80 transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`} style={{ top: "calc(var(--header-height) + 4px)",height: "calc(100vh - 5rem)" }}>
      <button onClick={() => setOpen((s) => !s)}
        className="absolute -right-12 top-5 bg-btn-primary-bg text-white px-3 py-2 rounded-r-md shadow-lg hover:opacity-90 transition"
        aria-expanded={open}
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}>
          <svg className={`w-6 h-6 transform ${open ? "" : "rotate-180"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 6l5 4-5 4V6z" />
          </svg>
        </button>
    <aside className="w-80 h-full bg-bg-main border-r  shadow-2xl overflow-auto">
    <div className="px-4 py-3 border-b flex items-center justify-between">
      <h3 className="font-bold text-text-primary">Poziomy</h3>
    </div>
      <div className="mt-3 flex flex-col gap-3 rounded-xl p-3">
        {chapters.map((chapter) => (
          <details
          key={chapter.chapterId}
          className="group/chapter rounded-xl border" 
          open>
          <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-white font-semibold select-none flex items-center justify-between">
          <span>{chapter.chapterTitle}</span>
          <span className="transition-transform duration-300 group-open/chapter:rotate-180">▼</span>
          </summary>
          
        
      <div className="px-2 pb-2 flex flex-col gap-2">
        {chapter.levels.map((level) => (
          <a
            key={level.id}
            href={scormify_path(`/game/${level.id}`)}
            className="rounded-xl border border-btn-primary-border bg-btn-primary-bg px-4 py-2 text-text-primary font-semibold hover:bg-btn-primary-bg-hover transition"
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
"use client";

import levelsData from "@/app/levels/chapter1.json";
import chapter1 from "@/app/levels/chapter1.json";
import chapter2 from "@/app/levels/chapter2.json";
import chapter3 from "@/app/levels/chapter3.json";

const chapters = [chapter1, chapter2, chapter3];

export const Menu = () => {
  return (
    <details className="w-full max-w-xs group" open>
      <summary className="cursor-pointer list-none rounded-xl bg-blue-900 px-4 py-3 text-white font-bold select-none flex items-center justify-between">
        <span>Poziomy</span>
        <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
      </summary>

      <div className="mt-3 flex flex-col gap-3 rounded-xl bg-blue-950/30 p-3">
        {chapters.map((chapter) => (
          <details
          key={chapter.chapterId}
          className="group/chapter rounded-xl border border-blue-900 bg-blue-900/30" 
          open>
          <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-white font-semibold select-none flex items-center justify-between">
          <span>{chapter.chapterTitle}</span>
          <span className="transition-transform duration-300 group-open/chapter:rotate-180">▼</span>
          </summary>
          
        
      <div className="px-2 pb-2 flex flex-col gap-2">
        {chapter.levels.map((level) => (
          <a
            key={level.id}
            href={`/game/${level.id}`}
            className="rounded-xl border border-blue-900 bg-blue-800 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
          >
            {level.title}
          </a>
        ))}
          </div>
        </details>
        ))}
      </div>
    </details>
  );
};
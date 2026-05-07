"use client";

import levelsData from "@/app/levels/chapter1.json";

export const Menu = ({onNavigate}: { onNavigate: (href: string) => void }) => {
  return (
    <details className="w-full max-w-xs group" open>
      <summary className="cursor-pointer list-none rounded-xl bg-blue-900 px-4 py-3 text-white font-bold select-none flex items-center justify-between">
        <span>Poziomy</span>
        <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
      </summary>

      <div className="mt-3 flex flex-col gap-3 rounded-xl bg-blue-950/30 p-3">
        {levelsData.levels.map((level) => (
          <a
            key={level.id}
            href={`/game/${level.id}`}
            className="rounded-xl border border-blue-900 bg-blue-800 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(`/game/${level.id}`);
            }}
          >
            {level.title}
          </a>
        ))}
      </div>
    </details>
  );
};
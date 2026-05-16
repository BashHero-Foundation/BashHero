"use client";

import levelsData from "@/app/levels/chapter1.json";
import { scormify_path } from "@/app/scorm/scorm_utils";

export const Menu = () => {
  return (
    <details className="w-full max-w-xs group" open>
      <summary className="cursor-pointer list-none rounded-xl bg-bg-main px-4 py-3 text-text-primary font-bold select-none flex items-center justify-between">
        <span>Poziomy</span>
        <span className="transition-transform duration-300 group-open:rotate-180">▼</span>
      </summary>

      <div className="mt-3 flex flex-col gap-3 rounded-xl bg-bg-tertiary p-3">
        {levelsData.levels.map((level) => (
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
  );
};
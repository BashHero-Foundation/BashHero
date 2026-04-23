"use client";

import Link from "next/link";
import levelsData from "@/app/levels/chapter1.json";

export const Menu = () => {
  return (
    <div className="flex flex-col items-start gap-6 p-2">
      {levelsData.levels.map((level) => (
        <Link
          key={level.id}
          href={`/game/${level.id}`}
          className="text-lg text-text-primary font-semibold border border-element-border bg-btn-primary-bg blue-800 rounded-2xl px-4 py-2 hover:bg-btn-primary-bg-hover transition"
        >
          {level.title}
        </Link>
      ))}
    </div>
  );
}
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
          className="text-lg text-white font-semibold border border-blue-950 bg-blue-800 rounded-2xl px-4 py-2 hover:bg-blue-700 transition"
        >
          {level.title}
        </Link>
      ))}
    </div>
  );
}
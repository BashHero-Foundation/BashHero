"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "./menu";
import { LevelStats, StatsPageContentProps } from "@/app/types";


export function StatsPageContent({ level }: StatsPageContentProps) {
  const [stats, setStats] = useState<LevelStats | null>(null);

  useEffect(() => {
    // Get stats from localStorage
    const savedStats = localStorage.getItem(`level_${level.id}_stats`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [level.id]);


  return (
    <div className="flex h-screen">

      {/* Sidebar menu */}
      <div className="w-1/6 p-4 border-r border-gray-300">
        <Menu />
      </div>

      {/* Main Content */}
      <div className="w-5/6 flex flex-col items-center pt-20">
        {/* Level Info */}
        <div className="flex flex-col items-center mb-10 gap-2">
          <h1 className="text-3xl font-bold text-blue-800">{level.title}</h1> 
        </div>

        {/* Stats Container */}
        <div className="flex flex-col items-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8">Twoje statystyki</h2>

          {stats ? (
            <div className="w-full space-y-6">

            {/* Duration */}
              <div className="flex justify-between items-center p-4 bg-linear-to-r from-green-100 to-emerald-50 rounded-lg border border-green-200">
                <span className="text-lg font-semibold text-gray-700">Czas:</span>
                <span className="text-3xl font-bold text-green-600">{stats.duration.toFixed(2)}s</span>
              </div>

              {/* WPM */}
              <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-100 to-purple-50 rounded-lg border border-blue-200">
                <span className="text-lg font-semibold text-gray-700">WPM:</span>
                <span className="text-3xl font-bold text-blue-600">{stats.WPM}</span>
              </div>

              {/* Timestamp */}
              <div className="text-center text-sm text-gray-500 mt-4">
                {new Date(stats.timestamp).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ) : 
          
          // No stats available
          (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Brak zapisanych statystyk dla tego poziomu.</p>
              <p className="text-sm">Ukończ poziom, aby zobaczyć statystyki.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex flex-col gap-3 w-full">
            <Link href={`/game/${level.id}`} className="w-full">
              <button className="w-full rounded-xl border-b-4 border-blue-600 bg-blue-800 shadow-lg px-6 py-3 text-lg text-white font-bold transition hover:bg-blue-600 active:border-b-0 active:translate-y-1 active:bg-blue-900">
                ← Wróć do poziomu
              </button>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}

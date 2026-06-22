"use client";

import { useEffect, useState } from "react";
import { Menu } from "./menu";
import SettingsSidebar from "./settings";
import { GlobalStats } from "@/app/types";
import { getGlobalStats } from "@/components/getGlobalStats";

export function GlobalStatsContent() {
  const [stats, setStats] = useState<GlobalStats | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setStats(getGlobalStats());
  }, []);

  function previous() {
        window.history.back()
    }


  return (
    <div className="flex h-screen">

      {/* Sidebar menu */}
        <Menu />

      <SettingsSidebar
                  open={settingsOpen}
                  onClose={() => setSettingsOpen(false)}
                  onOpen={() => setSettingsOpen(true)}
      />      

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-20">

        {/* Stats Container */}
        <div className="flex flex-col items-center bg-bg-surface rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8 text-text-secondary/60">Statystki globalne</h2>

          {stats ? (
            <div className="w-full space-y-6">

            {/* Duration */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-green-100 to-emerald-50 rounded-lg border border-green-200">
                <span className="text-lg font-semibold text-gray-700">Całkowity czas</span>
                <span className="text-3xl font-bold text-green-600">{stats.totalDuration.toFixed(2)}s</span>
              </div>

              {/* WPM */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-badge-primary-from to-badge-primary-to rounded-lg border border-badge-primary-border">
                <span className="text-lg font-semibold text-gray-700">Średni WPM</span>
                <span className="text-3xl font-bold text-badge-primary-text">{stats.averageWPM}</span>
              </div>

              {/* Errors */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-red-100 to-rose-50 rounded-lg border border-red-200">
                <span className="text-lg font-semibold text-gray-700">Wszystkie błędy</span>
                <span className="text-3xl font-bold text-red-600">{stats.totalErrors}</span>
              </div>
              
              {/* Accuracy */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-orange-100 to-amber-50 rounded-lg border border-orange-200">
                <span className="text-lg font-semibold text-gray-700">Średnia dokładność</span>
                <span className="text-3xl font-bold text-orange-600">{stats.averageAccuracy}%</span>
              </div>

            </div>
          ) : 
          
          // No stats available
          (
            <div className="text-center py-8 text-text-neutral">
              <p className="mb-4">Brak zapisanych statystyk dla tego poziomu.</p>
              <p className="text-sm">Ukończ poziom, aby zobaczyć statystyki.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex flex-col gap-3 w-full">
              <button onClick={previous} className="w-full rounded-xl border-b-4 border-btn-primary-border bg-btn-primary-bg 
              shadow-lg px-6 py-3 text-lg text-text-primary font-bold transition hover:bg-btn-primary-bg-hover 
              active:border-b-0 active:translate-y-1">
                ← Wróć
              </button>

          </div>
        </div>
      </div>
    </div>
  );
}

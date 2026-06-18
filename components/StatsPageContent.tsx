"use client";
import { useEffect, useState } from "react";
import { Menu } from "./menu";
import { LevelStats, StatsPageContentProps } from "@/app/types";
import SettingsSidebar from "./settings";
import { scormify_path } from "@/app/scorm/scorm_utils";
import { ArrowLeft } from 'lucide-react';


export function StatsPageContent({ level }: StatsPageContentProps) {
  const [stats, setStats] = useState<LevelStats | null>(null);

  // settings sidebar
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Get stats from localStorage
    const savedStats = localStorage.getItem(`level_${level.id}_stats`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [level.id]);


  return (
    <div className="flex">

      {/* Sidebar menu */}
        <Menu />

      <SettingsSidebar
                  open={settingsOpen}
                  onClose={() => setSettingsOpen(false)}
                  onOpen={() => setSettingsOpen(true)}
      />      

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-10">
        {/* Level Info */}
        <div className="flex flex-col items-center mb-10 gap-2">
          <h1 className="text-3xl font-bold text-text-secondary">{level.title}</h1> 
        </div>

        {/* Stats Container */}
        <div className="flex flex-col items-center bg-bg-surface rounded-lg shadow-lg px-8 py-4 gap-7 max-w-md w-full">
          <h2 className="text-3xl font-bold text-text-secondary/60">Twoje statystyki</h2>

          {stats ? (
            <div className="w-full space-y-6">

            {/* Duration */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-green-100 to-emerald-50 rounded-lg border border-green-200">
                <span className="text-lg font-semibold text-gray-700">Czas</span>
                <span className="text-3xl font-bold text-green-600">{stats.duration.toFixed(2)}s</span>
              </div>

              {/* WPM */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-badge-primary-from to-badge-primary-to rounded-lg border border-badge-primary-border">
                <span className="text-lg font-semibold text-gray-700">WPM</span>
                <span className="text-3xl font-bold text-badge-primary-text">{stats.WPM}</span>
              </div>

              {/* Errors */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-red-100 to-rose-50 rounded-lg border border-red-200">
                <span className="text-lg font-semibold text-gray-700">Błędy</span>
                <span className="text-3xl font-bold text-red-600">{stats.Errors}</span>
              </div>
              
              {/* Accuracy */}
              <div className="flex justify-between items-center p-4 tracking-wider bg-linear-to-r from-orange-100 to-amber-50 rounded-lg border border-orange-200">
                <span className="text-lg font-semibold text-gray-700">Dokładność</span>
                <span className="text-3xl font-bold text-orange-600">{stats.Accuracy}%</span>
              </div>


              {/* Timestamp */}
              <div className="text-center text-sm text-text-neutral py-1">
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
            <div className="text-center py-8 text-text-neutral">
              <p className="mb-4">Brak zapisanych statystyk dla tego poziomu.</p>
              <p className="text-sm">Ukończ poziom, aby zobaczyć statystyki.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="w-full pb-5">
            <a href={scormify_path(`/game/${level.id}`)} className="w-full">
              <button className="w-full rounded-xl border-b-4 border-btn-primary-border bg-btn-primary-bg 
              shadow-lg px-6 py-3 text-lg text-text-primary font-bold transition hover:bg-btn-primary-bg-hover 
              active:border-b-0 active:translate-y-1">
                <div className="flex flex-row items-center gap-5"> 
                  <ArrowLeft size={18} strokeWidth={4} />
                  Wróć do poziomu
                </div>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

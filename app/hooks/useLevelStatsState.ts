import { useEffect } from "react";
import { LevelStats, LevelStatsStateProps } from "../types";

export function useLevelStatsState({
    isFinished,
    duration,
    wpm,
    level
}: LevelStatsStateProps) {

  useEffect(() => { 
    if (!isFinished || duration <= 0) return;

    const stats: LevelStats = {
      levelId: level.id,
      duration,
      WPM: Math.round(wpm),
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(
      `level_${level.id}_stats`,
      JSON.stringify(stats)
    );
  }, [isFinished, duration, wpm, level.id, level.title]);
}
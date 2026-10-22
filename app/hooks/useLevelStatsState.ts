import { useEffect } from "react";
import { LevelStats, LevelStatsStateProps } from "../types";
import { set_level_wpm } from "../scorm/scorm_database";

export function useLevelStatsState({
  isFinished,
  duration,
  wpm,
  errors,
  accuracy,
  level
}: LevelStatsStateProps) {

  useEffect(() => {
    if (!isFinished || duration <= 0) return;

    const stats: LevelStats = {
      levelId: level.id,
      duration,
      WPM: Math.round(wpm),
      Errors: errors,
      Accuracy: accuracy,
      timestamp: new Date().toISOString()
    };

    set_level_wpm(level.id, stats.WPM);

    localStorage.setItem(
      `level_${level.id}_stats`,
      JSON.stringify(stats)
    );

    void fetch(`${process.env.NEXT_PUBLIC_LTI_API_URL ?? ""}/api/results`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    }).catch(() => {
      // Local storage remains available when the game runs outside Moodle.
    });
  }, [isFinished, duration, wpm, errors, accuracy, level.id, level.title]);
}
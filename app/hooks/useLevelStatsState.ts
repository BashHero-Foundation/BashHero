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
  }, [isFinished, duration, wpm, errors, accuracy, level.id, level.title]);
}
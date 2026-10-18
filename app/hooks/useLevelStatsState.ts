import { useEffect } from "react";
import { LevelStats, LevelStatsStateProps } from "../types";
import { saveLevelStats } from "@/components/persistentStats";

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

    saveLevelStats(stats);

  }, [isFinished, duration, wpm, errors, accuracy, level.id, level.title]);
}

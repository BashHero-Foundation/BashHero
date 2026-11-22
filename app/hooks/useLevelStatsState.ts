import { useEffect } from "react";
import { LevelStats, LevelStatsStateProps } from "../types";
import { saveLevelStats } from "@/components/persistentStats";

export function useLevelStatsState({
  isFinished,
  duration,
  wpm,
  errors,
  accuracy,
  earnedPoints,
  level
}: LevelStatsStateProps) {

  useEffect(() => {
    if (!isFinished || duration <= 0) return;

    const isShortcutLevel = level.category === "shortcuts";
    const stats: LevelStats = {
      levelId: level.id,
      duration,
      WPM: isShortcutLevel ? -1 : Math.round(wpm),
      Errors: isShortcutLevel ? -1 : errors,
      Accuracy: isShortcutLevel ? -1 : accuracy,
      earnedPoints,
      timestamp: new Date().toISOString()
    };

    saveLevelStats(stats);

  }, [isFinished, duration, wpm, errors, accuracy, earnedPoints, level.id, level.title]);
}

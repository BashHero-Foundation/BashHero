import { useEffect } from "react";
import { LevelStats, LevelStatsStateProps } from "../types";
import { saveLevelStats } from "@/components/persistentStats";
import { getScormLevelStats } from "../scorm/scorm_database";

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
            earnedPoints: earnedPoints,
            timestamp: new Date().toISOString(),
        };

        getScormLevelStats(level.id).then((previousStats) => {
            if (previousStats) {
                if (previousStats.earnedPoints < stats.earnedPoints) {
                    saveLevelStats(stats);
                }
            } else {
                saveLevelStats(stats);
            }
        });
    }, [isFinished, duration, wpm, errors, accuracy, earnedPoints, level.id, level.title]);
}

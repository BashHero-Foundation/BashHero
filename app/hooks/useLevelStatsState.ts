import { useEffect } from "react";
import { LevelStats, LevelStatsStateProps } from "../types";
import { SCORM_STATUS, set_or_update_objective } from "../scorm/scorm_utils"

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

    set_or_update_objective(level.id, { status: SCORM_STATUS.PASSED, score: wpm })

    localStorage.setItem(
      `level_${level.id}_stats`,
      JSON.stringify(stats)
    );
  }, [isFinished, duration, wpm, errors, accuracy, level.id, level.title]);
}
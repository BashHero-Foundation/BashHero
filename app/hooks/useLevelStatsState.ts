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
    level,
}: LevelStatsStateProps) {
    useEffect(() => {
        if (!isFinished || duration <= 0) return;

        const stats: LevelStats = {
            levelId: level.id,
            duration,
            WPM: Math.round(wpm),
            Errors: errors,
            Accuracy: accuracy,
            timestamp: new Date().toISOString(),
        };

        getScormLevelStats(level.id).then((previousStats) => {
            if (previousStats) {
                if (previousStats.WPM < stats.WPM) {
                    saveLevelStats(stats);
                }
            } else {
                saveLevelStats(stats);
            }
        });
    }, [isFinished, duration, wpm, errors, accuracy, level.id, level.title]);
}

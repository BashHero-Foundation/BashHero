import { saveScormLevelStats } from "@/app/scorm/scorm_database";
import { GlobalStats, LevelStats } from "@/app/types";

export function getGlobalStats(): GlobalStats {
    const allStats: LevelStats[] = getAllLevelStats();

    if (allStats.length === 0) {
        return {
            levelsCompleted: 0,
            totalDuration: 0,
            averageWPM: 0,
            totalErrors: 0,
            averageAccuracy: 0,
        };
    }

    return {
        levelsCompleted: allStats.length,

        totalDuration: allStats.reduce((sum, stat) => sum + stat.duration, 0),

        averageWPM: Math.round(
            allStats.reduce((sum, stat) => sum + stat.WPM, 0) / allStats.length,
        ),

        totalErrors: allStats.reduce((sum, stat) => sum + stat.Errors, 0),

        averageAccuracy: Math.round(
            allStats.reduce((sum, stat) => sum + stat.Accuracy, 0) /
                allStats.length,
        ),
    };
}

export function getLevelStats(levelId: string): LevelStats | null {
    const savedStats = localStorage.getItem(`level_${levelId}_stats`);
    if (savedStats) {
        return JSON.parse(savedStats);
    }
    return null;
}

export function saveLevelStats(stats: LevelStats) {
    saveScormLevelStats(stats);
    localStorage.setItem(`level_${stats.levelId}_stats`, JSON.stringify(stats));
}

export function getAllLevelStats(): LevelStats[] {
    const allStats: LevelStats[] = [];

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("level_") && key.endsWith("_stats")) {
            const data = localStorage.getItem(key);

            if (data) {
                allStats.push(JSON.parse(data));
            }
        }
    });

    return allStats;
}

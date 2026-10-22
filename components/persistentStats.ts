import {  getScormAllLevelStats, getScormLevelStats, saveScormLevelStats } from "@/app/scorm/scorm_database";
import { GlobalStats, LevelStats } from "@/app/types";

export async function getGlobalStats(): Promise<GlobalStats> {
    const allStats: Record<string, LevelStats> = await getAllLevelStats();
    const allStatsList: LevelStats[] = Object.values(allStats);

    if (allStatsList.length === 0) {
        return {
            levelsCompleted: 0,
            totalDuration: 0,
            averageWPM: 0,
            totalErrors: 0,
            averageAccuracy: 0,
        };
    }

    return {
        levelsCompleted: allStatsList.length,

        totalDuration: allStatsList.reduce((sum, stat) => sum + stat.duration, 0),

        averageWPM: Math.round(
            allStatsList.reduce((sum, stat) => sum + stat.WPM, 0) / allStatsList.length,
        ),

        totalErrors: allStatsList.reduce((sum, stat) => sum + stat.Errors, 0),

        averageAccuracy: Math.round(
            allStatsList.reduce((sum, stat) => sum + stat.Accuracy, 0) /
                allStatsList.length,
        ),
    };
}

export async function getLevelStats(levelId: string): Promise<LevelStats | null> {
    const savedStats = await getScormLevelStats(levelId);
    if (savedStats) {
        return savedStats;
    }
    return null;
}

export function saveLevelStats(stats: LevelStats) {
    saveScormLevelStats(stats);
}

export async function getAllLevelStats(): Promise<Record<string, LevelStats>> {
    const allStats = await getScormAllLevelStats();
    return allStats;
}

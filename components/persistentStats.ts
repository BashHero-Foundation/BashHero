import {
    getScormAllLevelStats,
    getScormLevelStats,
    saveScormLevelStats,
} from "@/app/scorm/scorm_database";
import { GlobalStats, LevelStats } from "@/app/types";

export async function getGlobalStats(): Promise<GlobalStats> {
    const allStats: Record<string, LevelStats> = await getAllLevelStats();
    const allStatsList: LevelStats[] = Object.values(allStats);

    const statsWithWpm = allStatsList.filter((stat) => stat.WPM !== -1);
    const statsWithErrors = allStatsList.filter((stat) => stat.Errors !== -1);
    const statsWithAccuracy = allStatsList.filter((stat) => stat.Accuracy !== -1);

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

        totalDuration: allStatsList.reduce(
            (sum, stat) => sum + stat.duration,
            0,
        ),

        averageWPM: Math.round(
        statsWithWpm.reduce((sum, stat) => sum + stat.WPM, 0) /
        (statsWithWpm.length || 1)
        ),

        totalErrors: statsWithErrors.reduce(
        (sum, stat) => sum + stat.Errors,
        0
        ),

        averageAccuracy: Math.round(
        statsWithAccuracy.reduce((sum, stat) => sum + stat.Accuracy, 0) /
        (statsWithAccuracy.length || 1)
        ),
    };
}

export async function getLevelStats(
    levelId: string,
): Promise<LevelStats | null> {
    const savedStats = await getScormLevelStats(levelId);
    if (savedStats) {
        return savedStats;
    }
    return null;
}

export const LEVEL_PROGRESS_EVENT = "level-progress-changed";

export async function saveLevelStats(stats: LevelStats) {
    await saveScormLevelStats(stats);
    window.dispatchEvent(new Event(LEVEL_PROGRESS_EVENT));
}
// saved stats keep the best attempt, so a worse retry doesn't remove it
export function isLevelPassed(
    level: { id: string; points: number },
    allStats: Record<string, LevelStats>,
): boolean {
    return getLevelStatus(level, allStats) === "passed";
}

export type LevelStatus = "passed" | "partial" | "none";

export function getLevelStatus(
    level: { id: string; points: number },
    allStats: Record<string, LevelStats>,
): LevelStatus {
    const stats = allStats[level.id];
    if (stats === undefined) return "none";
    if (typeof stats.earnedPoints === "number" && stats.earnedPoints >= level.points) return "passed";
    return "partial";
}

export async function getAllLevelStats(): Promise<Record<string, LevelStats>> {
    const allStats = await getScormAllLevelStats();
    return allStats;
}

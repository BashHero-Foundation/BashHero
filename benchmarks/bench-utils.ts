import { allLevels } from "@/app/levelsUtils";
import { LevelStats, ScormStorageStruct } from "@/app/types";

export function generateRandomLevelStats(): LevelStats {
    const maxIndex = allLevels.length;
    const randomLevel: LevelStats = {
        levelId: allLevels[Math.floor(Math.random() * maxIndex)].id,
        duration: Number((10 + Math.random() * 150).toFixed(2)),
        WPM: 10 + Math.floor(Math.random() * 150),
        Errors: Math.floor(Math.random() * 150),
        Accuracy: Math.ceil(Math.random() * 100),
        timestamp: new Date(
            Math.floor(Math.random() * 2000000000000),
        ).toISOString(),
    };

    return randomLevel;
}

export function generateRandomScormStorageStruct(
    numberOfLevelStats: number,
): ScormStorageStruct {
    const scormStorageStruct: ScormStorageStruct = {
        levelStats: {},
    };
    for (let i = 0; i < numberOfLevelStats; i++) {
        const randomLevelStats = generateRandomLevelStats();
        scormStorageStruct.levelStats[randomLevelStats.levelId] =
            randomLevelStats;
    }
    return scormStorageStruct;
}

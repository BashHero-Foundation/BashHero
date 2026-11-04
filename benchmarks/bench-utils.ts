import { LevelStats, ScormStorageStruct } from "@/app/types";
import { existsSync, mkdirSync, writeFile } from "fs";

export type BenchmarkResult = {
    algorithm: string;
    experiment: string;
    xs: number[];
    ys: number[];
};

export function generateRandomLevelStats(levelIndex: number): LevelStats {
    const randomLevel: LevelStats = {
        levelId: levelIndex.toString(),
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
        const randomLevelStats = generateRandomLevelStats(i);
        scormStorageStruct.levelStats[randomLevelStats.levelId] =
            randomLevelStats;
    }
    return scormStorageStruct;
}

export function saveBenchmarkResult(
    filename: string,
    benchmarkResult: BenchmarkResult,
) {
    const resultsDir = "benchmark-results/";

    if (!existsSync(resultsDir)) {
        mkdirSync(resultsDir);
    }

    const benchmarkResultString = JSON.stringify(benchmarkResult);

    writeFile(resultsDir + filename, benchmarkResultString, (err) => {
        if (err) {
            console.error("Error writing file:", err);
        } else {
            console.log("File written successfully");
        }
    });
}

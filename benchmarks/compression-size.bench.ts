import LZString from "lz-string";
import {
    generateRandomScormStorageStruct,
    BenchmarkResult,
    saveBenchmarkResult,
} from "./bench-utils";

import { shortenKeysScormStorageStruct } from "@/app/scorm/scorm_database";

const sizeJsonBenchmarkResult: BenchmarkResult = {
    algorithm: "JSON stringify",
    experiment: "size",
    xs: [],
    ys: [],
};

const sizeLZStringBenchmarkResult: BenchmarkResult = {
    algorithm: "LZString",
    experiment: "size",
    xs: [],
    ys: [],
};

const numbers_of_levels = [ 1, 2, 4, 8, 16, 32, 64, 128]

for (let i = 0; i < numbers_of_levels.length; i++) {
  const numberOfLevels = numbers_of_levels[i]
    for (let i = 0; i < 100; i++) {
        const randomScormStorageStruct =
            generateRandomScormStorageStruct(numberOfLevels);

        const jsonEncoded = JSON.stringify(randomScormStorageStruct);
        sizeJsonBenchmarkResult.xs.push(numberOfLevels);
        sizeJsonBenchmarkResult.ys.push(jsonEncoded.length);

        const shortenJson = JSON.stringify(
            shortenKeysScormStorageStruct(randomScormStorageStruct),
        );
        const lzstringEncoded = LZString.compressToBase64(shortenJson);
        sizeLZStringBenchmarkResult.xs.push(numberOfLevels);
        sizeLZStringBenchmarkResult.ys.push(lzstringEncoded.length);
    }
}

saveBenchmarkResult("json-size.json", sizeJsonBenchmarkResult);
saveBenchmarkResult("lzstring-size.json", sizeLZStringBenchmarkResult);

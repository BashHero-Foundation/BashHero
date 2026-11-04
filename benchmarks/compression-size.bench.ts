import LZString from "lz-string";
import {
    generateRandomScormStorageStruct,
    BenchmarkResult,
    saveBenchmarkResult,
} from "./bench-utils";

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

for (let numberOfLevels = 1; numberOfLevels <= 100; numberOfLevels += 10) {
    for (let i = 0; i < 100; i++) {
        const randomScormStorageStruct =
            generateRandomScormStorageStruct(numberOfLevels);

        const jsonEncoded = JSON.stringify(randomScormStorageStruct);
        sizeJsonBenchmarkResult.xs.push(numberOfLevels);
        sizeJsonBenchmarkResult.ys.push(jsonEncoded.length);

        const lzstringEncoded = LZString.compressToBase64(jsonEncoded);
        sizeLZStringBenchmarkResult.xs.push(numberOfLevels);
        sizeLZStringBenchmarkResult.ys.push(lzstringEncoded.length);
    }
}

saveBenchmarkResult("json-size.json", sizeJsonBenchmarkResult);
saveBenchmarkResult("lzstring-size.json", sizeLZStringBenchmarkResult);


console.log(JSON.stringify(generateRandomScormStorageStruct(2)));

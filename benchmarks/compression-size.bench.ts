import { Bench } from "tinybench";
import { generateRandomScormStorageStruct } from "./bench-utils";

const bench = new Bench({ name: "simple benchmark", time: 100 });

bench
    .add("faster task", () => {})
    .add("slower task", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
    });

bench.run();

console.log(bench.name);
console.table(bench.table());

console.log(generateRandomScormStorageStruct(3));

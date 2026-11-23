"use client";

import { NavigateFn, ScormIframeMessage } from "../types";

export const SCORM_FIELDS = {
    SUSPEND_DATA: "cmi.suspend_data",

    STUDENT_ID: "cmi.core.student_id",
    STUDENT_NAME: "cmi.core.student_name",

    LESSON_STATUS: "cmi.core.lesson_status",
    SCORE_RAW: "cmi.core.score.raw",
    SCORE_MAX: "cmi.core.score.max",
    SCORE_MIN: "cmi.core.score.min",

    // INTERACTION_ID: (n: number) => `cmi.interactions.${n}.id` as const,
    // INTERACTION_TYPE: (n: number) => `cmi.interactions.${n}.type` as const,
    // INTERACTION_RESULT: (n: number) => `cmi.interactions.${n}.result` as const,

    OBJECTIVE_COUNT: "cmi.objectives._count",

    OBJECTIVE_ID: (n: string) => `cmi.objectives.${n}.id` as const,
    OBJECTIVE_SCORE: (n: string) => `cmi.objectives.${n}.score.raw` as const,
    OBJECTIVE_MIN_SCORE: (n: string) =>
        `cmi.objectives.${n}.score.min` as const,
    OBJECTIVE_MAX_SCORE: (n: string) =>
        `cmi.objectives.${n}.score.max` as const,
    OBJECTIVE_STATUS: (n: string) => `cmi.objectives.${n}.status` as const,
} as const;

export enum SCORM_STATUS {
    PASSED = "passed",
    COMPLETED = "completed",
    FAILED = "failed",
    INCOMPLETE = "incomplete",
    BROWSED = "browsed",
    NOT_ATTEMPTED = "not attempted",
}

async function newObjective(
    id: string,
    options?: {
        score?: number;
        min_score?: number;
        max_score?: number;
        status?: SCORM_STATUS;
    },
) {
    const next_available_id = await scormGet(SCORM_FIELDS.OBJECTIVE_COUNT);
    if (typeof next_available_id === "undefined") {
        return false;
    }

    await scormSet(SCORM_FIELDS.OBJECTIVE_ID(String(next_available_id)), id);

    if (typeof options?.score !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_SCORE(next_available_id),
            options?.score.toString(),
        );
    }
    if (typeof options?.min_score !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_MIN_SCORE(next_available_id),
            options?.min_score.toString(),
        );
    }
    if (typeof options?.max_score !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_MAX_SCORE(next_available_id),
            options?.max_score.toString(),
        );
    }
    if (typeof options?.status !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_STATUS(next_available_id),
            options?.status,
        );
    }
}

export async function objectiveNumberFromId(
    id: string,
): Promise<number | undefined> {
    const next_available_id = Number(
        await scormGet(SCORM_FIELDS.OBJECTIVE_COUNT),
    );
    if (typeof next_available_id === "undefined") {
        return undefined;
    }

    for (let i = 0; i < next_available_id; i++) {
        const objective_id = await scormGet(
            SCORM_FIELDS.OBJECTIVE_ID(String(i)),
        );
        if (typeof objective_id !== "undefined" && objective_id == id) {
            return i;
        }
    }
    return undefined;
}

export async function setOrUpdateObjective(
    id: string,
    options?: {
        score?: number;
        min_score?: number;
        max_score?: number;
        status?: SCORM_STATUS;
    },
) {
    const objective_number = await objectiveNumberFromId(id);

    if (typeof objective_number === "undefined") {
        await newObjective(id, options);
        return;
    }

    if (typeof options?.score !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_SCORE(String(objective_number)),
            options?.score.toString(),
        );
    }
    if (typeof options?.min_score !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_MIN_SCORE(String(objective_number)),
            options?.min_score.toString(),
        );
    }
    if (typeof options?.max_score !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_MAX_SCORE(String(objective_number)),
            options?.max_score.toString(),
        );
    }
    if (typeof options?.status !== "undefined") {
        await scormSet(
            SCORM_FIELDS.OBJECTIVE_STATUS(String(objective_number)),
            options?.status,
        );
    }
}

export default function ScormSandbox() {
    const saveTest = async () => {
        const student_name = await scormGet(SCORM_FIELDS.STUDENT_NAME);
        console.log("from iframe" + student_name);
    };

    return (
        <div>
            <button
                onClick={saveTest}
                className="bg-red-300 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 active:bg-red-700 transition duration-200"
            >
                create problem
            </button>
        </div>
    );
}

export function scormifyPath(path: string): string {
    if (process.env.NEXT_PUBLIC_SCORM === "true") {
        // for main pages
        if (path === "/") return "./index.html";
        if (path === "/game") return "./game.html";

        const new_path = path.slice(1).replaceAll("/", "-");
        return "./" + new_path + ".html";
    }

    return path;
}

export function navigateToUrl(levelId: string | null, statsPage: boolean): string {
    const params = new URLSearchParams();
    if (levelId !== null) {
        params.set("levelId", levelId);
    }
    params.set("statsPage", String(statsPage));
    const queryString = params.toString();
    return queryString ? `#${queryString}` : "";
};

export function navigateToFn(levelId: string | null, statsPage: boolean, navigateFn: NavigateFn) {
    const queryString = navigateToUrl(levelId, statsPage);
    window.history.pushState(null, "", queryString);
    navigateFn.setLevelIdFn(levelId);
    navigateFn.setStatsPageFn(statsPage);
};


export function scormSet(field: string, value: string): Promise<string> {
    return new Promise((resolve) => {
        const uuid = crypto.randomUUID();

        const onMessage = (event: MessageEvent) => {
            const data = event.data;

            if (data.id == uuid) {
                window.removeEventListener(`message`, onMessage);

                resolve(data.message);
            }
        };

        window.addEventListener("message", onMessage);

        const message: ScormIframeMessage = {
            type: "SET",
            id: uuid,
            payload: {
                field: field,
                value: value,
            },
        };
        window.parent.postMessage(message, window.location.origin);
    });
}

export function scormGet(field: string): Promise<string> {
    return new Promise((resolve) => {
        const uuid = crypto.randomUUID();

        const onMessage = (event: MessageEvent) => {
            const data = event.data;

            if (data.id == uuid) {
                window.removeEventListener("message", onMessage);

                resolve(data.message);
            }
        };

        window.addEventListener("message", onMessage);

        const message: ScormIframeMessage = {
            type: "GET",
            id: uuid,
            payload: {
                field: field,
                value: "",
            },
        };

        window.parent.postMessage(message, window.location.origin);
    });
}

export function scormLog(value: string) {
    const uuid = crypto.randomUUID();

    const message: ScormIframeMessage = {
        type: "LOG",
        id: uuid,
        payload: {
            field: value,
            value: value,
        },
    };
    window.parent.postMessage(message, window.location.origin);
}

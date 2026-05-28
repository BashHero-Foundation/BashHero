"use client";

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

    OBECTIVE_COUNT: "cmi.objectives._count",

    OBJECTIVE_ID: (n: string) => `cmi.objectives.${n}.id` as const,
    OBJECTIVE_SCORE: (n: string) => `cmi.objectives.${n}.score.raw` as const,
    OBJECTIVE_MIN_SCORE: (n: string) => `cmi.objectives.${n}.score.min` as const,
    OBJECTIVE_MAX_SCORE: (n: string) => `cmi.objectives.${n}.score.max` as const,
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


async function new_objective(id: string, options?: { score?: number, min_score?: number, max_score?: number, status?: SCORM_STATUS }) {

    const next_available_id = await scorm_get(SCORM_FIELDS.OBECTIVE_COUNT);
    if (typeof next_available_id === 'undefined') {
        return false;
    }

    scorm_set(SCORM_FIELDS.OBJECTIVE_ID(String(next_available_id)), id);

    if (typeof options?.score !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_SCORE(next_available_id), options?.score.toString()); }
    if (typeof options?.min_score !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_MIN_SCORE(next_available_id), options?.min_score.toString()); }
    if (typeof options?.max_score !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_MAX_SCORE(next_available_id), options?.max_score.toString()); }
    if (typeof options?.status !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_STATUS(next_available_id), options?.status); }
}

export async function objective_number_from_id(id: string): Promise<number | undefined> {
    const next_available_id = Number(await scorm_get(SCORM_FIELDS.OBECTIVE_COUNT));
    if (typeof next_available_id === 'undefined') {
        return undefined;
    }

    for (var i = 0; i < next_available_id; i++) {
        var objective_id = await scorm_get(SCORM_FIELDS.OBJECTIVE_ID(String(i)))
        if (typeof objective_id !== 'undefined' && objective_id == id) {
            return i;
        }
    }
    return undefined;
}

export async function set_or_update_objective(id: string, options?: { score?: number, min_score?: number, max_score?: number, status?: SCORM_STATUS }) {
    const objective_number = await objective_number_from_id(id);

    if (typeof objective_number === 'undefined') {
        await new_objective(id, options);
        return;
    }

    if (typeof options?.score !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_SCORE(String(objective_number)), options?.score.toString()); }
    if (typeof options?.min_score !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_MIN_SCORE(String(objective_number)), options?.min_score.toString()); }
    if (typeof options?.max_score !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_MAX_SCORE(String(objective_number)), options?.max_score.toString()); }
    if (typeof options?.status !== 'undefined') { scorm_set(SCORM_FIELDS.OBJECTIVE_STATUS(String(objective_number)), options?.status); }
}

export default function ScormSandbox() {
    const saveTest = async () => {
        let student_name = await scorm_get(SCORM_FIELDS.STUDENT_NAME);
        console.log("from ifrome" + student_name);
    };

    return (
        <div>
            <button onClick={saveTest} className="bg-red-300 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 active:bg-red-700 transition duration-200">create problem</button>
        </div>
    );
}

export function scormify_path(path: string): string {
    if (process.env.NEXT_PUBLIC_SCORM === "true") {

        // for main pages
        if (path === "/") return "./index.html";
        if (path === "/game") return "./game.html";

        let new_path = path.slice(1).replaceAll("/", "-");
        return "./" + new_path + ".html";
    }

    return path;
}

import { ScormIframeMessage } from "../types";

export function scorm_set(field: string, value: string) {
    const message: ScormIframeMessage = {
        type: "SET",
        payload: {
            field: field,
            value: value
        }
    };
    window.parent.postMessage(message, window.location.origin);
}

export function scorm_get(field: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const onMessage = (event: MessageEvent) => {
            const data = event.data;

            window.removeEventListener('message', onMessage);

            resolve(data)
        }

        window.addEventListener('message', onMessage);

        const message: ScormIframeMessage = {
            type: "GET",
            payload: {
                field: field,
                value: "",
            }
        }

        window.parent.postMessage(message, window.location.origin);
    })
}
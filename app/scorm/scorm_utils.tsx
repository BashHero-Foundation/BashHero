"use client";

import pipewerks, { SCORM } from "pipwerks-scorm-api-wrapper";
import { set_level_wpm, update_global_score } from "./scorm_database";
import { Unica_One } from "next/font/google";
import { useEffect, useState } from "react";



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

export function ensure_scorm_connection() {
    try {
        if (!SCORM.connection.isActive) {
            return SCORM.init();
        }
        return true;
    } catch (error) {
        console.warn("scorm init failed", error);
        return false;
    }
}

export function safe_scorm_set(field: string, value: string): boolean {
    if (!ensure_scorm_connection()) { return false; };

    try {
        return SCORM.set(field, value);
    } catch (error) {
        console.warn(`scorm set failed, field: ${field}`, error);
        return false;
    }
}
export function safe_scorm_get(field: string): string | undefined {
    if (!ensure_scorm_connection()) { return undefined; };

    try {
        return SCORM.get(field);
    } catch (error) {
        console.warn(`scorm get failed, field: ${field}`, error);
        return undefined;
    }
}

function new_objective(id: string, options?: { score?: number, min_score?: number, max_score?: number, status?: SCORM_STATUS }): boolean {
    if (!ensure_scorm_connection()) { return false; };

    const next_available_id = safe_scorm_get(SCORM_FIELDS.OBECTIVE_COUNT);
    if (typeof next_available_id === 'undefined') {
        return false;
    }

    safe_scorm_set(SCORM_FIELDS.OBJECTIVE_ID(String(next_available_id)), id);

    if (typeof options?.score !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_SCORE(next_available_id), options?.score.toString()); }
    if (typeof options?.min_score !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_MIN_SCORE(next_available_id), options?.min_score.toString()); }
    if (typeof options?.max_score !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_MAX_SCORE(next_available_id), options?.max_score.toString()); }
    if (typeof options?.status !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_STATUS(next_available_id), options?.status); }

    return SCORM.save();
}

export function objective_number_from_id(id: string): number | undefined {
    if (!ensure_scorm_connection()) { return undefined; };

    const next_available_id = Number(safe_scorm_get(SCORM_FIELDS.OBECTIVE_COUNT));
    if (typeof next_available_id === 'undefined') {
        return undefined;
    }

    for (var i = 0; i < next_available_id; i++) {
        var objective_id = safe_scorm_get(SCORM_FIELDS.OBJECTIVE_ID(String(i)))
        if (typeof objective_id !== 'undefined' && objective_id == id) {
            return i;
        }
    }
    return undefined;
}

export function set_or_update_objective(id: string, options?: { score?: number, min_score?: number, max_score?: number, status?: SCORM_STATUS }): boolean {
    if (!ensure_scorm_connection()) { return false; };
    const objective_number = objective_number_from_id(id);

    if (typeof objective_number === 'undefined') {
        return new_objective(id, options);
    }

    if (typeof options?.score !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_SCORE(String(objective_number)), options?.score.toString()); }
    if (typeof options?.min_score !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_MIN_SCORE(String(objective_number)), options?.min_score.toString()); }
    if (typeof options?.max_score !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_MAX_SCORE(String(objective_number)), options?.max_score.toString()); }
    if (typeof options?.status !== 'undefined') { safe_scorm_set(SCORM_FIELDS.OBJECTIVE_STATUS(String(objective_number)), options?.status); }

    return SCORM.save();
}

export default function ScormSandbox() {
    const [scorm_connection, set_scorm_connection] = useState(false);

    const saveTest = () => {
        set_level_wpm("test1", 67);
        set_level_wpm("test2", 67);
    };

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        const try_to_connect = async () => {
            await wait(5000);
            set_scorm_connection(ensure_scorm_connection());
        };

        try_to_connect();
    }, [])

    return (
        <div>
            scorm: {scorm_connection ? "connected" : "disconnected"}
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
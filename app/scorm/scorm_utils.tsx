"use client";

import { useState, useEffect } from 'react';
import { SCORM } from "pipwerks-scorm-api-wrapper";

export const SCORM_FIELDS = {
    SUSPEND_DATA: "cmi.suspend_data",

    STUDENT_ID: "cmi.core.student_id",
    STUDENT_NAME: "cmi.core.student_name",

    LESSON_STATUS: "cmi.core.lesson_status",

    INTERACTION_ID: (n: number) => `cmi.interactions.${n}.id` as const,
    INTERACTION_TYPE: (n: number) => `cmi.interactions.${n}.type` as const,
    INTERACTION_RESULT: (n: number) => `cmi.interactions.${n}.result` as const,

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

function new_objective(id: string, options?: { score?: number, min_score?: number, max_score?: number, status?: SCORM_STATUS }): boolean {
    if (!SCORM.connection.isActive) {
        SCORM.init();
    }
    const next_available_id = SCORM.get(SCORM_FIELDS.OBECTIVE_COUNT);

    SCORM.set(SCORM_FIELDS.OBJECTIVE_ID(next_available_id), id);

    if (typeof options?.score !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_SCORE(next_available_id), options?.score.toString()); }
    if (typeof options?.min_score !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_MIN_SCORE(next_available_id), options?.min_score.toString()); }
    if (typeof options?.max_score !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_MAX_SCORE(next_available_id), options?.max_score.toString()); }
    if (typeof options?.status !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_STATUS(next_available_id), options?.status); }

    return SCORM.save();
}

export function set_or_update_objective(id: string, options?: { score?: number, min_score?: number, max_score?: number, status?: SCORM_STATUS }): boolean {
    if (!SCORM.connection.isActive) {
        SCORM.init();
    }
    const next_available_id = Number(SCORM.get(SCORM_FIELDS.OBECTIVE_COUNT));

    // if objective with this id already exists
    for (var i = 0; i < next_available_id; i++) {
        var objective_id = SCORM.get(SCORM_FIELDS.OBJECTIVE_ID(String(i)))
        if (objective_id == id) {
            if (typeof options?.score !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_SCORE(String(i)), options?.score.toString()); }
            if (typeof options?.min_score !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_MIN_SCORE(String(i)), options?.min_score.toString()); }
            if (typeof options?.max_score !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_MAX_SCORE(String(i)), options?.max_score.toString()); }
            if (typeof options?.status !== 'undefined') { SCORM.set(SCORM_FIELDS.OBJECTIVE_STATUS(String(i)), options?.status); }

            return SCORM.save();
        }
    }
    // if objective with this id dont exits
    return new_objective(id, options);
}

export default function ScormSandbox() {

    const saveTest = () => {
        set_or_update_objective("nowy", { status: SCORM_STATUS.PASSED });
    };

    return (
        <div>
            <button onClick={saveTest} className="bg-red-300 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 active:bg-red-700 transition duration-200">test button</button>
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
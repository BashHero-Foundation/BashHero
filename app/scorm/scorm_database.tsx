import { objective_number_from_id, scorm_get, scorm_set, SCORM_FIELDS, SCORM_STATUS, set_or_update_objective } from "./scorm_utils";
import { SCORM } from "pipwerks-scorm-api-wrapper";

import levels_data from "../levels/chapter1.json"

/**
* sets score to wpn and status to passed for level with id
* if wpn is higher than saved dont do anything
* @param id - unique id for level
* @param wpm - u can guess what it means (words per minute)
* @returns 'true' if no error
*/
export async function set_level_wpm(id: string, wpm: number) {
    const objective_number = await objective_number_from_id(id);

    if (typeof objective_number !== 'undefined') {
        const last_wpm = await scorm_get(SCORM_FIELDS.OBJECTIVE_SCORE(String(objective_number)));

        if (typeof last_wpm !== 'undefined' && Number(last_wpm) < wpm) {
            set_or_update_objective(id, { score: wpm, status: SCORM_STATUS.PASSED });
        } else if (typeof last_wpm === 'undefined') {
            set_or_update_objective(id, { score: wpm, status: SCORM_STATUS.PASSED });
        }
    }
    else {
        set_or_update_objective(id, { score: wpm, status: SCORM_STATUS.PASSED });
    }

    await update_global_score();
}

export async function update_global_score() {
    const next_available_id = Number(await scorm_get(SCORM_FIELDS.OBECTIVE_COUNT));

    var passed_levels = 0;

    for (var i = 0; i < next_available_id; i++) {
        var objective_status = await scorm_get(SCORM_FIELDS.OBJECTIVE_STATUS(String(i)))
        if (objective_status == SCORM_STATUS.PASSED) {
            passed_levels++;
        }
    }

    const number_of_levels = levels_data.levels.length;

    if (passed_levels == number_of_levels) {
        scorm_set(SCORM_FIELDS.LESSON_STATUS, SCORM_STATUS.PASSED);
    }
    else {
        scorm_set(SCORM_FIELDS.LESSON_STATUS, SCORM_STATUS.INCOMPLETE);
    }

    scorm_set(SCORM_FIELDS.SCORE_MIN, "0");
    scorm_set(SCORM_FIELDS.SCORE_MAX, "1");
    scorm_set(SCORM_FIELDS.SCORE_RAW, String(passed_levels / number_of_levels));
}
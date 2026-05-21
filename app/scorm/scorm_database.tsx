import {objective_number_from_id, SCORM_FIELDS, SCORM_STATUS, set_or_update_objective} from "./scorm_utils";
import { SCORM } from "pipwerks-scorm-api-wrapper";

import levels_data from "../levels/chapter1.json"

/**
* sets score to wpn and status to passed for level with id
* if wpn is higher than saved dont do anything
* @param id - unique id for level
* @param wpm - u can guess what it means (words per minute)
* @returns 'true' if no error
*/
export function set_level_wpm(id: string, wpm: number): boolean {
    const objective_number = objective_number_from_id(id);

    if (typeof objective_number !== 'undefined') {
        const last_wpm = SCORM.get(SCORM_FIELDS.OBJECTIVE_SCORE(String(objective_number)));

        if (Number(last_wpm) < wpm) {
            set_or_update_objective(id, {score: wpm, status: SCORM_STATUS.PASSED});
        }
    }
    else {
        set_or_update_objective(id, {score: wpm, status: SCORM_STATUS.PASSED});
    }
    
    return update_global_score();
}

function update_global_score(): boolean {
    if (!SCORM.connection.isActive) {
        SCORM.init();
    }
    const next_available_id = Number(SCORM.get(SCORM_FIELDS.OBECTIVE_COUNT));

    var passed_levels = 0;

    for (var i = 0; i < next_available_id; i++) {
        var objective_status = SCORM.get(SCORM_FIELDS.OBJECTIVE_STATUS(String(i)))
        if (objective_status == SCORM_STATUS.PASSED) {
            passed_levels++;
        }
    }

    const number_of_levels = levels_data.levels.length;

    if (passed_levels == number_of_levels) {
        SCORM.set(SCORM_FIELDS.LESSON_STATUS, SCORM_STATUS.PASSED);
    }
    else {
        SCORM.set(SCORM_FIELDS.LESSON_STATUS, SCORM_STATUS.INCOMPLETE);
    }

    SCORM.set(SCORM_FIELDS.SCORE_MIN, "0");
    SCORM.set(SCORM_FIELDS.SCORE_MAX, "1");
    SCORM.set(SCORM_FIELDS.SCORE_RAW, String(passed_levels / number_of_levels));

    return SCORM.save();;
}
import {objective_number_from_id, SCORM_FIELDS, SCORM_STATUS, set_or_update_objective} from "./scorm_utils";
import { SCORM } from "pipwerks-scorm-api-wrapper";
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
            return set_or_update_objective(id, {score: wpm, status: SCORM_STATUS.PASSED});
        }
    }
    else {
        return set_or_update_objective(id, {score: wpm, status: SCORM_STATUS.PASSED});
    }
    return true;
}
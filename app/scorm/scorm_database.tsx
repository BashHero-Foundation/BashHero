import {
    objectiveNumberFromId,
    scormGet,
    scormSet,
    SCORM_FIELDS,
    SCORM_STATUS,
    setOrUpdateObjective,
    scormLog,
} from "./scorm_utils";

import { allLevels } from "../levelsUtils";
import { LevelStats, ScormStorageStruct } from "../types";

/**
 * sets score to wpn and status to passed for level with id
 * if wpn is higher than saved dont do anything
 * @param id - unique id for level
 * @param wpm - u can guess what it means (words per minute)
 * @returns 'true' if no error
 */
export async function setScormLevelWpm(id: string, wpm: number) {
    const objective_number = await objectiveNumberFromId(id);

    if (typeof objective_number !== "undefined") {
        const last_wpm = await scormGet(
            SCORM_FIELDS.OBJECTIVE_SCORE(String(objective_number)),
        );

        if (typeof last_wpm !== "undefined" && Number(last_wpm) < wpm) {
            await setOrUpdateObjective(id, {
                score: wpm,
                status: SCORM_STATUS.PASSED,
            });
        } else if (typeof last_wpm === "undefined") {
            await setOrUpdateObjective(id, {
                score: wpm,
                status: SCORM_STATUS.PASSED,
            });
        }
    } else {
        await setOrUpdateObjective(id, {
            score: wpm,
            status: SCORM_STATUS.PASSED,
        });
    }

    await updateScormGlobalScore();
}

async function getScormStorageStruct(): Promise<ScormStorageStruct> {
  const suspendStorageString = await scormGet(SCORM_FIELDS.SUSPEND_DATA);

  let suspendStorage: ScormStorageStruct = {
      levelStats: {},
  };

  if (suspendStorageString.trim().length > 0) {
      const parsed = JSON.parse(suspendStorageString);

      if (parsed && suspendStorageString.trim().length > 0) {
          suspendStorage = parsed as ScormStorageStruct;
      }
  }

    return suspendStorage;
}

export async function saveScormLevelStats(stats: LevelStats) {
    setScormLevelWpm(stats.levelId, stats.WPM);

    const suspendStorage = await getScormStorageStruct();

    suspendStorage.levelStats[stats.levelId] = stats;

    const resultSuspendStorage = JSON.stringify(suspendStorage);

    await scormSet(SCORM_FIELDS.SUSPEND_DATA, resultSuspendStorage);
}

export async function getScormLevelStats(levelId: string): Promise<LevelStats | null> {
    const suspendStorage = await getScormStorageStruct();

    if (levelId in suspendStorage.levelStats) {
        return suspendStorage.levelStats[levelId];
    }

    return null;
}

export async function getScormAllLevelStats(): Promise<Record<string, LevelStats>> {
    const suspendStorage = await getScormStorageStruct();
    return suspendStorage.levelStats;
}

export async function updateScormGlobalScore() {
    const next_available_id = Number(
        await scormGet(SCORM_FIELDS.OBJECTIVE_COUNT),
    );

    let passed_levels = 0;

    for (let i = 0; i < next_available_id; i++) {
        const objective_status = await scormGet(
            SCORM_FIELDS.OBJECTIVE_STATUS(String(i)),
        );
        if (objective_status == SCORM_STATUS.PASSED) {
            passed_levels++;
        }
    }
    const number_of_levels = allLevels.length;

    if (passed_levels == number_of_levels) {
        await scormSet(SCORM_FIELDS.LESSON_STATUS, SCORM_STATUS.PASSED);
    } else {
        await scormSet(SCORM_FIELDS.LESSON_STATUS, SCORM_STATUS.INCOMPLETE);
    }

    await scormSet(SCORM_FIELDS.SCORE_MIN, "0");
    await scormSet(SCORM_FIELDS.SCORE_MAX, "1");
    await scormSet(
        SCORM_FIELDS.SCORE_RAW,
        String(passed_levels / number_of_levels),
    );
}

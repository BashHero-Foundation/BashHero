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
} as const;

export default function ScormStatus() {
    const [scormConnected, setScormConnected] = useState(false);
    const [scormStudentName, setScormStudentName] = useState("");
    const [testValue, setTestValue] = useState("");

    const saveTest = () => {
        SCORM.set(SCORM_FIELDS.SUSPEND_DATA, "passed");
        setTestValue(SCORM.get(SCORM_FIELDS.SUSPEND_DATA));
        console.log("hello log");
        console.log(SCORM.get(SCORM_FIELDS.SUSPEND_DATA));
        SCORM.save();
    };

    const checkTest = () => {
        setTestValue(SCORM.get(SCORM_FIELDS.SUSPEND_DATA));
        console.log("hello log");
        console.log(SCORM.get(SCORM_FIELDS.SUSPEND_DATA));
    };

    useEffect(() => {
        if (!SCORM.init()) {
            console.log("Something went wrong during scorm connection");
        }
        if (SCORM.connection.isActive) {
            setScormConnected(true);

            setScormStudentName(SCORM.get(SCORM_FIELDS.STUDENT_NAME));

            setTestValue(SCORM.get(SCORM_FIELDS.SUSPEND_DATA));

            console.log(testValue);
        }
        else {
            setScormConnected(false);
        }

        return () => {
            if (SCORM.connection.isActive) {
                SCORM.quit();
                setScormConnected(true);
            }
            else {
                setScormConnected(false);
            }
        };
    }, []);

    return (
        <div>
            {scormConnected && (<p className="font-retro">hello {scormStudentName}</p>)}
            <p className="font-retro">scorm connection status: {scormConnected ? "connected" : "disconnected"}</p>
            <button onClick={saveTest} className="bg-red-300 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 active:bg-red-700 transition duration-200">save SUSPEND_DATA with passed</button>
            <button onClick={checkTest} className="bg-red-300 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 active:bg-red-700 transition duration-200">check SUSPEND_DATA</button>
            <p>scorm SUSPEND_DATA value {testValue}</p>
        </div>
    );
}
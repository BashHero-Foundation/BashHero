"use client";

import { useState, useEffect } from 'react';
import { SCORM } from "pipwerks-scorm-api-wrapper";

export const SCORM_FIELDS = {
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

    useEffect(() => {
        const isConnected = SCORM.init();

        if (isConnected) {
            setScormConnected(true);

            setScormStudentName(SCORM.get(SCORM_FIELDS.STUDENT_NAME));
        }

        return () => {
            if (SCORM.connection.isActive) {
                SCORM.save();
                SCORM.quit();
            }
        };
    }, []);

    return (
        <div>
            {scormConnected && (<p className="font-retro">hello {scormStudentName}</p>)}
            <p className="font-retro">scorm connection status: {scormConnected ? "connected" : "disconnected"}</p>
        </div>
    );
}
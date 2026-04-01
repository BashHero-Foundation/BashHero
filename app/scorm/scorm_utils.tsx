"use client";

import { useState, useEffect } from 'react';
import { SCORM } from "pipwerks-scorm-api-wrapper";

const scorm_student_name_field = "cmi.core.student_name";

export default function ScormStatus() {
    const [scormConnected, setScormConnected] = useState(false);
    const [scormStudentName, setScormStudentName] = useState("");

    useEffect(() => {
        const isConnected = SCORM.init();

        if (isConnected) {
            setScormConnected(true);

            setScormStudentName(SCORM.get(scorm_student_name_field));
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
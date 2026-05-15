import { useEffect, useState } from "react";

export function useLiveTimer(startTime: number | null, isFinished: boolean) {
    const [liveTime, setLiveTime] = useState(0);

    useEffect(() => {
        if (!startTime || isFinished) return;

        const interval = setInterval(() => {
            setLiveTime((Date.now() - startTime) / 1000);
        }, 100);

        return () => clearInterval(interval);
    }, [startTime, isFinished]);

    return liveTime;
}
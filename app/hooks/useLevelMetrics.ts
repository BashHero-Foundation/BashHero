import { LevelMetricsProps } from "../types";


export function useLevelMetrics({commands, duration, errors}: LevelMetricsProps) {

    // characters from all comands in level
    const targetText = commands.map(c => c.text).join('');
    const totalChars = targetText.length;

    const WPM = duration > 0 && totalChars > 0 // prevent bugs
    ?(totalChars / 5) / (duration / 60)
    : 0;
    
    const accuracy = totalChars > 0
            ? Math.max(0, Math.round(((totalChars - errors) / totalChars) * 100))
            : 100;

    return {
        WPM,
        errors,
        accuracy,
    };
}
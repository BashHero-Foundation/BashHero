import { LevelMetricsProps } from "../types";


export function useLevelMetrics({commands, duration, errors, typedChars}: LevelMetricsProps) {

    // characters from all comands in level
    const targetText = commands.map(c => c.text).join('');
    const totalChars = targetText.length;


    const WPM = duration > 0 && totalChars> 0 // prevent bugs
    ?(totalChars / 5) / (duration / 60)
    : 0;

    // lowers WPM when using TAB due to less manual typed character, may be used in the future 
    const manualWPM = duration > 0 && typedChars > 0 // prevent bugs
    ?(typedChars / 5) / (duration / 60)
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
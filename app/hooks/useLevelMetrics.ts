import { LevelMetricsProps } from "../types";


export function useLevelMetrics({commands, duration}: LevelMetricsProps) {

    // characters from all comands in level
    const totalChars = commands.reduce(
        (sum, command) => sum + (command.text?.length || 0),
        0
    )

    const WPM = duration > 0 && totalChars > 0 // prevent bugs
    ?(totalChars / 5) / (duration / 60)
    : 0;
    
    return WPM;

}
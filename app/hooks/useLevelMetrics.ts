import { LevelMetricsProps } from "../types";


export function useLevelMetrics({commands, duration, userText}: LevelMetricsProps) {

    // characters from all comands in level
    const targetText = commands.map(c => c.text).join('');
    const totalChars = targetText.length;

    const WPM = duration > 0 && totalChars > 0 // prevent bugs
    ?(totalChars / 5) / (duration / 60)
    : 0;

    let errors = 0;

    let maxLen = Math.max(userText.length, targetText.length);

    for (let i = 0; i < maxLen; i++) {
        if (userText[i] !== targetText[i]) {
            errors++;
        }
    }

    const accuracy = userText.length > 0
      ? Math.round(((userText.length - errors) / userText.length) * 100)
      : 100;

    return {WPM, errors, accuracy};
}
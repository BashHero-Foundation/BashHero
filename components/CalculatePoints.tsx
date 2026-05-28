export default function CalculatePoints(accuracy: number, wpm: number, maxPoints: number): number {
    const accuracyPoints = accuracy > 80 ? maxPoints * 0.25 : 0;
    const wpmPoints = wpm > 40 ? maxPoints * 0.25 : 0;
    return Math.round(maxPoints * 0.5 + accuracyPoints + wpmPoints);
}
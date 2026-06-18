export default function CalculatePoints(
  accuracy: number,
  wpm: number,
  maxPoints: number,
  minWPM: number,
  minAccuracy: number
): number {
  const accuracyPoints = accuracy >= minAccuracy ? maxPoints * 0.25 : 0;
  const wpmPoints = wpm >= minWPM ? maxPoints * 0.25 : 0;
  return Math.round(maxPoints * 0.5 + accuracyPoints + wpmPoints);
}
export default function CalculatePoints(
  accuracy: number,
  wpm: number,
  tabCount: number,
  maxPoints: number,
  minWPM: number,
  minAccuracy: number,
  minTabCount: number=0
): number {
    if (minTabCount > 0 && tabCount < minTabCount) {
      return Math.round(maxPoints * 0.5);
  }
  const accuracyPoints = accuracy >= minAccuracy ? maxPoints * 0.25 : 0;
  const wpmPoints = wpm >= minWPM ? maxPoints * 0.25 : 0;
  return Math.round(maxPoints * 0.5 + accuracyPoints + wpmPoints);
}
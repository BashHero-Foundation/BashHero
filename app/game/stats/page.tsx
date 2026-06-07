"use client";

import { useGlobalStats } from "@/app/hooks/useGlobalStats";

export default function GlobalStatsPage() {
  const stats = useGlobalStats();

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>Completed levels: {stats.levelsCompleted}</div>
      <div>Total time: {stats.totalDuration.toFixed(2)}s</div>
      <div>Average WPM: {stats.averageWPM}</div>
      <div>Best WPM: {stats.bestWPM}</div>
      <div>Total Errors: {stats.totalErrors}</div>
      <div>Average Accuracy: {stats.averageAccuracy}%</div>
    </div>
  );
}
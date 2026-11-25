import { useEffect, useState } from "react";
import { LevelStats } from "../types";
import { getAllLevelStats, LEVEL_PROGRESS_EVENT } from "@/components/persistentStats";

// returns saved (best) stats of all levels
export function useLevelProgress(): Record<string, LevelStats> {
  const [allStats, setAllStats] = useState<Record<string, LevelStats>>({});

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      getAllLevelStats().then((stats) => {
        if (!cancelled) setAllStats(stats ?? {});
      });
    };
    refresh();

    window.addEventListener(LEVEL_PROGRESS_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(LEVEL_PROGRESS_EVENT, refresh);
    };
  }, []);

  return allStats;
}

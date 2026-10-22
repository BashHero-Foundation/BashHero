import { useEffect, useState } from "react";
import { GlobalStats } from "../types";
import { getGlobalStats } from "@/components/persistentStats";

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    setStats(getGlobalStats());
  }, []);

  return stats;
}

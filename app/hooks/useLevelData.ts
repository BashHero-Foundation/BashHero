import { useState, useEffect } from "react";
import levelsData from "../levels/chapter1.json"
import { Level } from "../types";

export function useLevel(levelId: string) {
  const [level, setLevel] = useState<Level | null>(null);

  useEffect(() => {
    const foundLevel = levelsData.levels.find(
      (lvl: Level) => lvl.id === levelId
    );

    setLevel(foundLevel || null);
  }, [levelId]);

  return { level };
}
export type Command = {
  text: string;
  hint?: string;
};

export type Level = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  points: number;
  commands: Command[];
};

export type LevelMetricsProps = {
  commands: Command[];
  duration: number;
}

export interface LevelStats {
  levelId: string;
  duration: number;
  WPM: number;
  timestamp: string;
}

export type LevelStatsStateProps = {
  isFinished: boolean;
  duration: number;
  wpm: number;
  level: {
    id: string;
    title: string;
  };
};

export interface StatsPageContentProps {
  level: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    points: number;
  };
}
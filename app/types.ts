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

export interface LevelMetricsProps {
  commands: Command[];
  duration: number;
  userText: string;
}

export type LevelStats = {
  levelId: string;
  duration: number;
  WPM: number;
  Errors: number;
  Accuracy: number;
  timestamp: string;
}

export interface LevelStatsStateProps {
  isFinished: boolean;
  duration: number;
  wpm: number;
  errors: number;
  accuracy: number;
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

export interface ScormIframeMessage {
  type: "SET" | "GET";
  payload: {
    field: string;
    value: string;
  }
}
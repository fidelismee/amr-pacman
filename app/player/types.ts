export const categories = ['Student', 'Working Adult', 'Guest'] as const;
export const termsVersion = '2026-11-22';

export interface Player {
  id: string;
  nickname: string;
  bestScore: number;
  clearedLevels: number;
  checkpointScore: number;
}

export interface QuizResponse {
  eventId: string;
  question: string;
  selected: string;
}

export interface Progress {
  score: number;
  clearedLevels: number;
  answers: QuizResponse[];
}

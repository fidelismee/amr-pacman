// Level data for Antibiotic Defender game
// 0 = Path/Infected Cell (dot)
// 1 = Membrane/Wall
// 2 = Empty path (no dot)
// 3 = Immune Booster (power pellet)

export const LEVEL_1: Level = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 3, 0, 0, 0, 3, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const GRID_WIDTH = 15;
export const GRID_HEIGHT = 15;

// Starting positions
export const ANTIBIOTIC_START = { x: 7, y: 7 };
export const BACTERIA_STARTS = [
  { x: 1, y: 1 },
  { x: 13, y: 1 },
  { x: 1, y: 13 },
  { x: 13, y: 13 }
];

export type CellType = 0 | 1 | 2 | 3;
export type Level = CellType[][];

export const LEVELS: Level[] = [LEVEL_1];

// app/game/types.ts
// Shared game types used by level data, AI, quiz logic, and the game component.

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

// 0 = nutrient dot, 1 = wall, 2 = empty path, 3 = resistance booster
export type CellType = 0 | 1 | 2 | 3;
export type Level = CellType[][];

export type Tier = 'easy' | 'moderate' | 'hard';
export type ChaseProfile = 'wander' | 'hunt' | 'pursue';

export interface Zone {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface LevelConfig {
  name: string;
  map: Level;
  playerStart: Position;
  enemySpawnZones: Zone[];
  enemyCount: number;
  baseTier: Tier;
  chaseProfile: ChaseProfile;
}

// app/game/levels.ts
// Level data for the AMR game.
// Cell encoding: 0 = nutrient dot, 1 = wall, 2 = empty path, 3 = resistance booster.

import type { CellType, Level, LevelConfig, Position, Zone } from "./types";

export type { CellType, Level } from "./types";

// --- Maps -----------------------------------------------------------------

// Hand-crafted, asymmetric "open arena" maps — unique per level, increasing in
// size and wall density. Boosters (3) and the player-start empty tile (2) are
// baked in; every other open cell (0) is a nutrient dot. All three are fully
// connected from their player start (verified in levels.test.ts).

const EASY_MAP: Level = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,1,1,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,1,1],
  [1,0,1,1,0,0,0,2,0,0,1,1,1,0,1],
  [1,0,1,1,1,0,0,0,1,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MODERATE_MAP: Level = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,0,1,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,0,0,0,0,1,1,1,0,1,1,0,0,0,1],
  [1,0,1,0,1,1,1,1,1,0,0,0,1,1,0,1,1,1,0,0,1],
  [1,0,0,0,1,1,1,1,0,0,2,0,1,1,0,0,1,1,1,0,1],
  [1,1,1,0,0,1,1,1,0,0,0,0,1,0,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,1,1,1,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,1,1,0,1,0,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const HARD_MAP: Level = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,1,1,0,0,1,1,0,1,1,0,1],
  [1,0,1,0,1,1,0,0,1,1,1,1,0,0,1,0,0,1,1,0,1,1,1,1,0,0,1],
  [1,0,1,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,1],
  [1,0,0,0,1,1,0,1,1,1,1,0,0,2,0,0,0,1,0,0,1,1,1,0,1,1,1],
  [1,0,0,1,0,0,0,1,1,1,1,0,0,0,1,0,1,0,1,0,1,1,1,1,0,0,1],
  [1,0,0,1,1,0,0,0,1,1,1,1,0,1,1,0,1,0,1,0,0,0,1,1,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,0,1,0,0,0,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,1,1,1,0,0,1,1,0,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,1,1,0,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,1,1,1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// --- Reachability & winnable grid -----------------------------------------

export function floodFill(map: Level, start: Position): boolean[][] {
  const height = map.length;
  const width = map[0].length;
  const reachable: boolean[][] = Array.from({ length: height }, () =>
    new Array<boolean>(width).fill(false),
  );
  if (map[start.y]?.[start.x] === 1) return reachable;

  const queue: Position[] = [start];
  reachable[start.y][start.x] = true;
  let head = 0;
  const steps = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];
  while (head < queue.length) {
    const cur = queue[head++];
    for (const { dx, dy } of steps) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (map[ny][nx] === 1) continue;
      if (reachable[ny][nx]) continue;
      reachable[ny][nx] = true;
      queue.push({ x: nx, y: ny });
    }
  }
  return reachable;
}

// Runtime grid: dots/boosters only survive on cells reachable from the start.
export function buildLevelState(config: LevelConfig): Level {
  const reachable = floodFill(config.map, config.playerStart);
  return config.map.map((row, y) =>
    row.map((cell, x): CellType => {
      if (cell === 1) return 1;
      if (!reachable[y][x]) return 2;
      if (cell === 3) return 3;
      if (cell === 0) return 0;
      return 2;
    }),
  );
}

// --- Enemy spawning -------------------------------------------------------

const keyOf = (p: Position) => `${p.x},${p.y}`;

function zoneCells(map: Level, reachable: boolean[][], zone: Zone): Position[] {
  const cells: Position[] = [];
  for (let y = zone.minY; y <= zone.maxY; y++) {
    for (let x = zone.minX; x <= zone.maxX; x++) {
      if (map[y]?.[x] !== 1 && reachable[y]?.[x]) cells.push({ x, y });
    }
  }
  return cells;
}

export function generateSpawnPositions(
  config: LevelConfig,
  count: number = config.enemyCount,
): Position[] {
  const reachable = floodFill(config.map, config.playerStart);
  const zones = config.enemySpawnZones;
  const used = new Set<string>();
  const result: Position[] = [];
  let zi = 0;
  let guard = 0;
  while (result.length < count && guard < count * 50) {
    guard++;
    const zone = zones[zi % zones.length];
    zi++;
    const cells = zoneCells(config.map, reachable, zone).filter(
      (c) => !used.has(keyOf(c)),
    );
    if (cells.length === 0) continue;
    const pick = cells[Math.floor(Math.random() * cells.length)];
    used.add(keyOf(pick));
    result.push(pick);
  }
  return result;
}

export function pickRespawnPosition(config: LevelConfig): Position | null {
  const [pos] = generateSpawnPositions(config, 1);
  return pos ?? null;
}

// --- Levels ---------------------------------------------------------------

export const LEVELS: LevelConfig[] = [
  {
    name: "Level 1 — Easy",
    map: EASY_MAP,
    playerStart: { x: 7, y: 5 },
    enemySpawnZones: [
      { minX: 1, maxX: 3, minY: 1, maxY: 3 },
      { minX: 11, maxX: 13, minY: 1, maxY: 3 },
      { minX: 1, maxX: 3, minY: 7, maxY: 9 },
      { minX: 11, maxX: 13, minY: 7, maxY: 9 },
    ],
    enemyCount: 3,
    baseTier: "easy",
    chaseProfile: "wander",
  },
  {
    name: "Level 2 — Moderate",
    map: MODERATE_MAP,
    playerStart: { x: 10, y: 7 },
    enemySpawnZones: [
      { minX: 1, maxX: 4, minY: 1, maxY: 4 },
      { minX: 15, maxX: 19, minY: 1, maxY: 4 },
      { minX: 1, maxX: 4, minY: 9, maxY: 13 },
      { minX: 15, maxX: 19, minY: 9, maxY: 13 },
    ],
    enemyCount: 3,
    baseTier: "moderate",
    chaseProfile: "hunt",
  },
  {
    name: "Level 3 — Hard",
    map: HARD_MAP,
    playerStart: { x: 13, y: 9 },
    enemySpawnZones: [
      { minX: 1, maxX: 5, minY: 1, maxY: 5 },
      { minX: 21, maxX: 25, minY: 1, maxY: 5 },
      { minX: 1, maxX: 5, minY: 13, maxY: 17 },
      { minX: 21, maxX: 25, minY: 13, maxY: 17 },
    ],
    enemyCount: 3,
    baseTier: "hard",
    chaseProfile: "pursue",
  },
];

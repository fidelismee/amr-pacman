# Difficulty Levels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-board game into a three-level progression (Easy → Moderate → Hard) with larger maps, level-based quiz tiers, and antibiotic chase AI that scales with difficulty.

**Architecture:** Extract three concerns out of the `BacteriaGame` monolith into small, pure, testable modules — shared types, quiz-tier mapping, and antibiotic movement AI — plus a rewritten `levels.ts` that holds three level configs and a winnability-guaranteeing map loader. `BacteriaGame` then becomes level-driven: it reads the current `LevelConfig`, calls the AI module each tick, and advances levels on win.

**Tech Stack:** Next.js 16 / React 19 / TypeScript. Tests use Node's built-in `node:test` runner with TypeScript type-stripping (matches the existing `app/game/audio/audioState.test.ts`).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `app/game/types.ts` (new) | Shared types: `Direction`, `Position`, `CellType`, `Level`, `Tier`, `ChaseProfile`, `Zone`, `LevelConfig`. |
| `app/game/quiz/difficulty.ts` (new) | Pure `getEffectiveTier(baseTier, lives)`. |
| `app/game/quiz/difficulty.test.ts` (new) | Tests for the tier mapping. |
| `app/game/ai/antibioticMovement.ts` (new) | Pure `computeAntibioticMoves` + `buildDistanceField` (BFS chase). |
| `app/game/ai/antibioticMovement.test.ts` (new) | Tests for wander/hunt/pursue, occupancy, no-reverse, walls. |
| `app/game/levels.ts` (rewrite) | Three `LevelConfig`s, `latticeMap`/`buildMap` generators, `buildLevelState` (flood-fill dot placement), `generateSpawnPositions`, `pickRespawnPosition`, `floodFill`. |
| `app/game/levels.test.ts` (new) | Tests for `buildLevelState` winnability + `floodFill`. |
| `app/game/components/BacteriaGame.tsx` (edit) | Level-driven state, per-level dimensions, progression flow, calls AI + tier modules. |
| `README.md`, `current_project.md` (edit) | Document the new levels feature. |

**Testing note:** run test files with:
`node --test --experimental-strip-types <path-to-test-file>`
(Node 22.6+; on Node 23+ the flag is optional.) Per repo guardrails, only run tests/builds when explicitly doing so as part of executing this plan; `npm run dev` remains the standing compile-check.

---

## Task 1: Shared types module

**Files:**
- Create: `app/game/types.ts`

- [ ] **Step 1: Create the types file**

```ts
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run dev` and confirm no TypeScript error is reported for `app/game/types.ts`. Stop the dev server after confirming.
Expected: dev server compiles cleanly.

- [ ] **Step 3: Commit**

```bash
git add app/game/types.ts
git commit -m "feat: add shared game types module"
```

---

## Task 2: Quiz tier mapping (TDD)

**Files:**
- Create: `app/game/quiz/difficulty.ts`
- Test: `app/game/quiz/difficulty.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/game/quiz/difficulty.test.ts
import assert from "node:assert/strict";
import test from "node:test";

import { getEffectiveTier } from "./difficulty.ts";

test("easy level climbs easy -> moderate -> hard as lives drop", () => {
  assert.equal(getEffectiveTier("easy", 3), "easy");
  assert.equal(getEffectiveTier("easy", 2), "moderate");
  assert.equal(getEffectiveTier("easy", 1), "hard");
  assert.equal(getEffectiveTier("easy", 0), "hard");
});

test("moderate level starts at moderate and caps at hard", () => {
  assert.equal(getEffectiveTier("moderate", 3), "moderate");
  assert.equal(getEffectiveTier("moderate", 2), "hard");
  assert.equal(getEffectiveTier("moderate", 1), "hard");
});

test("hard level is always hard", () => {
  assert.equal(getEffectiveTier("hard", 3), "hard");
  assert.equal(getEffectiveTier("hard", 2), "hard");
  assert.equal(getEffectiveTier("hard", 0), "hard");
});

test("lives above 3 behave like 3", () => {
  assert.equal(getEffectiveTier("easy", 5), "easy");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types app/game/quiz/difficulty.test.ts`
Expected: FAIL — cannot resolve `./difficulty.ts` / `getEffectiveTier is not a function`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/game/quiz/difficulty.ts
import type { Tier } from "../types";

const TIERS: Tier[] = ["easy", "moderate", "hard"];

// Level sets the baseline tier; losing lives raises it (capped at hard).
export function getEffectiveTier(baseTier: Tier, lives: number): Tier {
  const penalty = lives >= 3 ? 0 : lives === 2 ? 1 : 2;
  const baseIndex = TIERS.indexOf(baseTier);
  const index = Math.min(TIERS.length - 1, Math.max(0, baseIndex + penalty));
  return TIERS[index];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types app/game/quiz/difficulty.test.ts`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/game/quiz/difficulty.ts app/game/quiz/difficulty.test.ts
git commit -m "feat: add level-based quiz tier mapping"
```

---

## Task 3: Antibiotic chase AI (TDD)

**Files:**
- Create: `app/game/ai/antibioticMovement.ts`
- Test: `app/game/ai/antibioticMovement.test.ts`

The module exposes `buildDistanceField` (BFS distances from the bacteria over open cells) and `computeAntibioticMoves` (computes every enemy's next position/direction for one tick). `random` is injectable so tests are deterministic.

- [ ] **Step 1: Write the failing test**

```ts
// app/game/ai/antibioticMovement.test.ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDistanceField,
  computeAntibioticMoves,
} from "./antibioticMovement.ts";
import type { Position } from "../types";

// 5x5 grid: border walls, open 3x3 interior (x,y in 1..3).
const width = 5;
const height = 5;
const isWall = (x: number, y: number) =>
  x <= 0 || x >= width - 1 || y <= 0 || y >= height - 1;

test("buildDistanceField gives 0 at the bacteria and grows outward", () => {
  const bacteria: Position = { x: 3, y: 3 };
  const dist = buildDistanceField(bacteria, isWall, width, height);
  assert.equal(dist[3][3], 0);
  assert.equal(dist[1][1], 4); // manhattan path around the open interior
});

test("pursue moves the antibiotic closer to the bacteria", () => {
  const bacteria: Position = { x: 3, y: 3 };
  const dist = buildDistanceField(bacteria, isWall, width, height);
  const before = { x: 1, y: 1 };
  const result = computeAntibioticMoves({
    positions: [before],
    directions: ["down"],
    isWall,
    bacteria,
    profile: "pursue",
    width,
    height,
    random: () => 0.5, // >0.15, so no random deviation
  });
  const after = result.positions[0];
  assert.ok(
    dist[after.y][after.x] < dist[before.y][before.x],
    `expected ${JSON.stringify(after)} closer than ${JSON.stringify(before)}`,
  );
});

test("moves never land on a wall", () => {
  const result = computeAntibioticMoves({
    positions: [{ x: 1, y: 1 }],
    directions: ["up"],
    isWall,
    bacteria: { x: 3, y: 3 },
    profile: "wander",
    width,
    height,
    random: () => 0,
  });
  const p = result.positions[0];
  assert.equal(isWall(p.x, p.y), false);
});

test("two antibiotics never stack on the same cell", () => {
  // A at (1,1) and B at (2,1), both facing right and trying to continue.
  const result = computeAntibioticMoves({
    positions: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    directions: ["right", "right"],
    isWall,
    bacteria: { x: 3, y: 3 },
    profile: "wander",
    width,
    height,
    random: () => 0, // wander: continue-current path
  });
  const [a, b] = result.positions;
  assert.notDeepEqual(a, b);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types app/game/ai/antibioticMovement.test.ts`
Expected: FAIL — module/exports not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/game/ai/antibioticMovement.ts
import type { ChaseProfile, Direction, Position } from "../types";

interface Step {
  dir: Direction;
  dx: number;
  dy: number;
}

const DIRECTIONS: Step[] = [
  { dir: "up", dx: 0, dy: -1 },
  { dir: "down", dx: 0, dy: 1 },
  { dir: "left", dx: -1, dy: 0 },
  { dir: "right", dx: 1, dy: 0 },
];

function opposite(d: Direction): Direction {
  return d === "up" ? "down" : d === "down" ? "up" : d === "left" ? "right" : "left";
}

const keyOf = (p: Position) => `${p.x},${p.y}`;

// BFS distance from the bacteria across all non-wall cells.
export function buildDistanceField(
  bacteria: Position,
  isWall: (x: number, y: number) => boolean,
  width: number,
  height: number,
): number[][] {
  const dist: number[][] = Array.from({ length: height }, () =>
    new Array<number>(width).fill(Infinity),
  );
  if (
    bacteria.x < 0 || bacteria.x >= width ||
    bacteria.y < 0 || bacteria.y >= height ||
    isWall(bacteria.x, bacteria.y)
  ) {
    return dist;
  }
  const queue: Position[] = [bacteria];
  dist[bacteria.y][bacteria.x] = 0;
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    for (const { dx, dy } of DIRECTIONS) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (isWall(nx, ny)) continue;
      if (dist[ny][nx] !== Infinity) continue;
      dist[ny][nx] = dist[cur.y][cur.x] + 1;
      queue.push({ x: nx, y: ny });
    }
  }
  return dist;
}

export interface AntibioticMoveInput {
  positions: Position[];
  directions: Direction[];
  isWall: (x: number, y: number) => boolean;
  bacteria: Position;
  profile: ChaseProfile;
  width: number;
  height: number;
  random?: () => number;
}

export interface AntibioticMoveResult {
  positions: Position[];
  directions: Direction[];
}

function bestTowardBacteria(
  pos: Position,
  moves: Step[],
  dist: number[][] | null,
): Step {
  if (!dist || moves.length === 0) return moves[0];
  let best = moves[0];
  let bestD = Infinity;
  for (const m of moves) {
    const d = dist[pos.y + m.dy]?.[pos.x + m.dx] ?? Infinity;
    if (d < bestD) {
      bestD = d;
      best = m;
    }
  }
  return best;
}

function chooseMove(
  pos: Position,
  currentDir: Direction,
  validMoves: Step[],
  profile: ChaseProfile,
  dist: number[][] | null,
  random: () => number,
): Step | null {
  if (validMoves.length === 0) return null;

  const opp = opposite(currentDir);
  const nonReverse = validMoves.filter((m) => m.dir !== opp);
  const wanderPool =
    nonReverse.length > 0 && random() < 0.8 ? nonReverse : validMoves;

  const wander = (): Step => {
    const cont = validMoves.find((m) => m.dir === currentDir);
    if (cont && random() < 0.6) return cont;
    return wanderPool[Math.floor(random() * wanderPool.length)];
  };

  if (profile === "wander") {
    return wander();
  }

  if (profile === "hunt") {
    if (random() < 0.5) {
      return bestTowardBacteria(pos, nonReverse.length ? nonReverse : validMoves, dist);
    }
    return wander();
  }

  // pursue
  if (random() < 0.15) {
    const pool = nonReverse.length ? nonReverse : validMoves;
    return pool[Math.floor(random() * pool.length)];
  }
  return bestTowardBacteria(pos, nonReverse.length ? nonReverse : validMoves, dist);
}

export function computeAntibioticMoves(
  input: AntibioticMoveInput,
): AntibioticMoveResult {
  const { positions, directions, isWall, bacteria, profile, width, height } = input;
  const random = input.random ?? Math.random;

  const dist =
    profile === "hunt" || profile === "pursue"
      ? buildDistanceField(bacteria, isWall, width, height)
      : null;

  const takenNext = new Set<string>();
  const pendingCurrent = new Set<string>(positions.map(keyOf));

  const newPositions: Position[] = [];
  const newDirections: Direction[] = [...directions];

  positions.forEach((pos, index) => {
    pendingCurrent.delete(keyOf(pos)); // this enemy is moving; free its own cell
    const currentDir = directions[index] ?? "right";

    const blocked = (x: number, y: number) =>
      takenNext.has(`${x},${y}`) || pendingCurrent.has(`${x},${y}`);

    const validMoves = DIRECTIONS.filter((d) => {
      const tx = pos.x + d.dx;
      const ty = pos.y + d.dy;
      return !isWall(tx, ty) && !blocked(tx, ty);
    });

    const chosen = chooseMove(pos, currentDir, validMoves, profile, dist, random);

    if (!chosen) {
      newPositions.push(pos);
      takenNext.add(keyOf(pos));
      return;
    }

    const nextPos = { x: pos.x + chosen.dx, y: pos.y + chosen.dy };
    newDirections[index] = chosen.dir;
    newPositions.push(nextPos);
    takenNext.add(keyOf(nextPos));
  });

  return { positions: newPositions, directions: newDirections };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types app/game/ai/antibioticMovement.test.ts`
Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/game/ai/antibioticMovement.ts app/game/ai/antibioticMovement.test.ts
git commit -m "feat: add profile-based antibiotic chase AI"
```

---

## Task 4: Level configs + winnable map loader (TDD)

**Files:**
- Rewrite: `app/game/levels.ts`
- Test: `app/game/levels.test.ts`

Maps are built by a deterministic **lattice generator** (border walls + isolated even/even pillars) so every level is guaranteed fully connected; per-level booster and empty-tile overlays are applied on top. `buildLevelState` flood-fills from the player start and only keeps dots/boosters on reachable cells — so no level can ever be unwinnable.

- [ ] **Step 1: Write the failing test**

```ts
// app/game/levels.test.ts
import assert from "node:assert/strict";
import test from "node:test";

import { buildLevelState, floodFill, LEVELS } from "./levels.ts";
import type { LevelConfig } from "./types";

// A map with a fully walled-off right region (column x=2 is all wall).
const sealedConfig: LevelConfig = {
  name: "test",
  map: [
    [1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 3, 1],
    [1, 2, 1, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  playerStart: { x: 1, y: 3 },
  enemySpawnZones: [{ minX: 1, maxX: 1, minY: 1, maxY: 1 }],
  enemyCount: 1,
  baseTier: "easy",
  chaseProfile: "wander",
};

test("floodFill only reaches cells connected to the start", () => {
  const reachable = floodFill(sealedConfig.map, sealedConfig.playerStart);
  assert.equal(reachable[1][1], true); // left region
  assert.equal(reachable[1][3], false); // sealed right region
});

test("buildLevelState keeps reachable dots and drops unreachable dots/boosters", () => {
  const grid = buildLevelState(sealedConfig);
  assert.equal(grid[1][1], 0); // reachable dot kept
  assert.equal(grid[1][3], 2); // unreachable dot removed
  assert.equal(grid[2][3], 2); // unreachable booster removed
  assert.equal(grid[3][1], 2); // player start stays empty
});

test("every configured level is winnable: at least one dot, all reachable", () => {
  for (const config of LEVELS) {
    const grid = buildLevelState(config);
    const reachable = floodFill(config.map, config.playerStart);
    let dotCount = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 0) {
          dotCount++;
          assert.equal(reachable[y][x], true, `${config.name} has an unreachable dot`);
        }
      }
    }
    assert.ok(dotCount > 0, `${config.name} has no dots`);
  }
});

test("there are exactly three levels, ordered easy/moderate/hard", () => {
  assert.equal(LEVELS.length, 3);
  assert.deepEqual(
    LEVELS.map((l) => l.baseTier),
    ["easy", "moderate", "hard"],
  );
  assert.deepEqual(
    LEVELS.map((l) => l.chaseProfile),
    ["wander", "hunt", "pursue"],
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types app/game/levels.test.ts`
Expected: FAIL — new exports (`buildLevelState`, `floodFill`, `LEVELS` shape) not present.

- [ ] **Step 3: Write the implementation**

Replace the entire contents of `app/game/levels.ts` with:

```ts
// app/game/levels.ts
// Level data for the AMR game.
// Cell encoding: 0 = nutrient dot, 1 = wall, 2 = empty path, 3 = resistance booster.

import type { CellType, Level, LevelConfig, Position, Zone } from "./types";

export type { CellType, Level } from "./types";

// --- Map generation -------------------------------------------------------

// Border walls + isolated pillars at even/even interior coords.
// Guarantees a fully connected interior (odd rows and odd columns stay open).
function latticeMap(width: number, height: number): Level {
  const grid: Level = [];
  for (let y = 0; y < height; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        row.push(1);
      } else if (x % 2 === 0 && y % 2 === 0) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
    grid.push(row);
  }
  return grid;
}

function buildMap(
  width: number,
  height: number,
  boosters: Position[],
  empties: Position[],
): Level {
  const grid = latticeMap(width, height);
  for (const b of boosters) grid[b.y][b.x] = 3;
  for (const e of empties) grid[e.y][e.x] = 2;
  return grid;
}

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
    map: buildMap(
      15,
      11,
      [
        { x: 1, y: 1 },
        { x: 13, y: 9 },
      ],
      [{ x: 7, y: 5 }],
    ),
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
    map: buildMap(
      21,
      15,
      [
        { x: 1, y: 1 },
        { x: 19, y: 13 },
      ],
      [{ x: 10, y: 7 }],
    ),
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
    map: buildMap(
      27,
      19,
      [
        { x: 1, y: 1 },
        { x: 25, y: 17 },
        { x: 13, y: 9 },
      ],
      [{ x: 13, y: 9 }],
    ),
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
```

Note: the Hard level lists `{ x: 13, y: 9 }` in both `boosters` and `empties`; `buildMap` applies boosters first then empties, so the player-start cell ends up empty (`2`) — intended.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types app/game/levels.test.ts`
Expected: PASS — all 4 tests pass (including the winnability sweep over all 3 levels).

- [ ] **Step 5: Commit**

```bash
git add app/game/levels.ts app/game/levels.test.ts
git commit -m "feat: add three level configs with winnable map loader"
```

---

## Task 5: Make BacteriaGame level-driven (map, dimensions, spawns)

This task swaps the hardcoded single board for the current level's config. No progression yet — it still just plays level 0. Verified by compile + play.

**Files:**
- Modify: `app/game/components/BacteriaGame.tsx`

- [ ] **Step 1: Replace the level imports**

Find (lines ~12-26):

```ts
import { Bacteria } from '../../../src/entities/Bacteria';
import { BacteriaRenderer } from '../../../src/components/BacteriaRenderer';
import { Antibiotic } from '../../../src/entities/Antibiotic';
import { AntibioticRenderer } from '../../../src/components/AntibioticRenderer';
import { questions, Question } from '../../../src/data/questions';

import {
  LEVEL_1,
  GRID_WIDTH,
  GRID_HEIGHT,
  ANTIBIOTIC_START as BACTERIA_START_POS,
  BACTERIA_STARTS as ANTIBIOTIC_STARTS,
  Level,
  CellType
} from '../levels';
```

Replace with:

```ts
import { Bacteria } from '../../../src/entities/Bacteria';
import { BacteriaRenderer } from '../../../src/components/BacteriaRenderer';
import { Antibiotic } from '../../../src/entities/Antibiotic';
import { AntibioticRenderer } from '../../../src/components/AntibioticRenderer';
import { questions, Question } from '../../../src/data/questions';

import {
  LEVELS,
  buildLevelState,
  generateSpawnPositions,
  pickRespawnPosition,
} from '../levels';
import type { Direction, Position, Level } from '../types';
import { computeAntibioticMoves } from '../ai/antibioticMovement';
import { getEffectiveTier } from '../quiz/difficulty';
```

- [ ] **Step 2: Remove the now-duplicated local type aliases**

Find (lines ~28-33):

```ts
// Types
type Direction = 'up' | 'down' | 'left' | 'right';
interface Position {
  x: number;
  y: number;
}

// Constants
```

Replace with:

```ts
// Constants
```

(`Direction` and `Position` now come from `../types`.)

- [ ] **Step 3: Introduce level state and derived config/dimensions**

Find (lines ~46-56):

```ts
  // STEP B: LOADING STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [showCutscene, setShowCutscene] = useState(false);

  const [level, setLevel] = useState<Level>(LEVEL_1);
  const [bacteriaPosition, setBacteriaPosition] = useState<Position>(BACTERIA_START_POS);
  const [antibioticPositions, setAntibioticPositions] = useState<Position[]>([]);
  const [bacteriaInstance, setBacteriaInstance] = useState<Bacteria>(
    new Bacteria(BACTERIA_START_POS.x, BACTERIA_START_POS.y)
  );
```

Replace with:

```ts
  // STEP B: LOADING STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [showCutscene, setShowCutscene] = useState(false);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const currentConfig = LEVELS[currentLevelIndex];

  const [level, setLevel] = useState<Level>(() => buildLevelState(LEVELS[0]));
  const [bacteriaPosition, setBacteriaPosition] = useState<Position>(LEVELS[0].playerStart);
  const [antibioticPositions, setAntibioticPositions] = useState<Position[]>([]);
  const [bacteriaInstance, setBacteriaInstance] = useState<Bacteria>(
    new Bacteria(LEVELS[0].playerStart.x, LEVELS[0].playerStart.y)
  );
```

- [ ] **Step 4: Fix the remaining `BACTERIA_START_POS` refs and add derived dimensions**

Find (lines ~64-68):

```ts
  // Refs for mutable state to avoid stale closure issues
  const poweredUpRef = useRef(false);
  const justCollectedBoosterRef = useRef(false);
  const bacteriaPositionRef = useRef<Position>(BACTERIA_START_POS);
  const antibioticPositionsRef = useRef<Position[]>([]);
```

Replace with:

```ts
  // Refs for mutable state to avoid stale closure issues
  const poweredUpRef = useRef(false);
  const justCollectedBoosterRef = useRef(false);
  const bacteriaPositionRef = useRef<Position>(LEVELS[0].playerStart);
  const antibioticPositionsRef = useRef<Position[]>([]);
```

Then find (lines ~96-101):

```ts
  const boardPixelWidth = GRID_WIDTH * CELL_SIZE;
  const boardPixelHeight = GRID_HEIGHT * CELL_SIZE;

  // Calculate responsive cell size for mobile
  const [responsiveCellSize, setResponsiveCellSize] = useState(CELL_SIZE);
  const boardRef = useRef<HTMLDivElement>(null);
```

Replace with:

```ts
  // Current level dimensions (per-level, derived from the runtime grid)
  const gridWidth = level[0]?.length ?? 0;
  const gridHeight = level.length;

  // Calculate responsive cell size for mobile
  const [responsiveCellSize, setResponsiveCellSize] = useState(CELL_SIZE);
  const boardRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 5: Point the responsive sizing at per-level dimensions**

In the `updateCellSize` effect, find:

```ts
      const cellSizeByWidth = Math.floor(availableWidth / GRID_WIDTH);
      const cellSizeByHeight = Math.floor(availableHeight / GRID_HEIGHT);
```

Replace with:

```ts
      const cellSizeByWidth = Math.floor(availableWidth / gridWidth);
      const cellSizeByHeight = Math.floor(availableHeight / gridHeight);
```

Then change that effect's dependency array from:

```ts
  }, [platform.isMobile]);
```

to (the FIRST occurrence — the `updateCellSize` effect only):

```ts
  }, [platform.isMobile, gridWidth, gridHeight]);
```

Then find:

```ts
  const responsiveBoardWidth = GRID_WIDTH * responsiveCellSize;
  const responsiveBoardHeight = GRID_HEIGHT * responsiveCellSize;
```

Replace with:

```ts
  const responsiveBoardWidth = gridWidth * responsiveCellSize;
  const responsiveBoardHeight = gridHeight * responsiveCellSize;
```

- [ ] **Step 6: Replace the hardcoded spawn generator**

Find the whole `generateScatteredPositions` function (lines ~163-198, from the comment `// --- NEW: Quadrant-Based Spawning Logic ---` through its closing `};`) and replace it with:

```ts
  // Spawn antibiotics from the current level's configured zones.
  const generateScatteredPositions = (): Position[] =>
    generateSpawnPositions(currentConfig);
```

- [ ] **Step 7: Point the grid render at per-level dimensions**

Find (in the JSX, ~line 881):

```ts
                      gridTemplateColumns: `repeat(${GRID_WIDTH}, ${responsiveCellSize}px)`,
                      gridTemplateRows: `repeat(${GRID_HEIGHT}, ${responsiveCellSize}px)`,
```

Replace with:

```ts
                      gridTemplateColumns: `repeat(${gridWidth}, ${responsiveCellSize}px)`,
                      gridTemplateRows: `repeat(${gridHeight}, ${responsiveCellSize}px)`,
```

- [ ] **Step 8: Rewrite `initializeGame` to load level 0 via config**

Find the `initializeGame` function (lines ~653-675) and replace it with:

```ts
  const initializeLevel = useCallback((index: number, resetScore: boolean) => {
    const config = LEVELS[index];
    const grid = buildLevelState(config);
    const spawns = generateSpawnPositions(config);

    setLevel(grid);
    setBacteriaPosition(config.playerStart);
    setAntibioticPositions(spawns);
    antibioticDirectionsRef.current = spawns.map(() => 'right');

    bacteriaPositionRef.current = config.playerStart;
    antibioticPositionsRef.current = spawns;
    prevBacteriaPositionRef.current = { ...config.playerStart };
    prevAntibioticPositionsRef.current = spawns.map((pos) => ({ ...pos }));
    poweredUpRef.current = false;
    justCollectedBoosterRef.current = false;

    if (resetScore) setScore(0);
    setLives(3);
    setGameActive(true);
    setPoweredUp(false);
    setPowerUpTimer(0);
    setGameMessage('');
    setLevelComplete(false);
    setIsRunning(true);
  }, []);

  const initializeGame = useCallback(() => {
    setCurrentLevelIndex(0);
    initializeLevel(0, true);
  }, [initializeLevel]);
```

- [ ] **Step 9: Verify it compiles and plays**

Run: `npm run dev`, open http://localhost:3000, click through loading + cutscene, and confirm the (smaller Easy) board renders and the bacteria moves/eats dots. Antibiotics still use the old inline movement — that's fixed in Task 6. Stop the dev server.
Expected: compiles; Easy map (15×11) renders and is playable.

- [ ] **Step 10: Commit**

```bash
git add app/game/components/BacteriaGame.tsx
git commit -m "feat: drive BacteriaGame from level config and per-level dimensions"
```

---

## Task 6: Wire in the AI module, quiz tiers, and config-based respawn

**Files:**
- Modify: `app/game/components/BacteriaGame.tsx`

- [ ] **Step 1: Replace `moveAntibiotics` with the AI module**

Replace the entire `moveAntibiotics` function (lines ~355-483) with:

```ts
  const moveAntibiotics = () => {
    setAntibioticPositions(prev => {
      if (prev.length === 0) return prev; // Wait for init

      const result = computeAntibioticMoves({
        positions: prev,
        directions: antibioticDirectionsRef.current,
        isWall: (x, y) => !canMoveTo(x, y),
        bacteria: bacteriaPositionRef.current,
        profile: currentConfig.chaseProfile,
        width: gridWidth,
        height: gridHeight,
      });

      antibioticDirectionsRef.current = result.directions;
      antibioticPositionsRef.current = result.positions;
      return result.positions;
    });
  };
```

- [ ] **Step 2: Use the level-based tier in `triggerQuestion`**

Find the `getDifficulty` function and the start of `triggerQuestion` (lines ~594-609):

```ts
  const getDifficulty = (): "easy" | "moderate" | "hard" => {
  if (lives >= 3) return "easy";
  if (lives === 2) return "moderate";
  return "hard";
};

const triggerQuestion = () => {
  const difficulty = getDifficulty();

  const filtered = questions.filter(
    q => q.difficulty === difficulty
  );
```

Replace with:

```ts
const triggerQuestion = () => {
  const difficulty = getEffectiveTier(currentConfig.baseTier, lives);

  const filtered = questions.filter(
    q => q.difficulty === difficulty
  );
```

- [ ] **Step 3: Fix the eat-enemy respawn to use the current level**

In `checkCollisions`, find the powered-up branch that removes and respawns an antibiotic (lines ~547-584):

```ts
        if (isPoweredUp) {
          // Eat Enemy - Remove temporarily and respawn after delay
          setAntibioticPositions(prev => prev.filter((a, i) => i !== index));
          setAntibioticInstances(prev => prev.filter((_, i) => i !== index));
          setScore(prev => prev + 100);
          playMovementEffect();

          // Respawn the antibiotic after 3 seconds
          setTimeout(() => {
            setAntibioticPositions(prev => {
              // Generate a new position in a random quadrant
              const quadrants = [
                { minX: 1, maxX: 8, minY: 1, maxY: 4 },     // Top-Left
                { minX: 18, maxX: 25, minY: 1, maxY: 4 },   // Top-Right
                { minX: 1, maxX: 8, minY: 14, maxY: 17 },   // Bottom-Left
                { minX: 18, maxX: 25, minY: 14, maxY: 17 }, // Bottom-Right
              ];

              const randomQuadrant = quadrants[Math.floor(Math.random() * quadrants.length)];
              const validPositions: Position[] = [];

              // Find all valid empty cells in this quadrant
              for (let y = randomQuadrant.minY; y <= randomQuadrant.maxY; y++) {
                for (let x = randomQuadrant.minX; x <= randomQuadrant.maxX; x++) {
                  if (LEVEL_1[y]?.[x] !== 1) {
                    validPositions.push({ x, y });
                  }
                }
              }

              if (validPositions.length > 0) {
                const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
                return [...prev, randomPos];
              }

              return prev; // No valid position found, don't respawn
            });
          }, 3000); // 3 second respawn delay
        } else {
```

Replace with:

```ts
        if (isPoweredUp) {
          // Eat Enemy - Remove temporarily and respawn after delay
          setAntibioticPositions(prev => prev.filter((a, i) => i !== index));
          setAntibioticInstances(prev => prev.filter((_, i) => i !== index));
          antibioticDirectionsRef.current = antibioticDirectionsRef.current.filter((_, i) => i !== index);
          setScore(prev => prev + 100);
          playMovementEffect();

          // Respawn the antibiotic in a configured spawn zone after 3 seconds
          setTimeout(() => {
            const respawn = pickRespawnPosition(currentConfig);
            if (!respawn) return;
            antibioticDirectionsRef.current = [...antibioticDirectionsRef.current, 'right'];
            setAntibioticPositions(prev => [...prev, respawn]);
          }, 3000); // 3 second respawn delay
        } else {
```

- [ ] **Step 4: Refresh game-loop closures on level change**

Find the game-loop effect dependency array (line ~758):

```ts
  }, [isRunning, gameActive, bacteriaPosition, antibioticPositions, poweredUp, level]);
```

Replace with:

```ts
  }, [isRunning, gameActive, bacteriaPosition, antibioticPositions, poweredUp, level, currentLevelIndex]);
```

- [ ] **Step 5: Verify it compiles and chases**

Run: `npm run dev`, play level 0 (Easy). Confirm antibiotics now mostly wander (Easy profile) and colliding triggers a question. Stop the dev server.
Expected: compiles; enemies move via the AI module; questions use the easy pool at 3 lives.

- [ ] **Step 6: Commit**

```bash
git add app/game/components/BacteriaGame.tsx
git commit -m "feat: use chase AI, level-based quiz tiers, and config respawn"
```

---

## Task 7: Level progression flow

**Files:**
- Modify: `app/game/components/BacteriaGame.tsx`

- [ ] **Step 1: Advance to the next level on win (instead of ending)**

In `moveBacteria`, find the win check inside the "Eat Nutrient" branch (lines ~330-336):

```ts
        if (!newLevel.flat().includes(0)) {
          stopAllLoops();
          playEffect('function');
          setGameActive(false);
          setGameMessage('🎉 Infection Spread! Bacteria Wins!');
        }
```

Replace with:

```ts
        if (!newLevel.flat().includes(0)) {
          stopAllLoops();
          playEffect('function');
          setIsRunning(false);
          if (currentLevelIndex < LEVELS.length - 1) {
            setLevelComplete(true);
          } else {
            setGameActive(false);
            setGameMessage('🎉 Infection Spread! You Win!');
          }
        }
```

- [ ] **Step 2: Add the advance handler**

Immediately after the `handleRestart` definition (lines ~698-702), add:

```ts
  const handleAdvanceLevel = useCallback(() => {
    ensureAudioUnlocked();
    const nextIndex = currentLevelIndex + 1;
    setCurrentLevelIndex(nextIndex);
    initializeLevel(nextIndex, false); // keep cumulative score, reset lives to 3
    setHasFocus(true);
  }, [ensureAudioUnlocked, currentLevelIndex, initializeLevel]);
```

- [ ] **Step 3: Make R restart the current level**

Replace the `handleRestart` function (lines ~698-702):

```ts
  const handleRestart = useCallback(() => {
    ensureAudioUnlocked();
    initializeGame();
    setHasFocus(true);
  }, [ensureAudioUnlocked, initializeGame]);
```

with:

```ts
  const handleRestart = useCallback(() => {
    ensureAudioUnlocked();
    initializeLevel(currentLevelIndex, false); // restart current level, keep score
    setHasFocus(true);
  }, [ensureAudioUnlocked, currentLevelIndex, initializeLevel]);

  const handleRestartFromStart = useCallback(() => {
    ensureAudioUnlocked();
    initializeGame(); // back to Level 1, score reset
    setHasFocus(true);
  }, [ensureAudioUnlocked, initializeGame]);
```

- [ ] **Step 4: Add the "Level Complete" overlay**

Find the game-over overlay in the JSX (lines ~1011-1018):

```ts
                  {!gameActive && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-white">{gameMessage}</h2>
                        <button onClick={handleRestart} className="px-6 py-2 bg-green-600 rounded font-bold">Try Again</button>
                      </div>
                    </div>
                  )}
```

Replace with:

```ts
                  {levelComplete && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2 text-green-300">✅ Level Complete!</h2>
                        <p className="text-sm text-gray-300 mb-4">
                          {LEVELS[currentLevelIndex + 1]?.name ?? ''}
                        </p>
                        <button onClick={handleAdvanceLevel} className="px-6 py-2 bg-green-600 rounded font-bold">Next Level</button>
                      </div>
                    </div>
                  )}
                  {!gameActive && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-white">{gameMessage}</h2>
                        <button onClick={handleRestartFromStart} className="px-6 py-2 bg-green-600 rounded font-bold">Try Again</button>
                      </div>
                    </div>
                  )}
```

- [ ] **Step 5: Show the current level name in the stats panel**

Find the Game Stats header (line ~1029):

```ts
              <h3 className="text-sm font-bold mb-1 text-green-300 text-center">Game Stats</h3>
```

Replace with:

```ts
              <h3 className="text-sm font-bold mb-1 text-green-300 text-center">Game Stats</h3>
              <div className="text-[10px] text-center text-gray-400 mb-1">{currentConfig.name}</div>
```

- [ ] **Step 6: Verify the full flow**

Run: `npm run dev`. Play through:
- Clear Easy → "Level Complete!" → Next Level loads the larger Moderate map, lives reset to 3, score carried over, enemies noticeably hunt.
- Clear Moderate → Hard loads (largest map), enemies actively pursue.
- Clear Hard → "You Win!" screen.
- Lose all lives → "Game Over" → Try Again returns to Level 1 with score reset.
- Press R mid-level → current level restarts, score preserved.
Stop the dev server.
Expected: all transitions behave as described.

- [ ] **Step 7: Commit**

```bash
git add app/game/components/BacteriaGame.tsx
git commit -m "feat: add three-level progression flow"
```

---

## Task 8: Documentation + final verification

**Files:**
- Modify: `README.md`
- Modify: `current_project.md`

- [ ] **Step 1: Update README game description**

In `README.md`, under `## Features`, add a bullet after the "Gameplay" line:

```md
- 🎚️ **Three Levels**: Easy → Moderate → Hard, each with a larger map, tougher AMR questions, and smarter antibiotic pursuit
```

And under `## Game Elements` add a short "Levels" subsection:

```md
## Levels

The game has three levels played in sequence:

| Level | Map size | Antibiotic behavior | Quiz baseline |
|-------|----------|---------------------|---------------|
| 1 — Easy | 15×11 | Wander (mostly random) | Easy |
| 2 — Moderate | 21×15 | Hunt (sometimes heads toward you) | Moderate |
| 3 — Hard | 27×19 | Pursue (actively chases via shortest path) | Hard |

Clearing a level advances to the next; lives reset to 3 each level and score is cumulative. Beating Level 3 wins the game.
```

- [ ] **Step 2: Update current_project.md**

Add a dated note at the top of `current_project.md` describing the new difficulty-levels feature (three levels, larger maps, level-based quiz tiers, scaling chase AI, modules added under `app/game/ai`, `app/game/quiz`, and the rewritten `app/game/levels.ts`).

- [ ] **Step 3: Run the full test suite**

Run each:
```
node --test --experimental-strip-types app/game/quiz/difficulty.test.ts
node --test --experimental-strip-types app/game/ai/antibioticMovement.test.ts
node --test --experimental-strip-types app/game/levels.test.ts
node --test --experimental-strip-types app/game/audio/audioState.test.ts
```
Expected: all suites pass.

- [ ] **Step 4: Final compile check**

Run: `npm run dev`, confirm clean compile and a full playthrough of all three levels once more. Stop the dev server.
Expected: no errors; progression works end to end.

- [ ] **Step 5: Commit**

```bash
git add README.md current_project.md
git commit -m "docs: document three-level difficulty progression"
```

---

## Self-Review Notes

- **Spec coverage:** sequential progression (Task 7), three larger maps (Task 4), lives reset each level (Task 5 `initializeLevel` sets `setLives(3)`; Task 7 keeps that), cumulative score (Task 7 `handleAdvanceLevel` passes `resetScore: false`), level-based quiz with lives penalty (Tasks 2 + 6), chase AI scaling wander/hunt/pursue (Tasks 3 + 6), constant enemy count/speed (Task 4 `enemyCount: 3` on every level; tick interval untouched), winnable maps (Task 4 `buildLevelState` + test). All covered.
- **Enemy count:** 3 on every level per the "only AI scales" decision (down from the previous 4 so the small Easy map is not crowded).
- **Restart semantics:** R restarts the current level (score kept); game-over "Try Again" restarts from Level 1 (score reset) — Task 7 wires each to the right handler.
- **Type consistency:** `Direction`/`Position` centralized in `types.ts` and imported everywhere; `computeAntibioticMoves`, `getEffectiveTier`, `buildLevelState`, `generateSpawnPositions`, `pickRespawnPosition` signatures are used exactly as defined.
```

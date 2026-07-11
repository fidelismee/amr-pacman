# Difficulty Levels — Design

**Date:** 2026-07-11
**Status:** Approved (pending spec review)

## Goal

Turn the single-board game into a three-level progression (Easy → Moderate → Hard). Each level has its own larger map, its own baseline quiz difficulty, and antibiotics whose chase behavior gets smarter as the level rises. Beating a level advances to the next; beating the last level wins the game.

## Confirmed decisions

- **Selection:** Sequential progression. The player always starts on Easy; clearing a level advances to the next. There is no difficulty picker.
- **Lives:** Reset to 3 at the start of every level.
- **Maps:** Three brand-new hand-authored maps, increasing in size (Easy smallest, Hard largest). The current 27×19 board is *not* reused.
- **Enemy scaling:** Only chase intelligence scales with difficulty. Enemy **count and speed stay constant** across levels.
- **Quiz:** Each level sets a baseline tier; losing lives raises the tier within the level (lives-based logic kept, floored at the level's baseline).
- **Score:** Cumulative across levels (does not reset on advance).

## Architecture

Chosen approach: **Modularize** (Approach A). Extract level data and antibiotic AI out of the `BacteriaGame` monolith so both are self-contained and testable, and make `BacteriaGame` level-driven instead of hardcoding one board.

### New / changed units

| Unit | File | Responsibility |
|------|------|----------------|
| Level configs | `app/game/levels.ts` (rewrite) | Array of 3 level definitions + types; map-load helper that guarantees winnable dot placement. |
| Antibiotic AI | `app/game/ai/antibioticMovement.ts` (new) | Pure functions that compute enemy next-positions given a chase profile. |
| AI tests | `app/game/ai/antibioticMovement.test.ts` (new) | `node:test` coverage of wander/hunt/pursue + occupancy/no-reverse. |
| Quiz tier logic | `app/game/quiz/difficulty.ts` (new) | Pure `getEffectiveTier(baseTier, lives)`. |
| Quiz tests | `app/game/quiz/difficulty.test.ts` (new) | `node:test` coverage of the tier mapping. |
| Game component | `app/game/components/BacteriaGame.tsx` (edit) | Level-driven state, progression flow, calls AI + tier modules, responsive sizing off current-level dims. |

## Level configuration

```ts
type ChaseProfile = 'wander' | 'hunt' | 'pursue';
type Tier = 'easy' | 'moderate' | 'hard';

interface LevelConfig {
  name: string;              // e.g. "Level 1 — Easy"
  map: CellType[][];         // authored wall layout (see encoding below)
  playerStart: Position;     // must be a non-wall cell
  enemySpawnZones: Zone[];   // rectangular regions enemies spawn/respawn in
  enemyCount: number;        // constant across levels (see below)
  baseTier: Tier;            // quiz baseline for this level
  chaseProfile: ChaseProfile;
}

export const LEVELS: LevelConfig[] = [ /* easy, moderate, hard */ ];
```

- **Easy** — ~15×13 map, `baseTier: 'easy'`, `chaseProfile: 'wander'`.
- **Moderate** — ~21×17 map, `baseTier: 'moderate'`, `chaseProfile: 'hunt'`.
- **Hard** — ~27×21 map, `baseTier: 'hard'`, `chaseProfile: 'pursue'`.

**Enemy count** is constant across all levels (per the "only AI scales" decision). Value: **3** on every level (down from the current 4) so the small Easy map does not feel crowded. `enemyCount` may exceed `enemySpawnZones.length`; zones are cycled/sampled to place the required number of enemies. Final value is tunable during implementation.

### Map cell encoding (authoring)

Same as today: `0` = nutrient dot, `1` = wall, `2` = intentionally empty path (spawn tiles, corridors we don't want dotted), `3` = resistance booster.

### Winnability guarantee (map load)

Hand-authored dot placement risks walling a dot off and making a level impossible to clear. To prevent this, `buildLevelState(config)` runs at level load:

1. Flood-fill the set of cells reachable from `playerStart` across all non-wall cells.
2. Produce the runtime grid: walls stay walls; a `3` stays a booster **only if reachable** (else becomes empty); every reachable cell authored as `0` becomes a dot; everything else becomes empty (`2`).

Result: **every dot in play is reachable from the start**, so "all dots eaten" is always achievable. The win check is unchanged (`no 0 remains`).

## Antibiotic chase AI (`antibioticMovement.ts`)

A single pure entry point computes all enemies' next state for a tick:

```ts
computeAntibioticMoves(input: {
  positions: Position[];
  directions: Direction[];
  isWall: (x, y) => boolean;
  bacteria: Position;
  profile: ChaseProfile;
}): { positions: Position[]; directions: Direction[] };
```

Shared helper: build one **BFS distance field from the bacteria** over open cells per tick; both `hunt` and `pursue` read it (cheap — one BFS shared by all enemies).

- **`wander` (Easy):** current behavior — 60% continue current direction, 40% random with non-reverse preference (80%), plus the existing occupancy-avoidance that prevents two antibiotics stacking on one cell.
- **`hunt` (Moderate):** with probability ~0.5, move to the valid non-reverse neighbor with the **smallest BFS distance** to the bacteria; otherwise fall back to `wander`. Keeps occupancy avoidance.
- **`pursue` (Hard):** always step to the neighbor with the smallest BFS distance to the bacteria (greedy shortest-path follow). No instant 180° reversal unless it's the only move; ~15% random deviation to avoid clumping/oscillation and deadlocks; occupancy avoidance retained. If the BFS field is unreachable (shouldn't happen on a connected map), fall back to greedy Manhattan.

Count and per-tick step frequency (the 200 ms loop) are unchanged across profiles.

## Quiz tier mapping (`difficulty.ts`)

```ts
getEffectiveTier(baseTier: Tier, lives: number): Tier
```

`penalty = lives >= 3 ? 0 : lives === 2 ? 1 : 2`, then `tiers = ['easy','moderate','hard']`, `index = clamp(indexOf(baseTier) + penalty, 0, 2)`.

Because lives reset to 3 each level, each level starts at its baseline and climbs as the player loses lives:

| Level (baseTier) | lives 3 | lives 2 | lives ≤1 |
|------------------|---------|---------|----------|
| Easy | easy | moderate | hard |
| Moderate | moderate | hard | hard |
| Hard | hard | hard | hard |

`triggerQuestion` filters `questions` by this effective tier. Existing question pools are unchanged (easy 6 / moderate 5 / hard 11).

## Progression flow (`BacteriaGame`)

New state: `currentLevelIndex` (0–2).

- **Init / load level:** `initializeLevel(index)` loads `LEVELS[index]` via `buildLevelState`, sets player to `playerStart`, spawns `enemyCount` antibiotics from `enemySpawnZones`, resets lives to 3, resets power-up/refs. Score is preserved (cumulative).
- **All dots eaten:**
  - Not the last level → pause, show a **"Level Complete!"** overlay with a **Next Level** button → `initializeLevel(index + 1)`.
  - Last level → show **victory** end screen ("🎉 Infection Spread! You Win!").
- **Lives reach 0:** game over screen ("💀 Sterilized! Game Over"). Its restart button returns to **Level 1 / Easy** and resets score to 0.
- **Restart key (R):** restarts the **current** level (reload map, lives → 3). Score is left as-is.

## Responsive sizing

Board sizing currently keys off module constants `GRID_WIDTH`/`GRID_HEIGHT`. These become **per-level dimensions** derived from the active map. The two resize `useEffect`s and the grid render read the current level's width/height from state so each map is centered and scaled correctly.

## Spawn logic

`generateScatteredPositions` and the eat-enemy respawn logic currently hardcode 27×19 quadrants. Both are rewritten to sample valid (non-wall, reachable, unoccupied) cells from the **current level's `enemySpawnZones`**.

## Testing

- `node --test app/game/ai/antibioticMovement.test.ts` — wander stays in bounds/never enters walls; hunt/pursue reduce BFS distance toward the bacteria; no two enemies occupy one cell; pursue avoids instant reversal.
- `node --test app/game/quiz/difficulty.test.ts` — the tier table above.
- Manual: play through all three levels, confirm advance, lives reset, larger maps, and visibly smarter chasing per level.

(Per repo guardrails, tests and builds are run only when explicitly requested; `npm run dev` is the standing verify command.)

## Out of scope

- Difficulty picker / level select menu.
- Enemy speed or count scaling.
- More than three levels; persistent high scores; new question content.

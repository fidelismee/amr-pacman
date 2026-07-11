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

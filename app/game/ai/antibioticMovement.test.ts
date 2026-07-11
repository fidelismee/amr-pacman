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

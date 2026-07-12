// app/game/collision.test.ts
import assert from "node:assert/strict";
import test from "node:test";

import { detectCollisions } from "./collision.ts";
import type { Position } from "./types.ts";

const p = (x: number, y: number): Position => ({ x, y });

test("same cell after the move is a collision", () => {
  const hits = detectCollisions(p(5, 5), p(4, 5), [p(5, 5)], [p(6, 5)]);
  assert.deepEqual(hits, [0]);
});

test("swapping cells (passing through) is a collision", () => {
  // bacteria 4->5, antibiotic 5->4: they cross.
  const hits = detectCollisions(p(5, 5), p(4, 5), [p(4, 5)], [p(5, 5)]);
  assert.deepEqual(hits, [0]);
});

test("parallel movement while adjacent is NOT a collision", () => {
  // Both move right in adjacent rows, staying one cell apart the whole time.
  const hits = detectCollisions(p(8, 5), p(7, 5), [p(8, 4)], [p(7, 4)]);
  assert.deepEqual(hits, []);
});

test("following an enemy into its vacated cell is NOT a collision", () => {
  // Antibiotic 5,5 -> 5,4; bacteria 5,6 -> 5,5 (into the vacated cell).
  const hits = detectCollisions(p(5, 5), p(5, 6), [p(5, 4)], [p(5, 5)]);
  assert.deepEqual(hits, []);
});

test("an enemy stepping into the bacteria's vacated cell is NOT a collision", () => {
  // Bacteria 5,5 -> 6,5; antibiotic 5,4 -> 5,5 (into bacteria's old cell).
  const hits = detectCollisions(p(6, 5), p(5, 5), [p(5, 5)], [p(5, 4)]);
  assert.deepEqual(hits, []);
});

test("reports every colliding enemy index, aligned to the array", () => {
  const antibiotics = [p(1, 1), p(5, 5), p(9, 9), p(5, 5)];
  const prev = [p(1, 0), p(5, 4), p(9, 8), p(5, 6)];
  const hits = detectCollisions(p(5, 5), p(4, 5), antibiotics, prev);
  assert.deepEqual(hits, [1, 3]);
});

test("no antibiotics means no collisions", () => {
  assert.deepEqual(detectCollisions(p(5, 5), p(4, 5), [], []), []);
});

test("tolerates a missing previous position (no swap, no crash)", () => {
  const hits = detectCollisions(p(5, 5), p(4, 5), [p(0, 0)], []);
  assert.deepEqual(hits, []);
});

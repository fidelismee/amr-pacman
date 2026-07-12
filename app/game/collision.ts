// app/game/collision.ts
// Pure collision detection between the bacterium and the antibiotics.
//
// On a grid where everything moves one cell per tick, two entities collide in
// exactly two cases:
//   1. They end the tick on the same cell.
//   2. They swap cells (each moves into the other's previous cell) — passing
//      "through" each other without ever sharing a cell.
// The previous inline implementation also flagged parallel movement and one
// entity stepping into the other's vacated cell, which produced deaths where
// the two never actually touched. Those cases are intentionally NOT collisions.

import type { Position } from "./types";

const samePos = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y;

/**
 * Returns the indices of antibiotics that collided with the bacterium this
 * tick. Positions are post-move; `prev*` are the positions before the move
 * (used to detect swaps). Indices are aligned to the `antibiotics` array.
 */
export function detectCollisions(
  bacteria: Position,
  prevBacteria: Position,
  antibiotics: Position[],
  prevAntibiotics: Position[],
): number[] {
  const hits: number[] = [];
  antibiotics.forEach((anti, index) => {
    const prevAnti = prevAntibiotics[index];
    const occupiesSameCell = samePos(anti, bacteria);
    const swapped =
      prevAnti != null &&
      samePos(bacteria, prevAnti) &&
      samePos(anti, prevBacteria);
    if (occupiesSameCell || swapped) hits.push(index);
  });
  return hits;
}

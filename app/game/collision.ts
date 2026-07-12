// app/game/collision.ts
// Pure collision detection between the bacterium and the antibiotics.
//
// This mirrors the game's original, deliberately aggressive detection: a hit is
// registered not only when the two share a cell or cleanly swap, but also when
// one steps into the other's just-vacated cell or when they pass while adjacent.
// The wider net stops enemies from appearing to slip past the player through
// tight one-tile corridors, which matters more here than the occasional
// near-miss being counted as a catch.

import type { Position } from "./types";

const samePos = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y;

/**
 * Returns the indices of antibiotics that collided with the bacterium this
 * tick. Positions are post-move; `prev*` are the positions before the move.
 * Indices are aligned to the `antibiotics` array.
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

    // 1. Bacteria and antibiotic occupy the same cell now.
    const isSamePosition = samePos(anti, bacteria);

    // 2. They swapped cells this tick (crossing / passing through).
    const isCrossingCollision =
      prevAnti != null &&
      samePos(bacteria, prevAnti) &&
      samePos(anti, prevBacteria);

    // 3. Bacteria moved into the antibiotic's previous cell.
    const bacteriaMovedIntoAntibioticOldPos =
      prevAnti != null && samePos(bacteria, prevAnti);

    // 4. Antibiotic moved into the bacteria's previous cell.
    const antibioticMovedIntoBacteriaOldPos =
      prevAnti != null && samePos(anti, prevBacteria);

    // 5. They were adjacent and both moved (passing collision).
    let isPassingCollision = false;
    if (prevAnti != null) {
      const prevDistance =
        Math.abs(prevBacteria.x - prevAnti.x) +
        Math.abs(prevBacteria.y - prevAnti.y);
      if (prevDistance === 1) {
        const bacteriaMovedAway = !samePos(bacteria, prevBacteria);
        const antibioticMovedAway = !samePos(anti, prevAnti);
        if (bacteriaMovedAway && antibioticMovedAway) {
          isPassingCollision = true;
        }
      }
    }

    if (
      isSamePosition ||
      isCrossingCollision ||
      bacteriaMovedIntoAntibioticOldPos ||
      antibioticMovedIntoBacteriaOldPos ||
      isPassingCollision
    ) {
      hits.push(index);
    }
  });

  return hits;
}

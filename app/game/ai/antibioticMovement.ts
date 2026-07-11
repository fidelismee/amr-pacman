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

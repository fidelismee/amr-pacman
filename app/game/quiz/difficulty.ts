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

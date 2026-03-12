export type LoopTrackName = "city" | "inGame" | "none";
export type SoundEffectName = "bacteriaAnimation" | "function";

export interface DesiredLoopTrackInput {
  audioUnlocked: boolean;
  gameActive: boolean;
  hasFocus: boolean;
  isRunning: boolean;
}

export interface MovementSfxInput {
  now: number;
  lastPlayedAt: number;
  cooldownMs?: number;
}

export const GAMEPLAY_MOVEMENT_SFX_COOLDOWN_MS = 900;

export function getDesiredLoopTrack({
  audioUnlocked,
  gameActive,
  hasFocus,
  isRunning,
}: DesiredLoopTrackInput): LoopTrackName {
  if (!audioUnlocked) {
    return "none";
  }

  if (!gameActive) {
    return "none";
  }

  if (hasFocus && isRunning) {
    return "inGame";
  }

  return "city";
}

export function shouldPlayMovementSfx({
  now,
  lastPlayedAt,
  cooldownMs = GAMEPLAY_MOVEMENT_SFX_COOLDOWN_MS,
}: MovementSfxInput): boolean {
  return now - lastPlayedAt >= cooldownMs;
}

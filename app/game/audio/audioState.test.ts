import assert from "node:assert/strict";
import test from "node:test";

import {
  GAMEPLAY_MOVEMENT_SFX_COOLDOWN_MS,
  getDesiredLoopTrack,
  shouldPlayMovementSfx,
} from "./audioState.ts";

test("returns no loop before audio is unlocked", () => {
  assert.equal(
    getDesiredLoopTrack({
      audioUnlocked: false,
      gameActive: true,
      hasFocus: true,
      isRunning: true,
    }),
    "none",
  );
});

test("returns in-game loop while the game is active and running", () => {
  assert.equal(
    getDesiredLoopTrack({
      audioUnlocked: true,
      gameActive: true,
      hasFocus: true,
      isRunning: true,
    }),
    "inGame",
  );
});

test("returns city loop while the game is unlocked but paused", () => {
  assert.equal(
    getDesiredLoopTrack({
      audioUnlocked: true,
      gameActive: true,
      hasFocus: true,
      isRunning: false,
    }),
    "city",
  );
});

test("returns no loop after the game has ended", () => {
  assert.equal(
    getDesiredLoopTrack({
      audioUnlocked: true,
      gameActive: false,
      hasFocus: true,
      isRunning: false,
    }),
    "none",
  );
});

test("throttles movement sfx until the cooldown expires", () => {
  assert.equal(
    shouldPlayMovementSfx({
      now: GAMEPLAY_MOVEMENT_SFX_COOLDOWN_MS - 1,
      lastPlayedAt: 0,
    }),
    false,
  );

  assert.equal(
    shouldPlayMovementSfx({
      now: GAMEPLAY_MOVEMENT_SFX_COOLDOWN_MS,
      lastPlayedAt: 0,
    }),
    true,
  );
});

test("returns city loop while the game is active but unfocused", () => {
  assert.equal(
    getDesiredLoopTrack({
      audioUnlocked: true,
      gameActive: true,
      hasFocus: false,
      isRunning: true,
    }),
    "city",
  );
});

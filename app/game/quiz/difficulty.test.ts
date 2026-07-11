// app/game/quiz/difficulty.test.ts
import assert from "node:assert/strict";
import test from "node:test";

import { getEffectiveTier } from "./difficulty.ts";

test("easy level climbs easy -> moderate -> hard as lives drop", () => {
  assert.equal(getEffectiveTier("easy", 3), "easy");
  assert.equal(getEffectiveTier("easy", 2), "moderate");
  assert.equal(getEffectiveTier("easy", 1), "hard");
  assert.equal(getEffectiveTier("easy", 0), "hard");
});

test("moderate level starts at moderate and caps at hard", () => {
  assert.equal(getEffectiveTier("moderate", 3), "moderate");
  assert.equal(getEffectiveTier("moderate", 2), "hard");
  assert.equal(getEffectiveTier("moderate", 1), "hard");
});

test("hard level is always hard", () => {
  assert.equal(getEffectiveTier("hard", 3), "hard");
  assert.equal(getEffectiveTier("hard", 2), "hard");
  assert.equal(getEffectiveTier("hard", 0), "hard");
});

test("lives above 3 behave like 3", () => {
  assert.equal(getEffectiveTier("easy", 5), "easy");
});

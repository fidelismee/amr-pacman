import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createClient } from '@libsql/client';
import { loginPlayer, registerPlayer, saveProgress } from './store.ts';
import { termsVersion } from './types.ts';
import { questions } from '../../src/data/questions.ts';

test('consented profiles, isolated checkpoints and retry-safe quiz history', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'amr-player-test-'));
  const url = 'file:' + join(directory, 'players.db');
  process.env.TURSO_DATABASE_URL = url;
  const inspect = createClient({ url });
  t.after(async () => { inspect.close(); await rm(directory, { recursive: true }); });

  const input = { nickname: '  Pixel  ', category: 'Guest', heardAmr: false, consent: true, version: termsVersion };
  for (const invalid of [{ consent: false }, { nickname: ' ' }, { category: 'Other' }, { heardAmr: null }]) {
    await assert.rejects(registerPlayer({ ...input, ...invalid }));
  }
  const player = await registerPlayer(input);
  const other = await registerPlayer(input);
  assert.notEqual(player.id, other.id);
  assert.equal(player.nickname, 'Pixel');
  assert.deepEqual(await loginPlayer(player.id.toLowerCase().replaceAll('-', '')), player);
  await assert.rejects(loginPlayer('AMR-0000-0000-0000-0000'));

  const q = questions[0];
  const answers = [{ eventId: randomUUID().replaceAll('-', ''), question: q.question, selected: q.answer }];
  const checkpoint = { id: player.id, score: 80, clearedLevels: 1, answers };
  await saveProgress(checkpoint);
  await saveProgress({ ...checkpoint, score: 180, clearedLevels: 0, answers: [] });
  await saveProgress(checkpoint);
  await assert.rejects(saveProgress({ ...checkpoint, score: 999, answers: [{ ...answers[0], selected: '?' }] }));
  assert.deepEqual(await loginPlayer(player.id), { ...player, bestScore: 180, checkpointScore: 80, clearedLevels: 1 });
  assert.deepEqual(await loginPlayer(other.id), other);
  const history = await inspect.execute('SELECT selected, correct FROM quiz_responses');
  assert.equal(history.rows.length, 1);
  assert.equal(history.rows[0].selected, q.answer);
  assert.equal(history.rows[0].correct, 1);
  const profile = await inspect.execute('SELECT player_key, consent_version, heard_amr FROM players LIMIT 1');
  assert.notEqual(profile.rows[0].player_key, player.id);
  assert.equal(profile.rows[0].consent_version, termsVersion);
  assert.equal(profile.rows[0].heard_amr, 0);
});

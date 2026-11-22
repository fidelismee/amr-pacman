import { createHash, randomBytes } from 'node:crypto';
import { createClient, type Client } from '@libsql/client';
import { questions } from '../../src/data/questions.ts';
import { LEVELS } from '../game/levels.ts';
import { categories, termsVersion, type Player, type QuizResponse } from './types.ts';

let database: Promise<Client> | undefined;

async function openDatabase() {
  const url = process.env.TURSO_DATABASE_URL ||
    (process.env.NODE_ENV !== 'production' && 'file:amr-players.db');
  if (!url) throw new Error('Configure TURSO_DATABASE_URL for player storage.');
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  await client.batch([
    `CREATE TABLE IF NOT EXISTS players (
      player_key TEXT PRIMARY KEY, nickname TEXT NOT NULL, category TEXT NOT NULL,
      heard_amr INTEGER NOT NULL, consent_version TEXT NOT NULL,
      consent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, best_score INTEGER NOT NULL DEFAULT 0,
      cleared_levels INTEGER NOT NULL DEFAULT 0, checkpoint_score INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_responses (
      player_key TEXT NOT NULL REFERENCES players(player_key), event_id TEXT NOT NULL,
      question TEXT NOT NULL, selected TEXT NOT NULL, correct INTEGER NOT NULL,
      answered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (player_key, event_id)
    )`
  ], 'write');
  return client;
}

function db() {
  database ??= openDatabase().catch(error => {
    database = undefined;
    throw error;
  });
  return database;
}

export class PlayerInputError extends Error {}

function playerKey(id: string) {
  return createHash('sha256').update(id).digest('hex');
}

function readId(value: unknown) {
  const raw = typeof value === 'string' ? value.trim().toUpperCase().replace(/[-\s]/g, '') : '';
  if (!/^AMR[0-9A-F]{16}$/.test(raw)) throw new PlayerInputError('Check your Player ID and try again.');
  return 'AMR-' + raw.slice(3).match(/.{4}/g)!.join('-');
}

export async function registerPlayer(input: Record<string, unknown>): Promise<Player> {
  const nickname = typeof input.nickname === 'string' ? input.nickname.trim() : '';
  if (!nickname || nickname.length > 40 || !categories.some(role => role === input.category) ||
      typeof input.heardAmr !== 'boolean' || input.consent !== true || input.version !== termsVersion) {
    throw new PlayerInputError('Accept the terms and complete all three registration fields.');
  }
  const client = await db();
  // The unique key also protects concurrent registrations in the event of a collision.
  while (true) {
    const id = readId('AMR' + randomBytes(8).toString('hex'));
    const result = await client.execute({
      sql: `INSERT INTO players (player_key,nickname,category,heard_amr,consent_version)
            VALUES (?,?,?,?,?) ON CONFLICT(player_key) DO NOTHING`,
      args: [playerKey(id), nickname, String(input.category), input.heardAmr, termsVersion]
    });
    if (result.rowsAffected) return { id, nickname, bestScore: 0, clearedLevels: 0, checkpointScore: 0 };
  }
}

export async function loginPlayer(value: unknown): Promise<Player> {
  const id = readId(value);
  const client = await db();
  const { rows: [row] } = await client.execute({
    sql: 'SELECT nickname,best_score,cleared_levels,checkpoint_score FROM players WHERE player_key=?',
    args: [playerKey(id)]
  });
  if (!row) throw new PlayerInputError('Check your Player ID and try again.');
  return { id, nickname: String(row.nickname), bestScore: Number(row.best_score),
    clearedLevels: Number(row.cleared_levels), checkpointScore: Number(row.checkpoint_score) };
}

function quizAnswer(value: QuizResponse) {
  const question = questions.find(q => q.question === value?.question);
  if (!question || !question.options.includes(value.selected) ||
      typeof value.eventId !== 'string' || !/^[\da-f]{32}$/i.test(value.eventId)) throw new PlayerInputError('Invalid quiz response.');
  return question.answer === value.selected;
}

export async function saveProgress(input: Record<string, unknown>) {
  const key = playerKey(readId(input.id));
  const { score, clearedLevels, answers } = input;
  if (typeof score !== 'number' || !Number.isSafeInteger(score) || score < 0 ||
      typeof clearedLevels !== 'number' || !Number.isInteger(clearedLevels) ||
      clearedLevels < 0 || clearedLevels > LEVELS.length || !Array.isArray(answers) || answers.length > 20) {
    throw new PlayerInputError('Invalid game progress.');
  }
  const responses = answers.map(answer => ({
    sql: `INSERT INTO quiz_responses (player_key,event_id,question,selected,correct)
          SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM players WHERE player_key=?)
          ON CONFLICT(player_key,event_id) DO NOTHING`,
    args: [key, answer?.eventId, answer?.question, answer?.selected, quizAnswer(answer), key]
  }));
  const client = await db();
  const [update] = await client.batch([{
    sql: `UPDATE players SET best_score=max(best_score,?),
          checkpoint_score=CASE WHEN ?>cleared_levels THEN ?
            WHEN ?=cleared_levels AND ?>0 THEN max(checkpoint_score,?) ELSE checkpoint_score END,
          cleared_levels=max(cleared_levels,?) WHERE player_key=?`,
    args: [score, clearedLevels, score, clearedLevels, clearedLevels, score, clearedLevels, key]
  }, ...responses], 'write');
  if (!update.rowsAffected) throw new PlayerInputError('Check your Player ID and try again.');
}

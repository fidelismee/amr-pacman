'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Progress, QuizResponse } from './types';

export function useProgress(id: string, score: number, clearedLevels: number) {
  const queue = useRef<Progress[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);

  const enqueue = useCallback((points: number, cleared: number, answer?: QuizResponse) => {
    const last = queue.current.at(-1);
    if (last && last.clearedLevels === cleared && last.answers.length < 20) {
      last.score = Math.max(last.score, points);
      if (answer) last.answers.push(answer);
    } else {
      queue.current.push({ score: points, clearedLevels: cleared, answers: answer ? [answer] : [] });
    }
  }, []);

  useEffect(() => {
    if (score || clearedLevels) enqueue(score, clearedLevels);
  }, [score, clearedLevels, enqueue]);

  useEffect(() => {
    let active = true;
    let inFlight: Progress | undefined;
    function send(progress: Progress) {
      return fetch('/api/player', { method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', id, ...progress }) });
    }
    async function flush() {
      if (inFlight || !queue.current.length) return;
      inFlight = queue.current.shift()!;
      try {
        const response = await send(inFlight);
        if (!response.ok) throw new Error('Save failed');
        if (active) setSaveFailed(false);
      } catch {
        queue.current.unshift(inFlight);
        if (active) setSaveFailed(true);
      } finally {
        inFlight = undefined;
      }
    }
    // A page close can happen between ticks. Replays are safe on the server.
    function flushOnExit() {
      for (const progress of queue.current) void send(progress).catch(() => {});
    }
    const timer = window.setInterval(flush, 1200);
    window.addEventListener('pagehide', flushOnExit);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('pagehide', flushOnExit);
    };
  }, [id]);

  function recordAnswer(question: string, selected: string) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const eventId = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    enqueue(score, 0, { eventId, question, selected });
  }
  return { recordAnswer, saveFailed };
}

// app/game/hooks/useGameLoop.ts
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

interface UseGameLoopProps {
  tickInterval?: number;
  onTick?: () => void;
}

export const useGameLoop = ({ tickInterval = 200, onTick }: UseGameLoopProps = {}) => {
  const [isRunning, setIsRunning] = useState(true);
  const nextDirectionRef = useRef<Direction | null>(null);
  const currentDirectionRef = useRef<Direction>('right');
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys and space to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      if (!isRunning && e.key !== ' ') return;
      
      switch (e.key) {
        case 'ArrowUp':
          nextDirectionRef.current = 'up';
          break;
        case 'ArrowDown':
          nextDirectionRef.current = 'down';
          break;
        case 'ArrowLeft':
          nextDirectionRef.current = 'left';
          break;
        case 'ArrowRight':
          nextDirectionRef.current = 'right';
          break;
        case ' ':
          setIsRunning(prev => !prev);
          break;
        case 'r':
        case 'R':
          // Restart game - handled by parent component
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Call the tick callback
      if (onTick) {
        onTick();
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [isRunning, tickInterval, onTick]);

  const getCurrentDirection = useCallback(() => currentDirectionRef.current, []);
  const getNextDirection = useCallback(() => nextDirectionRef.current, []);
  
  const setDirection = useCallback((dir: Direction) => {
    nextDirectionRef.current = dir;
  }, []);

  const updateCurrentDirection = useCallback((dir: Direction) => {
    currentDirectionRef.current = dir;
    nextDirectionRef.current = null;
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const togglePause = useCallback(() => setIsRunning(prev => !prev), []);

  return {
    isRunning,
    getCurrentDirection,
    getNextDirection,
    setDirection,
    updateCurrentDirection,
    pause,
    resume,
    togglePause,
  };
};

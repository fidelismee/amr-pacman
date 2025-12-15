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
      if (!isRunning) return;
      
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Update direction from next direction if available
      if (nextDirectionRef.current !== null) {
        currentDirectionRef.current = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }

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

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const togglePause = useCallback(() => setIsRunning(prev => !prev), []);

  return {
    isRunning,
    getCurrentDirection,
    getNextDirection,
    setDirection,
    pause,
    resume,
    togglePause,
  };
};

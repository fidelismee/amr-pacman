// app/game/components/AntibioticGame.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLoop, Direction, Position } from '../hooks/useGameLoop';
import GameBoard from './GameBoard';
import EntityLayer from './EntityLayer';
import { 
  LEVEL_1, 
  ANTIBIOTIC_START, 
  BACTERIA_STARTS, 
  Level, 
  CellType 
} from '../levels';
import Image from 'next/image';

const POWER_UP_DURATION = 5000;
const CELL_SIZE = 32; // Larger for desktop
const MOBILE_CELL_SIZE = 24;

type GameState = 'playing' | 'paused' | 'won' | 'lost';

const AntibioticGame = () => {
  // Screen detection
  const [isMobile, setIsMobile] = useState(false);
  const [cellSize, setCellSize] = useState(CELL_SIZE);

  // Game state
  const [level, setLevel] = useState<Level>(LEVEL_1);
  const [antibioticPosition, setAntibioticPosition] = useState<Position>(ANTIBIOTIC_START);
  const [bacteriaPositions, setBacteriaPositions] = useState<Position[]>(BACTERIA_STARTS);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [poweredUp, setPoweredUp] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [gameMessage, setGameMessage] = useState<string>('');

  // Refs for mutable state to avoid stale closure issues
  const gameStateRef = useRef<GameState>('playing');
  const antibioticPositionRef = useRef<Position>(ANTIBIOTIC_START);
  const bacteriaPositionsRef = useRef<Position[]>(BACTERIA_STARTS);
  const poweredUpRef = useRef(false);
  const levelRef = useRef<Level>(LEVEL_1);
  const directionQueueRef = useRef<Direction | null>(null);

  // UI state
  const [hasFocus, setHasFocus] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setCellSize(mobile ? MOBILE_CELL_SIZE : CELL_SIZE);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game loop hook
  const { getCurrentDirection, getNextDirection, isRunning, setDirection, updateCurrentDirection } = useGameLoop({
    tickInterval: 200,
    onTick: () => {
      if (gameStateRef.current !== 'playing') return;

      // Update mutable refs from state
      const currentLevel = levelRef.current;
      const currentAntibioticPos = antibioticPositionRef.current;
      const currentBacteria = bacteriaPositionsRef.current;
      const isPoweredUp = poweredUpRef.current;

      // Move antibiotic
      const newAntibioticPos = calculateAntibioticMove(
        currentAntibioticPos,
        getCurrentDirection(),
        getNextDirection(),
        currentLevel
      );

      // Update state if moved
      if (newAntibioticPos.x !== currentAntibioticPos.x || newAntibioticPos.y !== currentAntibioticPos.y) {
        setAntibioticPosition(newAntibioticPos);
        antibioticPositionRef.current = newAntibioticPos;

        // Check collection at new position
        const cellType = currentLevel[newAntibioticPos.y]?.[newAntibioticPos.x];
        if (cellType === 0 || cellType === 3) {
          handleCellCollection(newAntibioticPos, cellType, currentLevel);
        }
      }

      // Move bacteria with improved AI
      const newBacteriaPositions = calculateBacteriaMove(currentBacteria, currentLevel);
      setBacteriaPositions(newBacteriaPositions);
      bacteriaPositionsRef.current = newBacteriaPositions;

      // Update power-up timer
      if (isPoweredUp) {
        setPowerUpTimer(prev => {
          const newTimer = Math.max(0, prev - 200);
          if (newTimer === 0) {
            setPoweredUp(false);
            poweredUpRef.current = false;
          }
          return newTimer;
        });
      }

      // Check collisions
      checkCollisions(newAntibioticPos, newBacteriaPositions, isPoweredUp);
    },
  });

  // Calculate antibiotic movement with improved logic
  const calculateAntibioticMove = useCallback((
    pos: Position,
    currentDir: Direction | null,
    nextDir: Direction | null,
    currentLevel: Level
  ): Position => {
    const newPos = { ...pos };
    let moved = false;

    // Try next direction first if queued
    if (nextDir !== null) {
      const testPos = applyDirection(pos, nextDir);
      if (canMoveTo(testPos, currentLevel)) {
        Object.assign(newPos, testPos);
        updateCurrentDirection(nextDir);
        moved = true;
      }
    }

    // If next direction failed or unavailable, try current direction
    if (!moved && currentDir !== null) {
      const testPos = applyDirection(pos, currentDir);
      if (canMoveTo(testPos, currentLevel)) {
        Object.assign(newPos, testPos);
      }
    }

    return newPos;
  }, [updateCurrentDirection]);

  const applyDirection = (pos: Position, dir: Direction | null): Position => {
    const newPos = { ...pos };
    switch (dir) {
      case 'up': newPos.y--; break;
      case 'down': newPos.y++; break;
      case 'left': newPos.x--; break;
      case 'right': newPos.x++; break;
    }
    return newPos;
  };

  // Improved bacteria movement with smarter pathfinding
  const calculateBacteriaMove = useCallback((bacteria: Position[], currentLevel: Level): Position[] => {
    return bacteria.map(b => {
      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];

      const validMoves = directions.filter(dir =>
        canMoveTo({ x: b.x + dir.x, y: b.y + dir.y }, currentLevel)
      );

      if (validMoves.length === 0) return b;

      // Prefer moving towards antibiotic (simple AI improvement)
      const antiPos = antibioticPositionRef.current;
      const moveTowardAnti = validMoves.find(dir => {
        const newX = b.x + dir.x;
        const newY = b.y + dir.y;
        const distToAnti = Math.abs(newX - antiPos.x) + Math.abs(newY - antiPos.y);
        const currentDist = Math.abs(b.x - antiPos.x) + Math.abs(b.y - antiPos.y);
        return distToAnti < currentDist;
      });

      const selectedMove = moveTowardAnti || validMoves[Math.floor(Math.random() * validMoves.length)];
      return {
        x: b.x + selectedMove.x,
        y: b.y + selectedMove.y,
      };
    });
  }, []);

  const handleCellCollection = useCallback((pos: Position, cellType: number, currentLevel: Level) => {
    const newLevel = currentLevel.map(row => [...row]);
    newLevel[pos.y][pos.x] = 2;
    setLevel(newLevel);
    levelRef.current = newLevel;

    if (cellType === 0) {
      setScore(prev => prev + 10);
      // Check win condition
      if (!newLevel.flat().includes(0)) {
        setGameState('won');
        gameStateRef.current = 'won';
        setGameMessage('🎉 Infection Cleared! You Win!');
      }
    } else if (cellType === 3) {
      setPoweredUp(true);
      poweredUpRef.current = true;
      setPowerUpTimer(POWER_UP_DURATION);
      setScore(prev => prev + 50);
    }
  }, []);

  const checkCollisions = useCallback((antiPos: Position, bacteria: Position[], isPoweredUp: boolean) => {
    const collision = bacteria.find(b => b.x === antiPos.x && b.y === antiPos.y);

    if (collision) {
      if (isPoweredUp) {
        // Destroy bacteria - remove temporarily and respawn after delay
        const newBacteria = bacteria.filter(b => b !== collision);
        setBacteriaPositions(newBacteria);
        bacteriaPositionsRef.current = newBacteria;
        setScore(prev => prev + 100);
        
        // Respawn the bacteria after 3 seconds
        setTimeout(() => {
          setBacteriaPositions(prev => {
            // Add a new bacteria at one of the starting positions
            const availableStarts = BACTERIA_STARTS.filter(start => 
              !prev.some(b => b.x === start.x && b.y === start.y)
            );
            
            if (availableStarts.length > 0) {
              const randomStart = availableStarts[Math.floor(Math.random() * availableStarts.length)];
              return [...prev, randomStart];
            }
            
            return prev; // No available starting positions
          });
        }, 3000); // 3 second respawn delay
      } else {
        // Lose life
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('lost');
            gameStateRef.current = 'lost';
            setGameMessage('💀 Bacteria Overcame Antibiotic! Game Over');
          }
          return newLives;
        });

        // Reset positions
        setAntibioticPosition(ANTIBIOTIC_START);
        setBacteriaPositions([...BACTERIA_STARTS]);
        antibioticPositionRef.current = ANTIBIOTIC_START;
        bacteriaPositionsRef.current = [...BACTERIA_STARTS];
      }
    }
  }, []);

  const canMoveTo = (pos: Position, currentLevel: Level): boolean => {
    if (pos.x < 0 || pos.x >= currentLevel[0].length || pos.y < 0 || pos.y >= currentLevel.length) {
      return false;
    }
    return currentLevel[pos.y]?.[pos.x] !== 1;
  };

  // Handle keyboard input with debouncing
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!hasFocus) return;

    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        e.preventDefault();
        setDirection('up');
        break;
      case 'arrowdown':
      case 's':
        e.preventDefault();
        setDirection('down');
        break;
      case 'arrowleft':
      case 'a':
        e.preventDefault();
        setDirection('left');
        break;
      case 'arrowright':
      case 'd':
        e.preventDefault();
        setDirection('right');
        break;
      case ' ':
        e.preventDefault();
        handlePauseToggle();
        break;
      case 'r':
        e.preventDefault();
        handleRestart();
        break;
    }
  }, [hasFocus, setDirection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle pause toggle
  const handlePauseToggle = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      gameStateRef.current = 'paused';
    } else if (gameState === 'paused') {
      setGameState('playing');
      gameStateRef.current = 'playing';
    }
  }, [gameState]);

  // Initialize game
  const handleRestart = useCallback(() => {
    const newLevel = LEVEL_1.map(row => [...row]);
    setLevel(newLevel);
    levelRef.current = newLevel;
    setAntibioticPosition(ANTIBIOTIC_START);
    antibioticPositionRef.current = ANTIBIOTIC_START;
    setBacteriaPositions([...BACTERIA_STARTS]);
    bacteriaPositionsRef.current = [...BACTERIA_STARTS];
    setScore(0);
    setLives(3);
    setGameState('playing');
    gameStateRef.current = 'playing';
    setPoweredUp(false);
    poweredUpRef.current = false;
    setPowerUpTimer(0);
    setGameMessage('');
    setHasFocus(true);
  }, []);

  // Map lives count to image filename
  const getLivesImagePath = (livesCount: number): string => {
    const clampedLives = Math.max(0, Math.min(5, livesCount));
    return `/assets/lives/live-${clampedLives}.png`;
  };

  // Stats
  const remainingInfectedCells = level.flat().filter(cell => cell === 0).length;
  const remainingBoosters = level.flat().filter(cell => cell === 3).length;

  const gameboardWidth = level[0].length * cellSize + 2;
  const gameboardHeight = level.length * cellSize + 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            💊 Antibiotic Defender
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            Clear infected cells while avoiding resistant bacteria. Collect immune boosters to fight back!
          </p>
        </header>

        {/* Main game container - responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Game board - left/top column */}
          <div className="lg:col-span-3">
            <div className="flex justify-center">
              <div className="relative">
                {/* Focus indicator */}
                <div 
                  className={`absolute -inset-3 rounded-xl transition-all duration-300 z-10 pointer-events-none ${
                    hasFocus 
                      ? 'ring-4 ring-blue-500/50 bg-blue-500/10' 
                      : 'ring-2 ring-gray-700/30'
                  }`}
                />
                
                {/* Game board container */}
                <div
                  className="relative cursor-pointer focus:outline-none"
                  onClick={() => setHasFocus(true)}
                  onBlur={() => setHasFocus(false)}
                  tabIndex={0}
                  role="application"
                  aria-label="Game board"
                >
                  <GameBoard level={level} cellSize={cellSize} />
                  <EntityLayer
                    antibioticPosition={antibioticPosition}
                    antibioticDirection={getCurrentDirection()}
                    bacteriaPositions={bacteriaPositions}
                    poweredUp={poweredUp}
                    cellSize={cellSize}
                  />

                  {/* Focus overlay */}
                  {!hasFocus && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-20">
                      <div className="text-center p-6 lg:p-8 bg-gray-900/95 rounded-xl border-2 border-blue-500/50">
                        <h3 className="text-xl lg:text-2xl font-bold mb-3 text-blue-300">Click to Focus</h3>
                        <p className="text-sm lg:text-base text-gray-300 mb-4">Click on the game board to enable keyboard controls</p>
                        <div className="text-xs lg:text-sm text-gray-400">Use Arrow Keys or WASD to move</div>
                      </div>
                    </div>
                  )}

                  {/* Pause overlay */}
                  {gameState === 'paused' && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-20">
                      <div className="text-center p-6 lg:p-8 bg-gray-900/95 rounded-xl border-2 border-yellow-500/50">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-yellow-300">⏸️ Paused</h2>
                        <p className="text-gray-300 mb-4">Press Space to resume</p>
                        <button
                          onClick={handlePauseToggle}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                          Resume
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Game over overlay */}
                  {(gameState === 'won' || gameState === 'lost') && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-20">
                      <div className="text-center p-6 lg:p-8 bg-gray-900/95 rounded-xl border-2 border-blue-500/50">
                        <h2 className="text-2xl lg:text-4xl font-bold mb-4">{gameMessage}</h2>
                        <div className="text-gray-300 mb-6">Final Score: <span className="text-cyan-400 text-2xl font-bold">{score}</span></div>
                        <button
                          onClick={handleRestart}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                          Play Again (R)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status indicator */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                    hasFocus 
                      ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${hasFocus ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="font-medium">
                      {hasFocus ? 'Controls Active' : 'Click to focus'}
                    </span>
                  </div>

                  {gameState === 'playing' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-blue-900/30 text-blue-400 border border-blue-700/50">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="font-medium">Playing</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - stats and controls */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* Game stats */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <h2 className="text-lg lg:text-2xl font-bold mb-4 text-blue-300">Game Status</h2>
              
              <div className="space-y-3 text-sm lg:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Score</span>
                  <span className="text-2xl lg:text-3xl font-bold text-cyan-400">{score}</span>
                </div>
                
                {/* Lives display with image asset */}
                <div className="flex flex-col gap-2">
                  <span className="text-gray-400">Lives</span>
                  <div className="relative w-full h-auto bg-gray-800/30 rounded-lg p-2 border border-gray-700/50 overflow-hidden flex items-center justify-center">
                    <Image
                      src={getLivesImagePath(lives)}
                      alt={`Bacteria lives: ${lives}`}
                      width={300}
                      height={90}
                      priority
                      className="w-full h-auto object-contain"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {lives === 0 ? 'Game Over' : `${lives} remaining`}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Infected Cells</span>
                  <span className="text-xl font-bold text-green-400">{remainingInfectedCells}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Boosters</span>
                  <span className="text-xl font-bold text-blue-400">{remainingBoosters}</span>
                </div>
                
                <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400">Powered Up</span>
                  <span className={`text-lg font-bold ${poweredUp ? 'text-cyan-300 animate-pulse' : 'text-gray-500'}`}>
                    {poweredUp ? '⚡ ACTIVE' : 'Inactive'}
                  </span>
                </div>
                
                {poweredUp && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
                        style={{ width: `${(powerUpTimer / POWER_UP_DURATION) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-2">
                      {Math.ceil(powerUpTimer / 1000)}s remaining
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg lg:text-xl font-bold mb-4 text-blue-300">Controls</h3>
              
              {/* Desktop: Keyboard instructions */}
              <div className="hidden md:block space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Arrow Keys / WASD</span>
                    <span className="text-blue-300 font-medium">Move</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Space</span>
                    <span className="text-blue-300 font-medium">Pause/Resume</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">R</span>
                    <span className="text-blue-300 font-medium">Restart</span>
                  </div>
                </div>
              </div>

              {/* Mobile: Arrow visualization */}
              <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
                <div className="col-start-2">
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600 text-xl">↑</div>
                </div>
                <div>
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600 text-xl">←</div>
                </div>
                <div className="col-start-2">
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600 text-xl">↓</div>
                </div>
                <div className="col-start-3 row-start-2">
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600 text-xl">→</div>
                </div>
              </div>
              
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-lg font-bold text-sm lg:text-base hover:opacity-90 transition-opacity active:scale-95"
              >
                New Game (R)
              </button>
            </div>

            {/* Legend */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg lg:text-xl font-bold mb-4 text-blue-300">Elements</h3>
              
              <div className="space-y-3 text-xs lg:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex-shrink-0"></div>
                  <span className="text-gray-300">Antibiotic (You)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex-shrink-0"></div>
                  <span className="text-gray-300">Bacteria (Enemy)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                  <span className="text-gray-300">Infected Cell +10</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span className="text-gray-300">Booster +50</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-900 to-red-900 rounded-sm flex-shrink-0"></div>
                  <span className="text-gray-300">Wall</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 lg:mt-12 text-center text-gray-500 text-xs md:text-sm border-t border-gray-800 pt-6">
          <p>Clear all infected cells to win. Collect boosters to destroy bacteria temporarily!</p>
          <p className="mt-2 text-gray-600">Tick: 200ms • Grid: 27×19 • Built with Next.js & Tailwind</p>
        </footer>
      </div>
    </div>
  );
};

export default AntibioticGame;

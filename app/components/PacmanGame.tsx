"use client";

import { useState, useEffect } from 'react';

const GRID_SIZE = 19;
const CELL_SIZE = 28;

type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;
  y: number;
}

const PacmanGame = () => {
  const [pacman, setPacman] = useState<Position>({ x: 9, y: 9 });
  const [direction, setDirection] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<boolean[][]>([]);
  const [gameActive, setGameActive] = useState(true);

  // Initialize dots
  useEffect(() => {
    const initialDots = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(true)
    );
    
    // Create simple maze walls
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (i === 0 || i === GRID_SIZE - 1 || j === 0 || j === GRID_SIZE - 1) {
          initialDots[i][j] = false;
        }
        if (i === 5 && j > 3 && j < 15) initialDots[i][j] = false;
        if (i === 13 && j > 3 && j < 15) initialDots[i][j] = false;
        if (j === 5 && i > 3 && i < 15) initialDots[i][j] = false;
        if (j === 13 && i > 3 && i < 15) initialDots[i][j] = false;
        
        // Starting positions
        if (i === 9 && j === 9) initialDots[i][j] = false;
      }
    }
    
    setDots(initialDots);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      
      switch (e.key) {
        case 'ArrowUp': setDirection('up'); break;
        case 'ArrowDown': setDirection('down'); break;
        case 'ArrowLeft': setDirection('left'); break;
        case 'ArrowRight': setDirection('right'); break;
        case 'r': case 'R': resetGame(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive]);

  // Game loop
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setPacman(prev => {
        const newPos = { ...prev };
        
        switch (direction) {
          case 'up': if (prev.y > 0 && !isWall(prev.x, prev.y - 1)) newPos.y--; break;
          case 'down': if (prev.y < GRID_SIZE - 1 && !isWall(prev.x, prev.y + 1)) newPos.y++; break;
          case 'left': if (prev.x > 0 && !isWall(prev.x - 1, prev.y)) newPos.x--; break;
          case 'right': if (prev.x < GRID_SIZE - 1 && !isWall(prev.x + 1, prev.y)) newPos.x++; break;
        }

        // Collect dot
        if (dots[newPos.y]?.[newPos.x]) {
          const newDots = [...dots];
          newDots[newPos.y][newPos.x] = false;
          setDots(newDots);
          setScore(prev => prev + 10);
        }

        return newPos;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, gameActive, dots]);

  const isWall = (x: number, y: number): boolean => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return true;
    if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) return true;
    if (y === 5 && x > 3 && x < 15) return true;
    if (y === 13 && x > 3 && x < 15) return true;
    if (x === 5 && y > 3 && y < 15) return true;
    if (x === 13 && y > 3 && y < 15) return true;
    return false;
  };

  const resetGame = () => {
    setPacman({ x: 9, y: 9 });
    setDirection('right');
    setScore(0);
    setGameActive(true);
    
    const initialDots = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(true)
    );
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (i === 0 || i === GRID_SIZE - 1 || j === 0 || j === GRID_SIZE - 1) {
          initialDots[i][j] = false;
        }
        if (i === 5 && j > 3 && j < 15) initialDots[i][j] = false;
        if (i === 13 && j > 3 && j < 15) initialDots[i][j] = false;
        if (j === 5 && i > 3 && i < 15) initialDots[i][j] = false;
        if (j === 13 && i > 3 && i < 15) initialDots[i][j] = false;
        if (i === 9 && j === 9) initialDots[i][j] = false;
      }
    }
    
    setDots(initialDots);
  };

  const getPacmanRotation = () => {
    switch (direction) {
      case 'right': return 'rotate-0';
      case 'left': return 'rotate-180';
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      default: return 'rotate-0';
    }
  };

  const dotsRemaining = dots.flat().filter(Boolean).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-2 text-yellow-400">
          🍒 Pacman Game
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Use arrow keys to move • R to restart
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Game board */}
          <div className="flex-1">
            <div className="bg-gray-800 p-4 rounded-2xl shadow-2xl">
              <div className="relative bg-gray-900 rounded-lg p-2">
                <div 
                  className="relative grid gap-0 border-2 border-blue-500 rounded"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    width: `${GRID_SIZE * CELL_SIZE}px`,
                    height: `${GRID_SIZE * CELL_SIZE}px`,
                  }}
                >
                  {Array(GRID_SIZE).fill(null).map((_, rowIndex) => (
                    Array(GRID_SIZE).fill(null).map((_, colIndex) => {
                      const isWallCell = isWall(colIndex, rowIndex);
                      const hasDot = dots[rowIndex]?.[colIndex] && !isWallCell;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`flex items-center justify-center border border-gray-800 ${
                            isWallCell ? 'bg-blue-900' : 'bg-gray-900'
                          }`}
                        >
                          {hasDot && (
                            <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></div>
                          )}
                        </div>
                      );
                    })
                  ))}

                  {/* Pacman */}
                  <div
                    className={`absolute w-6 h-6 rounded-full bg-yellow-400 transition-all duration-150 ${getPacmanRotation()}`}
                    style={{
                      left: `${pacman.x * CELL_SIZE + CELL_SIZE/2 - 12}px`,
                      top: `${pacman.y * CELL_SIZE + CELL_SIZE/2 - 12}px`,
                    }}
                  >
                    <div className="absolute w-3 h-3 bg-gray-900 rounded-full -top-1 -right-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game info */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Game Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Score:</span>
                  <span className="text-3xl font-bold text-yellow-400">{score}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Dots remaining:</span>
                  <span className="text-xl font-bold text-green-400">{dotsRemaining}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status:</span>
                  <span className={`text-xl font-bold ${gameActive ? 'text-green-400' : 'text-red-400'}`}>
                    {gameActive ? 'Playing' : 'Game Over'}
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-cyan-300">Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-yellow-400">↑</div>
                    <div className="text-sm text-gray-300">Up</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-yellow-400">↓</div>
                    <div className="text-sm text-gray-300">Down</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-yellow-400">←</div>
                    <div className="text-sm text-gray-300">Left</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-yellow-400">→</div>
                    <div className="text-sm text-gray-300">Right</div>
                  </div>
                </div>
                
                <button
                  onClick={resetGame}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Restart Game (R)
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl">
              <h3 className="text-xl font-bold mb-3 text-yellow-300">How to Play</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  Use arrow keys to move Pacman
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  Collect all yellow dots to score points
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  Avoid hitting the blue walls
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  Press R to restart the game
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacmanGame;

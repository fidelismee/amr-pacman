"use client";

import { useState, useEffect } from 'react';

const GRID_SIZE = 19;
const CELL_SIZE = 28;

type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;
  y: number;
}

const AntibioticGame = () => {
  const [antibiotic, setAntibiotic] = useState<Position>({ x: 9, y: 9 });
  const [direction, setDirection] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<boolean[][]>([]);
  const [gameActive, setGameActive] = useState(true);

  // Initialize dots
  useEffect(() => {
    const initialDots = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(true)
    );
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (i === 0 || i === GRID_SIZE - 1 || j === 0 || j === GRID_SIZE - 1) {
          initialDots[i][j] = false;
        }
        if (i === 6 && j > 4 && j < 14) initialDots[i][j] = false;
        if (i === 12 && j > 4 && j < 14) initialDots[i][j] = false;
        if (j === 6 && i > 4 && i < 14) initialDots[i][j] = false;
        if (j === 12 && i > 4 && i < 14) initialDots[i][j] = false;
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

  // Move antibiotic
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setAntibiotic(prev => {
        const newPos = { ...prev };
        
        switch (direction) {
          case 'up': if (prev.y > 0 && !isWall(prev.x, prev.y - 1)) newPos.y--; break;
          case 'down': if (prev.y < GRID_SIZE - 1 && !isWall(prev.x, prev.y + 1)) newPos.y++; break;
          case 'left': if (prev.x > 0 && !isWall(prev.x - 1, prev.y)) newPos.x--; break;
          case 'right': if (prev.x < GRID_SIZE - 1 && !isWall(prev.x + 1, prev.y)) newPos.x++; break;
        }

        if (dots[newPos.y]?.[newPos.x]) {
          const newDots = [...dots];
          newDots[newPos.y][newPos.x] = false;
          setDots(newDots);
          setScore(prev => prev + 10);
          
          if (newDots.flat().filter(Boolean).length === 0) {
            setGameActive(false);
          }
        }

        return newPos;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, gameActive, dots]);

  const isWall = (x: number, y: number): boolean => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return true;
    if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) return true;
    if (y === 6 && x > 4 && x < 14) return true;
    if (y === 12 && x > 4 && x < 14) return true;
    if (x === 6 && y > 4 && y < 14) return true;
    if (x === 12 && y > 4 && y < 14) return true;
    return false;
  };

  const resetGame = () => {
    setAntibiotic({ x: 9, y: 9 });
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
        if (i === 6 && j > 4 && j < 14) initialDots[i][j] = false;
        if (i === 12 && j > 4 && j < 14) initialDots[i][j] = false;
        if (j === 6 && i > 4 && i < 14) initialDots[i][j] = false;
        if (j === 12 && i > 4 && i < 14) initialDots[i][j] = false;
        if (i === 9 && j === 9) initialDots[i][j] = false;
      }
    }
    
    setDots(initialDots);
  };

  const getAntibioticRotation = () => {
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-2 text-blue-700">
          💊 Antibiotic Defender
        </h1>
        <p className="text-center text-blue-600 mb-8 font-medium">
          Help the antibiotic clear infection sites! Use arrow keys to move.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-blue-200">
              <div className="relative bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-2">
                <div 
                  className="relative grid gap-0 border-2 border-blue-300 rounded-lg"
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
                          className={`flex items-center justify-center border border-blue-100 ${
                            isWallCell ? 'bg-blue-300' : 'bg-gradient-to-br from-blue-50 to-white'
                          }`}
                        >
                          {hasDot && (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          )}
                        </div>
                      );
                    })
                  ))}

                  <div
                    className={`absolute w-7 h-5 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-150 ${getAntibioticRotation()} border-2 border-white shadow-lg`}
                    style={{
                      left: `${antibiotic.x * CELL_SIZE + CELL_SIZE/2 - 14}px`,
                      top: `${antibiotic.y * CELL_SIZE + CELL_SIZE/2 - 10}px`,
                    }}
                  >
                    <div className="absolute w-1 h-3 bg-white rounded-full left-1 top-1"></div>
                    <div className="absolute w-1 h-3 bg-white rounded-full right-1 top-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border-2 border-blue-200">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">Game Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Score:</span>
                  <span className="text-3xl font-bold text-blue-600">{score}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Infection sites:</span>
                  <span className="text-xl font-bold text-red-600">{dotsRemaining}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Status:</span>
                  <span className={`text-xl font-bold ${gameActive ? 'text-green-600' : 'text-red-600'}`}>
                    {gameActive ? 'Fighting Infection' : dotsRemaining === 0 ? 'Victory! 🎉' : 'Game Over'}
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-blue-600">Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="text-blue-700 text-xl">↑</div>
                    <div className="text-sm text-gray-600">Up</div>
                  </div>
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="text-blue-700 text-xl">↓</div>
                    <div className="text-sm text-gray-600">Down</div>
                  </div>
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="text-blue-700 text-xl">←</div>
                    <div className="text-sm text-gray-600">Left</div>
                  </div>
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="text-blue-700 text-xl">→</div>
                    <div className="text-sm text-gray-600">Right</div>
                  </div>
                </div>
                
                <button
                  onClick={resetGame}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Restart Game (R)
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-2xl border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-3 text-blue-600">About Antibiotics</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Antibiotics fight bacterial infections</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Finish your full prescription</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Prevent antibiotic resistance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntibioticGame;

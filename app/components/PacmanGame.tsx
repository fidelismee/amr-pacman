// app/components/PacmanGame.tsx
"use client";

import { useState, useEffect } from 'react';
import EntityLayer, { Position, Direction } from '../game/components/EntityLayer';

// Constants
const GRID_SIZE = 19;
const CELL_SIZE = 24; // Increased slightly for better visibility
const BOARD_WIDTH = GRID_SIZE * CELL_SIZE;
const BOARD_HEIGHT = GRID_SIZE * CELL_SIZE;

const AntibioticGame = () => {
  const [antibiotic, setAntibiotic] = useState<Position>({ x: 9, y: 9 });
  const [direction, setDirection] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<boolean[][]>([]);
  const [gameActive, setGameActive] = useState(true);
  
  // Mock bacteria for now (can be made dynamic later)
  const [bacteria] = useState<Position[]>([
    { x: 1, y: 1 },
    { x: 17, y: 1 },
    { x: 1, y: 17 },
    { x: 17, y: 17 }
  ]);

  // --- Game Logic Helpers ---
  const isWall = (x: number, y: number): boolean => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return true;
    if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) return true;
    if (y === 6 && x > 4 && x < 14) return true;
    if (y === 12 && x > 4 && x < 14) return true;
    if (x === 6 && y > 4 && y < 14) return true;
    if (x === 12 && y > 4 && y < 14) return true;
    return false;
  };

  // --- Initialization ---
  useEffect(() => {
    const initialDots = Array(GRID_SIZE).fill(null).map((_, y) => 
      Array(GRID_SIZE).fill(null).map((_, x) => !isWall(x, y))
    );
    // Clear center spawn area
    if(initialDots[9][9]) initialDots[9][9] = false;
    
    setDots(initialDots);
  }, []);

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
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

  // --- Movement Loop ---
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setAntibiotic(prev => {
        const newPos = { ...prev };
        
        switch (direction) {
          case 'up': newPos.y--; break;
          case 'down': newPos.y++; break;
          case 'left': newPos.x--; break;
          case 'right': newPos.x++; break;
        }

        // Collision Check
        if (isWall(newPos.x, newPos.y)) {
          return prev; // Hit wall, don't move
        }

        // Eat Dot
        if (dots[newPos.y]?.[newPos.x]) {
          setDots(currentDots => {
            const newDots = [...currentDots.map(row => [...row])];
            newDots[newPos.y][newPos.x] = false;
            return newDots;
          });
          setScore(s => s + 10);
        }

        return newPos;
      });
      
      // Check win condition
      const remaining = dots.flat().filter(Boolean).length;
      if (remaining === 0 && dots.length > 0) setGameActive(false);

    }, 150);

    return () => clearInterval(interval);
  }, [direction, gameActive, dots]);

  const resetGame = () => {
    setAntibiotic({ x: 9, y: 9 });
    setDirection('right');
    setScore(0);
    setGameActive(true);
    // Trigger re-init of dots
    const initialDots = Array(GRID_SIZE).fill(null).map((_, y) => 
      Array(GRID_SIZE).fill(null).map((_, x) => !isWall(x, y))
    );
    if(initialDots[9][9]) initialDots[9][9] = false;
    setDots(initialDots);
  };

  const dotsRemaining = dots.flat().filter(Boolean).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-800">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-blue-700">
          💊 Antibiotic Defender
        </h1>
        <p className="text-center text-blue-600 mb-8 font-medium">
          Clear the infection sites!
        </p>

        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
          
          {/* --- GAME BOARD CONTAINER --- */}
          <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-blue-200">
            <div className="bg-blue-900 rounded-lg p-3 overflow-hidden">
              
              {/* This relative container is the EXACT size of the grid. 
                  No padding here ensures absolute positioning works perfectly. */}
              <div 
                className="relative mx-auto"
                style={{
                  width: `${BOARD_WIDTH}px`,
                  height: `${BOARD_HEIGHT}px`,
                }}
              >
                {/* 1. Grid Layer */}
                <div 
                  className="grid gap-0 absolute inset-0 z-0"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  }}
                >
                  {Array(GRID_SIZE).fill(null).map((_, y) => (
                    Array(GRID_SIZE).fill(null).map((_, x) => {
                      const wall = isWall(x, y);
                      const hasDot = dots[y]?.[x];
                      
                      return (
                        <div
                          key={`${y}-${x}`}
                          className={`flex items-center justify-center ${
                            wall ? 'bg-blue-800/80 border-blue-900' : 'bg-transparent'
                          }`}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        >
                          {/* Dot rendering */}
                          {hasDot && !wall && (
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400/80 shadow-[0_0_4px_rgba(244,114,182,0.8)]"></div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>

                {/* 2. Entity Layer (Stacked directly on top) */}
                <EntityLayer 
                   antibioticPosition={antibiotic}
                   antibioticDirection={direction}
                   bacteriaPositions={bacteria}
                   poweredUp={false}
                   cellSize={CELL_SIZE}
                />
                
              </div>
            </div>
          </div>

          {/* --- UI / STATUS PANEL --- */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100">
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Mission Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-900 font-semibold">Score</span>
                  <span className="text-3xl font-bold text-blue-600">{score}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-900 font-semibold">Infection Sites</span>
                  <span className="text-2xl font-bold text-red-500">{dotsRemaining}</span>
                </div>
                
                <div className="text-center pt-2">
                  <span className={`text-xl font-bold ${gameActive ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {gameActive ? '● Active' : dotsRemaining === 0 ? '🎉 CURED!' : '⚠ STOPPED'}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-2 font-semibold">CONTROLS</p>
                <div className="grid grid-cols-3 gap-2">
                  <div />
                  <button onClick={() => setDirection('up')} className="p-3 bg-gray-100 rounded hover:bg-blue-100 transition">↑</button>
                  <div />
                  <button onClick={() => setDirection('left')} className="p-3 bg-gray-100 rounded hover:bg-blue-100 transition">←</button>
                  <button onClick={() => setDirection('down')} className="p-3 bg-gray-100 rounded hover:bg-blue-100 transition">↓</button>
                  <button onClick={() => setDirection('right')} className="p-3 bg-gray-100 rounded hover:bg-blue-100 transition">→</button>
                </div>
                
                <button
                  onClick={resetGame}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transform active:scale-95 transition-all"
                >
                  Restart Treatment (R)
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AntibioticGame;
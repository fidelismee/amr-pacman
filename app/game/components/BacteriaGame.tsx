// BacteriaGame.tsx - Complete Fixed Version

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

// Types
type Direction = 'up' | 'down' | 'left' | 'right';
interface Position {
  x: number;
  y: number;
}
type CellType = 0 | 1 | 2 | 3;
type Level = CellType[][];

// Constants
const CELL_SIZE = 24;
const POWER_UP_DURATION = 5000;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 15;

const LEVEL_1: Level = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 3, 0, 0, 0, 3, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const ANTIBIOTIC_START = { x: 7, y: 7 };
const BACTERIA_STARTS = [
  { x: 1, y: 1 },
  { x: 13, y: 1 },
  { x: 1, y: 13 },
  { x: 13, y: 13 }
];

const INITIAL_ENEMY_DIRECTIONS: Direction[] = ['right', 'left', 'right', 'left'];

const BacteriaGame = () => {
  const [level, setLevel] = useState<Level>(LEVEL_1);
  const [bacteriaPosition, setBacteriaPosition] = useState<Position>(ANTIBIOTIC_START);
  const [antibioticPositions, setAntibioticPositions] = useState<Position[]>(BACTERIA_STARTS);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [poweredUp, setPoweredUp] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [hasFocus, setHasFocus] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

  const antibioticDirectionsRef = useRef<Direction[]>([...INITIAL_ENEMY_DIRECTIONS]);
  const nextDirectionRef = useRef<Direction | null>(null);
  const currentDirectionRef = useRef<Direction>('right');

  const boardPixelWidth = GRID_WIDTH * CELL_SIZE;
  const boardPixelHeight = GRID_HEIGHT * CELL_SIZE;

  const canMoveTo = (x: number, y: number): boolean => {
    if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) return false;
    return level[y]?.[x] !== 1;
  };

  const moveBacteria = () => {
    const currentDirection = currentDirectionRef.current;
    const nextDirection = nextDirectionRef.current;
    const newPos = { ...bacteriaPosition };
    let moved = false;
    
    if (nextDirection !== null) {
      const testPos = { ...bacteriaPosition };
      switch (nextDirection) {
        case 'up':
          if (canMoveTo(testPos.x, testPos.y - 1)) {
            testPos.y--;
            moved = true;
          }
          break;
        case 'down':
          if (canMoveTo(testPos.x, testPos.y + 1)) {
            testPos.y++;
            moved = true;
          }
          break;
        case 'left':
          if (canMoveTo(testPos.x - 1, testPos.y)) {
            testPos.x--;
            moved = true;
          }
          break;
        case 'right':
          if (canMoveTo(testPos.x + 1, testPos.y)) {
            testPos.x++;
            moved = true;
          }
          break;
      }
      
      if (moved) {
        Object.assign(newPos, testPos);
        currentDirectionRef.current = nextDirection;
        nextDirectionRef.current = null;
      }
    }
    
    if (!moved) {
      switch (currentDirection) {
        case 'up': if (canMoveTo(newPos.x, newPos.y - 1)) newPos.y--; break;
        case 'down': if (canMoveTo(newPos.x, newPos.y + 1)) newPos.y++; break;
        case 'left': if (canMoveTo(newPos.x - 1, newPos.y)) newPos.x--; break;
        case 'right': if (canMoveTo(newPos.x + 1, newPos.y)) newPos.x++; break;
      }
    }

    if (newPos.x !== bacteriaPosition.x || newPos.y !== bacteriaPosition.y) {
      setBacteriaPosition(newPos);
      const cellType = level[newPos.y]?.[newPos.x];
      if (cellType === 0) {
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2;
        setLevel(newLevel);
        setScore(prev => prev + 10);
        if (!newLevel.flat().includes(0)) {
          setGameActive(false);
          setGameMessage('🎉 All Nutrients Consumed! Bacteria Wins!');
        }
      } else if (cellType === 3) {
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2;
        setLevel(newLevel);
        setPoweredUp(true);
        setPowerUpTimer(POWER_UP_DURATION);
        setScore(prev => prev + 50);
      }
    }
  };

  const moveAntibiotics = () => {
    setAntibioticPositions(prev => {
      const newPositions: Position[] = [];
      
      prev.forEach((antibiotic, index) => {
        const currentDir = antibioticDirectionsRef.current[index];
        
        const directionVectors: { dir: Direction, x: number, y: number }[] = [
          { dir: 'up', x: 0, y: -1 },
          { dir: 'down', x: 0, y: 1 },
          { dir: 'left', x: -1, y: 0 },
          { dir: 'right', x: 1, y: 0 },
        ];
        
        const isPositionOccupied = (pos: Position, checkIndex: number): boolean => {
          for (let i = 0; i < newPositions.length; i++) {
            if (newPositions[i].x === pos.x && newPositions[i].y === pos.y) {
              return true;
            }
          }
          for (let i = newPositions.length; i < prev.length; i++) {
            if (i !== checkIndex && prev[i].x === pos.x && prev[i].y === pos.y) {
              return true;
            }
          }
          return false;
        };
        
        const getOppositeDir = (dir: Direction): Direction => {
          switch (dir) {
            case 'up': return 'down';
            case 'down': return 'up';
            case 'left': return 'right';
            case 'right': return 'left';
          }
        };
        
        const currentVector = directionVectors.find(v => v.dir === currentDir);
        if (currentVector) {
          const nextPos = { 
            x: antibiotic.x + currentVector.x, 
            y: antibiotic.y + currentVector.y 
          };
          
          if (canMoveTo(nextPos.x, nextPos.y) && !isPositionOccupied(nextPos, index)) {
            const perpendicularDirs = directionVectors.filter(v => 
              v.dir !== currentDir && v.dir !== getOppositeDir(currentDir)
            );
            
            const availableTurns = perpendicularDirs.filter(v => {
              const turnPos = { x: antibiotic.x + v.x, y: antibiotic.y + v.y };
              return canMoveTo(turnPos.x, turnPos.y) && !isPositionOccupied(turnPos, index);
            });
            
            if (availableTurns.length > 0 && Math.random() < 0.3) {
              const chosenTurn = availableTurns[Math.floor(Math.random() * availableTurns.length)];
              antibioticDirectionsRef.current[index] = chosenTurn.dir;
              newPositions.push({ 
                x: antibiotic.x + chosenTurn.x, 
                y: antibiotic.y + chosenTurn.y 
              });
              return;
            }
            
            newPositions.push(nextPos);
            return;
          }
        }
        
        const validMoves = directionVectors.filter(v => {
          const targetPos = { x: antibiotic.x + v.x, y: antibiotic.y + v.y };
          return v.dir !== getOppositeDir(currentDir) && 
                 canMoveTo(targetPos.x, targetPos.y) && 
                 !isPositionOccupied(targetPos, index);
        });
        
        if (validMoves.length > 0) {
          const chosenMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          antibioticDirectionsRef.current[index] = chosenMove.dir;
          newPositions.push({ 
            x: antibiotic.x + chosenMove.x, 
            y: antibiotic.y + chosenMove.y 
          });
          return;
        }
        
        const anyValidMove = directionVectors.find(v => {
          const targetPos = { x: antibiotic.x + v.x, y: antibiotic.y + v.y };
          return canMoveTo(targetPos.x, targetPos.y) && !isPositionOccupied(targetPos, index);
        });
        
        if (anyValidMove) {
          antibioticDirectionsRef.current[index] = anyValidMove.dir;
          newPositions.push({ 
            x: antibiotic.x + anyValidMove.x, 
            y: antibiotic.y + anyValidMove.y 
          });
        } else {
          newPositions.push(antibiotic);
        }
      });
      
      return newPositions;
    });
  };

  const checkCollisions = () => {
    antibioticPositions.forEach(antibiotic => {
      if (antibiotic.x === bacteriaPosition.x && antibiotic.y === bacteriaPosition.y) {
        if (poweredUp) {
          setAntibioticPositions(prev => prev.filter(a => a !== antibiotic));
          setScore(prev => prev + 100);
        } else {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameActive(false);
              setGameMessage('💀 Antibiotics Eliminated Bacteria! Game Over');
            }
            return newLives;
          });
          setBacteriaPosition(ANTIBIOTIC_START);
          setAntibioticPositions(BACTERIA_STARTS.map(pos => ({ ...pos })));
          antibioticDirectionsRef.current = [...INITIAL_ENEMY_DIRECTIONS];
        }
      }
    });
  };

  const initializeGame = useCallback(() => {
    setLevel(LEVEL_1.map(row => [...row]));
    setBacteriaPosition(ANTIBIOTIC_START);
    setAntibioticPositions(BACTERIA_STARTS.map(pos => ({ ...pos })));
    antibioticDirectionsRef.current = [...INITIAL_ENEMY_DIRECTIONS];
    setScore(0);
    setLives(3);
    setGameActive(true);
    setPoweredUp(false);
    setPowerUpTimer(0);
    setGameMessage('');
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          initializeGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, initializeGame]);

  // Game loop
  useEffect(() => {
    if (!isRunning || !gameActive) return;

    const interval = setInterval(() => {
      moveBacteria();
      moveAntibiotics();
      
      if (poweredUp) {
        setPowerUpTimer(prev => {
          if (prev <= 200) {
            setPoweredUp(false);
            return 0;
          }
          return prev - 200;
        });
      }
      checkCollisions();
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, gameActive, bacteriaPosition, antibioticPositions, poweredUp, level]);

  const remainingNutrients = level.flat().filter(cell => cell === 0).length;
  const remainingBoosters = level.flat().filter(cell => cell === 3).length;

  const getBacteriaRotation = () => {
    switch (currentDirectionRef.current) {
      case 'right': return 'rotate-0';
      case 'left': return 'rotate-180';
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      default: return 'rotate-0';
    }
  };

  const getAntibioticColor = (index: number) => {
    const colors = [
      'from-blue-400 to-cyan-500',
      'from-blue-300 to-cyan-400',
      'from-indigo-400 to-purple-500',
      'from-sky-400 to-blue-500',
    ];
    return colors[index % colors.length];
  };

  const bacteriaSize = CELL_SIZE * 0.8;
  const antibioticSize = CELL_SIZE * 0.7;
  const bacteriaOffset = (CELL_SIZE - bacteriaSize) / 2;
  const antibioticOffset = (CELL_SIZE - antibioticSize) / 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white p-3 md:p-6 touch-none">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🦠 Bacterial Survival
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            Eat nutrients (dots), avoid antibiotics. Use arrow keys to move!
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          {/* Game Board */}
          <div className="flex-1 w-full flex flex-col items-center">
            <div className="flex justify-center items-center w-full overflow-hidden py-4">
              <div 
                className="relative"
                style={{
                  width: boardPixelWidth,
                  height: boardPixelHeight,
                }}
              >
                <div 
                  className={`absolute -inset-2 rounded-xl transition-all duration-300 z-10 pointer-events-none ${
                    hasFocus ? 'ring-4 ring-green-500/50 bg-green-500/10' : 'ring-2 ring-gray-700/30'
                  }`}
                />
                
                <div
                  className="relative cursor-pointer w-full h-full outline-none"
                  onClick={() => setHasFocus(true)}
                  onBlur={() => setHasFocus(false)}
                  tabIndex={0}
                >
                  {/* Game Board */}
                  <div 
                    className="bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
                      gridTemplateRows: `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`,
                      width: 'fit-content',
                      height: 'fit-content',
                    }}
                  >
                    {level.map((row, y) =>
                      row.map((cell, x) => {
                        let cellContent = null;
                        let cellClass = "flex items-center justify-center relative";
                        
                        if (cell === 1) {
                          cellClass += " bg-gray-800/80 border-[0.5px] border-gray-700/30";
                        } else {
                          cellClass += " bg-transparent";
                          
                          if (cell === 0) {
                            cellContent = (
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            );
                          } else if (cell === 3) {
                            cellContent = (
                              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                            );
                          }
                        }

                        return (
                          <div
                            key={`${x}-${y}`}
                            className={cellClass}
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          >
                            {cellContent}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Entities Layer */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Bacteria (Player) */}
                    <div
                      className={`absolute rounded-lg transition-all duration-150 ${getBacteriaRotation()} ${
                        poweredUp 
                          ? 'bg-gradient-to-br from-green-300 to-emerald-400 border-2 border-white shadow-lg shadow-green-400/50 animate-pulse' 
                          : 'bg-gradient-to-br from-green-500 to-emerald-700 border-2 border-white shadow-lg'
                      }`}
                      style={{
                        width: `${bacteriaSize}px`,
                        height: `${bacteriaSize}px`,
                        transform: `translate(${bacteriaPosition.x * CELL_SIZE + bacteriaOffset}px, ${bacteriaPosition.y * CELL_SIZE + bacteriaOffset}px)`,
                        left: 0,
                        top: 0,
                      }}
                    >
                      <div className="absolute w-2 h-2 bg-white/90 rounded-full left-2 top-2"></div>
                      <div className="absolute w-2 h-2 bg-white/90 rounded-full right-2 top-2"></div>
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-white/70 rounded-t-full"></div>
                      {poweredUp && (
                        <div className="absolute inset-0 rounded-lg animate-ping bg-green-400/30"></div>
                      )}
                    </div>

                    {/* Antibiotics (Enemies) */}
                    {antibioticPositions.map((pos, index) => (
                      <div
                        key={index}
                        className={`absolute rounded-full animate-bounce ${
                          poweredUp ? 'opacity-50 grayscale' : `bg-gradient-to-r ${getAntibioticColor(index)}`
                        }`}
                        style={{
                          width: `${antibioticSize}px`,
                          height: `${antibioticSize}px`,
                          transform: `translate(${pos.x * CELL_SIZE + antibioticOffset}px, ${pos.y * CELL_SIZE + antibioticOffset}px)`,
                          left: 0,
                          top: 0,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      >
                        <div className="absolute w-1 h-3 bg-white/80 rounded-full left-2 top-1/2 transform -translate-y-1/2"></div>
                        <div className="absolute w-1 h-3 bg-white/80 rounded-full right-2 top-1/2 transform -translate-y-1/2"></div>
                        {poweredUp && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs font-bold text-green-300">!</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {!hasFocus && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-20 backdrop-blur-[1px]">
                      <div className="text-center p-4 bg-gray-900/90 rounded-xl border-2 border-green-500/50 shadow-2xl">
                        <h3 className="text-xl font-bold mb-2 text-green-300">Tap to Play</h3>
                        <p className="text-gray-300 text-sm">Activate controls</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {!gameActive && (
                  <div className="absolute inset-0 bg-black/85 flex items-center justify-center rounded-lg z-30 backdrop-blur-sm">
                    <div className="text-center p-6 bg-gray-900 rounded-xl border-2 border-green-500/50 shadow-2xl max-w-[90%]">
                      <h2 className="text-2xl font-bold mb-4 text-white">{gameMessage}</h2>
                      <button
                        onClick={initializeGame}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg"
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="lg:w-80 w-full space-y-4">
            <div className="bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-green-300">Game Status</h2>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">Score:</span>
                  <span className="text-2xl md:text-3xl font-bold text-emerald-400">{score}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">Lives:</span>
                  <div className="flex gap-1 md:gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${
                          i < lives ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">Nutrients:</span>
                  <span className="text-lg md:text-xl font-bold text-yellow-400">{remainingNutrients}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">Boosters:</span>
                  <span className="text-lg md:text-xl font-bold text-purple-400">{remainingBoosters}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm md:text-base">Resistant:</span>
                  <span className={`text-lg md:text-xl font-bold ${poweredUp ? 'text-purple-300 animate-pulse' : 'text-gray-400'}`}>
                    {poweredUp ? 'ACTIVE' : 'Vulnerable'}
                  </span>
                </div>
                
                {poweredUp && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                        style={{ width: `${(powerUpTimer / POWER_UP_DURATION) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-1">
                      {Math.ceil(powerUpTimer / 1000)}s remaining
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-green-300">Controls</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Arrow Keys</span>
                  <span className="text-green-300">Move</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Space</span>
                  <span className="text-green-300">Pause</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">R</span>
                  <span className="text-green-300">Restart</span>
                </div>
              </div>
              <button
                onClick={initializeGame}
                className="w-full mt-4 py-2 bg-gradient-to-r from-green-700 to-emerald-700 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacteriaGame;
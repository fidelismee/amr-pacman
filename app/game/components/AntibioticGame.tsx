// app/game/components/AntibioticGame.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
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

const CELL_SIZE = 24;
const POWER_UP_DURATION = 5000; // 5 seconds in milliseconds

const AntibioticGame = () => {
  // Game state
  const [level, setLevel] = useState<Level>(LEVEL_1);
  const [antibioticPosition, setAntibioticPosition] = useState<Position>(ANTIBIOTIC_START);
  const [bacteriaPositions, setBacteriaPositions] = useState<Position[]>(BACTERIA_STARTS);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [poweredUp, setPoweredUp] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [gameMessage, setGameMessage] = useState<string>('');

  // Game loop hook
  const { getCurrentDirection, isRunning, setDirection } = useGameLoop({
    tickInterval: 200,
    onTick: () => {
      if (!gameActive) return;
      
      // Move antibiotic
      moveAntibiotic();
      
      // Move bacteria
      moveBacteria();
      
      // Update power-up timer
      if (poweredUp) {
        setPowerUpTimer(prev => {
          if (prev <= 200) {
            setPoweredUp(false);
            return 0;
          }
          return prev - 200;
        });
      }
      
      // Check collisions
      checkCollisions();
    },
  });

  // Handle focus for keyboard events
  const [hasFocus, setHasFocus] = useState(false);
  
  const handleFocus = () => {
    setHasFocus(true);
  };
  
  const handleBlur = () => {
    setHasFocus(false);
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    setLevel([...LEVEL_1.map(row => [...row])]);
    setAntibioticPosition(ANTIBIOTIC_START);
    setBacteriaPositions([...BACTERIA_STARTS]);
    setScore(0);
    setLives(3);
    setGameActive(true);
    setPoweredUp(false);
    setPowerUpTimer(0);
    setGameMessage('');
  }, []);

  // Move antibiotic based on current direction
  const moveAntibiotic = () => {
    const direction = getCurrentDirection();
    const newPos = { ...antibioticPosition };
    
    switch (direction) {
      case 'up':
        if (canMoveTo(newPos.x, newPos.y - 1)) newPos.y--;
        break;
      case 'down':
        if (canMoveTo(newPos.x, newPos.y + 1)) newPos.y++;
        break;
      case 'left':
        if (canMoveTo(newPos.x - 1, newPos.y)) newPos.x--;
        break;
      case 'right':
        if (canMoveTo(newPos.x + 1, newPos.y)) newPos.x++;
        break;
    }

    // Check if position changed
    if (newPos.x !== antibioticPosition.x || newPos.y !== antibioticPosition.y) {
      setAntibioticPosition(newPos);
      
      // Check what's at the new position
      const cellType = level[newPos.y]?.[newPos.x];
      
      if (cellType === 0) {
        // Collect infected cell
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2; // Change to empty
        setLevel(newLevel);
        setScore(prev => prev + 10);
        
        // Check win condition
        if (!newLevel.flat().includes(0)) {
          setGameActive(false);
          setGameMessage('🎉 Infection Cleared! You Win!');
        }
      } else if (cellType === 3) {
        // Collect immune booster
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2; // Change to empty
        setLevel(newLevel);
        setPoweredUp(true);
        setPowerUpTimer(POWER_UP_DURATION);
        setScore(prev => prev + 50);
      }
    }
  };

  // Simple AI for bacteria movement
  const moveBacteria = () => {
    setBacteriaPositions(prev => 
      prev.map(bacteria => {
        const directions = [
          { x: 0, y: -1 }, // up
          { x: 0, y: 1 },  // down
          { x: -1, y: 0 }, // left
          { x: 1, y: 0 },  // right
        ];
        
        // Filter valid moves
        const validMoves = directions.filter(dir => 
          canMoveTo(bacteria.x + dir.x, bacteria.y + dir.y)
        );
        
        if (validMoves.length === 0) return bacteria;
        
        // Choose random valid move
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        
        return {
          x: bacteria.x + move.x,
          y: bacteria.y + move.y,
        };
      })
    );
  };

  // Check collisions between antibiotic and bacteria
  const checkCollisions = () => {
    bacteriaPositions.forEach(bacteria => {
      if (bacteria.x === antibioticPosition.x && bacteria.y === antibioticPosition.y) {
        if (poweredUp) {
          // Antibiotic destroys bacteria
          setBacteriaPositions(prev => prev.filter(b => b !== bacteria));
          setScore(prev => prev + 100);
        } else {
          // Antibiotic loses a life
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameActive(false);
              setGameMessage('💀 Bacteria Overcame Antibiotic! Game Over');
            }
            return newLives;
          });
          
          // Reset positions
          setAntibioticPosition(ANTIBIOTIC_START);
          setBacteriaPositions([...BACTERIA_STARTS]);
        }
      }
    });
  };

  // Check if a position is valid for movement
  const canMoveTo = (x: number, y: number): boolean => {
    if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) {
      return false;
    }
    
    const cellType = level[y]?.[x];
    return cellType !== 1; // Can't move into walls
  };

  // Handle restart
  const handleRestart = () => {
    initializeGame();
  };

  // Calculate remaining infected cells
  const remainingInfectedCells = level.flat().filter(cell => cell === 0).length;
  const remainingBoosters = level.flat().filter(cell => cell === 3).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            💊 Antibiotic Defender
          </h1>
          <p className="text-gray-300 mb-4">
            Clear infected cells while avoiding resistant bacteria. Collect immune boosters to fight back!
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: Game board */}
          <div className="flex-1">
            <div className="relative">
              {/* Focus indicator */}
              <div 
                className={`absolute -inset-2 rounded-xl transition-all duration-300 z-10 pointer-events-none ${
                  hasFocus 
                    ? 'ring-4 ring-blue-500/50 bg-blue-500/10' 
                    : 'ring-2 ring-gray-700/30'
                }`}
              />
              
              {/* Click to focus area */}
              <div
                className="relative cursor-pointer"
                onClick={handleFocus}
                onBlur={handleBlur}
                tabIndex={0}
              >
                <GameBoard level={level} cellSize={CELL_SIZE} />
                <EntityLayer
                  antibioticPosition={antibioticPosition}
                  antibioticDirection={getCurrentDirection()}
                  bacteriaPositions={bacteriaPositions}
                  poweredUp={poweredUp}
                  cellSize={CELL_SIZE}
                />
                
                {/* Focus instructions */}
                {!hasFocus && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <div className="text-center p-6 bg-gray-900/90 rounded-xl border-2 border-blue-500/50">
                      <h3 className="text-2xl font-bold mb-3 text-blue-300">Click to Focus</h3>
                      <p className="text-gray-300 mb-4">Click on the game board to enable keyboard controls</p>
                      <div className="text-sm text-gray-400">
                        Then use arrow keys to move
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Game overlay messages */}
              {!gameActive && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-20">
                  <div className="text-center p-8 bg-gray-900/90 rounded-xl border-2 border-blue-500/50">
                    <h2 className="text-3xl font-bold mb-4">{gameMessage}</h2>
                    <button
                      onClick={handleRestart}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Focus status */}
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                hasFocus 
                  ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${hasFocus ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-sm font-medium">
                  {hasFocus ? 'Keyboard controls active' : 'Click game board to activate controls'}
                </span>
              </div>
            </div>
          </div>

          {/* Right column: Game info and controls */}
          <div className="lg:w-80 space-y-6">
            {/* Game stats */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-blue-300">Game Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Score:</span>
                  <span className="text-3xl font-bold text-cyan-400">{score}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Lives:</span>
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${
                          i < lives 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Infected Cells:</span>
                  <span className="text-xl font-bold text-green-400">{remainingInfectedCells}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Immune Boosters:</span>
                  <span className="text-xl font-bold text-blue-400">{remainingBoosters}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Powered Up:</span>
                  <span className={`text-xl font-bold ${poweredUp ? 'text-cyan-300 animate-pulse' : 'text-gray-400'}`}>
                    {poweredUp ? 'ACTIVE' : 'Inactive'}
                  </span>
                </div>
                
                {poweredUp && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-200"
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

            {/* Controls */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Controls</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-start-2">
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="text-2xl">↑</div>
                  </div>
                  <div className="text-center text-sm text-gray-400 mt-1">Up</div>
                </div>
                
                <div>
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="text-2xl">←</div>
                  </div>
                  <div className="text-center text-sm text-gray-400 mt-1">Left</div>
                </div>
                
                <div className="col-start-2 row-start-3">
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="text-2xl">↓</div>
                  </div>
                  <div className="text-center text-sm text-gray-400 mt-1">Down</div>
                </div>
                
                <div className="row-start-2">
                  <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="text-2xl">→</div>
                  </div>
                  <div className="text-center text-sm text-gray-400 mt-1">Right</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Space</span>
                  <span className="text-blue-300">Pause/Resume</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">R</span>
                  <span className="text-blue-300">Restart Game</span>
                </div>
              </div>
              
              <button
                onClick={handleRestart}
                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Restart Game (R)
              </button>
            </div>

            {/* Legend */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Game Elements</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                  <span className="text-gray-300">Antibiotic (You)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700"></div>
                  <span className="text-gray-300">Bacteria (Enemies)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Infected Cell (10 pts)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">Immune Booster (50 pts)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-900 to-red-900 rounded-sm"></div>
                  <span className="text-gray-300">Membrane Wall</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Use arrow keys to move the antibiotic. Clear all infected cells to win. Avoid bacteria unless powered up!</p>
          <p className="mt-2">Game loop: 200ms • Grid: 15×15 • Built with Next.js & Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
};

export default AntibioticGame;

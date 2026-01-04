// app/game/components/BacteriaGame.tsx

"use client";

import { useState, useCallback, useRef } from 'react';
import { useGameLoop, Position, Direction } from '../hooks/useGameLoop'; // Ensure path is correct
import GameBoard from './GameBoard';
import SwappedEntityLayer from './SwappedEntityLayer';
import GameStats from './GameStats';
import GameControls from './GameControls';
import GameLegend from './GameLegend';
import GameBoardContainer from './GameBoardContainer';
import TouchController from '../../components/TouchController'; // Ensure path is correct
import { 
  LEVEL_1, 
  ANTIBIOTIC_START, 
  BACTERIA_STARTS, 
  Level, 
  GRID_WIDTH,
  GRID_HEIGHT
} from '../levels';

const CELL_SIZE = 24; // Keep this fixed!
const POWER_UP_DURATION = 5000;

const BacteriaGame = () => {
  // Game state
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

  // Store current direction for each antibiotic (inertia/memory)
  const antibioticDirectionsRef = useRef<Direction[]>(
    BACTERIA_STARTS.map(() => 'right') // Default starting direction
  );

  // --- Calculate Board Pixel Size for alignment ---
  const boardPixelWidth = GRID_WIDTH * CELL_SIZE;
  const boardPixelHeight = GRID_HEIGHT * CELL_SIZE;

  // Game loop hook
  const { getCurrentDirection, getNextDirection, setDirection, updateCurrentDirection } = useGameLoop({
    tickInterval: 200,
    onTick: () => {
      if (!gameActive) return;
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
    },
  });

  const handleFocus = () => setHasFocus(true);
  const handleBlur = () => setHasFocus(false);

  const initializeGame = useCallback(() => {
    // Create deep copy of level
    setLevel(LEVEL_1.map(row => [...row]));
    setBacteriaPosition(ANTIBIOTIC_START);
    setAntibioticPositions(BACTERIA_STARTS.map(pos => ({ ...pos })));
    // Reset antibiotic directions to default
    antibioticDirectionsRef.current = BACTERIA_STARTS.map(() => 'right');
    setScore(0);
    setLives(3);
    setGameActive(true);
    setPoweredUp(false);
    setPowerUpTimer(0);
    setGameMessage('');
  }, []);

  // --- Movement Logic with direction queuing ---
  const moveBacteria = () => {
    const currentDirection = getCurrentDirection();
    const nextDirection = getNextDirection();
    const newPos = { ...bacteriaPosition };
    let moved = false;
    
    // First try to move in the next direction if available
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
        // Update current direction in the hook
        updateCurrentDirection(nextDirection);
      }
    }
    
    // If next direction wasn't possible or available, try current direction
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
      const newPositions = prev.map((antibiotic, index) => {
        // Get current direction for this antibiotic
        const currentDir = antibioticDirectionsRef.current[index];
        
        // Define direction vectors with their corresponding Direction type
        const directionVectors: { dir: Direction, x: number, y: number }[] = [
          { dir: 'up', x: 0, y: -1 },
          { dir: 'down', x: 0, y: 1 },
          { dir: 'left', x: -1, y: 0 },
          { dir: 'right', x: 1, y: 0 },
        ];
        
        // First, try to continue in current direction if possible
        const currentVector = directionVectors.find(v => v.dir === currentDir);
        if (currentVector && canMoveTo(antibiotic.x + currentVector.x, antibiotic.y + currentVector.y)) {
          // Continue in same direction
          const newPos = { 
            x: antibiotic.x + currentVector.x, 
            y: antibiotic.y + currentVector.y 
          };
          return newPos;
        }
        
        // Current direction is blocked, need to choose a new direction
        // Filter valid moves (not walls)
        const validMoves = directionVectors.filter(v => 
          canMoveTo(antibiotic.x + v.x, antibiotic.y + v.y)
        );
        
        if (validMoves.length === 0) {
          // Dead end, can't move
          return antibiotic;
        }
        
        // Prevent backtracking (180-degree turns)
        // Determine opposite direction
        let oppositeDir: Direction | null = null;
        switch (currentDir) {
          case 'up': oppositeDir = 'down'; break;
          case 'down': oppositeDir = 'up'; break;
          case 'left': oppositeDir = 'right'; break;
          case 'right': oppositeDir = 'left'; break;
        }
        
        // Filter out the opposite direction unless it's the only option
        const nonBacktrackMoves = validMoves.filter(v => v.dir !== oppositeDir);
        const movesToChooseFrom = nonBacktrackMoves.length > 0 ? nonBacktrackMoves : validMoves;
        
        // Choose random direction from available options
        const chosenMove = movesToChooseFrom[Math.floor(Math.random() * movesToChooseFrom.length)];
        
        // Update direction for this antibiotic
        antibioticDirectionsRef.current[index] = chosenMove.dir;
        
        // Return new position
        return { 
          x: antibiotic.x + chosenMove.x, 
          y: antibiotic.y + chosenMove.y 
        };
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
        }
      }
    });
  };

  const canMoveTo = (x: number, y: number): boolean => {
    if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) return false;
    return level[y]?.[x] !== 1;
  };

  const remainingNutrients = level.flat().filter(cell => cell === 0).length;
  const remainingBoosters = level.flat().filter(cell => cell === 3).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white p-3 md:p-6 lg:p-8 touch-none">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🦠 Bacterial Survival
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            Eat nutrients (dots), avoid antibiotics.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          {/* Left: Game Board */}
          <div className="flex-1 w-full flex flex-col items-center">
            <GameBoardContainer
              hasFocus={hasFocus}
              onFocus={handleFocus}
              onBlur={handleBlur}
              gameActive={gameActive}
              gameMessage={gameMessage}
              onRestart={initializeGame}
              boardWidthPixels={boardPixelWidth}
              boardHeightPixels={boardPixelHeight}
            >
              {/* These two layers now overlay PERFECTLY */}
              <GameBoard level={level} cellSize={CELL_SIZE} />
              <SwappedEntityLayer
                bacteriaPosition={bacteriaPosition}
                bacteriaDirection={getCurrentDirection()}
                antibioticPositions={antibioticPositions}
                poweredUp={poweredUp}
                cellSize={CELL_SIZE}
              />
            </GameBoardContainer>

            {/* Mobile Touch Controller */}
            <div className="mt-4 w-full lg:hidden">
              <TouchController
                onDirectionChange={setDirection}
                onRestart={initializeGame}
                disabled={!gameActive}
              />
            </div>
          </div>

          {/* Right: Stats & Controls */}
          <div className="lg:w-80 w-full space-y-4">
            <GameStats
              score={score}
              lives={lives}
              remainingNutrients={remainingNutrients}
              remainingBoosters={remainingBoosters}
              poweredUp={poweredUp}
              powerUpTimer={powerUpTimer}
              powerUpDuration={POWER_UP_DURATION}
            />
            
            <GameControls onRestart={initializeGame} disabled={!gameActive} />
            <GameLegend />
            
            <div className="hidden lg:block">
               <div className="text-center mb-2 text-sm text-gray-400">On-screen controls</div>
               <TouchController
                onDirectionChange={setDirection}
                onRestart={initializeGame}
                disabled={!gameActive}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacteriaGame;

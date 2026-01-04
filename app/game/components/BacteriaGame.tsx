// app/game/components/BacteriaGame.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useGameLoop, Direction, Position } from '../hooks/useGameLoop';
import GameBoard from './GameBoard';
import SwappedEntityLayer from './SwappedEntityLayer';
import GameStats from './GameStats';
import GameControls from './GameControls';
import GameLegend from './GameLegend';
import GameBoardContainer from './GameBoardContainer';
import TouchController from '../../components/TouchController';
import { 
  LEVEL_1, 
  ANTIBIOTIC_START, 
  BACTERIA_STARTS, 
  Level, 
  CellType 
} from '../levels';

const CELL_SIZE = 24;
const POWER_UP_DURATION = 5000; // 5 seconds in milliseconds

const BacteriaGame = () => {
  // Game state - SWAPPED: bacteria is player, antibiotics are enemies
  const [level, setLevel] = useState<Level>(LEVEL_1);
  const [bacteriaPosition, setBacteriaPosition] = useState<Position>(ANTIBIOTIC_START); // Bacteria is player
  const [antibioticPositions, setAntibioticPositions] = useState<Position[]>(BACTERIA_STARTS); // Antibiotics are enemies
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
      
      // Move bacteria (player)
      moveBacteria();
      
      // Move antibiotics (enemies)
      moveAntibiotics();
      
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
    setBacteriaPosition(ANTIBIOTIC_START);
    setAntibioticPositions([...BACTERIA_STARTS]);
    setScore(0);
    setLives(3);
    setGameActive(true);
    setPoweredUp(false);
    setPowerUpTimer(0);
    setGameMessage('');
  }, []);

  // Move bacteria (player) based on current direction
  const moveBacteria = () => {
    const direction = getCurrentDirection();
    const newPos = { ...bacteriaPosition };
    
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
    if (newPos.x !== bacteriaPosition.x || newPos.y !== bacteriaPosition.y) {
      setBacteriaPosition(newPos);
      
      // Check what's at the new position
      const cellType = level[newPos.y]?.[newPos.x];
      
      if (cellType === 0) {
        // Collect nutrient (was infected cell)
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2; // Change to empty
        setLevel(newLevel);
        setScore(prev => prev + 10);
        
        // Check win condition
        if (!newLevel.flat().includes(0)) {
          setGameActive(false);
          setGameMessage('🎉 All Nutrients Consumed! Bacteria Wins!');
        }
      } else if (cellType === 3) {
        // Collect resistance booster (was immune booster)
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2; // Change to empty
        setLevel(newLevel);
        setPoweredUp(true);
        setPowerUpTimer(POWER_UP_DURATION);
        setScore(prev => prev + 50);
      }
    }
  };

  // Simple AI for antibiotic movement (enemies)
  const moveAntibiotics = () => {
    setAntibioticPositions(prev => 
      prev.map(antibiotic => {
        const directions = [
          { x: 0, y: -1 }, // up
          { x: 0, y: 1 },  // down
          { x: -1, y: 0 }, // left
          { x: 1, y: 0 },  // right
        ];
        
        // Filter valid moves
        const validMoves = directions.filter(dir => 
          canMoveTo(antibiotic.x + dir.x, antibiotic.y + dir.y)
        );
        
        if (validMoves.length === 0) return antibiotic;
        
        // Choose random valid move
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        
        return {
          x: antibiotic.x + move.x,
          y: antibiotic.y + move.y,
        };
      })
    );
  };

  // Check collisions between bacteria and antibiotics
  const checkCollisions = () => {
    antibioticPositions.forEach(antibiotic => {
      if (antibiotic.x === bacteriaPosition.x && antibiotic.y === bacteriaPosition.y) {
        if (poweredUp) {
          // Bacteria destroys antibiotic when powered up
          setAntibioticPositions(prev => prev.filter(a => a !== antibiotic));
          setScore(prev => prev + 100);
        } else {
          // Bacteria loses a life
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameActive(false);
              setGameMessage('💀 Antibiotics Eliminated Bacteria! Game Over');
            }
            return newLives;
          });
          
          // Reset positions
          setBacteriaPosition(ANTIBIOTIC_START);
          setAntibioticPositions([...BACTERIA_STARTS]);
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

  // Calculate remaining nutrients (was infected cells)
  const remainingNutrients = level.flat().filter(cell => cell === 0).length;
  const remainingBoosters = level.flat().filter(cell => cell === 3).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white p-3 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🦠 Bacterial Survival
          </h1>
          <p className="text-gray-300 mb-4 text-sm md:text-base">
            Control the bacteria to consume nutrients while avoiding antibiotics. Collect resistance boosters to fight back!
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Left column: Game board */}
          <div className="flex-1">
            <GameBoardContainer
              hasFocus={hasFocus}
              onFocus={handleFocus}
              onBlur={handleBlur}
              gameActive={gameActive}
              gameMessage={gameMessage}
              onRestart={handleRestart}
            >
              <GameBoard level={level} cellSize={CELL_SIZE} />
              <SwappedEntityLayer
                bacteriaPosition={bacteriaPosition}
                bacteriaDirection={getCurrentDirection()}
                antibioticPositions={antibioticPositions}
                poweredUp={poweredUp}
                cellSize={CELL_SIZE}
              />
            </GameBoardContainer>

            {/* Touch controller for mobile */}
            <div className="mt-6 md:mt-8 lg:hidden">
              <TouchController
                onDirectionChange={setDirection}
                onPauseToggle={() => {/* TODO: Implement pause toggle */}}
                onRestart={handleRestart}
                disabled={!gameActive}
              />
            </div>
          </div>

          {/* Right column: Game info and controls */}
          <div className="lg:w-80 space-y-4 md:space-y-6">
            <GameStats
              score={score}
              lives={lives}
              remainingNutrients={remainingNutrients}
              remainingBoosters={remainingBoosters}
              poweredUp={poweredUp}
              powerUpTimer={powerUpTimer}
              powerUpDuration={POWER_UP_DURATION}
            />

            <GameControls
              onRestart={handleRestart}
              disabled={!gameActive}
            />

            <GameLegend />

            {/* Touch controller for desktop (smaller version) */}
            <div className="hidden lg:block">
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-green-300">Touch Controls</h3>
                <p className="text-sm text-gray-400">Use these controls on touch devices</p>
              </div>
              <TouchController
                onDirectionChange={setDirection}
                onPauseToggle={() => {/* TODO: Implement pause toggle */}}
                onRestart={handleRestart}
                disabled={!gameActive}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 md:mt-8 text-center text-gray-500 text-xs md:text-sm">
          <p>Use arrow keys or touch controls to move the bacteria. Consume all nutrients to win. Avoid antibiotics unless resistant!</p>
          <p className="mt-2">Game loop: 200ms • Grid: 15×15 • Built with Next.js & Tailwind CSS • PWA Ready</p>
        </footer>
      </div>
    </div>
  );
};

export default BacteriaGame;

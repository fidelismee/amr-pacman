// app/game/components/BacteriaGame.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePlatform, useShouldShowTouchControls, useShouldShowKeyboardInstructions } from '../../contexts/PlatformContext';
import TouchController from '../../components/TouchController';

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

// Player starts in the middle
const BACTERIA_START_POS = { x: 7, y: 7 };
const INITIAL_ENEMY_DIRECTIONS: Direction[] = ['right', 'left', 'up', 'down'];

const BacteriaGame = () => {
  // Platform detection
  const platform = usePlatform();
  const showTouchControls = useShouldShowTouchControls();
  const showKeyboardInstructions = useShouldShowKeyboardInstructions();
  
  const [level, setLevel] = useState<Level>(LEVEL_1);
  const [bacteriaPosition, setBacteriaPosition] = useState<Position>(BACTERIA_START_POS);
  const [antibioticPositions, setAntibioticPositions] = useState<Position[]>([]);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [poweredUp, setPoweredUp] = useState(false);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [gameMessage, setGameMessage] = useState<string>('');
  // Auto-focus for PWA/mobile, manual focus for desktop
  const [hasFocus, setHasFocus] = useState(platform.isPWA || platform.isMobile);
  const [isRunning, setIsRunning] = useState(true);
  // Orientation detection for mobile PWA
  const [isPortrait, setIsPortrait] = useState(false);

  const antibioticDirectionsRef = useRef<Direction[]>([...INITIAL_ENEMY_DIRECTIONS]);
  const nextDirectionRef = useRef<Direction | null>(null);
  const currentDirectionRef = useRef<Direction>('right');

  const boardPixelWidth = GRID_WIDTH * CELL_SIZE;
  const boardPixelHeight = GRID_HEIGHT * CELL_SIZE;
  
  // Calculate responsive cell size for mobile
  const [responsiveCellSize, setResponsiveCellSize] = useState(CELL_SIZE);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Update responsive cell size on window resize
  useEffect(() => {
    const updateCellSize = () => {
      // Get available viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check if we're in landscape mode on mobile
      const isLandscape = viewportWidth > viewportHeight && platform.isMobile;
      
      // Reserve space for UI elements (header, stats, controls, padding)
      // Use less reserved space for landscape mode to maximize game board
      const reservedWidth = isLandscape ? 24 : (platform.isMobile ? 32 : 64); // padding
      const reservedHeight = isLandscape ? 180 : (platform.isMobile ? 280 : 200); // header + footer + padding
      
      const availableWidth = viewportWidth - reservedWidth;
      const availableHeight = viewportHeight - reservedHeight;
      
      // Calculate cell size based on both width and height constraints
      const cellSizeByWidth = Math.floor(availableWidth / GRID_WIDTH);
      const cellSizeByHeight = Math.floor(availableHeight / GRID_HEIGHT);
      
      // Use the smaller of the two to ensure board fits in viewport
      const newCellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
      
      // Set cell size with min/max constraints - allow larger cells in landscape
      const minSize = isLandscape ? 18 : 16;
      const maxSize = isLandscape ? 36 : 32;
      setResponsiveCellSize(Math.max(minSize, Math.min(newCellSize, maxSize)));
    };
    
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    window.addEventListener('orientationchange', updateCellSize);
    return () => {
      window.removeEventListener('resize', updateCellSize);
      window.removeEventListener('orientationchange', updateCellSize);
    };
  }, [platform.isMobile]);
  
  // Detect orientation for mobile PWA
  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode && platform.isMobile);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [platform.isMobile]);
  
  const responsiveBoardWidth = GRID_WIDTH * responsiveCellSize;
  const responsiveBoardHeight = GRID_HEIGHT * responsiveCellSize;

  // --- NEW: Quadrant-Based Spawning Logic ---
  const generateScatteredPositions = (): Position[] => {
    // Define the 4 quadrants (excluding the very center safe zone)
    const quadrants = [
      { minX: 1, maxX: 6, minY: 1, maxY: 6 },     // Top-Left
      { minX: 8, maxX: 13, minY: 1, maxY: 6 },    // Top-Right
      { minX: 1, maxX: 6, minY: 8, maxY: 13 },    // Bottom-Left
      { minX: 8, maxX: 13, minY: 8, maxY: 13 },   // Bottom-Right
    ];

    const selectedPositions: Position[] = [];

    quadrants.forEach(quad => {
      const validInQuad: Position[] = [];
      // Find all valid empty cells in this quadrant
      for (let y = quad.minY; y <= quad.maxY; y++) {
        for (let x = quad.minX; x <= quad.maxX; x++) {
          // If not a wall (1), it's a valid spawn point
          if (LEVEL_1[y]?.[x] !== 1) {
            validInQuad.push({ x, y });
          }
        }
      }

      // Pick one random spot from this quadrant
      if (validInQuad.length > 0) {
        const randomIndex = Math.floor(Math.random() * validInQuad.length);
        selectedPositions.push(validInQuad[randomIndex]);
      } else {
        // Fallback to the corner of the quadrant if no valid spots found (unlikely)
        selectedPositions.push({ x: quad.minX, y: quad.minY });
      }
    });

    return selectedPositions;
  };

  const canMoveTo = (x: number, y: number): boolean => {
    if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) return false;
    return level[y]?.[x] !== 1;
  };

  const moveBacteria = () => {
    const currentDirection = currentDirectionRef.current;
    const nextDirection = nextDirectionRef.current;
    const newPos = { ...bacteriaPosition };
    let moved = false;
    
    // Try queued direction
    if (nextDirection !== null) {
      const testPos = { ...bacteriaPosition };
      let dirChange: { x: number, y: number } | null = null;
      if (nextDirection === 'up') dirChange = { x: 0, y: -1 };
      if (nextDirection === 'down') dirChange = { x: 0, y: 1 };
      if (nextDirection === 'left') dirChange = { x: -1, y: 0 };
      if (nextDirection === 'right') dirChange = { x: 1, y: 0 };

      if (dirChange && canMoveTo(testPos.x + dirChange.x, testPos.y + dirChange.y)) {
        newPos.x += dirChange.x;
        newPos.y += dirChange.y;
        currentDirectionRef.current = nextDirection;
        nextDirectionRef.current = null;
        moved = true;
      }
    }
    
    // Continue current direction
    if (!moved) {
      let dirChange: { x: number, y: number } | null = null;
      if (currentDirection === 'up') dirChange = { x: 0, y: -1 };
      if (currentDirection === 'down') dirChange = { x: 0, y: 1 };
      if (currentDirection === 'left') dirChange = { x: -1, y: 0 };
      if (currentDirection === 'right') dirChange = { x: 1, y: 0 };

      if (dirChange && canMoveTo(newPos.x + dirChange.x, newPos.y + dirChange.y)) {
        newPos.x += dirChange.x;
        newPos.y += dirChange.y;
      }
    }

    if (newPos.x !== bacteriaPosition.x || newPos.y !== bacteriaPosition.y) {
      setBacteriaPosition(newPos);
      const cellType = level[newPos.y]?.[newPos.x];
      
      // Eat Nutrient
      if (cellType === 0) {
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2; // Empty
        setLevel(newLevel);
        setScore(prev => prev + 10);
        if (!newLevel.flat().includes(0)) {
          setGameActive(false);
          setGameMessage('🎉 Infection Spread! Bacteria Wins!');
        }
      } 
      // Eat Booster
      else if (cellType === 3) {
        const newLevel = [...level];
        newLevel[newPos.y][newPos.x] = 2; // Empty
        setLevel(newLevel);
        setPoweredUp(true);
        setPowerUpTimer(POWER_UP_DURATION);
        setScore(prev => prev + 50);
      }
    }
  };

  const moveAntibiotics = () => {
    setAntibioticPositions(prev => {
      if (prev.length === 0) return prev; // Wait for init

      const newPositions: Position[] = [];
      
      prev.forEach((antibiotic, index) => {
        const currentDir = antibioticDirectionsRef.current[index];
        const directions: { dir: Direction, x: number, y: number }[] = [
          { dir: 'up', x: 0, y: -1 }, { dir: 'down', x: 0, y: 1 },
          { dir: 'left', x: -1, y: 0 }, { dir: 'right', x: 1, y: 0 },
        ];
        
        const getOpposite = (d: Direction) => 
          d === 'up' ? 'down' : d === 'down' ? 'up' : d === 'left' ? 'right' : 'left';

        // Check forward move
        let nextPos = { ...antibiotic };
        let moved = false;

        // 1. Get valid moves
        const validMoves = directions.filter(d => {
          const tx = antibiotic.x + d.x;
          const ty = antibiotic.y + d.y;
          // Prevent moving into walls OR directly reversing
          return canMoveTo(tx, ty) && d.dir !== getOpposite(currentDir);
        });

        // 2. Decide move
        if (validMoves.length > 0) {
          // If at intersection (more than 1 choice), maybe change direction?
          // Otherwise keep going straight if possible.
          const straightMove = validMoves.find(m => m.dir === currentDir);
          
          let chosen;
          // 30% chance to turn at intersection, otherwise go straight
          if (validMoves.length > 1 && Math.random() < 0.3) {
             chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
          } else {
             chosen = straightMove || validMoves[0];
          }

          antibioticDirectionsRef.current[index] = chosen.dir;
          nextPos = { x: antibiotic.x + chosen.x, y: antibiotic.y + chosen.y };
          moved = true;
        } else {
          // Dead end? Reverse.
          const reverseDir = getOpposite(currentDir);
          const revVec = directions.find(d => d.dir === reverseDir);
          if (revVec && canMoveTo(antibiotic.x + revVec.x, antibiotic.y + revVec.y)) {
            antibioticDirectionsRef.current[index] = reverseDir;
            nextPos = { x: antibiotic.x + revVec.x, y: antibiotic.y + revVec.y };
            moved = true;
          }
        }
        
        // 3. Simple collision avoidance with other enemies (don't stack)
        const isOccupied = newPositions.some(p => p.x === nextPos.x && p.y === nextPos.y) || 
                           prev.some((p, i) => i > index && p.x === nextPos.x && p.y === nextPos.y);

        if (moved && !isOccupied) {
           newPositions.push(nextPos);
        } else {
           newPositions.push(antibiotic); // Stay still if blocked
        }
      });
      return newPositions;
    });
  };

  const checkCollisions = () => {
    antibioticPositions.forEach(antibiotic => {
      // Collision hit box
      if (antibiotic.x === bacteriaPosition.x && antibiotic.y === bacteriaPosition.y) {
        if (poweredUp) {
          // Eat Enemy - Send it back to its spawn quadrant? Or just remove temporarily?
          // For Pacman style, usually they respawn. Let's filter out to "kill" them.
          setAntibioticPositions(prev => prev.filter(a => a !== antibiotic));
          setScore(prev => prev + 100);
        } else {
          // Die
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameActive(false);
              setGameMessage('💀 Sterilized! Game Over');
            }
            return newLives;
          });
          // Reset positions but keep scattered
          setBacteriaPosition(BACTERIA_START_POS);
          setAntibioticPositions(generateScatteredPositions());
          antibioticDirectionsRef.current = [...INITIAL_ENEMY_DIRECTIONS];
        }
      }
    });
  };

  const initializeGame = useCallback(() => {
    setLevel(LEVEL_1.map(row => [...row]));
    setBacteriaPosition(BACTERIA_START_POS);
    // Use the new SCATTERED generator
    setAntibioticPositions(generateScatteredPositions());
    antibioticDirectionsRef.current = [...INITIAL_ENEMY_DIRECTIONS];
    setScore(0);
    setLives(3);
    setGameActive(true);
    setPoweredUp(false);
    setPowerUpTimer(0);
    setGameMessage('');
  }, []);

  // Initial Load
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!isRunning && e.key !== ' ') return;
      
      switch (e.key) {
        case 'ArrowUp': nextDirectionRef.current = 'up'; break;
        case 'ArrowDown': nextDirectionRef.current = 'down'; break;
        case 'ArrowLeft': nextDirectionRef.current = 'left'; break;
        case 'ArrowRight': nextDirectionRef.current = 'right'; break;
        case ' ': setIsRunning(prev => !prev); break;
        case 'r': case 'R': initializeGame(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, initializeGame]);

  // Game Loop
  useEffect(() => {
    if (!isRunning || !gameActive) return;

    const interval = setInterval(() => {
      moveBacteria();
      moveAntibiotics();
      if (poweredUp) {
        setPowerUpTimer(prev => (prev <= 200 ? 0 : prev - 200));
        if (powerUpTimer <= 200) setPoweredUp(false);
      }
      checkCollisions();
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, gameActive, bacteriaPosition, antibioticPositions, poweredUp, level]);

  // Helpers
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
      'from-red-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-orange-500 to-amber-600',
      'from-red-600 to-rose-700',
    ];
    return colors[index % colors.length];
  };

  const bacteriaSize = responsiveCellSize * 0.8;
  const antibioticSize = responsiveCellSize * 0.7;
  const bacteriaOffset = (responsiveCellSize - bacteriaSize) / 2;
  const antibioticOffset = (responsiveCellSize - antibioticSize) / 2;

  return (
    <div className="min-h-dvh max-h-dvh bg-gradient-to-br from-slate-900 to-gray-950 text-white touch-none overflow-hidden flex flex-col game-landscape-optimized">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col overflow-y-auto overflow-x-hidden safe-area-padding p-2 md:p-4 full-width-landscape">
        {/* Portrait mode warning for mobile PWA */}
        {isPortrait && platform.isPWA && (
          <div className="mb-2 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-center">
            <div className="text-yellow-300 font-bold mb-1 text-sm">📱 Rotate Your Device</div>
            <p className="text-yellow-200 text-xs">
              For the best experience, please rotate your device to landscape mode.
            </p>
            <div className="mt-1 text-xl animate-pulse">↻</div>
          </div>
        )}
        
        {/* Platform Indicator - for debugging (hidden on mobile to save space) */}
        {!platform.isMobile && (
          <div className="mb-1 md:mb-2 text-xs text-center">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-gray-700">
              <span className="text-gray-400">Platform:</span>
              <span className={`font-medium ${
                platform.platformType === 'pwa-mobile' ? 'text-green-400' :
                platform.platformType === 'browser-mobile' ? 'text-blue-400' :
                platform.platformType === 'browser-desktop' ? 'text-purple-400' :
                'text-gray-400'
              }`}>
                {platform.platformType}
                {platform.isPWA && ' (PWA)'}
                {platform.isMobile && ' (Mobile)'}
              </span>
            </div>
          </div>
        )}
        
        <header className="text-center mb-3 md:mb-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🦠 Bacterial Survival
            {platform.isPWA && platform.isMobile && (
              <span className="ml-1 md:ml-2 text-xs md:text-sm align-middle bg-green-900/30 text-green-300 px-1 md:px-2 py-0.5 md:py-1 rounded-full">PWA</span>
            )}
          </h1>
          <p className="text-gray-300 text-xs md:text-sm">
            Eat green dots. Avoid <span className="text-red-400 font-bold">RED</span> antibiotics. Grab blue boosters!
            {showKeyboardInstructions && (
              <span className="block mt-0.5 md:mt-1 text-green-300 text-xs">Use arrow keys to move • Space to pause • R to restart</span>
            )}
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start">
          <div className="flex-1 w-full flex flex-col items-center">
            <div className="flex justify-center items-center w-full overflow-hidden py-1 md:py-2 game-board-landscape" ref={boardRef}>
              <div className="relative" style={{ width: responsiveBoardWidth, height: responsiveBoardHeight }}>
                
                {/* Board Container */}
                <div 
                  className={`relative cursor-pointer w-full h-full outline-none rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700 ${
                    hasFocus ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setHasFocus(true)}
                  onBlur={() => setHasFocus(false)}
                  tabIndex={0}
                >
                  {/* Grid Layer */}
                  <div 
                    className="bg-black/80 backdrop-blur-sm relative z-0"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${GRID_WIDTH}, ${responsiveCellSize}px)`,
                      gridTemplateRows: `repeat(${GRID_HEIGHT}, ${responsiveCellSize}px)`,
                    }}
                  >
                    {level.map((row, y) =>
                      row.map((cell, x) => {
                        let cellContent = null;
                        let cellClass = "flex items-center justify-center relative";
                        if (cell === 1) cellClass += " bg-gray-800/80 border-[0.5px] border-gray-700/30";
                        else {
                          if (cell === 0) {
                            cellContent = <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />;
                          } else if (cell === 3) {
                            cellContent = <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />;
                          }
                        }
                        return <div key={`${x}-${y}`} className={cellClass} style={{ width: responsiveCellSize, height: responsiveCellSize }}>{cellContent}</div>;
                      })
                    )}
                  </div>

                  {/* Entities Layer (Z-Index 10) */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    
                    {/* Player (Bacteria) */}
                    <div
                      className={`absolute rounded-lg transition-transform duration-150 ease-linear ${getBacteriaRotation()} ${
                        poweredUp 
                          ? 'bg-gradient-to-br from-green-300 to-emerald-400 shadow-lg shadow-green-400/50 animate-pulse' 
                          : 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg'
                      }`}
                      style={{
                        width: `${bacteriaSize}px`, height: `${bacteriaSize}px`,
                        transform: `translate(${bacteriaPosition.x * responsiveCellSize + bacteriaOffset}px, ${bacteriaPosition.y * responsiveCellSize + bacteriaOffset}px)`,
                      }}
                    >
                      <div className="absolute w-2 h-2 bg-white/90 rounded-full left-2 top-2"></div>
                      <div className="absolute w-2 h-2 bg-white/90 rounded-full right-2 top-2"></div>
                    </div>

                    {/* Enemies (Antibiotics) */}
                    {antibioticPositions.map((pos, index) => (
                      <div
                        key={`enemy-${index}`}
                        className={`absolute rounded-full transition-transform duration-150 ease-linear ${
                          poweredUp ? 'opacity-50 grayscale' : `bg-gradient-to-r ${getAntibioticColor(index)}`
                        }`}
                        style={{
                          width: `${antibioticSize}px`, height: `${antibioticSize}px`,
                          transform: `translate(${pos.x * responsiveCellSize + antibioticOffset}px, ${pos.y * responsiveCellSize + antibioticOffset}px)`,
                          zIndex: 20
                        }}
                      >
                         <div className="absolute w-1 h-3 bg-white/60 rounded-full left-2 top-1/2 transform -translate-y-1/2"></div>
                         <div className="absolute w-1 h-3 bg-white/60 rounded-full right-2 top-1/2 transform -translate-y-1/2"></div>
                      </div>
                    ))}
                  </div>

                  {/* Overlays */}
                  {/* Only show "Click to Focus" for desktop browsers (not PWA/mobile) */}
                  {!hasFocus && !platform.isPWA && !platform.isMobile && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                      <div className="text-center p-3 bg-gray-900 rounded border border-green-500">
                        <p className="text-green-300 text-sm">Click to Focus (for keyboard controls)</p>
                      </div>
                    </div>
                  )}
                  {!gameActive && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-white">{gameMessage}</h2>
                        <button onClick={initializeGame} className="px-6 py-2 bg-green-600 rounded font-bold">Try Again</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Stats and Controls */}
          <div className="md:w-72 w-full space-y-2 md:space-y-4">
            {/* Stats Panel */}
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 game-stats-compact">
              <h3 className="text-base font-bold mb-2 text-green-300 text-center">Game Stats</h3>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm">Score</span>
                <span className="text-xl font-bold text-green-400">{score}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm">Lives</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-green-500' : 'bg-gray-700'}`} />
                  ))}
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm">Nutrients</span>
                <span className="text-lg font-bold text-green-300">{remainingNutrients}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-sm">Boosters</span>
                <span className="text-lg font-bold text-blue-300">{remainingBoosters}</span>
              </div>
              <div className="text-xs text-center text-gray-500 mt-2">
                Red = Enemy <br/> Blue = Booster
              </div>
            </div>

            {/* Platform-specific controls */}
            {showTouchControls ? (
              <div className="bg-gray-800 p-2 md:p-3 rounded-lg border border-gray-700 touch-controls-landscape">
                <h3 className="text-sm md:text-base font-bold mb-2 text-green-300 text-center">
                  {platform.isPWA ? '🎮 Gaming Console Controls' : '🎮 Controls'}
                </h3>
                
                <TouchController
                  onDirectionChange={(direction) => {
                    nextDirectionRef.current = direction;
                  }}
                  onPauseToggle={() => setIsRunning(prev => !prev)}
                  onRestart={initializeGame}
                  disabled={!gameActive}
                />
                
                <div className="mt-2 text-xs text-gray-400 text-center">
                  <p className="text-xs">{platform.isPWA ? 'Tap to move • Gaming console vibe' : 'Tap or use arrow keys'}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <h3 className="text-base font-bold mb-2 text-purple-300 text-center">Desktop Controls</h3>
                
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="inline-flex flex-col items-center gap-1 p-2 bg-gray-900/50 rounded-lg">
                      <div className="text-xl">🎮</div>
                      <div className="text-xs text-gray-300">Use <span className="font-bold text-green-300">Arrow Keys</span> to move</div>
                      <div className="text-xs text-gray-300"><span className="font-bold text-yellow-300">Space</span> to pause/resume</div>
                      <div className="text-xs text-gray-300"><span className="font-bold text-red-300">R</span> to restart game</div>
                    </div>
                  </div>
                  
                  <div className="text-center text-xs text-gray-400">
                    <p>Optimized for keyboard play</p>
                    <p className="text-xs text-gray-500 mt-0.5">Touch controls hidden on desktop</p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={initializeGame} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Restart (R)</button>
          </div>
        </div>

        <footer className="mt-3 md:mt-4 text-center text-gray-500 text-xs">
          <p>Move the bacteria with {showTouchControls ? 'on-screen controls or ' : ''}arrow keys. Eat all green dots to win!</p>
          <p className="mt-1">Avoid red antibiotics unless you have a blue booster active.</p>
          {platform.isPWA && (
            <p className="mt-1 text-green-400 text-xs">
              ✓ Running as Progressive Web App {platform.isMobile ? 'on mobile' : 'on desktop'}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default BacteriaGame;

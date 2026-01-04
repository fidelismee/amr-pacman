// app\game\components\GameBoard.tsx
"use client";

import { ReactNode, useEffect, useState, useRef } from 'react';

interface GameBoardContainerProps {
  children: ReactNode;
  hasFocus: boolean;
  onFocus: () => void;
  onBlur: () => void;
  gameActive: boolean;
  gameMessage: string;
  onRestart: () => void;
  // New props for alignment
  boardWidthPixels: number; 
  boardHeightPixels: number;
}

const GameBoardContainer = ({
  children,
  hasFocus,
  onFocus,
  onBlur,
  gameActive,
  gameMessage,
  onRestart,
  boardWidthPixels,
  boardHeightPixels,
}: GameBoardContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // PWA SCALING LOGIC
  // This calculates if the screen is too small for the board
  // and scales it down via CSS Transform to keep coordinates perfect
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Get parent width (subtracting padding)
        const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
        const availableWidth = parentWidth - 32; // Safety margin
        
        // If board is bigger than screen, scale down
        if (boardWidthPixels > availableWidth) {
          setScale(availableWidth / boardWidthPixels);
        } else {
          setScale(1);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [boardWidthPixels]);

  return (
    <div 
      ref={containerRef}
      className="flex justify-center items-center w-full overflow-hidden py-4"
    >
      <div 
        className="relative transition-transform duration-200 origin-top"
        style={{
          // 1. Force the container to be the EXACT size of the grid
          width: boardWidthPixels,
          height: boardHeightPixels,
          // 2. Scale it down if on a tiny mobile screen
          transform: `scale(${scale})`,
        }}
      >
        {/* Focus indicator ring */}
        <div 
          className={`absolute -inset-2 rounded-xl transition-all duration-300 z-10 pointer-events-none ${
            hasFocus 
              ? 'ring-4 ring-green-500/50 bg-green-500/10' 
              : 'ring-2 ring-gray-700/30'
          }`}
        />
        
        {/* Click to focus area */}
        <div
          className="relative cursor-pointer w-full h-full outline-none"
          onClick={onFocus}
          onBlur={onBlur}
          tabIndex={0}
        >
          {/* RENDER THE GAME LAYERS HERE */}
          {children}
          
          {/* Overlay: Click to Start */}
          {!hasFocus && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-20 backdrop-blur-[1px]">
              <div className="text-center p-4 bg-gray-900/90 rounded-xl border-2 border-green-500/50 shadow-2xl">
                <h3 className="text-xl font-bold mb-2 text-green-300">Tap to Play</h3>
                <p className="text-gray-300 text-sm">Activate controls</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Overlay: Game Over / Win */}
        {!gameActive && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center rounded-lg z-30 backdrop-blur-sm">
            <div className="text-center p-6 bg-gray-900 rounded-xl border-2 border-green-500/50 shadow-2xl max-w-[90%]">
              <h2 className="text-2xl font-bold mb-4 text-white">{gameMessage}</h2>
              <button
                onClick={onRestart}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoardContainer;
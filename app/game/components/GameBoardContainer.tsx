// app/game/components/GameBoardContainer.tsx
"use client";

import { ReactNode } from 'react';

interface GameBoardContainerProps {
  children: ReactNode;
  hasFocus: boolean;
  onFocus: () => void;
  onBlur: () => void;
  gameActive: boolean;
  gameMessage: string;
  onRestart: () => void;
}

const GameBoardContainer = ({
  children,
  hasFocus,
  onFocus,
  onBlur,
  gameActive,
  gameMessage,
  onRestart,
}: GameBoardContainerProps) => {
  return (
    <div className="relative">
      {/* Focus indicator */}
      <div 
        className={`absolute -inset-1 md:-inset-2 rounded-xl transition-all duration-300 z-10 pointer-events-none ${
          hasFocus 
            ? 'ring-2 md:ring-4 ring-green-500/50 bg-green-500/10' 
            : 'ring-1 md:ring-2 ring-gray-700/30'
        }`}
      />
      
      {/* Click to focus area */}
      <div
        className="relative cursor-pointer"
        onClick={onFocus}
        onBlur={onBlur}
        tabIndex={0}
      >
        {children}
        
        {/* Focus instructions */}
        {!hasFocus && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
            <div className="text-center p-4 md:p-6 bg-gray-900/90 rounded-xl border-2 border-green-500/50">
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-green-300">Tap to Focus</h3>
              <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">
                Tap on the game board to enable keyboard controls
              </p>
              <div className="text-xs md:text-sm text-gray-400">
                Then use arrow keys or touch controls to move
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Game overlay messages */}
      {!gameActive && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-20">
          <div className="text-center p-6 md:p-8 bg-gray-900/90 rounded-xl border-2 border-green-500/50">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{gameMessage}</h2>
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm md:text-base"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Focus status */}
      <div className="mt-3 md:mt-4 text-center">
        <div className={`inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-2 rounded-lg ${
          hasFocus 
            ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${hasFocus ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-xs md:text-sm font-medium">
            {hasFocus ? 'Keyboard controls active' : 'Tap game board to activate controls'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameBoardContainer;

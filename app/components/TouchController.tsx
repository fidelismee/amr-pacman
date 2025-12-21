"use client";

import { Direction } from '../game/hooks/useGameLoop';

interface TouchControllerProps {
  onDirectionChange: (direction: Direction) => void;
  onPauseToggle?: () => void;
  onRestart?: () => void;
  disabled?: boolean;
}

const TouchController = ({ 
  onDirectionChange, 
  onPauseToggle, 
  onRestart,
  disabled = false 
}: TouchControllerProps) => {
  const handleDirectionPress = (direction: Direction) => {
    if (!disabled) {
      onDirectionChange(direction);
    }
  };

  const handleTouchStart = (direction: Direction) => (e: React.TouchEvent) => {
    e.preventDefault();
    handleDirectionPress(direction);
  };

  const handleMouseDown = (direction: Direction) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleDirectionPress(direction);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Handheld console styling */}
      <div className="absolute -inset-4 bg-gradient-to-b from-gray-900 to-black rounded-3xl border-4 border-gray-800 shadow-2xl">
        {/* Console buttons */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-r-lg border-l-2 border-gray-700"></div>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-l from-gray-800 to-gray-900 rounded-l-lg border-r-2 border-gray-700"></div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-lg border-t-2 border-gray-700"></div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-8 bg-gradient-to-t from-gray-800 to-gray-900 rounded-t-lg border-b-2 border-gray-700"></div>
      </div>

      {/* D-pad / Arrow controls */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-2 border-gray-700 shadow-inner">
        <div className="grid grid-cols-3 grid-rows-3 gap-3 w-64 h-64 mx-auto">
          {/* Top row */}
          <div className="col-start-2">
            <button
              onTouchStart={handleTouchStart('up')}
              onMouseDown={handleMouseDown('up')}
              disabled={disabled}
              className={`w-full h-full rounded-xl flex items-center justify-center text-3xl transition-all duration-150 active:scale-95 ${
                disabled 
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-b from-green-600 to-emerald-800 text-white hover:from-green-500 hover:to-emerald-700 active:from-green-700 active:to-emerald-900 shadow-lg'
              }`}
              aria-label="Move Up"
            >
              ↑
            </button>
          </div>
          
          {/* Middle row */}
          <div>
            <button
              onTouchStart={handleTouchStart('left')}
              onMouseDown={handleMouseDown('left')}
              disabled={disabled}
              className={`w-full h-full rounded-xl flex items-center justify-center text-3xl transition-all duration-150 active:scale-95 ${
                disabled 
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-b from-green-600 to-emerald-800 text-white hover:from-green-500 hover:to-emerald-700 active:from-green-700 active:to-emerald-900 shadow-lg'
              }`}
              aria-label="Move Left"
            >
              ←
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800"></div>
            </div>
          </div>
          
          <div>
            <button
              onTouchStart={handleTouchStart('right')}
              onMouseDown={handleMouseDown('right')}
              disabled={disabled}
              className={`w-full h-full rounded-xl flex items-center justify-center text-3xl transition-all duration-150 active:scale-95 ${
                disabled 
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-b from-green-600 to-emerald-800 text-white hover:from-green-500 hover:to-emerald-700 active:from-green-700 active:to-emerald-900 shadow-lg'
              }`}
              aria-label="Move Right"
            >
              →
            </button>
          </div>
          
          {/* Bottom row */}
          <div className="col-start-2">
            <button
              onTouchStart={handleTouchStart('down')}
              onMouseDown={handleMouseDown('down')}
              disabled={disabled}
              className={`w-full h-full rounded-xl flex items-center justify-center text-3xl transition-all duration-150 active:scale-95 ${
                disabled 
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-b from-green-600 to-emerald-800 text-white hover:from-green-500 hover:to-emerald-700 active:from-green-700 active:to-emerald-900 shadow-lg'
              }`}
              aria-label="Move Down"
            >
              ↓
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between mt-8 px-4">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onPauseToggle?.();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onPauseToggle?.();
            }}
            disabled={disabled}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-150 active:scale-95 ${
              disabled 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-600 to-amber-800 text-white hover:from-yellow-500 hover:to-amber-700 active:from-yellow-700 active:to-amber-900 shadow-lg'
            }`}
            aria-label="Pause/Resume"
          >
            ⏯️ Pause
          </button>
          
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onRestart?.();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onRestart?.();
            }}
            disabled={disabled}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-150 active:scale-95 ${
              disabled 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-rose-800 text-white hover:from-red-500 hover:to-rose-700 active:from-red-700 active:to-rose-900 shadow-lg'
            }`}
            aria-label="Restart Game"
          >
            🔄 Restart
          </button>
        </div>

        {/* Touch instructions */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Tap and hold direction buttons to move</p>
          <p className="text-xs mt-1">Works with both touch and mouse</p>
        </div>
      </div>
    </div>
  );
};

export default TouchController;

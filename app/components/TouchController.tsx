// app/components/TouchController.tsx
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

  // Shared button styles to keep JSX clean
  const getButtonStyles = (isDisabled: boolean) => 
    `w-full h-full rounded-xl flex items-center justify-center text-2xl transition-all duration-150 active:scale-95 ${
      isDisabled 
        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
        : 'bg-gradient-to-b from-green-600 to-emerald-800 text-white hover:from-green-500 hover:to-emerald-700 active:from-green-700 active:to-emerald-900 shadow-lg'
    }`;

  return (
    <div className="relative w-full max-w-sm md:max-w-md mx-auto">
      {/* Handheld console styling */}
      <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-b from-gray-900 to-black rounded-2xl md:rounded-3xl border-2 md:border-4 border-gray-800 shadow-xl md:shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -left-1 md:-left-2 top-1/2 -translate-y-1/2 w-4 md:w-8 h-16 md:h-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-r-lg border-l-2 border-gray-700"></div>
        <div className="absolute -right-1 md:-right-2 top-1/2 -translate-y-1/2 w-4 md:w-8 h-16 md:h-24 bg-gradient-to-l from-gray-800 to-gray-900 rounded-l-lg border-r-2 border-gray-700"></div>
      </div>

      {/* D-pad / Arrow controls */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-3 md:p-6 rounded-xl md:rounded-2xl border-2 border-gray-700 shadow-inner">
        
        {/* GRID LAYOUT UPDATE:
           - Changed height to h-32/h-48 (rectangular aspect ratio)
           - Changed to grid-rows-2 (Inverted T shape)
        */}
        <div className="grid grid-cols-3 grid-rows-2 gap-1.5 md:gap-2.5 w-40 h-28 md:w-56 md:h-40 mx-auto">
          
          {/* Row 1: Up Key (Centered) */}
          <div className="col-start-2 row-start-1">
            <button
              onTouchStart={handleTouchStart('up')}
              onMouseDown={handleMouseDown('up')}
              disabled={disabled}
              className={getButtonStyles(disabled)}
              aria-label="Move Up"
            >
              ↑
            </button>
          </div>
          
          {/* Row 2: Left, Down, Right Keys */}
          <div className="col-start-1 row-start-2">
            <button
              onTouchStart={handleTouchStart('left')}
              onMouseDown={handleMouseDown('left')}
              disabled={disabled}
              className={getButtonStyles(disabled)}
              aria-label="Move Left"
            >
              ←
            </button>
          </div>
          
          <div className="col-start-2 row-start-2">
            <button
              onTouchStart={handleTouchStart('down')}
              onMouseDown={handleMouseDown('down')}
              disabled={disabled}
              className={getButtonStyles(disabled)}
              aria-label="Move Down"
            >
              ↓
            </button>
          </div>
          
          <div className="col-start-3 row-start-2">
            <button
              onTouchStart={handleTouchStart('right')}
              onMouseDown={handleMouseDown('right')}
              disabled={disabled}
              className={getButtonStyles(disabled)}
              aria-label="Move Right"
            >
              →
            </button>
          </div>
          
        </div>

        {/* Action buttons */}
        <div className="flex justify-between mt-4 md:mt-6 px-2 md:px-4">
          <button
            onTouchStart={(e) => { e.preventDefault(); onPauseToggle?.(); }}
            onMouseDown={(e) => { e.preventDefault(); onPauseToggle?.(); }}
            disabled={disabled}
            className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl font-bold text-sm md:text-base transition-all duration-150 active:scale-95 ${
              disabled 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-600 to-amber-800 text-white hover:from-yellow-500 hover:to-amber-700 active:from-yellow-700 active:to-amber-900 shadow-lg'
            }`}
          >
            ⏯️ <span className="hidden sm:inline">Pause</span>
          </button>
          
          <button
            onTouchStart={(e) => { e.preventDefault(); onRestart?.(); }}
            onMouseDown={(e) => { e.preventDefault(); onRestart?.(); }}
            disabled={disabled}
            className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl font-bold text-sm md:text-base transition-all duration-150 active:scale-95 ${
              disabled 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-rose-800 text-white hover:from-red-500 hover:to-rose-700 active:from-red-700 active:to-rose-900 shadow-lg'
            }`}
          >
            🔄 <span className="hidden sm:inline">Restart</span>
          </button>
        </div>

        {/* Touch instructions */}
        <div className="mt-3 md:mt-4 text-center text-xs md:text-sm text-gray-400">
          <p>Tap buttons to move</p>
        </div>
      </div>
    </div>
  );
};

export default TouchController;

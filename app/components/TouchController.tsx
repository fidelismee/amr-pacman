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
    `w-full h-full rounded-xl flex items-center justify-center text-xl transition-all duration-150 active:scale-95 ${
      isDisabled 
        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
        : 'bg-gradient-to-b from-green-600 to-emerald-800 text-white hover:from-green-500 hover:to-emerald-700 active:from-green-700 active:to-emerald-900 shadow-lg'
    }`;

  return (
    <div className="relative w-full max-w-xs md:max-w-sm mx-auto touch-controls-landscape">
      {/* Handheld console styling - more compact for landscape */}
      <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-b from-gray-900 to-black rounded-xl md:rounded-2xl border-2 border-gray-800 shadow-lg">
        {/* Decorative elements - smaller for compact mode */}
        <div className="absolute -left-0.5 md:-left-1 top-1/2 -translate-y-1/2 w-2 md:w-4 h-8 md:h-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-r-lg border-l border-gray-700"></div>
        <div className="absolute -right-0.5 md:-right-1 top-1/2 -translate-y-1/2 w-2 md:w-4 h-8 md:h-16 bg-gradient-to-l from-gray-800 to-gray-900 rounded-l-lg border-r border-gray-700"></div>
      </div>

      {/* D-pad / Arrow controls - more compact */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-1.5 md:p-3 rounded-lg border-2 border-gray-700 shadow-inner">
        
        {/* Compact grid layout for landscape */}
        <div className="grid grid-cols-3 grid-rows-2 gap-0.5 md:gap-1 w-32 h-20 md:w-40 md:h-28 mx-auto">
          
          {/* Row 1: Up Key (Centered) */}
          <div className="col-start-2 row-start-1">
            <button
              onTouchStart={handleTouchStart('up')}
              onMouseDown={handleMouseDown('up')}
              disabled={disabled}
              className={getButtonStyles(disabled)}
              aria-label="Move Up"
            >
              <span className="text-lg md:text-xl">↑</span>
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
              <span className="text-lg md:text-xl">←</span>
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
              <span className="text-lg md:text-xl">↓</span>
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
              <span className="text-lg md:text-xl">→</span>
            </button>
          </div>
          
        </div>

        {/* Action buttons - more compact */}
        <div className="flex justify-between mt-2 md:mt-3 px-1">
          <button
            onTouchStart={(e) => { e.preventDefault(); onPauseToggle?.(); }}
            onMouseDown={(e) => { e.preventDefault(); onPauseToggle?.(); }}
            disabled={disabled}
            className={`px-1.5 md:px-3 py-0.5 md:py-1 rounded-lg font-bold text-xs transition-all duration-150 active:scale-95 ${
              disabled 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-600 to-amber-800 text-white hover:from-yellow-500 hover:to-amber-700 active:from-yellow-700 active:to-amber-900 shadow-lg'
            }`}
          >
            ⏯️ <span className="hidden xs:inline text-xs">Pause</span>
          </button>
          
          <button
            onTouchStart={(e) => { e.preventDefault(); onRestart?.(); }}
            onMouseDown={(e) => { e.preventDefault(); onRestart?.(); }}
            disabled={disabled}
            className={`px-1.5 md:px-3 py-0.5 md:py-1 rounded-lg font-bold text-xs transition-all duration-150 active:scale-95 ${
              disabled 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-rose-800 text-white hover:from-red-500 hover:to-rose-700 active:from-red-700 active:to-rose-900 shadow-lg'
            }`}
          >
            🔄 <span className="hidden xs:inline text-xs">Restart</span>
          </button>
        </div>

        {/* Touch instructions - minimal */}
        <div className="mt-1 md:mt-2 text-center text-[10px] md:text-xs text-gray-400">
          <p>Tap to move</p>
        </div>
      </div>
    </div>
  );
};

export default TouchController;

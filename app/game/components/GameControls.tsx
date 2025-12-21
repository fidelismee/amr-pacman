// app/game/components/GameControls.tsx
"use client";

interface GameControlsProps {
  onRestart: () => void;
  disabled?: boolean;
}

const GameControls = ({ onRestart, disabled = false }: GameControlsProps) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-green-300">Controls</h3>
      
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="col-start-2">
          <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="text-xl md:text-2xl">↑</div>
          </div>
          <div className="text-center text-xs md:text-sm text-gray-400 mt-1">Up</div>
        </div>
        
        <div>
          <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="text-xl md:text-2xl">←</div>
          </div>
          <div className="text-center text-xs md:text-sm text-gray-400 mt-1">Left</div>
        </div>
        
        <div>
          <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="text-xl md:text-2xl">↓</div>
          </div>
          <div className="text-center text-xs md:text-sm text-gray-400 mt-1">Down</div>
        </div>
        
        <div>
          <div className="aspect-square flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="text-xl md:text-2xl">→</div>
          </div>
          <div className="text-center text-xs md:text-sm text-gray-400 mt-1">Right</div>
        </div>
      </div>
      
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm md:text-base">Space</span>
          <span className="text-green-300 text-sm md:text-base">Pause/Resume</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm md:text-base">R</span>
          <span className="text-green-300 text-sm md:text-base">Restart Game</span>
        </div>
      </div>
      
      <button
        onClick={onRestart}
        disabled={disabled}
        className="w-full mt-4 md:mt-6 py-2 md:py-3 bg-gradient-to-r from-green-700 to-emerald-700 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
      >
        Restart Game (R)
      </button>
    </div>
  );
};

export default GameControls;

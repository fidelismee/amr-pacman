"use client";

interface GameStatsProps {
  score: number;
  lives: number;
  remainingNutrients: number;
  remainingBoosters: number;
  poweredUp: boolean;
  powerUpTimer: number;
  powerUpDuration: number;
}

const GameStats = ({
  score,
  lives,
  remainingNutrients,
  remainingBoosters,
  poweredUp,
  powerUpTimer,
  powerUpDuration,
}: GameStatsProps) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-green-300">Game Status</h2>
      
      <div className="space-y-3 md:space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">Score:</span>
          <span className="text-2xl md:text-3xl font-bold text-emerald-400">{score}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">Lives:</span>
          <div className="flex gap-1 md:gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${
                  i < lives 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">Nutrients:</span>
          <span className="text-lg md:text-xl font-bold text-yellow-400">{remainingNutrients}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">Boosters:</span>
          <span className="text-lg md:text-xl font-bold text-purple-400">{remainingBoosters}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">Resistant:</span>
          <span className={`text-lg md:text-xl font-bold ${poweredUp ? 'text-purple-300 animate-pulse' : 'text-gray-400'}`}>
            {poweredUp ? 'ACTIVE' : 'Vulnerable'}
          </span>
        </div>
        
        {poweredUp && (
          <div className="mt-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                style={{ width: `${(powerUpTimer / powerUpDuration) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {Math.ceil(powerUpTimer / 1000)}s remaining
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;

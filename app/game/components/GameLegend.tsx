"use client";

const GameLegend = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-green-300">Game Elements</h3>
      
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700"></div>
          <span className="text-gray-300 text-sm md:text-base">Bacteria (You)</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
          <span className="text-gray-300 text-sm md:text-base">Antibiotics (Enemies)</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-300 text-sm md:text-base">Nutrient (10 pts)</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 md:w-4 md:h-4 rounded-full bg-purple-500"></div>
          <span className="text-gray-300 text-sm md:text-base">Resistance Booster (50 pts)</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-purple-900 to-red-900 rounded-sm"></div>
          <span className="text-gray-300 text-sm md:text-base">Membrane Wall</span>
        </div>
      </div>
    </div>
  );
};

export default GameLegend;

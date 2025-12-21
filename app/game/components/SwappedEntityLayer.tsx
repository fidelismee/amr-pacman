// app/game/components/SwappedEntityLayer.tsx
"use client";

import { memo } from 'react';
import { Position, Direction } from '../hooks/useGameLoop';

interface SwappedEntityLayerProps {
  bacteriaPosition: Position; // Bacteria is player
  bacteriaDirection: Direction;
  antibioticPositions: Position[]; // Antibiotics are enemies
  poweredUp: boolean;
  cellSize: number;
}

const SwappedEntityLayer = memo(({
  bacteriaPosition,
  bacteriaDirection,
  antibioticPositions,
  poweredUp,
  cellSize,
}: SwappedEntityLayerProps) => {
  const getBacteriaRotation = () => {
    switch (bacteriaDirection) {
      case 'right': return 'rotate-0';
      case 'left': return 'rotate-180';
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      default: return 'rotate-0';
    }
  };

  const getAntibioticColor = (index: number) => {
    const colors = [
      'from-blue-400 to-cyan-500',    // Standard antibiotic - blue
      'from-blue-300 to-cyan-400',    // Weaker antibiotic - light blue
      'from-indigo-400 to-purple-500', // Strong antibiotic - purple
      'from-sky-400 to-blue-500',     // Fast antibiotic - sky blue
    ];
    return colors[index % colors.length];
  };

  // GameBoard has p-2 (8px) padding, so we need to offset entities by 8px
  const gridOffset = 8;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Bacteria (Player - now looks like blob) */}
      <div
        className={`absolute rounded-lg transition-all duration-150 ${getBacteriaRotation()} ${
          poweredUp 
            ? 'bg-gradient-to-br from-green-300 to-emerald-400 border-2 border-white shadow-lg shadow-green-400/50 animate-pulse' 
            : 'bg-gradient-to-br from-green-500 to-emerald-700 border-2 border-white shadow-lg'
        }`}
        style={{
          width: `${cellSize * 0.8}px`,
          height: `${cellSize * 0.8}px`,
          left: `${bacteriaPosition.x * cellSize + cellSize * 0.1 + gridOffset}px`,
          top: `${bacteriaPosition.y * cellSize + cellSize * 0.1 + gridOffset}px`,
        }}
      >
        {/* Bacteria details */}
        <div className="absolute w-2 h-2 bg-white/90 rounded-full left-2 top-2"></div>
        <div className="absolute w-2 h-2 bg-white/90 rounded-full right-2 top-2"></div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-white/70 rounded-t-full"></div>
        
        {/* Powered up effect */}
        {poweredUp && (
          <div className="absolute inset-0 rounded-lg animate-ping bg-green-400/30"></div>
        )}
        
        {/* Direction indicator */}
        <div className={`absolute w-3 h-1 bg-white/80 rounded-full ${
          bacteriaDirection === 'right' ? 'right-1 top-1/2 transform -translate-y-1/2' :
          bacteriaDirection === 'left' ? 'left-1 top-1/2 transform -translate-y-1/2' :
          bacteriaDirection === 'up' ? 'top-1 left-1/2 transform -translate-x-1/2' :
          'bottom-1 left-1/2 transform -translate-x-1/2'
        }`}></div>
      </div>

      {/* Antibiotics (Enemies - now look like pills) */}
      {antibioticPositions.map((pos, index) => (
        <div
          key={index}
          className={`absolute rounded-full animate-bounce ${
            poweredUp 
              ? 'opacity-50 grayscale' 
              : `bg-gradient-to-r ${getAntibioticColor(index)}`
          }`}
          style={{
            width: `${cellSize * 0.7}px`,
            height: `${cellSize * 0.7}px`,
            left: `${pos.x * cellSize + cellSize * 0.15 + gridOffset}px`,
            top: `${pos.y * cellSize + cellSize * 0.15 + gridOffset}px`,
            animationDelay: `${index * 0.2}s`,
          }}
        >
          {/* Pill shape details */}
          <div className="absolute w-1 h-3 bg-white/80 rounded-full left-2 top-1/2 transform -translate-y-1/2"></div>
          <div className="absolute w-1 h-3 bg-white/80 rounded-full right-2 top-1/2 transform -translate-y-1/2"></div>
          
          {/* Scared effect when bacteria is powered up */}
          {poweredUp && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-green-300">!</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

SwappedEntityLayer.displayName = 'SwappedEntityLayer';

export default SwappedEntityLayer;

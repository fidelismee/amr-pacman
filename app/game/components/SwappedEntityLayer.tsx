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

  // Calculate grid offset to account for GameBoard padding and centering
  // GameBoard has p-2 (8px) padding and border-2 (2px) on all sides
  // Grid is centered horizontally with flex justify-center
  const padding = 8; // p-2 = 0.5rem = 8px
  const borderWidth = 2; // border-2 = 2px
  const totalHorizontalExtra = (padding + borderWidth) * 2; // Both sides
  const gridOffsetX = totalHorizontalExtra / 2; // Grid is centered horizontally
  const gridOffsetY = padding + borderWidth; // Grid is at top with padding+border

  // Calculate centered positions
  const bacteriaSize = cellSize * 0.8;
  const antibioticSize = cellSize * 0.7;
  
  const bacteriaLeft = bacteriaPosition.x * cellSize + (cellSize - bacteriaSize) / 2 + gridOffsetX;
  const bacteriaTop = bacteriaPosition.y * cellSize + (cellSize - bacteriaSize) / 2 + gridOffsetY;

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
          width: `${bacteriaSize}px`,
          height: `${bacteriaSize}px`,
          left: `${bacteriaLeft}px`,
          top: `${bacteriaTop}px`,
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
      {antibioticPositions.map((pos, index) => {
        const antibioticLeft = pos.x * cellSize + (cellSize - antibioticSize) / 2 + gridOffsetX;
        const antibioticTop = pos.y * cellSize + (cellSize - antibioticSize) / 2 + gridOffsetY;
        
        return (
          <div
            key={index}
            className={`absolute rounded-full animate-bounce ${
              poweredUp 
                ? 'opacity-50 grayscale' 
                : `bg-gradient-to-r ${getAntibioticColor(index)}`
            }`}
            style={{
              width: `${antibioticSize}px`,
              height: `${antibioticSize}px`,
              left: `${antibioticLeft}px`,
              top: `${antibioticTop}px`,
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
        );
      })}
    </div>
  );
});

SwappedEntityLayer.displayName = 'SwappedEntityLayer';

export default SwappedEntityLayer;

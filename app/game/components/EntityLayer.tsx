// app/game/components/EntityLayer.tsx
"use client";

import { memo } from 'react';
import { Position, Direction } from '../hooks/useGameLoop';

interface EntityLayerProps {
  antibioticPosition: Position;
  antibioticDirection: Direction;
  bacteriaPositions: Position[];
  poweredUp: boolean;
  cellSize: number;
}

const EntityLayer = memo(({
  antibioticPosition,
  antibioticDirection,
  bacteriaPositions,
  poweredUp,
  cellSize,
}: EntityLayerProps) => {
  const getAntibioticRotation = () => {
    switch (antibioticDirection) {
      case 'right': return 'rotate-0';
      case 'left': return 'rotate-180';
      case 'up': return '-rotate-90';
      case 'down': return 'rotate-90';
      default: return 'rotate-0';
    }
  };

  const getBacteriaColor = (index: number) => {
    const colors = [
      'from-green-500 to-emerald-700', // E. coli - green
      'from-purple-500 to-violet-800', // MRSA - purple
      'from-red-500 to-rose-800',      // Streptococcus - red
      'from-yellow-500 to-amber-700',  // Staphylococcus - yellow
    ];
    return colors[index % colors.length];
  };

  // FIX: Set offset to 0 because this component is mounted INSIDE the grid container
  const gridOffset = 0;

  // Calculate centered positions
  const antibioticSize = cellSize * 0.7;
  const bacteriaSize = cellSize * 0.8;
  
  const antibioticLeft = antibioticPosition.x * cellSize + (cellSize - antibioticSize) / 2 + gridOffset;
  const antibioticTop = antibioticPosition.y * cellSize + (cellSize - antibioticSize) / 2 + gridOffset;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Antibiotic (Pac-Man) */}
      <div
        className={`absolute rounded-full transition-all duration-150 ${getAntibioticRotation()} ${
          poweredUp 
            ? 'bg-gradient-to-r from-blue-300 to-cyan-400 border-2 border-white shadow-lg shadow-blue-400/50' 
            : 'bg-gradient-to-r from-blue-400 to-cyan-500 border-2 border-white shadow-lg'
        }`}
        style={{
          width: `${antibioticSize}px`,
          height: `${antibioticSize}px`,
          left: `${antibioticLeft}px`,
          top: `${antibioticTop}px`,
        }}
      >
        {/* Pill shape details */}
        <div className="absolute w-1 h-3 bg-white/80 rounded-full left-2 top-1/2 transform -translate-y-1/2"></div>
        <div className="absolute w-1 h-3 bg-white/80 rounded-full right-2 top-1/2 transform -translate-y-1/2"></div>
        
        {/* Powered up effect */}
        {poweredUp && (
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/30"></div>
        )}
      </div>

      {/* Bacteria (Ghosts) */}
      {bacteriaPositions.map((pos, index) => {
        const bacteriaLeft = pos.x * cellSize + (cellSize - bacteriaSize) / 2 + gridOffset;
        const bacteriaTop = pos.y * cellSize + (cellSize - bacteriaSize) / 2 + gridOffset;
        
        return (
          <div
            key={index}
            className={`absolute rounded-lg animate-bounce ${
              poweredUp 
                ? 'opacity-50 grayscale' 
                : `bg-gradient-to-br ${getBacteriaColor(index)}`
            }`}
            style={{
              width: `${bacteriaSize}px`,
              height: `${bacteriaSize}px`,
              left: `${bacteriaLeft}px`,
              top: `${bacteriaTop}px`,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            {/* Bacteria details */}
            <div className="absolute w-2 h-2 bg-white/90 rounded-full left-2 top-2"></div>
            <div className="absolute w-2 h-2 bg-white/90 rounded-full right-2 top-2"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-white/70 rounded-t-full"></div>
            
            {/* Scared effect when powered up */}
            {poweredUp && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs font-bold text-blue-300">!</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

EntityLayer.displayName = 'EntityLayer';

export default EntityLayer;
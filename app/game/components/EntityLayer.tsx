// app/game/components/EntityLayer.tsx
"use client";

import { memo } from 'react';
// Define these locally if your hooks file isn't available to me, 
// otherwise import them as you did before.
export type Direction = 'up' | 'down' | 'left' | 'right';
export interface Position {
  x: number;
  y: number;
}

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

  // Sizing relative to cell
  const antibioticSize = cellSize * 0.85; // Slightly larger for visibility
  const bacteriaSize = cellSize * 0.8;
  
  // Center the entity within the cell
  // Formula: (Cell coordinate * Size) + (Half Cell - Half Entity)
  const antibioticOffset = (cellSize - antibioticSize) / 2;
  const bacteriaOffset = (cellSize - bacteriaSize) / 2;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Antibiotic (Player) */}
      <div
        className={`absolute rounded-full transition-transform duration-150 ease-linear ${getAntibioticRotation()} ${
          poweredUp 
            ? 'bg-gradient-to-r from-blue-300 to-cyan-400 border-2 border-white shadow-lg shadow-blue-400/50' 
            : 'bg-gradient-to-r from-blue-400 to-cyan-500 border border-white shadow-md'
        }`}
        style={{
          width: `${antibioticSize}px`,
          height: `${antibioticSize}px`,
          // Simple, clean coordinate math
          transform: `translate(${antibioticPosition.x * cellSize + antibioticOffset}px, ${antibioticPosition.y * cellSize + antibioticOffset}px)`,
          // Using translate instead of top/left often results in smoother animation performance
          left: 0,
          top: 0,
        }}
      >
        {/* Pill shape details */}
        <div className="absolute w-[20%] h-[60%] bg-white/80 rounded-full left-[15%] top-1/2 transform -translate-y-1/2"></div>
        <div className="absolute w-[20%] h-[60%] bg-white/80 rounded-full right-[15%] top-1/2 transform -translate-y-1/2"></div>
        
        {poweredUp && (
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/30"></div>
        )}
      </div>

      {/* Bacteria (Enemies) */}
      {bacteriaPositions.map((pos, index) => (
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
            transform: `translate(${pos.x * cellSize + bacteriaOffset}px, ${pos.y * cellSize + bacteriaOffset}px)`,
            left: 0,
            top: 0,
            animationDelay: `${index * 0.2}s`,
          }}
        >
          <div className="absolute w-1.5 h-1.5 bg-white/90 rounded-full left-1 top-1"></div>
          <div className="absolute w-1.5 h-1.5 bg-white/90 rounded-full right-1 top-1"></div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white/70 rounded-t-full"></div>
        </div>
      ))}
    </div>
  );
});

EntityLayer.displayName = 'EntityLayer';

export default EntityLayer;
// app/game/components/Cell.tsx
"use client";

import { memo } from 'react';
import { CellType } from '../levels';

interface CellProps {
  type: CellType;
  row: number;
  col: number;
  cellSize: number;
}

const Cell = memo(({ type, row, col, cellSize }: CellProps) => {
  const getCellContent = () => {
    switch (type) {
      case 0: // Infected Cell (dot)
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
          </div>
        );
      case 1: // Membrane/Wall
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-red-900 border-2 border-purple-700 rounded-sm"></div>
        );
      case 2: // Empty path
        return null;
      case 3: // Immune Booster
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 animate-ping shadow-lg shadow-blue-500/50"></div>
            <div className="absolute w-3 h-3 rounded-full bg-cyan-300"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative border border-gray-800/30"
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }}
    >
      {/* Background for empty cells */}
      {type === 2 && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
      )}
      
      {getCellContent()}
      
      {/* Grid lines for debugging */}
      {/* <div className="absolute inset-0 border border-gray-700/20"></div> */}
    </div>
  );
});

Cell.displayName = 'Cell';

export default Cell;

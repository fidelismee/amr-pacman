// app\game\components\GameBoard.tsx
"use client";

import { memo } from 'react';
import { Level } from '../levels';

interface GameBoardProps {
  level: Level;
  cellSize: number;
}

const GameBoard = memo(({ level, cellSize }: GameBoardProps) => {
  return (
    <div 
      className="bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700"
      style={{
        // FORCE the grid to be the exact pixel size of the math
        display: 'grid',
        gridTemplateColumns: `repeat(${level[0].length}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${level.length}, ${cellSize}px)`,
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      {level.map((row, y) =>
        row.map((cell, x) => {
          // Determine cell styling based on type
          let cellContent = null;
          let cellClass = "flex items-center justify-center relative";
          
          if (cell === 1) {
            // Wall
            cellClass += " bg-gray-800/80 border-[0.5px] border-gray-700/30";
          } else {
            // Path
            cellClass += " bg-transparent";
            
            if (cell === 0) {
              // Nutrient / Dot
              cellContent = (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              );
            } else if (cell === 3) {
              // Power Up
              cellContent = (
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
              );
            }
          }

          return (
            <div
              key={`${x}-${y}`}
              className={cellClass}
              style={{ width: cellSize, height: cellSize }}
            >
              {cellContent}
            </div>
          );
        })
      )}
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
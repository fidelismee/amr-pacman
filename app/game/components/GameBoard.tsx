// app/game/components/GameBoard.tsx
"use client";

import { memo } from 'react';
import Cell from './Cell';
import { Level, GRID_WIDTH, GRID_HEIGHT } from '../levels';

interface GameBoardProps {
  level: Level;
  cellSize?: number;
}

const GameBoard = memo(({ level, cellSize = 32 }: GameBoardProps) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black p-2 rounded-lg border-2 border-purple-800/50 shadow-2xl overflow-hidden">
      <div className="flex justify-center">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
            width: `${GRID_WIDTH * cellSize}px`,
            height: `${GRID_HEIGHT * cellSize}px`,
            // Removed maxWidth: '100%' to ensure pixel-perfect alignment with entity positioning
          }}
        >
          {level.map((row, rowIndex) =>
            row.map((cellType, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                type={cellType}
                row={rowIndex}
                col={colIndex}
                cellSize={cellSize}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;

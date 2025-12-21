# Antibiotic Movement Algorithm - Technical Explanation

## Overview
The antibiotic movement in the AMR Pacman game is implemented as a grid-based navigation system with player-controlled movement in the "Antibiotic Defender" mode and AI-controlled movement in the "Bacterial Survival" mode. This document provides a technical explanation of how the antibiotic moves to chase bacteria.

## Game Architecture

### Grid System
- The game uses a 15×15 grid where each cell is 32×32 pixels
- Cell types:
  - `0`: Path/Infected Cell (collectible)
  - `1`: Membrane/Wall (impassable)
  - `2`: Empty path (no collectible)
  - `3`: Immune Booster/Resistance Booster (power-up)

### Coordinate System
- Positions are represented as `{x, y}` coordinates where:
  - `x`: Column index (0-14)
  - `y`: Row index (0-14)
- Starting positions:
  - Antibiotic: `{x: 7, y: 7}` (center)
  - Bacteria: Four corners: `[{1,1}, {13,1}, {1,13}, {13,13}]`

## Player-Controlled Antibiotic Movement (Antibiotic Defender Mode)

### Movement Algorithm
The antibiotic movement is implemented in the `moveAntibiotic()` function in `AntibioticGame.tsx`:

```typescript
const moveAntibiotic = () => {
  const direction = getCurrentDirection();
  const newPos = { ...antibioticPosition };
  
  switch (direction) {
    case 'up':
      if (canMoveTo(newPos.x, newPos.y - 1)) newPos.y--;
      break;
    case 'down':
      if (canMoveTo(newPos.x, newPos.y + 1)) newPos.y++;
      break;
    case 'left':
      if (canMoveTo(newPos.x - 1, newPos.y)) newPos.x--;
      break;
    case 'right':
      if (canMoveTo(newPos.x + 1, newPos.y)) newPos.x++;
      break;
  }

  // Update position if changed
  if (newPos.x !== antibioticPosition.x || newPos.y !== antibioticPosition.y) {
    setAntibioticPosition(newPos);
    // Handle cell interactions...
  }
};
```

### Key Components

#### 1. Direction Management
- Uses `useGameLoop` hook to manage direction state
- Direction is stored in `currentDirectionRef` (current) and `nextDirectionRef` (queued)
- Keyboard input updates `nextDirectionRef` which gets applied on the next game tick
- Prevents immediate direction reversal by queuing changes

#### 2. Collision Detection (`canMoveTo()`)
```typescript
const canMoveTo = (x: number, y: number): boolean => {
  if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) {
    return false; // Out of bounds
  }
  
  const cellType = level[y]?.[x];
  return cellType !== 1; // Can't move into walls (type 1)
};
```

#### 3. Game Loop Integration
- Game runs at 200ms intervals (5 FPS)
- Each tick:
  1. Updates direction from queued input
  2. Calls `moveAntibiotic()`
  3. Calls `moveBacteria()` (AI movement)
  4. Updates power-up timer
  5. Checks collisions

## AI-Controlled Antibiotic Movement (Bacterial Survival Mode)

When antibiotics are enemies in Bacterial Survival mode, they use a simple random movement AI implemented in `moveAntibiotics()`:

```typescript
const moveAntibiotics = () => {
  setAntibioticPositions(prev => 
    prev.map(antibiotic => {
      const directions = [
        { x: 0, y: -1 }, // up
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }, // left
        { x: 1, y: 0 },  // right
      ];
      
      // Filter valid moves
      const validMoves = directions.filter(dir => 
        canMoveTo(antibiotic.x + dir.x, antibiotic.y + dir.y)
      );
      
      if (validMoves.length === 0) return antibiotic;
      
      // Choose random valid move
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      return {
        x: antibiotic.x + move.x,
        y: antibiotic.y + move.y,
      };
    })
  );
};
```

### AI Movement Characteristics
1. **Random Selection**: Chooses randomly from valid adjacent cells
2. **No Pathfinding**: No intelligent chasing behavior
3. **Wall Avoidance**: Only considers moves that don't hit walls
4. **Independent Movement**: Each antibiotic moves independently

## Chasing Behavior Analysis

### Player vs AI Movement Comparison
| Aspect | Player-Controlled Antibiotic | AI-Controlled Antibiotic |
|--------|-----------------------------|--------------------------|
| **Control** | Direct keyboard input | Random movement algorithm |
| **Decision Making** | Human strategy | Random selection from valid moves |
| **Targeting** | Player chooses direction | No targeting - purely random |
| **Predictability** | Strategic | Unpredictable but simple |

### Limitations of Current Implementation
1. **No True Chasing**: The antibiotic doesn't actively chase bacteria
2. **Random AI**: Enemy antibiotics move randomly without targeting
3. **Grid Constraints**: Movement restricted to 4 directions (no diagonals)
4. **Fixed Speed**: Constant 200ms movement interval

## Technical Implementation Details

### State Management
```typescript
// Antibiotic position state
const [antibioticPosition, setAntibioticPosition] = useState<Position>(ANTIBIOTIC_START);

// Bacteria positions state  
const [bacteriaPositions, setBacteriaPositions] = useState<Position[]>(BACTERIA_STARTS);
```

### Game Loop Hook (`useGameLoop.ts`)
- Manages keyboard input and direction queuing
- Implements game timing with `setInterval`
- Provides pause/resume functionality
- Handles direction state with refs for performance

### Collision Detection
```typescript
const checkCollisions = () => {
  bacteriaPositions.forEach(bacteria => {
    if (bacteria.x === antibioticPosition.x && bacteria.y === antibioticPosition.y) {
      // Handle collision...
    }
  });
};
```

## Potential Algorithm Improvements

### 1. Pathfinding Implementation
```typescript
// Pseudocode for BFS-based chasing
function findPathToBacteria(antibioticPos, bacteriaPos) {
  // Implement BFS to find shortest path
  // Consider walls as obstacles
  // Return next move direction
}
```

### 2. Enhanced AI Strategies
- **A* Algorithm**: For efficient pathfinding
- **Predictive Movement**: Anticipate player movement
- **Group Behavior**: Coordinate multiple antibiotics
- **Difficulty Levels**: Adjust AI aggressiveness

### 3. Smooth Movement
- Interpolate positions between grid cells
- Variable movement speeds
- Momentum and inertia simulation

## Performance Considerations
- **Grid-based**: O(1) collision checks
- **State updates**: Batched React state updates
- **Game loop**: Fixed interval for consistent timing
- **Ref usage**: Direction stored in refs to avoid re-renders

## Conclusion
The current antibiotic movement algorithm provides basic grid-based navigation with player control in one mode and simple random AI in another. While functional for the game's requirements, it lacks sophisticated chasing behavior. The implementation demonstrates clean separation of concerns with the game loop managing timing, input handling, and state updates while movement logic resides in component-specific functions.

The architecture allows for easy extension with more advanced algorithms while maintaining the core grid-based movement system.

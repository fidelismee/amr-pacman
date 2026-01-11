# AMR Pacman Project Study Guide

## Project Overview
AMR Pacman is an antibiotic resistance-themed Pacman game built as a Progressive Web App (PWA) using Next.js 16 with TypeScript. The game features bacteria as the player character, antibiotics as enemies, and nutrients/boosters as collectibles. The project emphasizes mobile optimization with touch controls and PWA capabilities.

## Key Files to Read (in recommended order)

### 1. **Configuration Files**
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration with PWA setup using `next-pwa`
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `public/manifest.json` - PWA manifest for app installation

### 2. **Core Application Structure**
- `app/layout.tsx` - Root layout with PWA meta tags and platform provider
- `app/page.tsx` - Home page that renders the main game component
- `app/globals.css` - Global styles with mobile optimizations

### 3. **Platform Detection & Context**
- `app/hooks/usePlatformDetection.ts` - Custom hook for detecting platform (PWA, mobile, desktop)
- `app/contexts/PlatformContext.tsx` - React context provider for platform-specific logic
- `app/components/PWARegistration.tsx` - Service worker registration for PWA

### 4. **Main Game Component**
- `app/game/components/BacteriaGame.tsx` - **THE CORE GAME** - Contains game logic, state, rendering, and controls
  - Game state management (score, lives, positions)
  - Game loop implementation (200ms intervals)
  - Collision detection
  - Responsive board sizing
  - Platform-specific UI rendering

### 5. **Game Architecture Components**
- `app/game/hooks/useGameLoop.ts` - Custom hook for game loop logic (if refactored from BacteriaGame)
- `app/game/levels.ts` - Level data and configurations
- `app/game/components/GameBoard.tsx` - Game board rendering component
- `app/game/components/GameStats.tsx` - Score, lives, and game status display
- `app/game/components/GameControls.tsx` - Keyboard controls reference
- `app/game/components/GameLegend.tsx` - Game element explanations
- `app/game/components/GameBoardContainer.tsx` - Game board with focus management
- `app/game/components/EntityLayer.tsx` - Entity rendering layer
- `app/game/components/SwappedEntityLayer.tsx` - Alternative entity rendering
- `app/game/components/Cell.tsx` - Individual cell component
- `app/game/components/AntibioticGame.tsx` - Alternative game implementation

### 6. **UI Components**
- `app/components/TouchController.tsx` - **IMPORTANT** - Mobile touch controls with arrow buttons
- `app/components/PacmanGame.tsx` - Legacy or alternative game component

### 7. **Documentation**
- `README.md` - Project overview, features, and setup instructions
- `antibiotic.md` - Likely contains game design or medical context
- `personal.md` - Developer notes or personal documentation

## Architecture Explanation

### Game Engine
The game uses a custom React-based game loop running at 200ms intervals. The main game logic is contained in `BacteriaGame.tsx` which manages:
- Player (bacteria) movement and direction queuing
- Enemy (antibiotic) AI with quadrant-based spawning
- Collision detection between bacteria and antibiotics
- Power-up system (blue boosters)
- Score tracking and game state (win/lose conditions)

### Platform-Specific Features
The project has sophisticated platform detection that determines:
- Whether to show touch controls (mobile/PWA) vs keyboard instructions (desktop)
- Responsive sizing for different screen sizes
- PWA-specific optimizations (fullscreen experience, service workers)

### PWA Implementation
- Uses `next-pwa` package for service worker generation
- Manifest file defines app icons, name, and display mode
- Service worker registration happens in `PWARegistration.tsx`
- Platform detection distinguishes between PWA and browser modes

### Responsive Design
- The game board dynamically resizes based on container width
- Touch controls are optimized for mobile screens (recently made smaller to prevent overflow)
- CSS uses Tailwind with mobile-first breakpoints

## Key Concepts to Understand

1. **Game State Management**: The game uses React state hooks (`useState`, `useRef`) for game state rather than a state management library.

2. **Direction Queuing**: Player movement uses a queuing system where next direction is stored and applied when possible (similar to original Pacman).

3. **Quadrant-Based Spawning**: Enemies spawn in four quadrants of the board, avoiding the center safe zone.

4. **Platform Context Pattern**: The `PlatformContext` provides derived values (like `showTouchControls`) throughout the app without prop drilling.

5. **PWA Lifecycle**: Understanding service worker registration, update flow, and offline capabilities.

6. **Responsive Game Board**: The board uses `useEffect` to calculate cell size based on container width, ensuring consistent gameplay across devices.

## Development Workflow

### Running the Project
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### PWA Testing
- Use Chrome DevTools → Application tab to test service workers
- Test "Add to Home Screen" functionality on mobile
- Verify offline capabilities

## Common Development Tasks

### Modifying Game Logic
Most game logic is in `BacteriaGame.tsx`. Key functions to understand:
- `moveBacteria()` - Player movement and item collection
- `moveAntibiotics()` - Enemy AI movement
- `checkCollisions()` - Collision detection
- `generateScatteredPositions()` - Enemy spawning

### Adjusting UI/UX
- Touch controls: Modify `TouchController.tsx` for arrow button styling/sizing
- Game board: Adjust `GameBoard.tsx` or `BacteriaGame.tsx` rendering
- Responsive design: Modify CSS in `globals.css` or Tailwind classes

### Platform-Specific Changes
- Platform detection logic: `usePlatformDetection.ts`
- Context-derived values: `PlatformContext.tsx`
- PWA registration: `PWARegistration.tsx`

## Recent Changes & Issues

### Recent Improvements
- Mobile-first responsive design
- Touch controller with handheld console styling
- PWA optimization (service workers, meta tags)
- Component splitting for better maintainability

### Known Issues
- Touch controller may overflow on very small mobile screens (recently addressed by reducing arrow button sizes)
- Multiple lockfiles warning in development (package-lock.json in parent directory)

## Learning Resources

1. **Next.js Documentation** - For understanding the framework
2. **PWA Fundamentals** - MDN Web Docs on Progressive Web Apps
3. **Game Development Patterns** - React game loop implementations
4. **Tailwind CSS** - Utility-first CSS framework

## Next Steps for Deep Understanding

1. Start with `README.md` for high-level overview
2. Examine `BacteriaGame.tsx` to understand core game mechanics
3. Review `PlatformContext.tsx` to understand platform adaptation
4. Study `TouchController.tsx` for mobile UI implementation
5. Explore `next.config.ts` and PWA setup

This project demonstrates modern web development practices including PWA implementation, responsive design, platform detection, and game development in React.

# AMR Pacman Game - Project Documentation

## 1. Project Overview

**Project Name**: AMR Pacman Game

**High-Level Goal**: An antibiotic resistance themed Pacman game built as a Progressive Web App (PWA) with Next.js and TypeScript. The game allows players to control bacteria to consume nutrients while avoiding antibiotics, with educational elements about antimicrobial resistance. The project emphasizes mobile-first design, PWA capabilities, and responsive gameplay across all devices.

**Target Users**:
- General public interested in educational games
- Students learning about microbiology and antibiotic resistance
- Mobile gamers looking for casual browser-based games
- Educators seeking interactive teaching tools

**Platform(s)**:
- Web browsers (desktop and mobile)
- Progressive Web App (installable on mobile devices and desktop)
- Responsive design optimized for mobile, tablet, and desktop

## 2. Current Architecture (VERY DETAILED)

### Overall System Design
The application follows a client-side React architecture with server-side rendering via Next.js. The game logic runs entirely in the browser using a custom game loop system. The architecture is modular with clear separation between game entities, rendering systems, UI components, and platform detection.

### Frontend Architecture
- **Framework**: Next.js 16 with TypeScript and React 19
- **Styling**: Tailwind CSS for utility-first styling with custom CSS for game-specific layouts
- **State Management**: React hooks with local component state (no external state management library)
- **Component Structure**:
  - `BacteriaGame.tsx`: Main game component containing core game logic
  - Specialized components: `GameStats`, `GameControls`, `GameLegend`, `GameBoardContainer`, `TouchController`
  - Entity renderers: `BacteriaRenderer`, `AntibioticRenderer`
  - Platform detection: `PlatformContext`, `usePlatformDetection` hook

### Backend Architecture
- **Server**: Next.js server with static generation and API routes capability (though currently no API routes are implemented)
- **Build System**: Next.js build pipeline with PWA support via `next-pwa`
- **Deployment**: Static export capable, optimized for Vercel or similar platforms

### State Management
- Local React state hooks (`useState`) for game state (score, lives, positions, etc.)
- Refs (`useRef`) for direction queuing and animation state
- Context API (`PlatformContext`) for platform detection across components
- No global state management library (Redux, Zustand, etc.) - intentionally kept simple

### Data Flow
1. User input (keyboard/touch) → Direction queue in refs
2. Game loop (200ms interval) → Processes queued direction
3. Movement logic → Updates entity positions
4. Collision detection → Updates game state (score, lives)
5. State updates → Triggers React re-renders
6. Renderers → Display updated positions and animations

### Key Design Patterns Used
1. **Component Composition**: Breaking down monolithic game component into smaller, reusable components
2. **Custom Hooks**: `useGameLoop` for game timing, `usePlatformDetection` for platform awareness
3. **Entity-Component System (ECS) Light**: Separate entity classes (`Bacteria`, `Antibiotic`) with renderer components
4. **Strategy Pattern**: Different control schemes based on platform (touch vs keyboard)
5. **Observer Pattern**: Game loop observes state changes and triggers updates
6. **Factory Pattern**: Entity instantiation with consistent interfaces

### File/Folder Structure Explanation
```
amr-pacman/
├── app/                          # Next.js app router directory
│   ├── components/               # Reusable UI components
│   │   ├── TouchController.tsx   # Mobile touch controls
│   │   └── PWARegistration.tsx   # PWA service worker registration
│   ├── contexts/                 # React contexts
│   │   └── PlatformContext.tsx   # Platform detection context
│   ├── game/                     # Game-specific code
│   │   ├── components/           # Game UI components
│   │   │   ├── BacteriaGame.tsx  # Main game component
│   │   │   ├── GameStats.tsx     # Score/lives display
│   │   │   ├── GameControls.tsx  # Control instructions
│   │   │   ├── GameLegend.tsx    # Game element explanations
│   │   │   ├── GameBoardContainer.tsx # Board wrapper
│   │   │   ├── GameBoard.tsx     # Game board grid
│   │   │   └── SwappedEntityLayer.tsx # Entity rendering layer
│   │   ├── hooks/                # Game-specific hooks
│   │   │   └── useGameLoop.ts    # Game timing and input handling
│   │   └── levels.ts             # Game level data and constants
│   ├── hooks/                    # General-purpose hooks
│   │   └── usePlatformDetection.ts # Platform detection logic
│   ├── layout.tsx                # Root layout with PWA meta tags
│   ├── page.tsx                  # Home page (renders BacteriaGame)
│   └── globals.css               # Global styles with mobile optimizations
├── src/                          # Source code (non-UI)
│   ├── components/               # Renderer components
│   │   ├── AntibioticRenderer.tsx # Antibiotic animation renderer
│   │   └── BacteriaRenderer.tsx   # Bacteria animation renderer
│   ├── entities/                 # Game entity classes
│   │   ├── Antibiotic.ts         # Antibiotic entity with animation logic
│   │   └── Bacteria.ts           # Bacteria entity with animation logic
│   └── systems/                  # Game systems (currently minimal)
│       └── BacteriaAnimationSystem.ts # Animation system (unused?)
├── public/                       # Static assets
│   ├── assets/                   # Game assets
│   │   ├── antibiotic/           # Antibiotic sprite sheets
│   │   ├── bacteria/             # Bacteria sprite sheets
│   │   ├── lives/                # Lives indicator images
│   │   └── resistance/           # Resistance booster image
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (various sizes)
├── package.json                  # Dependencies and scripts
├── next.config.ts               # Next.js configuration with PWA
├── tailwind.config.js           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## 3. Implementation Details (AS DETAILED AS POSSIBLE)

### Technologies, Frameworks, Versions
- **Next.js**: 16.0.10 (React 19.2.1, React DOM 19.2.1)
- **TypeScript**: ^5
- **Tailwind CSS**: 3.4.19 with PostCSS 8.5.3, Autoprefixer 10.4.20
- **PWA**: next-pwa 5.6.0 for service workers
- **Canvas**: 3.2.0 (though not heavily used)
- **ESLint**: ^9 with Next.js config
- **React Compiler**: babel-plugin-react-compiler 1.0.0 (experimental)

### Important Modules and Their Responsibilities

#### Core Game Modules:
1. **`BacteriaGame.tsx`** (app/game/components/BacteriaGame.tsx)
   - Main game controller component (600+ lines)
   - Manages game state: score, lives, positions, power-ups
   - Handles game loop with 200ms intervals
   - Implements movement logic for bacteria and antibiotics
   - Manages collision detection and game rules
   - Responsive design calculations for different screen sizes

2. **`useGameLoop.ts`** (app/game/hooks/useGameLoop.ts)
   - Custom hook for game timing and keyboard input
   - 200ms tick interval by default
   - Direction queuing system for smooth controls
   - Pause/resume functionality

3. **`levels.ts`** (app/game/levels.ts)
   - Defines game grid: 27x19 cells
   - Cell types: 0=Nutrient, 1=Wall, 2=Empty, 3=Booster
   - Starting positions for bacteria and antibiotics
   - Constants: `GRID_WIDTH=27`, `GRID_HEIGHT=19`

#### Entity System:
4. **`Bacteria.ts`** (src/entities/Bacteria.ts)
   - Bacteria entity class with position, direction, animation state
   - Sprite management for 2-frame animation (left/right variants)
   - Update method for animation timing
   - Methods for position/direction changes

5. **`Antibiotic.ts`** (src/entities/Antibiotic.ts)
   - Antibiotic entity class similar to Bacteria
   - 3-frame animation for more complex movement
   - Same interface as Bacteria for consistency

#### Rendering System:
6. **`BacteriaRenderer.tsx`** (src/components/BacteriaRenderer.tsx)
   - Renders bacteria with proper sprite based on animation frame
   - Handles scaling for responsive design
   - Uses Next.js Image component for optimization

7. **`AntibioticRenderer.tsx`** (src/components/AntibioticRenderer.tsx)
   - Similar to BacteriaRenderer but for antibiotics
   - Different color schemes and animations

#### Platform Detection:
8. **`usePlatformDetection.ts`** (app/hooks/usePlatformDetection.ts)
   - Detects PWA vs browser, mobile vs desktop
   - Uses display-mode media queries and user agent
   - Listens for orientation changes and resize events
   - Returns platform type: 'pwa-mobile', 'browser-mobile', 'browser-desktop'

9. **`PlatformContext.tsx`** (app/contexts/PlatformContext.tsx)
   - Provides platform detection to entire app
   - Derived values: showTouchControls, showKeyboardInstructions
   - Context provider wrapper for the app

#### UI Components:
10. **`TouchController.tsx`** (app/components/TouchController.tsx)
    - On-screen arrow pad for mobile devices
    - Directional buttons with visual feedback
    - Pause and restart buttons integrated

11. **`PWARegistration.tsx`** (app/components/PWARegistration.tsx)
    - Registers service worker for PWA functionality
    - Handles update notifications for PWA

### Critical Functions/Classes and What They Do

#### Game Logic Functions (in BacteriaGame.tsx):
- `canMoveTo(x, y)`: Checks if a position is valid (not a wall)
- `moveBacteria()`: Handles bacteria movement with direction queuing
- `moveAntibiotics()`: AI movement for antibiotics with collision avoidance
- `checkCollisions()`: Detects bacteria-antibiotic collisions with power-up logic
- `generateScatteredPositions()`: Quadrant-based spawning for antibiotics
- `initializeGame()`: Resets game to initial state

#### Entity Methods:
- `setDirection(direction)`: Changes entity facing direction
- `setMoving(isMoving)`: Starts/stops animation
- `update(deltaTime)`: Advances animation frame based on elapsed time
- `getCurrentSprite()`: Returns path to current animation frame

#### Platform Detection:
- `usePlatformDetection()`: Main detection logic with multiple methods
- Platform type determination based on PWA status and screen size

### Game Logic / Business Logic
1. **Movement System**:
   - Bacteria: Player-controlled with arrow keys or touch
   - Antibiotics: AI-controlled with random direction changes and collision avoidance
   - Direction queuing: Next direction stored in ref for smooth turns

2. **Collision & Scoring**:
   - Bacteria collects nutrients (10 points) and boosters (50 points)
   - Booster gives temporary power (5 seconds) to eat antibiotics (100 points)
   - Collision with antibiotic without power-up loses a life
   - Game ends when all nutrients collected (win) or lives reach 0 (lose)

3. **Power-up System**:
   - Booster lasts 5000ms with visual indicators
   - Antibiotics turn grayscale and semi-transparent during power-up
   - Eating antibiotics during power-up respawns them after 3 seconds in random quadrants

4. **Enhanced Antibiotic AI**:
   - **Random Movement**: 40% chance to change direction even when current direction is valid
   - **Collision Avoidance**: Prevents antibiotics from stacking on same cell
   - **Smart Direction Changes**: When blocked, tries opposite direction first, then perpendicular directions
   - **Non-reverse Preference**: 80% chance to avoid immediate 180-degree turns
   - **Quadrant-based Spawning**: Antibiotics spawn in different map quadrants for balanced distribution

5. **Level Design**:
   - Single level (LEVEL_1) with 27x19 grid
   - Strategic booster placement (4 boosters in level)
   - Maze-like wall structure with open pathways

### Asset Pipeline
- **Sprites**: PNG images in `/public/assets/` with consistent naming
- **Animation**: 2-frame for bacteria, 3-frame for antibiotics
- **Lives Indicator**: Pre-rendered images for 0-5 lives count
- **Icons**: PWA icon set in multiple sizes (16x16 to 512x512)
- **Optimization**: Next.js Image component for automatic optimization

### Build and Deployment Process
1. **Development**: `npm run dev` starts Next.js dev server at localhost:3000
2. **Build**: `npm run build` creates optimized production build
3. **Production**: `npm start` runs production server
4. **PWA**: Service worker generated during build, registered on first load
5. **Deployment**: Compatible with Vercel, Netlify, or any static hosting

## 4. Assumptions & Constraints

### Known Limitations
1. **Single Level**: Only one level is implemented (LEVEL_1)
2. **Improved but Limited AI**: Antibiotic movement has enhanced randomness and collision avoidance, but still lacks advanced pathfinding
3. **No Sound**: No audio feedback or background music
4. **No Persistence**: High scores not saved between sessions
5. **Limited Animation**: Simple 2-3 frame sprite animations
6. **No Multiplayer**: Single-player only

### Performance Constraints
1. **Game Loop**: 200ms interval (5 FPS for game logic) - chosen for turn-based feel
2. **Animation**: 60 FPS for sprite animations (separate from game logic)
3. **Mobile Optimization**: Responsive cell sizing with min/max constraints
4. **Memory**: Entity instances created once and reused
5. **Rendering**: Canvas not used; DOM-based rendering may have performance limits at high entity counts

### Platform Constraints
1. **PWA Requirements**: Requires HTTPS for service worker registration
2. **iOS Limitations**: PWA installation prompts less prominent than on Android
3. **Browser Support**: Requires modern browsers for PWA features
4. **Touch vs Keyboard**: Different control schemes based on platform detection
5. **Orientation**: Landscape preferred, with portrait warnings on mobile

### Design Tradeoffs
1. **Simplicity vs Features**: Chose simple, working game over complex features
2. **DOM vs Canvas**: Used DOM for easier React integration vs Canvas for performance
3. **State Management**: Local state over global state for simplicity
4. **Mobile First**: Optimized for mobile at potential expense of desktop experience
5. **PWA vs Native**: PWA for cross-platform reach vs native app performance

## 5. Known Issues / Technical Debt

### Bugs
1. **Direction Queuing**: Sometimes queued direction doesn't register immediately
2. **Antibiotic Stacking**: Multiple antibiotics can occupy same cell in rare cases
3. **Respawn Logic**: Antibiotics may respawn in walls if quadrant has no valid positions
4. **Focus Management**: Desktop "Click to Focus" overlay may not disappear correctly
5. **Orientation Detection**: Portrait/landscape detection may be delayed on some devices

### Incomplete Features
1. **Multiple Levels**: Only LEVEL_1 implemented
2. **Difficulty Progression**: No increasing difficulty or level progression
3. **Power-up Variety**: Only one type of power-up (resistance booster)
4. **Visual Effects**: Missing particle effects, screen shakes, etc.
5. **Tutorial**: No in-game tutorial or instructions

### Hacky or Temporary Solutions
1. **Sprite Mapping**: Hardcoded sprite paths in entity classes
2. **Magic Numbers**: Cell size calculations with hardcoded values
3. **Quadrant Logic**: Fixed quadrant coordinates in `generateScatteredPositions()`
4. **Color Classes**: Hardcoded Tailwind classes for antibiotic colors
5. **Platform Detection**: Relies on user agent sniffing which can be unreliable

## 6. Current Status

### Fully Implemented
- ✅ Core game mechanics (movement, collision, scoring)
- ✅ Responsive design for mobile, tablet, desktop
- ✅ PWA functionality with service worker
- ✅ Touch controls for mobile devices
- ✅ Keyboard controls for desktop
- ✅ Platform detection and adaptive UI
- ✅ Basic animations for entities
- ✅ Game state management (score, lives, power-ups)
- ✅ Level design with walls, nutrients, boosters
- ✅ Win/lose conditions and game over screens

### Partially Implemented
- ⚠️ AI movement (enhanced with randomness and collision avoidance, but still lacks pathfinding)
- ⚠️ Animation system (basic but functional)
- ⚠️ UI components (split but some redundancy)
- ⚠️ Performance optimizations (works but could be better)
- ⚠️ Error handling (basic but not comprehensive)

### Not Started
- ❌ Multiple levels or difficulty progression
- ❌ Sound effects or background music
- ❌ High score persistence
- ❌ Advanced visual effects
- ❌ Game settings or customization
- ❌ Accessibility features (screen reader support)
- ❌ Localization/internationalization
- ❌ Analytics or player tracking
- ❌ Multiplayer or social features

## 7. Next Planned Steps

### High Priority (Next Session)
1. **Fix Known Bugs**:
   - Improve direction queuing reliability
   - Prevent antibiotic stacking
   - Fix respawn logic to ensure valid positions
   - Resolve focus management issues

2. **Add Multiple Levels**:
   - Design LEVEL_2 with different maze layout
   - Implement level progression system
   - Add level selection screen

3. **Improve AI**:
   - Implement pathfinding for antibiotics
   - Add different AI behaviors (patrol, chase, random)
   - Create antibiotic "personalities" with varying difficulty

### Medium Priority
4. **Add Sound System**:
   - Background music with toggle
   - Sound effects for movement, collection, collisions
   - Volume controls in settings

5. **Enhance Visuals**:
   - Particle effects for collection and collisions
   - Screen shake on damage
   - Smooth transitions between game states
   - Improved animations with more frames

6. **Add Game Features**:
   - High score persistence with localStorage
   - Settings menu (sound, controls, difficulty)
   - Pause menu with options
   - Tutorial or help system

### Low Priority
7. **Polish and Refactor**:
   - Code cleanup and documentation
   - Performance optimizations
   - Accessibility improvements
   - Testing suite (unit and integration tests)

## 8. How to Continue in a New Session

### Exact Instructions to the Next AI Instance
1. **First, read this file completely** to understand the project context, architecture, and current status.
2. **Review the codebase structure** by examining key files mentioned in Section 2.
3. **Check the "Next Planned Steps"** (Section 7) to continue development where the previous session left off.
4. **Run the game locally** with `npm run dev` to see current functionality and identify any issues.
5. **Focus on high-priority items first** unless the user specifies different requirements.

### What Files to Read First
1. **`app/game/components/BacteriaGame.tsx`** - Main game logic (600+ lines)
2. **`app/game/levels.ts`** - Level design and constants
3. **`src/entities/Bacteria.ts`** and **`src/entities/Antibiotic.ts`** - Entity classes
4. **`app/hooks/usePlatformDetection.ts`** - Platform detection logic
5. **`app/contexts/PlatformContext.tsx`** - Platform context provider
6. **`next.config.ts`** - Build configuration with PWA

### What NOT to Redo or Change
1. **Do NOT rewrite the entire architecture** - The current component-based structure is intentional and working.
2. **Do NOT remove PWA functionality** - This is a core feature of the project.
3. **Do NOT change the game loop timing** (200ms) without careful consideration - it's designed for turn-based feel.
4. **Do NOT switch from DOM to Canvas rendering** without user request - this is a deliberate design choice.
5. **Do NOT add complex state management** (Redux, etc.) unless absolutely necessary - local state is sufficient.
6. **Do NOT break mobile responsiveness** - Always test on mobile viewports.

### Coding Conventions to Follow
1. **TypeScript Strictness**: Maintain strict TypeScript typing throughout.
2. **React Patterns**: Use functional components with hooks, not class components.
3. **Tailwind CSS**: Use utility classes from the existing Tailwind configuration.
4. **File Organization**: Keep game logic in `/app/game/`, entities in `/src/entities/`, renderers in `/src/components/`.
5. **Naming Conventions**:
   - Components: PascalCase (e.g., `BacteriaGame.tsx`)
   - Hooks: camelCase starting with "use" (e.g., `useGameLoop.ts`)
   - Entities: PascalCase (e.g., `Bacteria.ts`)
   - Constants: UPPER_SNAKE_CASE (e.g., `GRID_WIDTH`)
6. **Error Handling**: Add try-catch blocks for critical operations, but avoid over-engineering.
7. **Comments**: Document complex logic, but avoid obvious comments.
8. **Performance**: Be mindful of React re-renders; use `useMemo` and `useCallback` where appropriate.
9. **Mobile First**: Always design for mobile first, then enhance for desktop.
10. **PWA Considerations**: Ensure all changes maintain PWA compatibility (offline support, installability).

### Testing Before Committing Changes
1. **Run the development server**: `npm run dev` and test on localhost:3000
2. **Test on multiple viewports**: Use browser dev tools to test mobile (iPhone SE), tablet (iPad), and desktop
3. **Verify PWA functionality**: Check service worker registration and offline capability
4. **Test keyboard and touch controls**: Ensure both input methods work correctly
5. **Check for console errors**: No warnings or errors in browser console
6. **Build test**: Run `npm run build` to ensure no TypeScript or build errors

### When in Doubt
- **Preserve existing functionality** over adding new features
- **Keep it simple** - this is an educational game, not a AAA title
- **Document decisions** in code comments or update this file
- **Ask for clarification** if requirements are unclear

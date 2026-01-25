# AMR Pacman Game

An antibiotic resistance themed Pacman game built as a Progressive Web App (PWA) with Next.js and TypeScript.

## Features

- 🎮 **Gameplay**: Control bacteria to consume nutrients while avoiding antibiotics
- 🤖 **Enhanced AI**: Smart antibiotic movement with randomness and collision avoidance
- 📱 **Mobile Optimized**: Responsive design that works on all devices
- 🎯 **Touch Controls**: Built-in arrow controller for mobile devices
- ⚡ **PWA Ready**: Installable as a native app on mobile devices
- 🎨 **Modern UI**: Clean, game console-like interface with Tailwind CSS
- 🔄 **Game Loop**: Smooth 200ms game loop with collision detection

## Recent Improvements

### Enhanced Game AI (Latest)
- **Smart Antibiotic Movement**: 40% chance to change direction even when current path is valid
- **Collision Avoidance**: Prevents antibiotics from stacking on same cell
- **Intelligent Direction Changes**: When blocked, tries opposite direction first, then perpendicular directions
- **Non-reverse Preference**: 80% chance to avoid immediate 180-degree turns
- **Quadrant-based Spawning**: Antibiotics spawn in different map quadrants for balanced gameplay

### Mobile & PWA Enhancements
- **Responsive Design**: Complete mobile-first redesign with proper breakpoints
- **Touch Controller**: Handheld console-style arrow controls for mobile
- **PWA Optimization**: Service worker registration, proper meta tags, and manifest
- **UI Fixes**: Prevented zooming, improved touch targets, removed pull-to-refresh
- **Performance**: Optimized CSS for mobile devices

### Code Refactoring
- **Component Splitting**: Monolithic game component split into:
  - `GameStats` - Displays score, lives, and game status
  - `GameControls` - Keyboard controls reference
  - `GameLegend` - Game element explanations
  - `GameBoardContainer` - Game board with focus management
  - `TouchController` - Mobile arrow controls
- **Maintainability**: Cleaner code structure with proper TypeScript interfaces
- **Reusability**: Components can be easily reused or modified

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## PWA Installation

### On Mobile:
1. Open the game in Chrome or Safari
2. Tap "Add to Home Screen" or "Install App"
3. The game will launch like a native app

### On Desktop:
1. Open in Chrome/Edge
2. Click the install icon in the address bar
3. Launch from your desktop or start menu

## Controls

### Desktop:
- **Arrow Keys**: Move bacteria
- **Space**: Pause/Resume game
- **R**: Restart game

### Mobile:
- **Touch Controls**: Use the arrow pad on screen
- **Tap Game Board**: Activate keyboard focus (for external keyboards)
- **Action Buttons**: Pause and restart buttons

## Game Elements

- 🦠 **Bacteria (Green)**: Player character
- 💊 **Antibiotics (Blue)**: Enemies to avoid
- 💛 **Nutrients (Yellow)**: Collect for 10 points
- 💜 **Resistance Boosters (Purple)**: Temporary power-up (50 points)
- 🧱 **Membrane Walls (Dark)**: Obstacles

## Technical Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **PWA**: next-pwa for service workers
- **Game Engine**: Custom React game loop hook
- **Icons**: Custom PWA icon set

## Project Structure

```
app/
├── components/           # Reusable components
│   ├── TouchController.tsx
│   └── PWARegistration.tsx
├── game/
│   ├── components/      # Game-specific components
│   │   ├── BacteriaGame.tsx (main game)
│   │   ├── GameStats.tsx
│   │   ├── GameControls.tsx
│   │   ├── GameLegend.tsx
│   │   ├── GameBoardContainer.tsx
│   │   ├── GameBoard.tsx
│   │   └── SwappedEntityLayer.tsx
│   ├── hooks/          # Custom hooks
│   │   └── useGameLoop.ts
│   └── levels.ts       # Game level data
├── layout.tsx          # Root layout with PWA meta
├── page.tsx            # Home page
└── globals.css         # Global styles with mobile optimizations
```

## License

MIT

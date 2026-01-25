export class Antibiotic {
  private x: number;
  private y: number;
  private direction: 'up' | 'down' | 'left' | 'right' = 'right';
  private isMoving: boolean = false;
  private currentFrame: number = 0;
  private elapsedTime: number = 0;
  private animationSpeed: number = 200; // milliseconds per frame

  private spriteMap = {
    left: ['antibiotic 1 left 1.png', 'antibiotic 1 left 2.png', 'antibiotic 1 left 3.png'],
    right: ['antibiotic 1 right 1.png', 'antibiotic 1 right 2.png', 'antibiotic 1 right 3.png'],
    up: ['antibiotic 1 right 1.png', 'antibiotic 1 right 2.png', 'antibiotic 1 right 3.png'],
    down: ['antibiotic 1 left 1.png', 'antibiotic 1 left 2.png', 'antibiotic 1 left 3.png'],
  };

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setDirection(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.direction !== direction) {
      this.direction = direction;
      this.currentFrame = 0;
      this.elapsedTime = 0;
    }
  }

  setMoving(isMoving: boolean): void {
    this.isMoving = isMoving;
    if (!isMoving) {
      this.elapsedTime = 0;
    }
  }

  update(deltaTime: number): void {
    if (!this.isMoving) return;

    this.elapsedTime += deltaTime;

    if (this.elapsedTime >= this.animationSpeed) {
      const sprites = this.spriteMap[this.direction];
      if (sprites && sprites.length > 0) {
        this.currentFrame = (this.currentFrame + 1) % sprites.length;
      }
      this.elapsedTime = 0;
    }
  }

  getCurrentSprite(): string {
    const sprites = this.spriteMap[this.direction];
    if (!sprites || sprites.length === 0) {
      return `/assets/antibiotic/antibiotic 1 right 1.png`; // Default fallback
    }
    const frameIndex = Math.min(this.currentFrame, sprites.length - 1);
    return `/assets/antibiotic/${sprites[frameIndex]}`;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
  }
}
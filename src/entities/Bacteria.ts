export class Bacteria {
  private x: number;
  private y: number;
  private direction: 'up' | 'down' | 'left' | 'right' = 'right';
  private isMoving: boolean = false;
  private currentFrame: number = 0;
  private elapsedTime: number = 0;
  private animationSpeed: number = 200; // milliseconds per frame

  private spriteMap = {
    left: ['bacteria left 1.png', 'bacteria left 2.png'],
    right: ['bacteria right 1.png', 'bacteria right 2.png'],
    up: ['bacteria right 1.png', 'bacteria right 2.png'],
    down: ['bacteria left 1.png', 'bacteria left 2.png'],
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
      this.currentFrame = (this.currentFrame + 1) % 2;
      this.elapsedTime = 0;
    }
  }

  getCurrentSprite(): string {
    const sprites = this.spriteMap[this.direction];
    return `/assets/bacteria/${sprites[this.currentFrame]}`;
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

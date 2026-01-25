import { Bacteria } from '../entities/Bacteria';

export class BacteriaAnimationSystem {
  private bacteria: Bacteria[] = [];
  private lastUpdateTime: number = Date.now();

  addBacteria(bacterium: Bacteria): void {
    this.bacteria.push(bacterium);
  }

  update(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.bacteria.forEach((bacterium) => {
      bacterium.update(deltaTime);
    });
  }

  getBacteria(): Bacteria[] {
    return this.bacteria;
  }
}

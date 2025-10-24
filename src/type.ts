export interface Obstacle {
  checkCollision(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number,
    isAttacking: boolean,
    isDashing: boolean
  ): boolean;
  tick(speed: number): void;
  destroy(force?: boolean): boolean;
}

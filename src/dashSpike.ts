import type { Rectangle } from "two.js/src/shapes/rectangle";
import type { Obstacle } from "./type";
import Two from "two.js";
import { DINO_BASE_Y, DINO_H, DINO_W, WIDTH } from "./static";

export default class DashSpike implements Obstacle {
  rect: Rectangle;
  constructor(
    two: Two,
    props?: {
      xApd?: number;
      y?: number;
    }
  ) {
    this.rect = two.makeImage(
      new Two.Texture("./assets/dash/default.png"),
      WIDTH + (props?.xApd ?? 0),
      props?.y ?? DINO_BASE_Y + DINO_H / 4,
      DINO_W / 2,
      DINO_H / 2
    );
    this.rect.fill = "#3523ffff";
    this.rect.noStroke();
  }
  checkCollision(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number,
    _isAttacking: boolean,
    isDashing: boolean
  ): boolean {
    const RECT_X = this.rect.position.x - this.rect.width / 2;
    const RECT_W = this.rect.width;
    if (!(playerX + playerWidth >= RECT_X && playerX <= RECT_X + RECT_W))
      return false;

    const RECT_Y = this.rect.position.y - this.rect.height;
    const RECT_H = this.rect.height;

    // A : playerY ~ playerY + playerHeight
    // B : RECT_Y ~ RECT_Y + RECT_H
    console.log(playerY, playerY + playerHeight, RECT_Y, RECT_Y + RECT_H);
    if (playerY + playerHeight > RECT_Y && playerY < RECT_Y + RECT_H) {
      return !isDashing;
    }
    return false;
  }
  tick(speed: number): void {
    this.rect.position.x -= speed;
  }
  destroy(force: boolean = false): boolean {
    if (!force) {
      if (this.rect.position.x > -100) {
        return false;
      }
    }

    this.rect.remove();
    return true;
  }
}

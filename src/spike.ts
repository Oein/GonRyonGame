import type { Rectangle } from "two.js/src/shapes/rectangle";
import type { Obstacle } from "./type";
import Two from "two.js";
import { DINO_BASE_Y, DINO_H, DINO_W, WIDTH } from "./static";

export default class Spike implements Obstacle {
  rect: Rectangle;
  constructor(
    two: Two,
    props?: {
      xApd?: number;
      y?: number;
    }
  ) {
    this.rect = two.makeImage(
      new Two.Texture("./assets/spike/default.png"),
      WIDTH + (props?.xApd ?? 0),
      props?.y ?? DINO_BASE_Y,
      DINO_W,
      DINO_H
    );
    this.rect.fill = "#ff2345";
    this.rect.noStroke();
  }
  checkCollision(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number
  ): boolean {
    const RECT_X = this.rect.position.x - this.rect.width / 2;
    const RECT_W = this.rect.width;
    if (!(playerX + playerWidth >= RECT_X && playerX <= RECT_X + RECT_W))
      return false;
    const RECT_Y = this.rect.position.y - this.rect.height;
    const RECT_H = this.rect.height;

    // A : playerY ~ playerY + playerHeight
    // B : RECT_Y ~ RECT_Y + RECT_H
    if (playerY + playerHeight > RECT_Y && playerY < RECT_Y + RECT_H) {
      return true;
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

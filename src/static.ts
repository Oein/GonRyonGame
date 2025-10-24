export const WIDTH = 640;
export const HEIGHT = 128;
export const GROUND_Y = HEIGHT - 18;

export const DINO_W = 22;
export const DINO_H = 22;
export const DINO_BASE_Y = GROUND_Y - DINO_H / 2;

export const TARGET_FPS = 60;
export const INTV = 1000 / TARGET_FPS;

export const DEFAULT_OBSTACLES_SPEED = 10;

export const JUMP_Y_VELOCITY = 18; // pixels/second
export const GRAVITY = 3; // pixels/second^2

export const SPAWN_INTERVAL = 50; // frames
export const SNEAK_HEIGHT_MULTIPLIER = 0.5;

export const PLAYER_ATK_TIME_FULL = 10; // farmes
export const PLAYER_DASH_TIME_FULL = 8; // frames

export const calculateObstacleSpeed = (dashTime: number): number => {
  return DEFAULT_OBSTACLES_SPEED + dashTime * 5;
};

import "./style.css";
import Two from "two.js";
import type { Obstacle } from "./type";
import Spike from "./spike";
import {
  calculateObstacleSpeed,
  DEFAULT_OBSTACLES_SPEED,
  DINO_BASE_Y,
  DINO_H,
  DINO_W,
  GRAVITY,
  GROUND_Y,
  HEIGHT,
  INTV,
  JUMP_Y_VELOCITY,
  PLAYER_ATK_TIME_FULL,
  PLAYER_DASH_TIME_FULL,
  SNEAK_HEIGHT_MULTIPLIER,
  SPAWN_INTERVAL,
  WIDTH,
} from "./static";
import DashSpike from "./dashSpike";
import AtkSpike from "./atk";
import SmallAtkSpike from "./smallAtk";
import notifier from "./notifier";
import createButton from "./buttonts";

async function main() {
  const container = document.getElementById("container");
  if (!container) return;

  // const playerTextureDefault = new Two.Texture("./assets/player/000.png");
  const playerTextures = [
    [
      new Two.Texture("./assets/player/000-0.png"),
      new Two.Texture("./assets/player/000-1.png"),
    ], // Default
    new Two.Texture("./assets/player/001.png"), // Dash
    new Two.Texture("./assets/player/010.png"), // Attack
    new Two.Texture("./assets/player/011.png"), // Attack + Dash
    [
      new Two.Texture("./assets/player/100-0.png"),
      new Two.Texture("./assets/player/100-1.png"),
    ], // Sneak
    new Two.Texture("./assets/player/101.png"), // Sneak + Dash
    new Two.Texture("./assets/player/110.png"), // Sneak + Attack
    new Two.Texture("./assets/player/111.png"), // Sneak + Attack + Dash
  ];

  const two = new Two({
    fullscreen: false,
    height: HEIGHT,
    width: WIDTH,
    autostart: true,
    smoothing: true,
    type: "SVGRenderer",
  }).appendTo(container as HTMLElement);
  two.renderer.domElement.style.imageRendering = "pixelated";

  const scale = window.innerWidth / WIDTH;
  const hSize = HEIGHT * scale;
  container.style.scale = scale.toString();
  container.style.minHeight = `${hSize}px`;

  // Ground
  const ground = two.makeRectangle(WIDTH / 2, GROUND_Y + 1, WIDTH, 2);
  ground.fill = "#333";
  ground.noStroke();

  // Dino
  const dino = two.makeImage(
    (playerTextures[0] as any as (typeof Two.Texture)[])[0],
    64,
    DINO_BASE_Y,
    DINO_W,
    DINO_H
  );
  // dino.fill = "#111";
  dino.noStroke();

  // Score text
  const scoreText = two.makeText("0", WIDTH - 24, 16);
  scoreText.fill = "#222";
  scoreText.alignment = "right" as any;
  scoreText.size = 14;

  // Game over overlay
  const overlay = two.makeGroup();
  const overlayBg = two.makeRectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
  overlayBg.opacity = 0.0; // transparent click layer (kept for grouping)
  overlayBg.noStroke();
  const overText = two.makeText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 6);
  overText.size = 18;
  overText.fill = "#111";
  const hintText = two.makeText(
    "Press any key to restart",
    WIDTH / 2,
    HEIGHT / 2 + 14
  );
  hintText.size = 10;
  hintText.fill = "#333";
  overlay.add(overlayBg, overText, hintText);
  overlay.visible = false;

  let OBSTACLES_SPEED = DEFAULT_OBSTACLES_SPEED;
  let obstacles: Obstacle[] = [];

  let yVelocity = 0;
  let playerY = 0;
  let gameRunning = true;
  let frameCount = 0;

  let PLAYER_ATK_T = 0; // frames
  let PLAYER_DASH_T = 0; // frames
  let LAST_UPDATE_TIME = 0;
  let isSneaking = false;

  function onJump() {
    if (isSneaking) return;
    if (playerY > 5) return;
    yVelocity = JUMP_Y_VELOCITY;
  }
  function onAttack() {
    console.log("Attack triggered");
    if (PLAYER_ATK_T == 0) PLAYER_ATK_T = PLAYER_ATK_TIME_FULL;
  }
  function onDash() {
    console.log("Dash triggered");
    if (PLAYER_DASH_T == 0) PLAYER_DASH_T = PLAYER_DASH_TIME_FULL;
  }
  function gameOver() {
    overlay.visible = true;
    gameRunning = false;

    yVelocity = 0;
    playerY = 0;
  }
  function onSneakStart() {
    if (playerY > 0) {
      yVelocity = -30; // fall down quickly
    }
  }

  // [Space] [Shift] [Atk] [Dash]

  function spawnOb1000() {
    let spk = new Spike(two);
    obstacles.push(spk);
  }

  function spawnOb0101() {
    for (let apd = 0; apd < 8; apd++) {
      let spk = new DashSpike(two, {
        xApd: (DINO_W * apd) / 2,
      });
      obstacles.push(spk);
    }
    for (let apd = 0; apd < 4; apd++) {
      let spk = new Spike(two, {
        xApd: DINO_W * apd + DINO_W / 4,
        y: DINO_BASE_Y - DINO_H / 2,
      });
      obstacles.push(spk);
    }

    let spk = new Spike(two, {
      xApd: DINO_W / 4,
      y: DINO_BASE_Y - DINO_H * 2 + DINO_H / 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4,
      y: DINO_BASE_Y - DINO_H * 3 + DINO_H / 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4,
      y: DINO_BASE_Y - DINO_H * 4 + DINO_H / 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4 + DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 2 + DINO_H / 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4 + DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 3 + DINO_H / 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4 + DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 4 + DINO_H / 2,
    });
    obstacles.push(spk);
  }

  function spawnOb0001() {
    for (let apd = 0; apd < 8; apd++) {
      let spk = new DashSpike(two, {
        xApd: (DINO_W * apd) / 2,
      });
      obstacles.push(spk);
    }
    for (let apd = 0; apd < 4; apd++) {
      let spk = new Spike(two, {
        xApd: DINO_W * apd + DINO_W / 4,
        y: DINO_BASE_Y - DINO_H,
      });
      obstacles.push(spk);
    }

    let spk = new Spike(two, {
      xApd: DINO_W / 4,
      y: DINO_BASE_Y - DINO_H * 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4,
      y: DINO_BASE_Y - DINO_H * 3,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4,
      y: DINO_BASE_Y - DINO_H * 4,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4 + DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4 + DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 3,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W / 4 + DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 4,
    });
    obstacles.push(spk);
  }

  function spawnOb1100() {
    let spk = new Spike(two);
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W * 3,
      y: DINO_BASE_Y - DINO_H,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 2,
    });
    obstacles.push(spk);

    spk = new Spike(two, {
      xApd: DINO_W * 3,
      y: DINO_BASE_Y - DINO_H * 3,
    });
    obstacles.push(spk);
  }

  function spawnOb0100_0101_0110_0111() {
    let spk = new Spike(two, { y: DINO_BASE_Y - DINO_H / 2 });
    obstacles.push(spk);

    spk = new Spike(two, { y: DINO_BASE_Y - DINO_H / 2 - DINO_H });
    obstacles.push(spk);

    spk = new Spike(two, { y: DINO_BASE_Y - DINO_H / 2 - DINO_H * 2 });
    obstacles.push(spk);

    spk = new Spike(two, { y: DINO_BASE_Y - DINO_H / 2 - DINO_H * 3 });
    obstacles.push(spk);

    spk = new Spike(two, { y: DINO_BASE_Y - DINO_H / 2 - DINO_H * 4 });
    obstacles.push(spk);
  }

  function spawnOb0010() {
    for (let apd = 0; apd < 4; apd++) {
      let spk = new AtkSpike(two, {
        y: DINO_BASE_Y - DINO_H * apd,
      });
      obstacles.push(spk);
    }
  }

  function spawnOb0011() {
    for (let xApd = 0; xApd < 4; xApd++) {
      for (let apd = 0; apd < 4; apd++) {
        let spk = new AtkSpike(two, {
          y: DINO_BASE_Y - DINO_H * apd,
          xApd: DINO_W * xApd,
        });
        obstacles.push(spk);
      }
    }
  }

  function spawnOb1010() {
    let spkn = new Spike(two, {
      y: DINO_BASE_Y,
    });
    obstacles.push(spkn);

    for (let apd = 1; apd < 4; apd++) {
      let spk = new AtkSpike(two, {
        y: DINO_BASE_Y - DINO_H * apd,
      });
      obstacles.push(spk);
    }
  }

  function spawnOb0110() {
    let spkn = new SmallAtkSpike(two, {
      y: DINO_BASE_Y + DINO_H / 4,
    });
    obstacles.push(spkn);

    for (let apd = 1; apd < 4; apd++) {
      let spk = new Spike(two, {
        y: DINO_BASE_Y - DINO_H * (apd - 0.5),
      });
      obstacles.push(spk);
    }
  }

  function spawnOb1011() {
    for (let xApd = 0; xApd < 4; xApd++) {
      let spkn = new Spike(two, {
        xApd: DINO_W * xApd,
      });
      obstacles.push(spkn);
      for (let apd = 1; apd < 4; apd++) {
        let spk = new AtkSpike(two, {
          y: DINO_BASE_Y - DINO_H * apd,
          xApd: DINO_W * xApd,
        });
        obstacles.push(spk);
      }
    }
  }

  function spawnOb0111() {
    for (let xApd = 0; xApd < 4; xApd++) {
      let spkn = new SmallAtkSpike(two, {
        xApd: DINO_W * xApd,
      });
      obstacles.push(spkn);
      for (let apd = 1; apd < 4; apd++) {
        let spk = new Spike(two, {
          y: DINO_BASE_Y - DINO_H * (apd - 0.5),
          xApd: DINO_W * xApd,
        });
        obstacles.push(spk);
      }
    }
  }

  function spawnOb1001() {
    for (let xApd = 0; xApd < 3; xApd++) {
      for (let apd = 0; apd < 2; apd++) {
        let spk = new Spike(two, {
          y: DINO_BASE_Y - DINO_H * apd,
          xApd: DINO_W * xApd,
        });
        obstacles.push(spk);
      }
    }
  }

  function restart() {
    obstacles.forEach((x) => x.destroy(true));
    obstacles = [];

    overlay.visible = false;
    gameRunning = true;
    frameCount = 0;
    OBSTACLES_SPEED = DEFAULT_OBSTACLES_SPEED;
  }

  let LAST_SNEAK_STATE = false;

  const spawners = {
    spawnOb1000,
    spawnOb0001,
    spawnOb1100,
    spawnOb0101,
    spawnOb0010,
    spawnOb1010,
    spawnOb0110,
    spawnOb0100_0101_0110_0111,
    spawnOb0011,
    spawnOb1011,
    spawnOb0111,
    spawnOb1001,
  };

  let jumpKeyDown = false;
  let attackKeyDown = false;
  let dashKeyDown = false;

  two.bind("update", () => {
    if (Date.now() - LAST_UPDATE_TIME < INTV) return;
    LAST_UPDATE_TIME = Date.now();

    if (!gameRunning) return;
    frameCount++;

    // Spawn obstacles
    if (frameCount % SPAWN_INTERVAL === 0) {
      const spawner =
        Object.values(spawners)[
          Math.floor(Math.random() * Object.values(spawners).length)
        ];
      spawner();
    }

    if (LAST_SNEAK_STATE != isSneaking) {
      LAST_SNEAK_STATE = isSneaking;
      if (isSneaking) {
        onSneakStart();
      }
    }

    // Physics
    playerY += yVelocity;
    if (playerY > 0) yVelocity -= GRAVITY;
    if (playerY < 0) {
      playerY = 0;
      yVelocity = 0;
    }
    if (PLAYER_ATK_T > 0) PLAYER_ATK_T--;
    if (PLAYER_DASH_T > 0) PLAYER_DASH_T--;

    OBSTACLES_SPEED = calculateObstacleSpeed(PLAYER_DASH_T);

    const isAttacking = PLAYER_ATK_T > 0;
    const isDashing = PLAYER_DASH_T > 0;

    const textureIndex =
      (isSneaking ? 1 << 2 : 0) |
      (isAttacking ? 1 << 1 : 0) |
      (isDashing ? 1 : 0);
    const textures = playerTextures[textureIndex];
    if (Array.isArray(textures)) {
      const tFrame = Math.floor((frameCount / 5) % textures.length);
      dino.texture = textures[tFrame];
    } else dino.texture = playerTextures[textureIndex] as any;
    console.log(isSneaking, isAttacking, isDashing, textureIndex);

    if (jumpKeyDown && !isSneaking) onJump();
    if (attackKeyDown) onAttack();
    if (dashKeyDown) onDash();

    const collision = obstacles
      .map((x) => {
        x.tick(OBSTACLES_SPEED);
        const yMulti = isSneaking ? SNEAK_HEIGHT_MULTIPLIER : 1;
        return x.checkCollision(
          64 - DINO_W / 2,
          DINO_BASE_Y - DINO_H - playerY + DINO_H * (1 - yMulti),
          DINO_W,
          DINO_H * yMulti,
          isAttacking,
          isDashing
        );
      })
      .includes(true);
    obstacles = obstacles.filter((x) => !x.destroy(false));

    // Graphics
    dino.translation.y = DINO_BASE_Y - playerY;
    scoreText.value = frameCount.toString();

    // Game Events
    if (collision) {
      gameOver();
    }
  });

  (window as any).dino = {
    onJump,
    onAttack,
    onDash,
    gameOver,
    spawners,
  };

  let jumpKey = localStorage.getItem("gonryon_jumpKey") || "Space";
  let attackKey = localStorage.getItem("gonryon_attackKey") || "KeyS";
  let dashKey = localStorage.getItem("gonryon_dashKey") || "KeyD";
  let shiftKey = localStorage.getItem("gonryon_sneakKey") || "ShiftLeft";

  window.addEventListener("keydown", (e) => {
    if (gameRunning) {
      if (e.code === jumpKey) {
        jumpKeyDown = true;
        onJump();
      }
      if (e.code === attackKey) {
        attackKeyDown = true;
        onAttack();
      }
      if (e.code === dashKey) {
        dashKeyDown = true;
        onDash();
      }
      if (e.code === shiftKey) {
        isSneaking = true;
      }
    } else {
      restart();
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === jumpKey) {
      jumpKeyDown = false;
    }
    if (e.code === attackKey) {
      attackKeyDown = false;
    }
    if (e.code === dashKey) {
      dashKeyDown = false;
    }
    if (e.code === shiftKey) {
      isSneaking = false;
    }
  });

  async function keyMatcher() {
    let resolver: ((str: string) => void) | null = null;
    const listener = (e: KeyboardEvent) => {
      if (resolver) {
        e.preventDefault();
        e.stopPropagation();
        resolver(e.code);
      }
    };
    window.addEventListener("keyup", listener);
    const waitForKey = () =>
      new Promise<string>((r) => {
        resolver = (ee) => {
          r(ee);
          resolver = null;
        };
      });

    notifier.show("점프로 사용할 키를 눌러주세요", 5000);
    jumpKey = await waitForKey();
    notifier.show(`점프 키가 ${jumpKey}로 설정되었습니다`, 5000);

    notifier.show("공격 키를 눌러주세요", 5000);
    attackKey = await waitForKey();
    notifier.show(`공격 키가 ${attackKey}로 설정되었습니다`, 5000);

    notifier.show("대시 키를 눌러주세요", 5000);
    dashKey = await waitForKey();
    notifier.show(`대시 키가 ${dashKey}로 설정되었습니다`, 5000);

    notifier.show("웅크리기 키를 눌러주세요", 5000);
    shiftKey = await waitForKey();
    notifier.show(`웅크리기 키가 ${shiftKey}로 설정되었습니다`, 5000);

    localStorage.setItem("gonryon_jumpKey", jumpKey);
    localStorage.setItem("gonryon_attackKey", attackKey);
    localStorage.setItem("gonryon_dashKey", dashKey);
    localStorage.setItem("gonryon_sneakKey", shiftKey);

    window.removeEventListener("keyup", listener);
  }

  createButton({
    text: "키 변경",
    onClick: (e: Event) => {
      keyMatcher();
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget && (e.currentTarget as HTMLElement).blur();
    },
    bgColor: "#44aa44",
    fgColor: "white",
  });
}

main();

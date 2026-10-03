const GRID = 20;
const CELL = 16;
const TICK_MS = 110;
const BEST_KEY = 'snake_best';

/* Idle patrol bounds — snake bounces inside this rectangle */
const IDLE_MIN = 4;
const IDLE_MAX = GRID - 5;

/* Food: keep away from edges and from the head */
const FOOD_PAD = 2;
const FOOD_MIN_DIST_FROM_HEAD = 4;

/* Cap accumulated time per frame (prevents tab-unfocus death spiral) */
const MAX_DT = TICK_MS * 3;

/* Directional input queue: remember up to N turns for smooth steering */
const DIR_QUEUE_MAX = 3;

/* Minimum swipe distance (px) to register as a direction on touch */
const SWIPE_MIN = 20;

type Point = { x: number; y: number };

export function initSnake(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#snake-canvas');
  const scoreEl = document.querySelector<HTMLElement>('#snake-score');
  const restartBtn =
    document.querySelector<HTMLButtonElement>('#snake-restart');
  const wrap = document.querySelector<HTMLElement>('.snake-canvas-wrap');
  const overlay = document.querySelector<HTMLElement>('#snake-gameover');
  const overlayRestartBtn = document.querySelector<HTMLButtonElement>(
    '#snake-gameover-restart',
  );
  const finalScoreEl =
    document.querySelector<HTMLElement>('#snake-final-score');
  const finalBestEl = document.querySelector<HTMLElement>('#snake-final-best');

  if (!canvas || !wrap) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const W = GRID * CELL;
  const H = GRID * CELL;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = '100%';
  canvas.style.maxWidth = `${W}px`;
  canvas.style.aspectRatio = '1 / 1';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let snake: Point[] = [];
  let dir: Point = { x: 1, y: 0 };
  let dirQueue: Point[] = [];
  let food: Point = { x: 0, y: 0 };
  let score = 0;
  let best = 0;
  let running = false;
  let paused = false;
  let dead = false;
  let idle = true;
  let loopId = 0;
  let last = 0;
  let acc = 0;

  try {
    best = Number(localStorage.getItem(BEST_KEY) ?? '0') || 0;
  } catch {
    best = 0;
  }

  const updateScore = (): void => {
    if (scoreEl) scoreEl.textContent = String(score);
  };

  /* Place food away from edges and away from the snake's head */
  const placeFood = (): void => {
    const minX = FOOD_PAD;
    const maxX = GRID - 1 - FOOD_PAD;
    const minY = FOOD_PAD;
    const maxY = GRID - 1 - FOOD_PAD;
    const head = snake[0];

    for (let attempts = 0; attempts < 500; attempts += 1) {
      const p: Point = {
        x: minX + Math.floor(Math.random() * (maxX - minX + 1)),
        y: minY + Math.floor(Math.random() * (maxY - minY + 1)),
      };

      if (snake.some((s) => s.x === p.x && s.y === p.y)) continue;

      if (head) {
        const dx = p.x - head.x;
        const dy = p.y - head.y;
        if (Math.sqrt(dx * dx + dy * dy) < FOOD_MIN_DIST_FROM_HEAD) continue;
      }

      food = p;
      return;
    }

    /* Fallback: first free cell inside the safe rectangle */
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (!snake.some((s) => s.x === x && s.y === y)) {
          food = { x, y };
          return;
        }
      }
    }
    food = { x: minX, y: minY };
  };

  const setSnakeDefault = (): void => {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    dirQueue = [];
  };

  const showOverlay = (): void => {
    if (!overlay) return;
    if (finalScoreEl) finalScoreEl.textContent = String(score);
    if (finalBestEl) finalBestEl.textContent = String(best);
    overlay.hidden = false;
    void overlay.offsetWidth;
    overlay.classList.add('is-visible');
  };

  const hideOverlay = (): void => {
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!overlay.classList.contains('is-visible')) overlay.hidden = true;
    }, 380);
  };

  /* Put the snake into idle patrol mode */
  const enterIdle = (): void => {
    setSnakeDefault();
    score = 0;
    paused = false;
    dead = false;
    idle = true;
    hideOverlay();
    updateScore();
    placeFood();
  };

  /* Leave idle, keep current position & direction — no reset */
  const beginPlaying = (): void => {
    score = 0;
    paused = false;
    dead = false;
    idle = false;
    hideOverlay();
    updateScore();
  };

  const gameOver = (): void => {
    running = false;
    dead = true;
    idle = false;
    cancelAnimationFrame(loopId);
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        /* ignore */
      }
    }
    draw();
    showOverlay();
  };

  const step = (): void => {
    /* Consume one queued direction per tick for smooth steering */
    const queued = dirQueue.shift();
    if (queued) dir = queued;

    const head = snake[0];
    if (!head) return;
    const nh: Point = { x: head.x + dir.x, y: head.y + dir.y };

    /* Idle patrol — traces the perimeter of a central rectangle.
       Never dies, never leaves the safe zone, never hits itself. */
    if (idle) {
      let turn: Point | null = null;
      if (dir.x === 1 && nh.x > IDLE_MAX) turn = { x: 0, y: -1 };
      else if (dir.y === -1 && nh.y < IDLE_MIN) turn = { x: -1, y: 0 };
      else if (dir.x === -1 && nh.x < IDLE_MIN) turn = { x: 0, y: 1 };
      else if (dir.y === 1 && nh.y > IDLE_MAX) turn = { x: 1, y: 0 };

      if (turn) {
        dir = turn;
        dirQueue = [];
      }

      snake.unshift({ x: head.x + dir.x, y: head.y + dir.y });
      snake.pop();
      return;
    }

    if (nh.x < 0 || nh.x >= GRID || nh.y < 0 || nh.y >= GRID) {
      gameOver();
      return;
    }

    if (snake.some((s) => s.x === nh.x && s.y === nh.y)) {
      gameOver();
      return;
    }

    snake.unshift(nh);

    if (nh.x === food.x && nh.y === food.y) {
      score += 1;
      updateScore();
      placeFood();
    } else {
      snake.pop();
    }
  };

  /* Soft diffused teal frame around the play area */
  const drawWalls = (): void => {
    const inset = 4;
    const x = inset;
    const y = inset;
    const w = W - inset * 2;
    const h = H - inset * 2;

    ctx.save();

    ctx.shadowColor = 'rgba(92, 184, 172, 0.9)';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = 'rgba(92, 184, 172, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(92, 184, 172, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.shadowBlur = 4;
    ctx.strokeStyle = 'rgba(123, 208, 195, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
  };

  const draw = (): void => {
    ctx.fillStyle = '#0a0a0b';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(92, 184, 172, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i += 1) {
      const p = i * CELL + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(W, p);
      ctx.stroke();
    }

    drawWalls();

    /* Food: hide during idle patrol and after death */
    if (!idle && !dead) {
      ctx.fillStyle = '#ff5f57';
      ctx.shadowColor = 'rgba(255, 95, 87, 0.7)';
      ctx.shadowBlur = 14;
      ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowBlur = 0;
    }

    snake.forEach((s, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#7bd0c3' : '#5cb8ac';
      ctx.shadowColor = isHead
        ? 'rgba(123, 208, 195, 0.8)'
        : 'rgba(92, 184, 172, 0.3)';
      ctx.shadowBlur = isHead ? 18 : 6;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;
  };

  const frame = (now: number): void => {
    if (!running) return;
    if (last === 0) last = now;
    /* Cap dt so tab-unfocus doesn't trigger a chain of steps */
    const dt = Math.min(now - last, MAX_DT);
    last = now;

    if (!paused) {
      acc += dt;
      while (acc >= TICK_MS) {
        acc -= TICK_MS;
        step();
        if (!running) return;
      }
    }

    draw();
    loopId = requestAnimationFrame(frame);
  };

  const startLoop = (): void => {
    running = true;
    last = 0;
    acc = 0;
    cancelAnimationFrame(loopId);
    loopId = requestAnimationFrame(frame);
  };

  const newGame = (): void => {
    setSnakeDefault();
    beginPlaying();
    placeFood();
    startLoop();
  };

  /* Queue a direction change; reject 180° reversals against the last
     pending direction so rapid inputs can't make the snake eat itself. */
  const queueDirection = (key: string): void => {
    const lastDir = dirQueue.length > 0 ? dirQueue[dirQueue.length - 1]! : dir;

    let candidate: Point | null = null;

    if (key === 'arrowup' || key === 'w') {
      if (lastDir.y !== 1) candidate = { x: 0, y: -1 };
    } else if (key === 'arrowdown' || key === 's') {
      if (lastDir.y !== -1) candidate = { x: 0, y: 1 };
    } else if (key === 'arrowleft' || key === 'a') {
      if (lastDir.x !== 1) candidate = { x: -1, y: 0 };
    } else if (key === 'arrowright' || key === 'd') {
      if (lastDir.x !== -1) candidate = { x: 1, y: 0 };
    }

    if (!candidate) return;
    if (dirQueue.length >= DIR_QUEUE_MAX) return;

    /* Skip if identical to the last pending direction */
    if (lastDir.x === candidate.x && lastDir.y === candidate.y) return;

    dirQueue.push(candidate);
  };

  window.addEventListener('keydown', (e) => {
    /* Don't hijack keys while the user is typing in an input/textarea */
    const active = document.activeElement as HTMLElement | null;
    if (active) {
      const tag = active.tagName.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        active.isContentEditable
      ) {
        return;
      }
    }

    const key = e.key.toLowerCase();
    const isGameKey = [
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
      'w',
      'a',
      's',
      'd',
      ' ',
    ].includes(key);

    if (!isGameKey) return;
    if (!canvas.isConnected) return;

    const rect = canvas.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    e.preventDefault();

    if (key === ' ') {
      if (!running && dead) {
        newGame();
        return;
      }
      if (idle) {
        beginPlaying();
        return;
      }
      if (running) paused = !paused;
      return;
    }

    if (idle) beginPlaying();
    if (!running || idle) return;

    queueDirection(key);
  });

  /* Touch / pointer steering:
     - First tap starts the game if idle
     - Swipe up/down/left/right queues a direction */
  let swipeStart: { x: number; y: number; id: number } | null = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (idle) {
      beginPlaying();
      return;
    }
    swipeStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!swipeStart || swipeStart.id !== e.pointerId) {
      swipeStart = null;
      return;
    }

    const dx = e.clientX - swipeStart.x;
    const dy = e.clientY - swipeStart.y;
    swipeStart = null;

    if (!running || idle) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < SWIPE_MIN) return;

    if (absDx > absDy) {
      queueDirection(dx > 0 ? 'arrowright' : 'arrowleft');
    } else {
      queueDirection(dy > 0 ? 'arrowdown' : 'arrowup');
    }
  });

  canvas.addEventListener('pointercancel', () => {
    swipeStart = null;
  });

  restartBtn?.addEventListener('click', (e) => {
    (e.currentTarget as HTMLButtonElement).blur();
    newGame();
  });
  overlayRestartBtn?.addEventListener('click', (e) => {
    (e.currentTarget as HTMLButtonElement).blur();
    newGame();
  });

  /* Auto-pause when the tab is hidden — user shouldn't come back to a dead snake */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && !idle && !dead && !paused) {
      paused = true;
    }
  });

  enterIdle();
  startLoop();
}

import { cssVar } from '../utils/color.js';

const GRID = 20;
const CELL = 16;
const TICK_MS_DESKTOP = 110;
const TICK_MS_TOUCH = 140;
const BEST_KEY = 'snake_best';
const DIFF_KEY = 'snake_difficulty';

/* idle patrol bounds */
const IDLE_MIN = 4;
const IDLE_MAX = GRID - 5;

/* food padding */
const FOOD_PAD = 2;
const FOOD_MIN_DIST_FROM_HEAD = 4;

/* dt cap per frame */
const MAX_DT_FACTOR = 3;

/* direction queue */
const DIR_QUEUE_MAX = 3;

/* swipe */
const SWIPE_MIN = 18;
const SWIPE_DEADZONE = 1.3;

type Difficulty = 'low' | 'medium' | 'high';
const DIFFICULTY_FACTOR: Record<Difficulty, number> = {
  low: 0.5,
  medium: 0.75,
  high: 1,
};
const DEFAULT_DIFFICULTY: Difficulty = 'high';

const isDifficulty = (v: string | null | undefined): v is Difficulty =>
  v === 'low' || v === 'medium' || v === 'high';

type Point = { x: number; y: number };

type SnakeColors = {
  bg: string;
  grid: string;
  wallGlow: string;
  wallOuter: string;
  wallMid: string;
  wallInner: string;
  snake: string;
  head: string;
  headGlow: string;
  bodyGlow: string;
  food: string;
  foodGlow: string;
};

/* fallbacks used only if CSS custom properties are missing */
const FALLBACK: SnakeColors = {
  bg: '#0a0a0b',
  grid: 'rgba(92, 184, 172, 0.07)',
  wallGlow: 'rgba(92, 184, 172, 0.9)',
  wallOuter: 'rgba(92, 184, 172, 0.35)',
  wallMid: 'rgba(92, 184, 172, 0.55)',
  wallInner: 'rgba(123, 208, 195, 0.85)',
  snake: '#5cb8ac',
  head: '#7bd0c3',
  headGlow: 'rgba(123, 208, 195, 0.8)',
  bodyGlow: 'rgba(92, 184, 172, 0.3)',
  food: '#f4f4f5',
  foodGlow: 'rgba(244, 244, 245, 0.7)',
};

function readSnakeColors(): SnakeColors {
  return {
    bg: cssVar('--snake-bg', FALLBACK.bg),
    grid: cssVar('--snake-grid', FALLBACK.grid),
    wallGlow: cssVar('--snake-wall-glow', FALLBACK.wallGlow),
    wallOuter: cssVar('--snake-wall-outer', FALLBACK.wallOuter),
    wallMid: cssVar('--snake-wall-mid', FALLBACK.wallMid),
    wallInner: cssVar('--snake-wall-inner', FALLBACK.wallInner),
    snake: cssVar('--snake-snake', FALLBACK.snake),
    head: cssVar('--snake-head', FALLBACK.head),
    headGlow: cssVar('--snake-head-glow', FALLBACK.headGlow),
    bodyGlow: cssVar('--snake-body-glow', FALLBACK.bodyGlow),
    food: cssVar('--snake-food', FALLBACK.food),
    foodGlow: cssVar('--snake-food-glow', FALLBACK.foodGlow),
  };
}

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
  const diffButtons =
    document.querySelectorAll<HTMLButtonElement>('.snake-diff-btn');

  if (!canvas || !wrap) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let colors = readSnakeColors();

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const BASE_TICK_MS = isTouch ? TICK_MS_TOUCH : TICK_MS_DESKTOP;

  let difficulty: Difficulty = DEFAULT_DIFFICULTY;
  try {
    const stored = localStorage.getItem(DIFF_KEY);
    if (isDifficulty(stored)) difficulty = stored;
  } catch {
    /* ignore */
  }

  const tickMs = (): number =>
    Math.round(BASE_TICK_MS / DIFFICULTY_FACTOR[difficulty]);

  const maxDt = (): number => tickMs() * MAX_DT_FACTOR;

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

  const applyDifficultyUI = (): void => {
    diffButtons.forEach((btn) => {
      btn.setAttribute(
        'aria-pressed',
        String(btn.dataset['difficulty'] === difficulty),
      );
    });
  };

  const setDifficulty = (next: Difficulty): void => {
    if (next === difficulty) return;
    difficulty = next;
    try {
      localStorage.setItem(DIFF_KEY, next);
    } catch {
      /* ignore */
    }
    applyDifficultyUI();
  };

  applyDifficultyUI();

  diffButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      (e.currentTarget as HTMLButtonElement).blur();
      const value = btn.dataset['difficulty'];
      if (isDifficulty(value)) setDifficulty(value);
    });
  });

  const updateScore = (): void => {
    if (scoreEl) scoreEl.textContent = String(score);
  };

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
    const queued = dirQueue.shift();
    if (queued) dir = queued;

    const head = snake[0];
    if (!head) return;
    const nh: Point = { x: head.x + dir.x, y: head.y + dir.y };

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

  const drawWalls = (): void => {
    const inset = 4;
    const x = inset;
    const y = inset;
    const w = W - inset * 2;
    const h = H - inset * 2;

    ctx.save();

    ctx.shadowColor = colors.wallGlow;
    ctx.shadowBlur = 22;
    ctx.strokeStyle = colors.wallOuter;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    ctx.shadowBlur = 12;
    ctx.strokeStyle = colors.wallMid;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.shadowBlur = 4;
    ctx.strokeStyle = colors.wallInner;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
  };

  const draw = (): void => {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = colors.grid;
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

    if (!idle && !dead) {
      ctx.fillStyle = colors.food;
      ctx.shadowColor = colors.foodGlow;
      ctx.shadowBlur = 14;
      ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowBlur = 0;
    }

    snake.forEach((s, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? colors.head : colors.snake;
      ctx.shadowColor = isHead ? colors.headGlow : colors.bodyGlow;
      ctx.shadowBlur = isHead ? 18 : 6;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;
  };

  const frame = (now: number): void => {
    if (!running) return;
    if (last === 0) last = now;
    const dt = Math.min(now - last, maxDt());
    last = now;

    if (!paused) {
      acc += dt;
      const tick = tickMs();
      while (acc >= tick) {
        acc -= tick;
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

    if (lastDir.x === candidate.x && lastDir.y === candidate.y) return;

    dirQueue.push(candidate);
  };

  window.addEventListener('keydown', (e) => {
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

    /* quick difficulty switch */
    if (key === '1') {
      setDifficulty('low');
      return;
    }
    if (key === '2') {
      setDifficulty('medium');
      return;
    }
    if (key === '3') {
      setDifficulty('high');
      return;
    }

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

  /* swipe / tap */
  let swipeStart: { x: number; y: number; id: number } | null = null;
  let swipeFired = false;

  const trySwipe = (clientX: number, clientY: number): void => {
    if (!swipeStart) return;
    if (!running || idle) return;

    const dx = clientX - swipeStart.x;
    const dy = clientY - swipeStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_MIN) return;

    if (absDx > absDy * SWIPE_DEADZONE) {
      queueDirection(dx > 0 ? 'arrowright' : 'arrowleft');
      swipeFired = true;
      swipeStart = { x: clientX, y: clientY, id: swipeStart.id };
    } else if (absDy > absDx * SWIPE_DEADZONE) {
      queueDirection(dy > 0 ? 'arrowdown' : 'arrowup');
      swipeFired = true;
      swipeStart = { x: clientX, y: clientY, id: swipeStart.id };
    }
  };

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture?.(e.pointerId);

    if (idle) {
      beginPlaying();
      return;
    }

    if (!running && dead) {
      newGame();
      return;
    }

    swipeStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
    swipeFired = false;
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!swipeStart || swipeStart.id !== e.pointerId) return;
    trySwipe(e.clientX, e.clientY);
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!swipeStart || swipeStart.id !== e.pointerId) {
      swipeStart = null;
      return;
    }
    if (!swipeFired) {
      trySwipe(e.clientX, e.clientY);
    }
    swipeStart = null;
    swipeFired = false;
  });

  canvas.addEventListener('pointercancel', () => {
    swipeStart = null;
    swipeFired = false;
  });

  restartBtn?.addEventListener('click', (e) => {
    (e.currentTarget as HTMLButtonElement).blur();
    newGame();
  });
  overlayRestartBtn?.addEventListener('click', (e) => {
    (e.currentTarget as HTMLButtonElement).blur();
    newGame();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && !idle && !dead && !paused) {
      paused = true;
    }
  });

  /* re-read CSS custom properties when theme changes */
  window.addEventListener('themechange', () => {
    colors = readSnakeColors();
    draw();
  });

  enterIdle();
  startLoop();
}

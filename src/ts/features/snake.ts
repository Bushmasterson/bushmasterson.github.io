const GRID = 20;
const CELL = 16;
const TICK_MS = 110;
const BEST_KEY = 'snake_best';

export function initSnake(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#snake-canvas');
  const scoreEl = document.querySelector<HTMLElement>('#snake-score');
  const restartBtn =
    document.querySelector<HTMLButtonElement>('#snake-restart');
  const wrap = document.querySelector<HTMLElement>('.snake-canvas-wrap');

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

  type Point = { x: number; y: number };

  let snake: Point[] = [];
  let dir: Point = { x: 1, y: 0 };
  let nextDir: Point = { x: 1, y: 0 };
  let food: Point = { x: 0, y: 0 };
  let score = 0;
  let best = 0;
  let running = false;
  let paused = false;
  let dead = false;
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

  const placeFood = (): void => {
    for (let attempts = 0; attempts < 500; attempts += 1) {
      const p: Point = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
      if (!snake.some((s) => s.x === p.x && s.y === p.y)) {
        food = p;
        return;
      }
    }
    food = { x: 0, y: 0 };
  };

  const reset = (): void => {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    paused = false;
    dead = false;
    wrap.classList.remove('snake-over');
    updateScore();
    placeFood();
  };

  const gameOver = (): void => {
    running = false;
    dead = true;
    cancelAnimationFrame(loopId);
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        /* ignore */
      }
    }
    wrap.classList.add('snake-over');
    draw();
  };

  const step = (): void => {
    dir = nextDir;
    const head = snake[0];
    if (!head) return;
    const nh: Point = { x: head.x + dir.x, y: head.y + dir.y };

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

    ctx.fillStyle = '#ff5f57';
    ctx.shadowColor = 'rgba(255, 95, 87, 0.7)';
    ctx.shadowBlur = 14;
    ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
    ctx.shadowBlur = 0;

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
    const dt = now - last;
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

  const start = (): void => {
    reset();
    running = true;
    last = 0;
    acc = 0;
    cancelAnimationFrame(loopId);
    loopId = requestAnimationFrame(frame);
  };

  window.addEventListener('keydown', (e) => {
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
      if (!running && dead) start();
      else if (running) paused = !paused;
      return;
    }

    if (!running) return;

    if (key === 'arrowup' || key === 'w') {
      if (dir.y !== 1) nextDir = { x: 0, y: -1 };
    } else if (key === 'arrowdown' || key === 's') {
      if (dir.y !== -1) nextDir = { x: 0, y: 1 };
    } else if (key === 'arrowleft' || key === 'a') {
      if (dir.x !== 1) nextDir = { x: -1, y: 0 };
    } else if (key === 'arrowright' || key === 'd') {
      if (dir.x !== -1) nextDir = { x: 1, y: 0 };
    }
  });

  restartBtn?.addEventListener('click', start);

  start();
}

import { CFG } from '../config.js';
import type { Particle } from '../types.js';
import { cssVar, rgbTriple } from '../utils/color.js';

export function initParticles(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): void {
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles: Particle[] = [];
  let connectDistance = CFG.connectDistance;
  let connectDistance2 = connectDistance * connectDistance;

  let cursorRGB = '255,255,255';
  let lineRGB = '212,212,212';
  let starRGB = '212,212,212';

  const pointer = { x: null as number | null, y: null as number | null };

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  function readColors(): void {
    cursorRGB = rgbTriple(
      cssVar('--cursor-line', 'rgba(255,255,255,0.14)'),
      '255,255,255',
    );
    lineRGB = rgbTriple(
      cssVar('--star-line', 'rgba(212,212,212,1)'),
      '212,212,212',
    );
    starRGB = rgbTriple(
      cssVar('--star-fill', 'rgba(212,212,212,1)'),
      '212,212,212',
    );
  }

  readColors();

  function pickDepth(): number {
    return Math.random() ** 1.6;
  }

  function createParticle(): Particle {
    const depth = pickDepth();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + depth * 1.6 + Math.random() * 0.4,
      speed: 0.25 + depth * 0.9 + (Math.random() - 0.5) * 0.08,
      drift: (Math.random() - 0.5) * (0.06 + depth * 0.22),
      depth,
      baseAlpha: 0.25 + depth * 0.45 + Math.random() * 0.15,
      twinkleSpeed:
        CFG.twinkleSpeedMin +
        Math.random() * (CFG.twinkleSpeedMax - CFG.twinkleSpeedMin),
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }

  function resetCanvas(): void {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const compact = Math.max(width, height) < CFG.breakpoint;
    connectDistance = compact
      ? CFG.connectDistanceCompact
      : CFG.connectDistance;
    connectDistance2 = connectDistance * connectDistance;

    const density = compact ? CFG.densityFar * 1.4 : CFG.densityFar;
    const targetCount = Math.max(
      CFG.countMin,
      Math.min(CFG.countMax, Math.round((width * height) / density)),
    );

    if (particles.length !== targetCount) {
      particles = Array.from({ length: targetCount }, createParticle);
    }
  }

  function updateParticle(p: Particle): void {
    p.y += p.speed;
    p.x += p.drift;

    if (p.y > height + 20) {
      p.y = -20;
      p.x = Math.random() * width;
      p.drift = (Math.random() - 0.5) * (0.06 + p.depth * 0.22);
    }

    if (p.x < -20) p.x = width + 20;
    else if (p.x > width + 20) p.x = -20;
  }

  function updatePointer(event: PointerEvent): void {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function clearPointer(): void {
    pointer.x = null;
    pointer.y = null;
  }

  function draw(): void {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(updateParticle);

    ctx.lineWidth = CFG.baseLineWidth;

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i]!;

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance2 = dx * dx + dy * dy;

        if (distance2 >= connectDistance2) continue;

        const alpha = (1 - distance2 / connectDistance2) * CFG.lineAlpha;
        ctx.strokeStyle = `rgba(${lineRGB},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    if (pointer.x !== null && pointer.y !== null) {
      const targetX = pointer.x;
      const targetY = pointer.y;
      const maxDistance = connectDistance * 1.5;
      const maxDistance2 = maxDistance * maxDistance;

      const nearest: { p: Particle; d2: number }[] = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        const dx = p.x - targetX;
        const dy = p.y - targetY;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDistance2) nearest.push({ p, d2 });
      }
      nearest.sort((a, b) => a.d2 - b.d2);

      ctx.lineWidth = CFG.cursorLineWidth;
      const count = Math.min(CFG.cursorNearest, nearest.length);

      for (let i = 0; i < count; i++) {
        const { p, d2 } = nearest[i]!;
        const alpha = (1 - d2 / maxDistance2) * CFG.cursorLineAlpha;
        ctx.strokeStyle = `rgba(${cursorRGB},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }

      ctx.lineWidth = CFG.baseLineWidth;
    }

    const time = performance.now() * 0.001;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const twinkle =
        0.65 + 0.35 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
      const alpha = p.baseAlpha * twinkle;

      if (p.depth > 0.7) {
        ctx.shadowBlur = 6 * p.depth;
        ctx.shadowColor = `rgba(${starRGB},${alpha * 0.4})`;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${starRGB},${alpha})`;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  resetCanvas();

  if (!reducedMotion) {
    window.addEventListener('resize', resetCanvas);
    document.addEventListener('pointermove', updatePointer);
    document.addEventListener('pointerleave', clearPointer);
    document.addEventListener('pointercancel', clearPointer);
    window.addEventListener('themechange', readColors);
    requestAnimationFrame(draw);
  } else {
    canvas.style.display = 'none';
  }
}

import { CFG } from '../config.js';
import type { Particle } from '../types.js';
import { cssVar, rgbTriple } from '../utils/color.js';

export function initParticles(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles: Particle[] = [];
  let connectDistance = CFG.connectDistance;
  let connectDistance2 = connectDistance * connectDistance;
  let invConnectDistance2 = 1 / connectDistance2;

  const targetPointer = { x: null as number | null, y: null as number | null };
  const pointer = { x: 0, y: 0, active: false };

  const cursorRGB = rgbTriple(cssVar('--cursor-line', 'rgba(255,255,255,0.14)'));
  const lineRGB = '212,212,212';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastTime = performance.now();

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
        CFG.twinkleSpeedMin + Math.random() * (CFG.twinkleSpeedMax - CFG.twinkleSpeedMin),
      twinklePhase: Math.random() * Math.PI * 2,
      fade: 0,
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
    connectDistance = compact ? CFG.connectDistanceCompact : CFG.connectDistance;
    connectDistance2 = connectDistance * connectDistance;
    invConnectDistance2 = 1 / connectDistance2;

    const density = compact ? CFG.densityFar * 1.4 : CFG.densityFar;
    const targetCount = Math.max(
      CFG.countMin,
      Math.min(CFG.countMax, Math.round((width * height) / density)),
    );

    if (particles.length !== targetCount) {
      particles = Array.from({ length: targetCount }, createParticle);
    }
  }

  function updateParticle(p: Particle, dt: number): void {
    p.y += p.speed * dt * 60 * 0.016;
    p.x += p.drift * dt * 60 * 0.016;

    if (p.fade < 1) p.fade = Math.min(1, p.fade + dt * 0.6);

    if (p.y > height + 20) {
      p.y = -20;
      p.x = Math.random() * width;
      p.drift = (Math.random() - 0.5) * (0.06 + p.depth * 0.22);
      p.fade = 0;
    }

    if (p.x < -20) p.x = width + 20;
    else if (p.x > width + 20) p.x = -20;
  }

  function updatePointer(event: PointerEvent): void {
    targetPointer.x = event.clientX;
    targetPointer.y = event.clientY;
    if (!pointer.active) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }
  }

  function clearPointer(): void {
    targetPointer.x = null;
    targetPointer.y = null;
    pointer.active = false;
  }

  function drawParticleLines(offsetX: number, offsetY: number): void {
    ctx.lineWidth = CFG.baseLineWidth;

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i]!;
      const ax = a.x + offsetX * CFG.parallax * a.depth;
      const ay = a.y + offsetY * CFG.parallax * a.depth;

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j]!;
        const bx = b.x + offsetX * CFG.parallax * b.depth;
        const by = b.y + offsetY * CFG.parallax * b.depth;

        const dx = ax - bx;
        const dy = ay - by;
        const distance2 = dx * dx + dy * dy;

        if (distance2 >= connectDistance2) continue;

        const t = 1 - distance2 * invConnectDistance2;
        const alpha = t * t * CFG.lineAlpha * Math.min(a.fade, b.fade);

        ctx.strokeStyle = `rgba(${lineRGB},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
  }

  function drawCursorLines(): void {
    if (!pointer.active) return;

    const maxDistance = connectDistance * 1.5;
    const maxDistance2 = maxDistance * maxDistance;
    const invMaxDistance2 = 1 / maxDistance2;

    const nearest: { p: Particle; d2: number }[] = [];
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < maxDistance2) nearest.push({ p, d2 });
    }
    nearest.sort((a, b) => a.d2 - b.d2);

    ctx.lineWidth = CFG.cursorLineWidth;
    const count = Math.min(CFG.cursorNearest, nearest.length);

    for (let i = 0; i < count; i++) {
      const { p, d2 } = nearest[i]!;
      const t = 1 - d2 * invMaxDistance2;
      const alpha = t * t * CFG.cursorLineAlpha * p.fade;

      ctx.strokeStyle = `rgba(${cursorRGB},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
    }

    ctx.lineWidth = CFG.baseLineWidth;
  }

  function drawStars(now: number): void {
    const time = now * 0.001;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!;
      const twinkle = 0.65 + 0.35 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
      const alpha = p.baseAlpha * twinkle * p.fade;
      if (alpha <= 0.001) continue;

      if (p.depth > 0.7) {
        ctx.shadowBlur = 6 * p.depth;
        ctx.shadowColor = `rgba(212,212,212,${alpha * 0.4})`;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,212,212,${alpha})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function draw(now: number): void {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    if (targetPointer.x !== null && targetPointer.y !== null) {
      pointer.x += (targetPointer.x - pointer.x) * CFG.pointerLerp;
      pointer.y += (targetPointer.y - pointer.y) * CFG.pointerLerp;
    }

    for (let i = 0; i < particles.length; i++) {
      updateParticle(particles[i]!, dt);
    }

    const px = pointer.active ? pointer.x : width / 2;
    const py = pointer.active ? pointer.y : height / 2;
    const offsetX = (px - width / 2) / (width / 2);
    const offsetY = (py - height / 2) / (height / 2);

    drawParticleLines(offsetX, offsetY);
    drawCursorLines();
    drawStars(now);

    requestAnimationFrame(draw);
  }

  resetCanvas();

  if (!reducedMotion) {
    window.addEventListener('resize', resetCanvas);
    document.addEventListener('pointermove', updatePointer);
    document.addEventListener('pointerleave', clearPointer);
    document.addEventListener('pointercancel', clearPointer);
    requestAnimationFrame(draw);
  } else {
    canvas.style.display = 'none';
  }
}

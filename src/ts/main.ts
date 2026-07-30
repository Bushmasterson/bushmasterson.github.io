const canvas = document.querySelector<HTMLCanvasElement>('#particles-canvas')!;
const backToTopEl = document.querySelector<HTMLButtonElement>('#back-to-top');
const ctx = canvas.getContext('2d')!;

if (canvas && ctx) {
        type Particle = { x: number; y: number; r: number; speed: number; drift: number };

        let width = 0;
        let height = 0;
        let particles: Particle[] = [];
        let connectDistance = 160;
        let connectDistance2 = connectDistance * connectDistance;
        let fallSpeed = 0.7;

        const pointer = { x: null as number | null, y: null as number | null };
        const starFill = 'rgba(212,212,212,0.38)';
        const lineAlpha = 0.42;
        const mouseLineColor = 'rgba(57,199,185,';
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function createParticle(): Particle {
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 1.6 + 1,
                speed: fallSpeed + (Math.random() - 0.5) * 0.16,
                drift: (Math.random() - 0.5) * 0.2,
            };
        }

        function resetCanvas(): void {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;

            const compact = Math.max(width, height) < 760;
            const targetCount = Math.max(38, Math.min(110, Math.round((width * height) / (compact ? 16000 : 10000))));

            connectDistance = compact ? 120 : 160;
            connectDistance2 = connectDistance * connectDistance;
            fallSpeed = compact ? 0.55 : 0.7;

            if (particles.length !== targetCount) {
                particles = Array.from({ length: targetCount }, createParticle);
            }
        }

        function updateParticle(particle: Particle): void {
            particle.y += particle.speed;
            particle.x += particle.drift;

            if (particle.y > height + 20) {
                particle.y = -20;
                particle.x = Math.random() * width;
                particle.drift = (Math.random() - 0.5) * 0.2;
            }

            if (particle.x < -20) {
                particle.x = width + 20;
            } else if (particle.x > width + 20) {
                particle.x = -20;
            }
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
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];

                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance2 = dx * dx + dy * dy;

                    if (distance2 >= connectDistance2) {
                        continue;
                    }

                    const alpha = (1 - distance2 / connectDistance2) * lineAlpha;
                    ctx.strokeStyle = `rgba(212,212,212,${alpha})`;
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

                const nearest = particles
                    .map(particle => ({ particle, distance2: (particle.x - targetX) ** 2 + (particle.y - targetY) ** 2 }))
                    .sort((left, right) => left.distance2 - right.distance2)
                    .slice(0, 3);

                nearest.forEach(({ particle, distance2 }) => {
                    if (distance2 >= maxDistance2) {
                        return;
                    }

                    const alpha = (1 - distance2 / maxDistance2) * 0.28;
                    ctx.strokeStyle = `${mouseLineColor}${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(targetX, targetY);
                    ctx.stroke();
                });
            }

            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
                ctx.fillStyle = starFill;
                ctx.fill();
            });

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

if (backToTopEl) {
    window.addEventListener('scroll', () => {
        backToTopEl.classList.toggle('visible', window.scrollY > 300);
    });

    backToTopEl.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
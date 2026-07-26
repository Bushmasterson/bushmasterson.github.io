// Particle constellation animation
(function initConstellation(): void {
    const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    const mouse = { x: null as number | null, y: null as number | null };
    let mouseStrength = 1.0;
    let lastMouseLeave = 0;
    const FADE_DURATION = 0.11;

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouseStrength = 1.0;
    });
    document.addEventListener('mouseleave', () => {
        lastMouseLeave = performance.now();
        mouse.x = null;
        mouse.y = null;
    });

    const PARTICLE_COUNT = 111;
    const CONNECT_DISTANCE = 166.66;
    const OPACITY = 0.666;
    const FALL_SPEED = 0.666;

    interface Particle {
        x: number;
        y: number;
        r: number;
        speed: number;
        drift: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.8 + 1.2,
            speed: FALL_SPEED + (Math.random() - 0.5) * 0.15,
            drift: (Math.random() - 0.5) * 0.2,
        });
    }

    function animate(time: number): void {
        ctx.clearRect(0, 0, w, h);
        if (mouse.x === null) {
            const elapsed = (time - lastMouseLeave) / 1000;
            mouseStrength = Math.max(0, 1 - elapsed / FADE_DURATION);
        }
        particles.forEach((p) => {
            p.y += p.speed;
            p.x += p.drift * 0.1;
            if (p.y > h + 20) {
                p.y = -20;
                p.x = Math.random() * w;
                p.drift = (Math.random() - 0.5) * 0.2;
            }
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
        });
        // Draw connections between nearby particles
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DISTANCE) {
                    const alpha = Math.round((1 - dist / CONNECT_DISTANCE) * OPACITY * 255).toString(16).padStart(2, '0');
                    ctx.strokeStyle = `#ffffff${alpha}`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        // Draw mouse-to-particle connections
        if (mouseStrength > 0.01) {
            const targetX = mouse.x !== null ? mouse.x : w / 2;
            const targetY = mouse.y !== null ? mouse.y : h / 2;
            const nearby = particles
                .map((p) => ({ p, dist: Math.sqrt((p.x - targetX) * (p.x - targetX) + (p.y - targetY) * (p.y - targetY)) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 3);
            nearby.forEach(({ p, dist }) => {
                if (dist < CONNECT_DISTANCE * 1.5 * mouseStrength) {
                    const alpha = Math.round((1 - dist / (CONNECT_DISTANCE * 1.5)) * 0.4 * mouseStrength * 255).toString(16).padStart(2, '0');
                    ctx.strokeStyle = `#ffffff${alpha}`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(targetX, targetY);
                    ctx.stroke();
                }
            });
        }

        // Draw particles with animated size
        particles.forEach((p) => {
            const size = p.r * (0.8 + 0.4 * Math.sin(time * 0.003 + p.y));
            const opacityValue = Math.round((OPACITY + 0.2) * 255);
            const alpha = Math.round(opacityValue).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `#ffffff${alpha}`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate(performance.now());
})();

// Back to top button scroll behavior
const backToTop = document.getElementById('back-to-top') as HTMLButtonElement;
window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 300);
});
backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
"use strict";
// ============================================================================
// Particle Constellation Animation
// ============================================================================
(function initConstellation() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d');
    // Set canvas size and handle window resize events
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });
    // Track mouse position and strength for particle interactions
    const mouse = { x: null, y: null };
    let mouseStrength = 1.0;
    let lastMouseLeave = 0;
    // Animation configuration constants
    const FADE_DURATION = 0.11;
    const PARTICLE_COUNT = 111;
    const CONNECT_DISTANCE = 166.66;
    const OPACITY = 0.555; // Refined for softer, more melancholic appearance
    const FALL_SPEED = 0.666;
    const SPEED_VARIATION = 0.15;
    const DRIFT_RANGE = 0.2;
    const PARTICLE_SIZE_MIN = 1.2;
    const PARTICLE_SIZE_MAX = 3.0;
    const MOUSE_CONNECTION_DISTANCE_MULTIPLIER = 1.5;
    const MOUSE_CONNECTION_OPACITY = 0.35; // Refined for calmer mouse interactions
    const PARTICLE_LINE_WIDTH = 0.5;
    const MOUSE_LINE_WIDTH = 0.8;
    // Create particles with random positions, sizes, and speeds
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
            speed: FALL_SPEED + (Math.random() - 0.5) * SPEED_VARIATION,
            drift: (Math.random() - 0.5) * DRIFT_RANGE,
        });
    }
    // Monitor mouse movement and leaving for particle interaction updates
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
    function drawConnections() {
        ctx.lineWidth = PARTICLE_LINE_WIDTH;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DISTANCE) {
                    const alpha = Math.round((1 - dist / CONNECT_DISTANCE) * OPACITY * 255).toString(16).padStart(2, '0');
                    // Use balanced white with soft opacity for calm, intentional feel
                    ctx.strokeStyle = `#d4d4d4${alpha}`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }
    function drawMouseConnections(targetX, targetY) {
        const nearby = particles
            .map((p) => ({
            p,
            dist: Math.sqrt((p.x - targetX) * (p.x - targetX) + (p.y - targetY) * (p.y - targetY))
        }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 3);
        nearby.forEach(({ p, dist }) => {
            const maxDist = CONNECT_DISTANCE * MOUSE_CONNECTION_DISTANCE_MULTIPLIER * mouseStrength;
            if (dist < maxDist) {
                const alpha = Math.round((1 - dist / (CONNECT_DISTANCE * MOUSE_CONNECTION_DISTANCE_MULTIPLIER)) *
                    MOUSE_CONNECTION_OPACITY *
                    mouseStrength *
                    255).toString(16).padStart(2, '0');
                // Use teal accent for intentional, calm mouse interactions
                ctx.strokeStyle = `#39C7B9${alpha}`;
                ctx.lineWidth = MOUSE_LINE_WIDTH;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(targetX, targetY);
                ctx.stroke();
            }
        });
    }
    function drawParticles() {
        particles.forEach((p) => {
            const opacityValue = Math.round(OPACITY * 255);
            const alpha = opacityValue.toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            // Use softer white (#d4d4d4) instead of harsh white for melancholic feel
            ctx.fillStyle = `#d4d4d4${alpha}`;
            ctx.fill();
        });
    }
    function updateParticles() {
        particles.forEach((p) => {
            p.y += p.speed;
            p.x += p.drift * 0.1;
            // Reset particles wrapping to opposite edge of screen
            if (p.y > h + 20) {
                p.y = -20;
                p.x = Math.random() * w;
                p.drift = (Math.random() - 0.5) * DRIFT_RANGE;
            }
            if (p.x < -20)
                p.x = w + 20;
            if (p.x > w + 20)
                p.x = -20;
        });
    }
    function animate(time) {
        ctx.clearRect(0, 0, w, h);
        // Fade mouse strength effect when cursor leaves canvas
        if (mouse.x === null) {
            const elapsed = (time - lastMouseLeave) / 1000;
            mouseStrength = Math.max(0, 1 - elapsed / FADE_DURATION);
        }
        // Update particle positions and render animation frame
        updateParticles();
        drawConnections();
        if (mouseStrength > 0.01) {
            const targetX = mouse.x !== null ? mouse.x : w / 2;
            const targetY = mouse.y !== null ? mouse.y : h / 2;
            drawMouseConnections(targetX, targetY);
        }
        drawParticles();
        requestAnimationFrame(animate);
    }
    animate(performance.now());
})();
// ============================================================================
// Back to Top Button
// ============================================================================
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 300);
});
backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

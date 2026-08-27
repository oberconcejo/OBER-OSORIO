import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
}

export const LusionBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 60; // Highly optimized limit

    // Handle high DPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4, // Very soft movement
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        targetAlpha: Math.random() * 0.5 + 0.1
      });
    }

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const draw = () => {
      // Clear canvas with subtle trailing motion blur
      ctx.fillStyle = 'rgba(11, 13, 17, 0.08)'; // Matches Google Antigravity dark background
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      const mouse = mouseRef.current;



      // Draw constellations and update particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // 1. Organic flow field noise simulation (fluid currents)
        const time = Date.now() * 0.0008;
        const noiseX = Math.sin(p1.y * 0.004 + time) * 0.05;
        const noiseY = Math.cos(p1.x * 0.004 + time) * 0.05;
        p1.vx += noiseX;
        p1.vy += noiseY;

        // 2. Mouse dynamic fluid repulsion (push away particles to keep cursor area clean and prevent swarming)
        if (mouse.active) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p1.vx += (dx / dist) * force * 0.09;
            p1.vy += (dy / dist) * force * 0.09;
          }
        }

        // 3. Fluid friction/damping (velocity deceleration)
        p1.vx *= 0.95;
        p1.vy *= 0.95;

        // 4. Update coordinates
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on boundaries
        if (p1.x < 0 || p1.x > window.innerWidth) {
          p1.vx *= -1;
          p1.x = Math.max(0, Math.min(p1.x, window.innerWidth));
        }
        if (p1.y < 0 || p1.y > window.innerHeight) {
          p1.vy *= -1;
          p1.y = Math.max(0, Math.min(p1.y, window.innerHeight));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 180, 248, ${p1.alpha})`; // Google active light blue particle
        ctx.fill();

        // Connect lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (120 - dist) / 120 * 0.15; // Soft opacity connection line
            ctx.strokeStyle = `rgba(138, 180, 248, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

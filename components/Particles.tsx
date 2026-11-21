import React, { useEffect, useRef, memo } from 'react';

interface ParticlesProps {
  count: number;
  enabled: boolean;
  pixelMode?: boolean;
}

const PARTICLE_COLORS = [
  '74, 222, 128',
  '34, 197, 94',
  '132, 204, 22',
  '16, 185, 129',
  '167, 139, 250'
];

const Particles: React.FC<ParticlesProps> = ({ count, enabled, pixelMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!enabled || count <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isMobile = window.innerWidth < 768;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    interface ParticleItem {
      x: number;
      y: number;
      size: number;
      density: number;
      color: string;
      angle: number;
      velocity: number;
      opacity: number;
      opacitySpeed: number;
      directionX: number;
      directionY: number;
    }

    let particles: ParticleItem[] = [];

    const createParticle = (): ParticleItem => {
      const baseSize = Math.random() * (isMobile ? 1.5 : 2.5) + 0.5;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: pixelMode ? Math.max(2, baseSize * 1.5) : baseSize,
        density: Math.random() * 10 + 2,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        directionX: Math.random() * 0.4 - 0.2,
        directionY: Math.random() * 0.4 - 0.2,
        angle: Math.random() * 360,
        velocity: Math.random() * 0.02 + 0.005,
        opacity: Math.random() * 0.5,
        opacitySpeed: Math.random() * 0.005 + 0.002
      };
    };

    const init = () => {
      isMobile = window.innerWidth < 768;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = !pixelMode;

      particles = Array.from({ length: count }, createParticle);
    };

    const stopLoop = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const animate = () => {
      if (document.hidden) {
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const forceDistance = isMobile ? 80 : 150;
      const forceDistSq = forceDistance * forceDistance;
      const w = canvas.width;
      const h = canvas.height;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.directionX;
        p.y += p.directionY;

        if (p.x > w + 20) p.x = -20;
        else if (p.x < -20) p.x = w + 20;
        if (p.y > h + 20) p.y = -20;
        else if (p.y < -20) p.y = h + 20;

        p.angle += p.velocity;
        p.x += Math.cos(p.angle) * 0.2;
        p.y += Math.sin(p.angle) * 0.2;

        p.opacity += p.opacitySpeed;
        if (p.opacity >= 0.6 || p.opacity <= 0.1) {
          p.opacitySpeed = -p.opacitySpeed;
        }

        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < forceDistSq && distSq > 0.001) {
          const distance = Math.sqrt(distSq);
          const force = (forceDistance - distance) / forceDistance;
          p.x -= (dx / distance) * force * p.density;
          p.y -= (dy / distance) * force * p.density;
        }

        ctx.fillStyle = `rgba(${p.color}, ${Math.abs(p.opacity)})`;
        if (pixelMode) {
          const side = p.size * 2;
          ctx.fillRect(p.x, p.y, side, side);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const startLoop = () => {
      if (animationFrameId === null && !document.hidden) {
        animate();
      }
    };

    init();
    startLoop();

    const handleResize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      // En móvil evita reiniciar partículas por cambios pequeños de la barra de direcciones al hacer scroll
      if (nextWidth === lastWidth && Math.abs(nextHeight - lastHeight) < 120) {
        return;
      }
      lastWidth = nextWidth;
      lastHeight = nextHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [count, enabled, pixelMode]);

  if (!enabled || count <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        mixBlendMode: 'screen',
        imageRendering: pixelMode ? 'pixelated' : 'auto'
      }}
    />
  );
};

export default memo(Particles);

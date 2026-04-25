
import React, { useEffect, useRef, memo } from 'react';

interface ParticlesProps {
  count: number;
  enabled: boolean;
  pixelMode?: boolean; // Nuevo prop opcional
}

const Particles: React.FC<ParticlesProps> = ({ count, enabled, pixelMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); 

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const isMobile = window.innerWidth < 768;
    
    const colors = [
      '74, 222, 128', 
      '34, 197, 94',  
      '132, 204, 22', 
      '16, 185, 129', 
      '167, 139, 250' 
    ];

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      angle: number;
      velocity: number;
      opacity: number;
      opacitySpeed: number;
      directionX: number;
      directionY: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        
        // Ajustar tamaño para Pixel Mode (un poco más grandes para que se noten los cuadros)
        const baseSize = Math.random() * (isMobile ? 1.5 : 2.5) + 0.5;
        this.size = pixelMode ? Math.max(2, baseSize * 1.5) : baseSize;
        
        this.density = (Math.random() * 10) + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.directionX = (Math.random() * 0.4) - 0.2; 
        this.directionY = (Math.random() * 0.4) - 0.2;
        
        this.angle = Math.random() * 360;
        this.velocity = Math.random() * 0.02 + 0.005;
        
        this.opacity = Math.random() * 0.5; 
        this.opacitySpeed = Math.random() * 0.005 + 0.002;
      }

      update(mouseX: number, mouseY: number) {
        this.x += this.directionX;
        this.y += this.directionY;

        if (this.x > canvas!.width + 20) this.x = -20;
        if (this.x < -20) this.x = canvas!.width + 20;
        if (this.y > canvas!.height + 20) this.y = -20;
        if (this.y < -20) this.y = canvas!.height + 20;

        this.angle += this.velocity;
        
        // Movimiento ligeramente más robótico/lineal en pixel mode opcionalmente, 
        // pero mantener el float suave queda bien con cuadrados también.
        this.x += Math.cos(this.angle) * 0.2;
        this.y += Math.sin(this.angle) * 0.2;

        this.opacity += this.opacitySpeed;
        if (this.opacity >= 0.6 || this.opacity <= 0.1) {
            this.opacitySpeed = -this.opacitySpeed;
        }

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDistance = isMobile ? 80 : 150;

        if (distance < forceDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = forceDistance;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * this.density;
            const directionY = forceDirectionY * force * this.density;

            this.x -= directionX;
            this.y -= directionY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        
        if (pixelMode) {
            // DIBUJAR CUADRADOS (Pixel Art Style)
            // No usamos arc, usamos rect
            ctx.rect(this.x, this.y, this.size * 2, this.size * 2);
        } else {
            // DIBUJAR CÍRCULOS (Estilo original)
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }
        
        ctx.fillStyle = `rgba(${this.color}, ${Math.abs(this.opacity)})`;
        ctx.fill();
        
        // En modo pixel, quitamos el shadowBlur para bordes duros (crisp edges)
        if (!isMobile && this.opacity > 0.3 && this.size > 2 && !pixelMode) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = `rgba(${this.color}, 0.3)`;
        } else {
            ctx.shadowBlur = 0;
        }
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // En modo pixel, deshabilitamos el suavizado de imagen para bordes duros
      if (pixelMode) {
          ctx.imageSmoothingEnabled = false;
      }
      
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update(mouseRef.current.x, mouseRef.current.y);
        p.draw();
      });
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.x;
        mouseRef.current.y = e.y;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        if(e.touches.length > 0) {
            mouseRef.current.x = e.touches[0].clientX;
            mouseRef.current.y = e.touches[0].clientY;
        }
    };

    const handleMouseLeave = () => {
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [count, enabled, pixelMode]); // Re-run if pixelMode changes

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ 
          mixBlendMode: 'screen',
          // Asegurar renderizado pixelado si está activo
          imageRendering: pixelMode ? 'pixelated' : 'auto' 
      }} 
    />
  );
};

export default memo(Particles);

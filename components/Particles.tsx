import React, { useEffect, useRef, memo } from 'react';

const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Configuración según dispositivo
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 75;

    // Paleta de colores "Pepe Magic Swamp"
    const colors = [
      '74, 222, 128', // Green-400 (Neon)
      '34, 197, 94',  // Green-500 (Classic Pepe)
      '132, 204, 22', // Lime-500 (Toxic)
      '16, 185, 129', // Emerald-500 (Deep)
      '250, 204, 21'  // Yellow-400 (Firefly glow - sutil)
    ];

    class Particle {
      x: number;
      y: number;
      baseX: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
      angle: number;
      spinSpeed: number;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.size = Math.random() * (isMobile ? 2 : 3) + 0.5;
        this.speedY = Math.random() * 0.3 + 0.1; // Subida lenta
        this.speedX = Math.random() * 0.2 - 0.1; // Deriva lateral
        this.opacity = 0;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * 6.2; // Para movimiento senoidal
        this.spinSpeed = Math.random() * 0.02 + 0.005;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100; // Ciclo de vida para fade in/out
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height + 10;
        this.baseX = this.x;
        this.life = 0;
        this.opacity = 0;
      }

      update(mouseX: number, mouseY: number) {
        // Ciclo de vida (Fade In / Fade Out)
        this.life++;
        if (this.life < 50) {
            this.opacity += 0.01; // Fade in
        } else if (this.life > this.maxLife - 50) {
            this.opacity -= 0.01; // Fade out
        }
        
        // Reiniciar si muere o sale de pantalla
        if (this.life >= this.maxLife || this.y < -10 || this.opacity <= 0) {
             if (this.life > 50) this.reset(); // Solo resetear si ya vivió un poco
        }

        // Movimiento orgánico (Seno)
        this.angle += this.spinSpeed;
        this.x = this.baseX + Math.sin(this.angle) * (isMobile ? 10 : 20);
        this.y -= this.speedY;

        // Interacción sutil con el mouse (las partículas huyen un poco)
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceRadius = 100;

        if (distance < forceRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (forceRadius - distance) / forceRadius;
            const directionX = forceDirectionX * force * 1; // Fuerza suave
            const directionY = forceDirectionY * force * 1;

            this.x -= directionX;
            this.y -= directionY;
        }

        // Limitar opacidad máxima
        if (this.opacity > 0.6) this.opacity = 0.6;
        if (this.opacity < 0) this.opacity = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
        
        // Glow effect (costoso, usar con moderación o solo en desktop)
        if (!isMobile) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        } else {
             ctx.shadowBlur = 0;
        }
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Trail effect suave (limpiar con opacidad baja crea estelas)
      // ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Color de fondo dark slate
      // ctx.fillRect(0, 0, canvas.width, canvas.height); 
      // Nota: fillRect con opacidad baja es costoso para rendimiento en móviles baratos.
      // Usaremos clearRect para rendimiento óptimo "liviano".
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update(mouseRef.current.x, mouseRef.current.y);
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
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
    
    // Soporte táctil básico
    const handleTouchMove = (e: TouchEvent) => {
        if(e.touches.length > 0) {
            mouseRef.current.x = e.touches[0].clientX;
            mouseRef.current.y = e.touches[0].clientY;
        }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
};

export default memo(Particles);
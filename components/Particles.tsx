import React, { useEffect, useRef, memo } from 'react';

const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Inicializar lejos para evitar glitch inicial

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Configuración según dispositivo
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 80; // Cantidad equilibrada para no saturar

    // Paleta de colores "Pepe Magic Swamp" (Verdes tóxicos y mágicos)
    const colors = [
      '74, 222, 128', // Green-400 (Neon)
      '34, 197, 94',  // Green-500 (Classic Pepe)
      '132, 204, 22', // Lime-500 (Toxic)
      '16, 185, 129', // Emerald-500 (Deep)
      '167, 139, 250' // Violet (Magic accent - muy sutil)
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
        this.size = Math.random() * (isMobile ? 1.5 : 2.5) + 0.5; // Tamaños variados pero sutiles
        this.density = (Math.random() * 10) + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Movimiento orgánico (Drift)
        // Velocidad muy baja para que sea relajante
        this.directionX = (Math.random() * 0.4) - 0.2; 
        this.directionY = (Math.random() * 0.4) - 0.2;
        
        // Oscilación
        this.angle = Math.random() * 360;
        this.velocity = Math.random() * 0.02 + 0.005;
        
        // Ciclo de vida de opacidad (Pulsación)
        this.opacity = Math.random() * 0.5; 
        this.opacitySpeed = Math.random() * 0.005 + 0.002;
      }

      update(mouseX: number, mouseY: number) {
        // 1. Movimiento Ambiental (Wrap Around - Efecto Pacman en bordes)
        this.x += this.directionX;
        this.y += this.directionY;

        // Si sale por un lado, entra por el otro (mantiene la densidad constante)
        if (this.x > canvas!.width + 20) this.x = -20;
        if (this.x < -20) this.x = canvas!.width + 20;
        if (this.y > canvas!.height + 20) this.y = -20;
        if (this.y < -20) this.y = canvas!.height + 20;

        // 2. Oscilación suave (Flotación)
        this.angle += this.velocity;
        this.x += Math.cos(this.angle) * 0.2;
        this.y += Math.sin(this.angle) * 0.2;

        // 3. Pulsación de Opacidad (Respiración)
        this.opacity += this.opacitySpeed;
        if (this.opacity >= 0.6 || this.opacity <= 0.1) {
            this.opacitySpeed = -this.opacitySpeed;
        }

        // 4. Interacción con Mouse (Repulsión Suave)
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
        // Dibujamos un círculo suave
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // El color tiene la opacidad calculada
        ctx.fillStyle = `rgba(${this.color}, ${Math.abs(this.opacity)})`;
        ctx.fill();
        
        // Brillo sutil solo si la partícula es "grande" y tiene buena opacidad (ahorra recursos)
        if (!isMobile && this.opacity > 0.3 && this.size > 2) {
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
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
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
    
    const handleTouchMove = (e: TouchEvent) => {
        if(e.touches.length > 0) {
            mouseRef.current.x = e.touches[0].clientX;
            mouseRef.current.y = e.touches[0].clientY;
        }
    };

    // Resetear posición del mouse cuando sale para que las partículas vuelvan a su sitio
    const handleMouseLeave = () => {
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseleave', handleMouseLeave); // Detectar salida del documento

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ mixBlendMode: 'screen' }} // Ayuda a que los colores brillen sobre el fondo oscuro
    />
  );
};

export default memo(Particles);
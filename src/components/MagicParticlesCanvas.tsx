import React, { useEffect, useRef } from 'react';

interface MagicParticlesCanvasProps {
  sceneId: number;
  intensity?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

export const MagicParticlesCanvas: React.FC<MagicParticlesCanvasProps> = ({ sceneId, intensity = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 1280);
    let height = (canvas.height = canvas.offsetHeight || 720);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 1280;
      height = canvas.height = canvas.offsetHeight || 720;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const maxParticles = sceneId === 5 ? 75 : sceneId === 6 ? 45 : 20;

    const createParticle = (): Particle => {
      const isMagic = sceneId === 5 || sceneId === 6;
      const x = isMagic
        ? width * 0.5 + (Math.random() - 0.5) * (width * 0.45)
        : Math.random() * width;
      const y = isMagic
        ? height * 0.65 + (Math.random() - 0.5) * (height * 0.3)
        : height * 0.85 + Math.random() * (height * 0.15);

      return {
        x,
        y,
        size: isMagic ? Math.random() * 4 + 1.5 : Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: isMagic ? -(Math.random() * 1.8 + 0.8) : -(Math.random() * 1.2 + 0.5),
        opacity: 0,
        maxOpacity: Math.random() * 0.7 + 0.3,
        hue: isMagic ? 42 + Math.random() * 15 : 25 + Math.random() * 20,
        life: 0,
        maxLife: Math.random() * 120 + 60,
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (sceneId === 5 || sceneId === 6) {
        const pulse = Math.sin(frame * 0.05) * 0.15 + 0.85;
        const radialGradient = ctx.createRadialGradient(
          width * 0.5,
          height * 0.6,
          20,
          width * 0.5,
          height * 0.6,
          width * (sceneId === 5 ? 0.4 : 0.35) * pulse
        );
        radialGradient.addColorStop(0, 'rgba(255, 230, 120, 0.28)');
        radialGradient.addColorStop(0.4, 'rgba(250, 200, 60, 0.12)');
        radialGradient.addColorStop(1, 'rgba(250, 190, 40, 0)');
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, width, height);

        if (sceneId === 5) {
          ctx.save();
          ctx.translate(width * 0.5, height * 0.6);
          ctx.rotate(frame * 0.003);
          const rayCount = 8;
          ctx.fillStyle = 'rgba(255, 240, 150, 0.04)';
          for (let r = 0; r < rayCount; r++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, width * 0.6, (r * Math.PI) / 4, (r * Math.PI) / 4 + 0.15);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;

        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.opacity = (progress / 0.2) * p.maxOpacity;
        } else if (progress > 0.7) {
          p.opacity = ((1 - progress) / 0.3) * p.maxOpacity;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${p.opacity * intensity})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`;
        ctx.fill();

        if (p.size > 3 && sceneId === 5) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 1.5, p.y);
          ctx.lineTo(p.x + p.size * 1.5, p.y);
          ctx.moveTo(p.x, p.y - p.size * 1.5);
          ctx.lineTo(p.x, p.y + p.size * 1.5);
          ctx.stroke();
        }
        ctx.restore();

        if (p.life >= p.maxLife || p.y < 0) {
          particles[i] = createParticle();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [sceneId, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
};

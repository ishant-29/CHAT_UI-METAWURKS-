"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function ParticleBurst({ x = 20, y = -10, color = "#6366f1" }: { x?: number, y?: number, color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x: canvas.width / 2, 
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: Math.random() * 20 + 20,
            color
        });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach((p) => {
        if (p.life < p.maxLife) {
            active = true;
            p.x += p.vx;
            p.y += p.vy;
            p.life++;
            const opacity = 1 - p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
      });
      
      if (active) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return <canvas ref={canvasRef} width={60} height={60} className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }} />;
}

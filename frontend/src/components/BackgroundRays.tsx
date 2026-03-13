import React, { useEffect, useRef } from 'react';

export const BackgroundRays: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Create rays
    const rays: { angle: number; width: number; speed: number; length: number; offset: number }[] = [];
    for (let i = 0; i < 40; i++) {
      rays.push({
        angle: (Math.random() - 0.5) * Math.PI * 1.5,
        width: 20 + Math.random() * 80,
        speed: (Math.random() > 0.5 ? 1 : -1) * (0.0005 + Math.random() * 0.001),
        length: canvas.height * (1.5 + Math.random()),
        offset: Math.random() * Math.PI * 2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = -canvas.height * 0.2; // Top origin
      
      ctx.save();
      ctx.translate(cx, cy);
      
      const time = performance.now() * 0.001;
      
      rays.forEach((ray) => {
        // sway back and forth
        const currentAngle = ray.angle + Math.sin(time + ray.offset) * 0.2;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, ray.length);
        // Using the requested #dc143c color for rays
        gradient.addColorStop(0, 'rgba(220, 20, 60, 0.15)');
        gradient.addColorStop(0.5, 'rgba(220, 20, 60, 0.05)');
        gradient.addColorStop(1, 'rgba(220, 20, 60, 0)');
        
        ctx.save();
        ctx.rotate(currentAngle);
        
        ctx.beginPath();
        ctx.moveTo(-ray.width / 2, 0);
        ctx.lineTo(ray.width / 2, 0);
        ctx.lineTo(ray.width * 1.5, ray.length);
        ctx.lineTo(-ray.width * 1.5, ray.length);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      });
      
      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen opacity-70 z-0"
    />
  );
};

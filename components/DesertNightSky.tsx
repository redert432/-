import React, { useEffect, useRef } from 'react';

const DesertNightSky: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let stars: { x: number; y: number; radius: number; alpha: number; delta: number }[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        delta: Math.random() * 0.005,
      });
    }

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      
      stars.forEach(star => {
        star.alpha += star.delta;
        if (star.alpha > 1) {
          star.alpha = 1;
          star.delta *= -1;
        } else if (star.alpha < 0) {
          star.alpha = 0;
          star.delta *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${star.alpha})`;
        ctx.fill();
        
        // Move stars slowly
        star.y -= 0.05;
        if (star.y < 0) {
            star.y = height;
        }
      });

      requestAnimationFrame(draw);
    };

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
        window.removeEventListener('resize', handleResize);
    }
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-50" />;
};

export default DesertNightSky;

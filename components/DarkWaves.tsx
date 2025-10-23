import React, { useRef, useEffect } from 'react';

const DarkWaves: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let tick = 0;

    const waves = [
      { amplitude: height * 0.1, frequency: 0.01, speed: 0.02, color: 'rgba(55, 65, 81, 0.2)' }, // gray-700
      { amplitude: height * 0.15, frequency: 0.015, speed: -0.03, color: 'rgba(30, 41, 59, 0.3)' }, // slate-800
      { amplitude: height * 0.08, frequency: 0.008, speed: 0.01, color: 'rgba(17, 24, 39, 0.2)' }, // gray-900
    ];

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x < width; x++) {
          const y = Math.sin(x * wave.frequency + tick * wave.speed) * wave.amplitude + height * 0.8;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      tick++;
      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    draw();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-80" />;
};

export default DarkWaves;

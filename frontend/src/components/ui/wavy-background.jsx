import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth = 50,
  backgroundFill = 'rgba(255, 255, 255, 0.1)',
  blur = 10,
  speed = 'slow',
  waveOpacity = 0.5,
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  const speedMap = {
    slow: 0.5,
    fast: 2,
    medium: 1,
  };

  const speedValue = speedMap[speed] || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      // Use viewport dimensions for full-screen background
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawWave = (y, amplitude, frequency, phase, color) => {
      ctx.beginPath();
      ctx.moveTo(0, y);

      for (let x = 0; x < canvas.width; x += 1) {
        const waveY = y + amplitude * Math.sin((x / frequency) + phase);
        ctx.lineTo(x, waveY);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = backgroundFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.01 * speedValue;

      const colorsArray = colors || ['#5142FF', '#818cf8', '#c084fc'];
      const numWaves = colorsArray.length;

      colorsArray.forEach((color, index) => {
        const y = (canvas.height / (numWaves + 1)) * (index + 1);
        const amplitude = waveWidth;
        const frequency = canvas.width / 4;
        const phase = timeRef.current + (index * Math.PI / numWaves);
        
        // Convert hex color to rgba with opacity
        let colorWithOpacity = color;
        if (color.startsWith('#')) {
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          colorWithOpacity = `rgba(${r}, ${g}, ${b}, ${waveOpacity})`;
        } else if (color.startsWith('rgba')) {
          // If already rgba, replace opacity
          colorWithOpacity = color.replace(/rgba?\(([^)]+)\)/, (match, values) => {
            const parts = values.split(',').map(v => v.trim());
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${waveOpacity})`;
          });
        } else {
          // Fallback: try to add opacity
          colorWithOpacity = color;
        }
        
        drawWave(y, amplitude, frequency, phase, colorWithOpacity);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [colors, waveWidth, backgroundFill, speed, waveOpacity]);

  return (
    <div className={`relative ${containerClassName || ''}`}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen"
        style={{ filter: `blur(${blur}px)`, zIndex: 0 }}
      />
      <div className={`relative z-10 ${className || ''}`}>
        {children}
      </div>
    </div>
  );
};


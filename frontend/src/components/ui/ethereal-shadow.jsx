import React, { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

export const EtherealShadow = ({
  color = 'rgba(81, 66, 255, 0.15)',
  animation = { scale: 80, speed: 75 },
  noise = { opacity: 0.3, scale: 1 },
  sizing = 'fill',
  className = '',
}) => {
  const canvasRef = useRef(null);
  const noise2D = useRef(createNoise2D());
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          
          const nx = (x / canvas.width) * noise.scale;
          const ny = (y / canvas.height) * noise.scale;
          const nz = timeRef.current * 0.001;
          
          const noiseValue = noise2D.current(nx, ny + nz);
          const normalizedNoise = (noiseValue + 1) / 2;
          
          const distance = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) + 
            Math.pow(y - canvas.height / 2, 2)
          );
          const maxDistance = Math.sqrt(
            Math.pow(canvas.width / 2, 2) + 
            Math.pow(canvas.height / 2, 2)
          );
          const radialGradient = 1 - (distance / maxDistance);
          
          const intensity = normalizedNoise * radialGradient * noise.opacity;
          
          // Parse rgba color string
          let r = 81, g = 66, b = 255;
          if (color.startsWith('rgba')) {
            const matches = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (matches) {
              r = parseInt(matches[1]);
              g = parseInt(matches[2]);
              b = parseInt(matches[3]);
            }
          } else if (color.startsWith('#')) {
            // Handle hex colors
            const hex = color.replace('#', '');
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
          }
          
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = Math.floor(intensity * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      timeRef.current += animation.speed || 75;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [color, animation, noise]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: sizing === 'fill' ? '100%' : 'auto', height: sizing === 'fill' ? '100%' : 'auto' }}
    />
  );
};


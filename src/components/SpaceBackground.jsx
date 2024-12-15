import React, { useEffect, useRef } from 'react';

const SpaceBackground = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationFrameRef = useRef(null);

  const createStars = (width, height) => {
    const numStars = Math.min(100, Math.floor((width * height) / 10000)); // Responsive star count
    const stars = [];
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
    return stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for non-transparent background

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      const dpr = window.devicePixelRatio || 1;
      
      // Set display size
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      
      // Set actual size in memory
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      
      // Scale context to match dpr
      ctx.scale(dpr, dpr);
      
      // Recreate stars for new dimensions
      starsRef.current = createStars(innerWidth, innerHeight);
    };

    const animate = () => {
      const { innerWidth, innerHeight } = window;
      
      // Clear with solid background for better performance
      ctx.fillStyle = '#235390';
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      
      // Add subtle gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, innerHeight);
      gradient.addColorStop(0, 'rgba(35, 83, 144, 0.8)');
      gradient.addColorStop(1, 'rgba(35, 83, 144, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, innerWidth, innerHeight);

      // Draw stars
      starsRef.current.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.2 + 0.8;

        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial setup
    handleResize();
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default SpaceBackground;

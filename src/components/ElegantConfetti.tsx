import React, { useEffect, useRef } from 'react';

export default function ElegantConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const colors = ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = -Math.random() * canvas!.height;
        this.size = Math.random() * 6 + 2;
        this.speedY = Math.random() * 2 + 1; // Slow, elegant fall
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 5;
        this.opacity = 1;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        
        // Gentle sway
        this.x += Math.sin(this.y * 0.02) * 0.5;

        // Fade out near the bottom
        if (this.y > canvas!.height - 100) {
          this.opacity -= 0.01;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);
        
        ctx.fillStyle = this.color;
        
        // Draw elegant diamond/star shape instead of pure squares
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size / 2, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        if (particle.opacity <= 0 || particle.y > canvas.height + 50) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

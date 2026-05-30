import React, { useEffect, useRef } from 'react';

export default function BackgroundAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Track mouse coordinates globally
    const mouse = {
      x: null,
      y: null,
      radius: 170, // Interaction range
      isActive: false
    };

    // Handle high-DPI screens correctly for razor-sharp rendering
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Track mouse motion
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.isActive = false;
    };

    // Support touch devices
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.isActive = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.isActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Initialize 60 plexus particles (highly optimized for 60FPS)
    const particleCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 22000));
    const particles = [];
    
    // ViralCut Brand Color Palette
    const colors = [
      'rgba(102, 203, 253, ', // Light Blue (#66CBFD)
      'rgba(249, 169, 240, ', // Light Pink (#F9A9F0)
      'rgba(96, 191, 8, ',   // Accent Green (#60BF08)
      'rgba(0, 0, 0, '       // Contrast Slate
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35, // Slow elegant drift
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1.2,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.35 + 0.12,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        pulseValue: Math.random() * Math.PI
      });
    }

    // Floating Sparks / Video Playhead vectors
    const sparkCount = 10;
    const sparks = [];
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 150,
        vy: -(Math.random() * 0.25 + 0.08),
        size: Math.random() * 7 + 4,
        type: ['star', 'play', 'circle'][Math.floor(Math.random() * 3)],
        opacity: Math.random() * 0.07 + 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008
      });
    }

    // Click Ripple System
    const ripples = [];
    const handleCanvasClick = (e) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 130,
        opacity: 0.45,
        speed: 1.8
      });
    };
    window.addEventListener('click', handleCanvasClick);

    // Audio Waveform Phase Accumulators
    let phase1 = 0;
    let phase2 = Math.PI / 3;
    let phase3 = Math.PI / 1.5;

    // Helper: Draw elegant 4-point star (creative spark)
    const drawSparkle = (cx, cy, spikes, outerRadius, innerRadius) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    // Helper: Draw play icon outline (video editor theme)
    const drawPlayIcon = (x, y, size, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(size * 0.55, 0);
      ctx.lineTo(-size * 0.35, -size * 0.45);
      ctx.lineTo(-size * 0.35, size * 0.45);
      ctx.closePath();
      ctx.restore();
    };

    // Main animation render loop (locked to 60fps)
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Clear background
      ctx.clearRect(0, 0, width, height);

      // 2. Draw Premium Dynamic Tech Grid
      const gridSize = 65;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.016)';
      ctx.lineWidth = 0.55;
      
      // Vertical grid lines with mouse warping effect
      for (let x = 0; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 15) {
          let drawX = x;
          if (mouse.isActive) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              const force = (160 - dist) / 160;
              // Warp lines slightly away from cursor
              drawX += (dx / dist) * force * 14;
            }
          }
          if (y === 0) ctx.moveTo(drawX, y);
          else ctx.lineTo(drawX, y);
        }
        ctx.stroke();
      }

      // Horizontal grid lines with mouse warping effect
      for (let y = 0; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 15) {
          let drawY = y;
          if (mouse.isActive) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              const force = (160 - dist) / 160;
              // Warp lines slightly away from cursor
              drawY += (dy / dist) * force * 14;
            }
          }
          if (x === 0) ctx.moveTo(x, drawY);
          else ctx.lineTo(x, drawY);
        }
        ctx.stroke();
      }

      // Draw faint dot grid intersections with interactive glows
      for (let x = 0; x < width + gridSize; x += gridSize) {
        for (let y = 0; y < height + gridSize; y += gridSize) {
          let dotX = x;
          let dotY = y;
          
          if (mouse.isActive) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              const force = (160 - dist) / 160;
              dotX += (dx / dist) * force * 14;
              dotY += (dy / dist) * force * 14;
              
              // Glow intersection dots near mouse
              ctx.fillStyle = `rgba(102, 203, 253, ${0.035 + force * 0.16})`;
              ctx.beginPath();
              ctx.arc(dotX, dotY, 1.4 + force * 1.2, 0, Math.PI * 2);
              ctx.fill();
              continue;
            }
          }
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
          ctx.beginPath();
          ctx.arc(dotX, dotY, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Undulating Audio Waveforms (Representing Sound & Video Tracks)
      const drawWave = (phase, amp, freq, offset, fillStyle) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width + 5; x += 6) {
          const y = height - offset + Math.sin(x * freq + phase) * amp;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
      };

      // Create flowing gradient waveforms
      const waveGrad1 = ctx.createLinearGradient(0, height - 160, width, height);
      waveGrad1.addColorStop(0, 'rgba(102, 203, 253, 0.038)');
      waveGrad1.addColorStop(1, 'rgba(249, 169, 240, 0.008)');
      
      const waveGrad2 = ctx.createLinearGradient(0, height - 130, width, height);
      waveGrad2.addColorStop(0, 'rgba(249, 169, 240, 0.032)');
      waveGrad2.addColorStop(1, 'rgba(102, 203, 253, 0.012)');

      const waveGrad3 = ctx.createLinearGradient(0, height - 190, width, height);
      waveGrad3.addColorStop(0, 'rgba(96, 191, 8, 0.016)');
      waveGrad3.addColorStop(1, 'rgba(102, 203, 253, 0.008)');

      drawWave(phase1, 32, 0.0022, 110, waveGrad1);
      drawWave(phase2, 22, 0.0038, 85, waveGrad2);
      drawWave(phase3, 38, 0.0016, 130, waveGrad3);

      phase1 += 0.0025;
      phase2 += 0.004;
      phase3 += 0.0018;

      // 4. Update & Draw Dynamic Click Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity -= 0.007;

        if (r.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(102, 203, 253, ${r.opacity})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(249, 169, 240, ${r.opacity * 0.45})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.78, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Update & Draw Floating Creative Sparks
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.y += s.vy;
        s.rotation += s.rotationSpeed;

        // Reset spark when it drifts off screen
        if (s.y < -30) {
          s.y = height + Math.random() * 100;
          s.x = Math.random() * width;
          s.vy = -(Math.random() * 0.2 + 0.06);
        }

        if (s.type === 'star') {
          ctx.strokeStyle = `rgba(102, 203, 253, ${s.opacity})`;
          ctx.lineWidth = 0.95;
          drawSparkle(s.x, s.y, 4, s.size, s.size * 0.28);
          ctx.stroke();
        } else if (s.type === 'play') {
          ctx.strokeStyle = `rgba(249, 169, 240, ${s.opacity * 1.3})`;
          ctx.lineWidth = 0.95;
          drawPlayIcon(s.x, s.y, s.size, s.rotation);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(0, 0, 0, ${s.opacity})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Draw Plexus Particles & Connective Network
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Pulse opacity and radius
        p.pulseValue += p.pulseSpeed;
        const currentOpacity = p.opacity + Math.sin(p.pulseValue) * 0.07;
        const currentRadius = p.radius + Math.sin(p.pulseValue) * 0.25;

        // Mouse attraction/repulsion mechanics
        if (mouse.isActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            // Push away smoothly (repelling force looks cleaner and maintains copy readability)
            p.x += (dx / dist) * force * 1.1;
            p.y += (dy / dist) * force * 1.1;
            
            p.x = Math.max(15, Math.min(width - 15, p.x));
            p.y = Math.max(15, Math.min(height - 15, p.y));
          }
        }

        // Screen boundary collisions
        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Draw node
        ctx.fillStyle = `${p.colorBase}${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nodes to neighboring nodes (Plexus)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            const lineOpacity = ((125 - dist) / 125) * 0.065;
            ctx.strokeStyle = `rgba(102, 203, 253, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw connective line from mouse to node
        if (mouse.isActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const lineOpacity = ((150 - dist) / 150) * 0.11;
            ctx.strokeStyle = `rgba(102, 203, 253, ${lineOpacity})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup listeners and animation frame on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: 'radial-gradient(circle at 50% 50%, #f7f9fd 0%, #edf1f7 100%)'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      
      {/* Dynamic Noise Overlay for paper-texture realism */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.032,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BackgroundAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP Context for easy cleanup
    const ctx = gsap.context(() => {
      const orbs = gsap.utils.toArray('.glow-orb');
      
      orbs.forEach((orb, i) => {
        // Drifting animation for each colored orb
        const randomX = Math.random() * 200 - 100;
        const randomY = Math.random() * 150 - 75;
        
        gsap.to(orb, {
          x: `+=${randomX}`,
          y: `+=${randomY}`,
          scale: () => Math.random() * 0.3 + 0.85,
          duration: 15 + i * 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * -3, // Start at staggered offsets
        });
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, // Behind all text and sections
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#F2F2F2', // Reelo soft off-white/light gray base
      }}
    >
      {/* Subtle Grid overlay for that premium texture */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          opacity: 0.8,
        }}
      />

      {/* Noise Texture Overlay for grain aesthetic */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03, // Ultra-fine, premium aesthetic noise
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vibrant 2D Ambient Glow Orbs */}
      {/* Orb 1: Reelo Cyan Blue */}
      <div 
        className="glow-orb"
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 203, 253, 0.45) 0%, rgba(102, 203, 253, 0) 70%)',
          filter: 'blur(120px)',
          mixBlendMode: 'multiply',
          willChange: 'transform',
        }}
      />

      {/* Orb 2: Reelo Soft Pink */}
      <div 
        className="glow-orb"
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 169, 240, 0.45) 0%, rgba(249, 169, 240, 0) 70%)',
          filter: 'blur(140px)',
          mixBlendMode: 'multiply',
          willChange: 'transform',
        }}
      />

      {/* Orb 3: Reelo Lime Green */}
      <div 
        className="glow-orb"
        style={{
          position: 'absolute',
          top: '25%',
          right: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220, 255, 219, 0.5) 0%, rgba(220, 255, 219, 0) 70%)',
          filter: 'blur(100px)',
          mixBlendMode: 'multiply',
          willChange: 'transform',
        }}
      />

      {/* Orb 4: Soft Warm Coral Accent */}
      <div 
        className="glow-orb"
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 85, 61, 0.22) 0%, rgba(232, 85, 61, 0) 70%)',
          filter: 'blur(120px)',
          mixBlendMode: 'multiply',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

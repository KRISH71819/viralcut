import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BackgroundAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP Context for easy cleanup
    const ctx = gsap.context(() => {
      const shapes = gsap.utils.toArray('.gsap-shape');
      
      shapes.forEach((shape) => {
        // Random floating animation for each shape
        gsap.to(shape, {
          y: `+=${Math.random() * 150 + 50}`,
          x: `+=${Math.random() * 100 - 50}`,
          rotation: Math.random() * 120 - 60,
          duration: 15 + Math.random() * 15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * -5, // Start at different times
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
        zIndex: 0, // Ensure it is behind content
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#ffffff', // Clean white background
      }}
    >
      {/* 3D Moving Perspective Grid */}
      <div 
        className="gsap-grid"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transformOrigin: 'center top',
          transform: 'perspective(1000px) rotateX(70deg) translateY(-200px) translateZ(-300px)',
          animation: 'gridMove 15s linear infinite',
        }}
      />
      <style>{`
        @keyframes gridMove {
          0% { transform: perspective(1000px) rotateX(70deg) translateY(-200px) translateZ(-300px); }
          100% { transform: perspective(1000px) rotateX(70deg) translateY(-120px) translateZ(-300px); }
        }
      `}</style>

      {/* Floating Geometric Wireframes */}
      
      {/* Wireframe Sphere */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '15%', left: '5%', width: '350px', opacity: 0.04 }} viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="1">
        <circle cx="50" cy="50" r="48" />
        <ellipse cx="50" cy="50" rx="48" ry="15" />
        <ellipse cx="50" cy="50" rx="15" ry="48" />
        <ellipse cx="50" cy="50" rx="48" ry="30" />
        <ellipse cx="50" cy="50" rx="30" ry="48" />
      </svg>

      {/* Large Outline Ring */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '65%', right: '-5%', width: '500px', opacity: 0.03 }} viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="3">
        <circle cx="50" cy="50" r="45" />
      </svg>

      {/* Abstract Plus */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '25%', left: '75%', width: '120px', opacity: 0.05 }} viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round">
        <path d="M50 20 L50 80 M20 50 L80 50" />
      </svg>

      {/* Wireframe Triangle / Pyramid */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '70%', left: '20%', width: '180px', opacity: 0.04 }} viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        <polygon points="50,15 90,85 10,85" />
        <path d="M50 15 L50 85 M10 85 L50 65 L90 85" />
      </svg>
      
      {/* Video Play Icon Floating */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '45%', right: '40%', width: '100px', opacity: 0.06 }} viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="2" strokeLinejoin="round">
        <polygon points="35,25 75,50 35,75" />
      </svg>

      {/* Square Frame */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '10%', right: '25%', width: '150px', opacity: 0.04 }} viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="1.5">
        <rect x="20" y="20" width="60" height="60" />
        <rect x="30" y="30" width="60" height="60" />
        <path d="M20 20 L30 30 M80 20 L90 30 M80 80 L90 90 M20 80 L30 90" />
      </svg>
      
      {/* Floating Dots Pattern */}
      <svg className="gsap-shape" style={{ position: 'absolute', top: '40%', left: '10%', width: '120px', opacity: 0.05 }} viewBox="0 0 100 100" fill="#000">
        <circle cx="10" cy="10" r="2.5" /><circle cx="35" cy="10" r="2.5" /><circle cx="60" cy="10" r="2.5" />
        <circle cx="10" cy="35" r="2.5" /><circle cx="35" cy="35" r="2.5" /><circle cx="60" cy="35" r="2.5" />
        <circle cx="10" cy="60" r="2.5" /><circle cx="35" cy="60" r="2.5" /><circle cx="60" cy="60" r="2.5" />
      </svg>

      {/* Optional Top Gradient overlay to blend the grid fading in */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '40%',
        background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}

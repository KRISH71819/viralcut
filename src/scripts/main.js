/* ============================================
   VIRALCUT — MAIN JS v3
   GSAP ScrollTrigger + Lenis + Rive
   Premium scroll-triggered animations
   ============================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Rive } from '@rive-app/canvas';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// LENIS SMOOTH SCROLL
// ==========================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top -80px',
    onEnter: () => navbar.classList.add('scrolled'),
    onLeaveBack: () => navbar.classList.remove('scrolled'),
  });

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const overlay = document.getElementById('nav-mobile-overlay');
  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    overlay.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
}

// ==========================================
// HERO ANIMATIONS
// ==========================================
function initHeroAnimations() {
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Badge fade in
  const heroBadge = document.querySelector('.hero-badge-wrap');
  if (heroBadge) {
    heroTl.fromTo(heroBadge, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.2
    );
  }

  // Title — word-by-word reveal
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const words = heroTitle.innerHTML.split(/(\s+|<br\s*\/?>)/);
    heroTitle.innerHTML = words.map(word => {
      if (word.match(/<br\s*\/?>/)) return word;
      if (word.trim() === '') return word;
      return `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:top;"><span class="word-inner" style="display:inline-block;transform:translateY(110%);opacity:0;">${word}</span></span>`;
    }).join('');

    const wordInners = heroTitle.querySelectorAll('.word-inner');
    heroTl.to(wordInners, {
      y: '0%',
      opacity: 1,
      duration: 0.7,
      stagger: 0.04,
      ease: 'power3.out',
    }, 0.4);
  }

  // Description
  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc) {
    heroTl.fromTo(heroDesc,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.9
    );
  }

  // Actions
  const heroActions = document.querySelector('.hero-actions');
  if (heroActions) {
    heroTl.fromTo(heroActions,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      1.1
    );
  }

  // 3-Phone mockups entrance — staggered slide up
  const phones = document.querySelectorAll('.hero-phone');
  if (phones.length) {
    phones.forEach((phone, i) => {
      const delays = [1.3, 1.15, 1.45]; // center first, then sides
      heroTl.fromTo(phone,
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
        delays[i] || 1.3
      );
    });

    // Continuous gentle bobbing on phones
    phones.forEach((phone, i) => {
      gsap.to(phone, {
        y: -8 + (i * 3),
        duration: 3.5 + (i * 0.4),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.5 + (i * 0.2),
      });
    });
  }

  // Stat badges float in
  document.querySelectorAll('.hero-stat-badge').forEach((badge, i) => {
    heroTl.fromTo(badge,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
      1.8 + (i * 0.15)
    );

    // Continuous float
    gsap.to(badge, {
      y: -10 + (i * 4),
      duration: 3 + (i * 0.6),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2.8 + (i * 0.3),
    });
  });

  // Hero phones parallax on scroll
  const heroPhones = document.querySelector('.hero-phones');
  if (heroPhones) {
    gsap.to(heroPhones, {
      y: 60,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }
}

// ==========================================
// RIVE INTEGRATION
// ==========================================
function initRive() {
  const canvas = document.getElementById('rive-canvas');
  if (!canvas) return;

  try {
    const r = new Rive({
      src: '/ai_clipping_new.riv',
      canvas: canvas,
      autoplay: true,
      onLoad: () => {
        r.resizeDrawingToCanvas();
      }
    });
  } catch (err) {
    console.error('Rive integration error:', err);
  }
}

// Marquees are now fully driven by high-performance CSS keyframe animations

// ==========================================
// SCROLL-TRIGGERED SECTION REVEALS
// ==========================================
function initScrollReveals() {
  // Fade-up reveals
  gsap.utils.toArray('[data-animate="fade-up"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        }
      }
    );
  });

  // Staggered grid reveals
  gsap.utils.toArray('[data-animate="stagger-up"]').forEach(container => {
    const children = container.children;
    gsap.fromTo(children,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        }
      }
    );
  });

  // Section heading reveals (large titles)
  gsap.utils.toArray('.section-header h2, .section-title').forEach(heading => {
    // Split into lines
    const lines = heading.innerHTML.split('<br');
    if (lines.length > 1) {
      heading.innerHTML = lines.map((line, i) => {
        const cleanLine = i > 0 ? line.replace(/^[^>]*>/, '') : line;
        return `<span style="display:block;overflow:hidden;"><span class="line-inner" style="display:block;transform:translateY(100%);opacity:0;">${cleanLine.trim()}</span></span>`;
      }).join('');

      const lineInners = heading.querySelectorAll('.line-inner');
      gsap.to(lineInners, {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          once: true,
        }
      });
    } else {
      gsap.fromTo(heading,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            once: true,
          }
        }
      );
    }
  });
}

// ==========================================
// CARD HOVER MICRO-INTERACTIONS
// ==========================================
function initCardHovers() {
  document.querySelectorAll('.card, .bento-card, .pricing-card, .compare-col, .insight-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { 
        y: -6, 
        duration: 0.3, 
        ease: 'power2.out',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { 
        y: 0, 
        duration: 0.4, 
        ease: 'power2.out',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      });
    });
  });
}

// ==========================================
// DYNAMIC INFINITE MARQUEES
// ==========================================
let testimonialTween = null;

function initMarqueeSystem() {
  const marquees = [
    { id: 'logo-track', type: 'css', targetSpeed: 35.7 },
    { id: 'hero-metrics-track', type: 'css', targetSpeed: 71.4 },
    { id: 'footer-marquee-track', type: 'css', targetSpeed: 80.0 },
    { id: 'testimonial-track', type: 'gsap', targetSpeed: 44.4 }
  ];

  marquees.forEach(m => {
    const track = document.getElementById(m.id);
    if (!track) return;

    // Capture the original children on the very first execution
    if (!track.originalNodes) {
      track.originalNodes = Array.from(track.children).map(node => node.cloneNode(true));
    }

    function rebuild() {
      // Clear current track items
      track.innerHTML = '';
      
      // Append original set
      track.originalNodes.forEach(node => track.appendChild(node.cloneNode(true)));

      // Measure original width
      const baseWidth = track.scrollWidth;
      if (baseWidth <= 0) return;

      const viewportWidth = window.innerWidth;
      // We want the track to be at least 3x the viewport width to prevent gaps
      const targetWidth = viewportWidth * 3;
      const copiesNeeded = Math.max(2, Math.ceil(targetWidth / baseWidth));

      // Append cloned sets
      for (let i = 1; i < copiesNeeded; i++) {
        track.originalNodes.forEach(node => {
          track.appendChild(node.cloneNode(true));
        });
      }

      // Calculate the final full track width
      const totalWidth = track.scrollWidth;

      if (m.type === 'css') {
        // CSS marquee animation translates -50%
        // Translate distance = totalWidth / 2
        // Duration = Distance / Speed
        const distance = totalWidth / 2;
        const duration = distance / m.targetSpeed;
        track.style.animationDuration = `${duration}s`;
      } else if (m.type === 'gsap') {
        // Kill existing GSAP tween if any
        if (testimonialTween) {
          testimonialTween.kill();
          testimonialTween = null;
        }

        const distance = totalWidth / 2;
        const duration = distance / m.targetSpeed;

        testimonialTween = gsap.to(track, {
          x: -distance,
          duration: duration,
          repeat: -1,
          ease: 'none'
        });
      }
    }

    // Run initially
    rebuild();

    // Attach listeners for GSAP interactive hover once
    if (m.type === 'gsap' && !track.dataset.hasListeners) {
      track.dataset.hasListeners = 'true';
      track.addEventListener('mouseenter', () => {
        if (testimonialTween) {
          gsap.to(testimonialTween, { timeScale: 0, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
        }
      });
      track.addEventListener('mouseleave', () => {
        if (testimonialTween) {
          gsap.to(testimonialTween, { timeScale: 1, duration: 1.2, ease: 'power2.inOut', overwrite: 'auto' });
        }
      });
    }

    // Hook window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(rebuild, 250);
    });
  });
}

// ==========================================
// FAQ ACCORDION
// ==========================================
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-a');
      const inner = answer.querySelector('.faq-a-inner');
      const isActive = item.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item.active').forEach(activeItem => {
        if (activeItem !== item) {
          activeItem.classList.remove('active');
          const activeAnswer = activeItem.querySelector('.faq-a');
          gsap.to(activeAnswer, { 
            height: 0, duration: 0.4, ease: 'power2.inOut',
            onComplete: () => { activeAnswer.style.maxHeight = '0'; }
          });
        }
      });

      if (isActive) {
        item.classList.remove('active');
        gsap.to(answer, { 
          height: 0, duration: 0.4, ease: 'power2.inOut',
          onComplete: () => { answer.style.maxHeight = '0'; }
        });
      } else {
        item.classList.add('active');
        answer.style.maxHeight = 'none';
        const height = inner.offsetHeight;
        answer.style.maxHeight = '0';
        gsap.fromTo(answer, 
          { height: 0 },
          { height: height, duration: 0.4, ease: 'power2.inOut',
            onComplete: () => { answer.style.maxHeight = `${height + 20}px`; answer.style.height = ''; }
          }
        );
      }
    });
  });
}

// ==========================================
// PRICING TOGGLE
// ==========================================
function initPricingToggle() {
  const monthlyBtn = document.getElementById('toggle-monthly');
  const yearlyBtn = document.getElementById('toggle-yearly');
  if (!monthlyBtn || !yearlyBtn) return;

  function updatePrices(period) {
    document.querySelectorAll('.pricing-value[data-monthly]').forEach(el => {
      const newVal = el.dataset[period];
      if (newVal) {
        gsap.to(el, { 
          opacity: 0, y: -10, duration: 0.2, 
          onComplete: () => {
            el.textContent = newVal;
            gsap.to(el, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
          }
        });
      }
    });
  }

  monthlyBtn.addEventListener('click', () => {
    monthlyBtn.classList.add('active');
    yearlyBtn.classList.remove('active');
    updatePrices('monthly');
  });

  yearlyBtn.addEventListener('click', () => {
    yearlyBtn.classList.add('active');
    monthlyBtn.classList.remove('active');
    updatePrices('yearly');
  });
}

// Footer marquee is now animated via hardware-accelerated CSS keyframe animations

// ==========================================
// PORTFOLIO PARALLAX
// ==========================================
function initPortfolioEffects() {
  document.querySelectorAll('.portfolio-item').forEach((item, i) => {
    gsap.fromTo(item,
      { y: 30 + (i * 15) },
      {
        y: -(10 + (i * 5)),
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      }
    );
  });
}

// ==========================================
// CTA BANNER ANIMATION
// ==========================================
function initCTABanner() {
  const banner = document.querySelector('.cta-banner');
  if (!banner) return;

  gsap.fromTo(banner,
    { opacity: 0, scale: 0.95, y: 40 },
    {
      opacity: 1, scale: 1, y: 0, duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: banner,
        start: 'top 85%',
        once: true,
      }
    }
  );
}

// ==========================================
// SCROLL INDICATOR ROTATION
// ==========================================
function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  // Fade out on scroll
  gsap.to(indicator, {
    opacity: 0,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=300',
      scrub: true,
    }
  });
}

// ==========================================
// PREMIUM BENTO GRID ANIMATIONS
// ==========================================
function initPremiumBentoAnimations() {
  // ==========================================================
  // 1. GLOBAL 3D PERSPECTIVE TILT EFFECT ON MOUSEMOVE
  // ==========================================================
  const bentoCards = document.querySelectorAll('.bento-card');
  bentoCards.forEach((card, cardIdx) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // X position inside card
      const y = e.clientY - rect.top;  // Y position inside card
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Subtly tilt the card in 3D perspective space (max 5 degrees)
      const rotateX = ((centerY - y) / centerY) * 5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.01,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.02)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // --- Custom Internal Parallax Shifts per Card ---
      if (cardIdx === 0) {
        // Card 1: Video card and Studio Card drift in opposite directions
        const dx = (x - centerX) / centerX;
        const dy = (y - centerY) / centerY;
        gsap.to('.bento-chat-video-card', { x: dx * 14, y: dy * 14, rotate: dx * -2, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-chat-studio-card', { x: dx * -8, y: dy * -8, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      } else if (cardIdx === 1) {
        // Card 2: Collage items float with different parallax indices
        const dx = (x - centerX) / centerX;
        const dy = (y - centerY) / centerY;
        gsap.to('.bento-collage-1', { x: dx * -12 - 16, y: dy * -12 - 10, scale: 1.06, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-collage-2', { x: dx * 16, y: dy * 16 - 8, scale: 1.05, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-collage-3', { x: dx * 8 + 12, y: dy * 8 - 12, scale: 1.06, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-collage-4', { x: dx * -10 + 8, y: dy * -10 + 10, scale: 1.06, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      } else if (cardIdx === 2) {
        // Card 3: Timeline UI shifts slightly
        const dx = (x - centerX) / centerX;
        const dy = (y - centerY) / centerY;
        gsap.to('.bento-timeline', { x: dx * 6, y: dy * 6, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      } else if (cardIdx === 3) {
        // Card 4: Magnetic cloud repulsion is handled by a dedicated mousemove listener below
      }
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.015), 0 1px 4px rgba(0,0,0,0.01)',
        borderColor: 'rgba(0, 0, 0, 0.05)',
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Reset internal drifts
      if (cardIdx === 0) {
        gsap.to('.bento-chat-video-card', { x: 0, y: 0, rotate: -1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-chat-studio-card', { x: 0, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      } else if (cardIdx === 1) {
        gsap.to('.bento-collage-1', { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-collage-2', { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-collage-3', { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.bento-collage-4', { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      } else if (cardIdx === 2) {
        gsap.to('.bento-timeline', { x: 0, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  });

  // ==========================================================
  // 2. CARD 1: STRATEGY CALL CHAT TIMELINE (SPRING BOUNCE)
  // ==========================================================
  const bubbles = gsap.utils.toArray('.bento-chat-bubble');
  if (bubbles.length) {
    const bubbleTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
    
    // Set initial compressed states
    bubbleTl.set(bubbles, { opacity: 0, scale: 0, transformOrigin: 'bottom left' });
    
    // Pop bubbles sequentially with organic spring ease
    bubbles.forEach((bubble, idx) => {
      // Right-aligned bubbles origin at bottom-right
      const origin = bubble.classList.contains('bento-chat-bubble-right') ? 'bottom right' : 'bottom left';
      bubbleTl.to(bubble, {
        opacity: 1,
        scale: 1,
        transformOrigin: origin,
        duration: 0.6,
        ease: 'elastic.out(1, 0.75)',
      }, idx * 1.1);
    });
    
    // Hold them readable, then clear out smoothly
    bubbleTl.to(bubbles, {
      opacity: 0,
      scale: 0.8,
      y: -12,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.in',
    }, '+=3.2');
  }

  // Floating background drifts
  const videoCard = document.querySelector('.bento-chat-video-card');
  if (videoCard) {
    gsap.to(videoCard, {
      y: -5,
      rotation: -1,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
  const studioCard = document.querySelector('.bento-chat-studio-card');
  if (studioCard) {
    gsap.to(studioCard, {
      y: -3,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.5,
    });
  }

  // ==========================================================
  // 3. CARD 2: PHOTO COLLAGE AMBIENT DRIFT
  // ==========================================================
  const collageItems = gsap.utils.toArray('.bento-collage-item');
  if (collageItems.length) {
    collageItems.forEach((item, i) => {
      gsap.to(item, {
        y: `-=${8 + i * 2}`,
        rotation: i % 2 === 0 ? '+=1' : '-=1',
        duration: 2.5 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * -0.4,
      });
    });
  }

  // ==========================================================
  // 4. CARD 3: TIMELINE PLAYHEAD SYNCHRONIZED WAVEFORM
  // ==========================================================
  const playhead = document.querySelector('.bento-timeline-playhead');
  const badge = document.querySelector('.bento-playhead-badge');
  const waveBars = gsap.utils.toArray('.bento-wave-bar');
  const clipCards = gsap.utils.toArray('.bento-clip');
  
  if (playhead && waveBars.length) {
    // Generate base waveform indices
    waveBars.forEach((bar, idx) => {
      const baseHeight = 10 + (idx % 3) * 6;
      gsap.set(bar, { height: baseHeight, backgroundColor: '#EBEBEB' });
    });

    const timelineTl = gsap.timeline({ repeat: -1 });
    
    // Sweep Playhead from left to right
    timelineTl.to(playhead, {
      left: '94%',
      duration: 6,
      ease: 'none',
      onUpdate: function () {
        const progress = this.progress(); // 0 to 1
        
        // Synchronously update numeric playback seconds badge
        const seconds = (progress * 5).toFixed(2);
        if (badge) badge.textContent = `0:0${seconds.replace('.', ':')}`;
        
        // 1. WAVEFORM SYNCHRONIZATION: Bounces high and glows green when playhead is directly overhead!
        const totalBars = waveBars.length;
        waveBars.forEach((bar, idx) => {
          const barProgress = idx / totalBars;
          const distance = Math.abs(progress - barProgress);
          
          if (distance < 0.08) {
            // Hotspot visualizer zone
            const intensity = (1 - (distance / 0.08)); // Scale from 0 to 1
            gsap.to(bar, {
              height: 12 + (intensity * 26),
              backgroundColor: '#60BF08', // Glowing lime green!
              duration: 0.12,
              overwrite: 'auto'
            });
          } else {
            // Idle background bounce simulation
            const baseVal = 10 + (idx % 3) * 6;
            const waveBounce = baseVal + Math.sin((Date.now() * 0.008) + idx) * 3;
            gsap.to(bar, {
              height: waveBounce,
              backgroundColor: '#EBEBEB', // Light gray idle state
              duration: 0.25,
              overwrite: 'auto'
            });
          }
        });
        
        // 2. TIMELINE CLIPS SEQUENTIAL ROLLOVER HIGHLIGHT
        clipCards.forEach((clip, idx) => {
          // Clip 1 active in first half, Clip 2 active in second half
          const startBound = idx === 0 ? 0.12 : 0.52;
          const endBound = idx === 0 ? 0.44 : 0.84;
          
          if (progress >= startBound && progress <= endBound) {
            gsap.to(clip, {
              scale: 1.08,
              borderColor: '#60BF08',
              boxShadow: '0 8px 20px rgba(96, 191, 8, 0.15)',
              duration: 0.25,
              overwrite: 'auto'
            });
          } else {
            gsap.to(clip, {
              scale: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              duration: 0.3,
              overwrite: 'auto'
            });
          }
        });
      }
    });
  }

  // ==========================================================
  // 5. CARD 4: SCALE YOUR CONTENT MAGNETIC REPULSION CLOUD
  // ==========================================================
  const metricsCard = document.querySelectorAll('.bento-card')[3]; // Card 4 is index 3
  const pills = gsap.utils.toArray('.bento-metric-pill');
  
  if (metricsCard && pills.length) {
    // Staggered infinite background drift
    pills.forEach((pill, idx) => {
      gsap.to(pill, {
        x: () => `+=${Math.random() * 10 - 5}`,
        y: () => `+=${Math.random() * 8 - 4}`,
        duration: 2.2 + idx * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: idx * -0.3,
      });

      // Custom color glow mappings on hover
      let hoverColor = '#66CBFD'; // Default light blue
      if (pill.textContent.includes('Retention')) hoverColor = '#F9A9F0'; // Soft pink
      if (pill.textContent.includes('Engagement')) hoverColor = '#60BF08'; // Glowing green
      if (pill.textContent.includes('Views')) hoverColor = '#E8553D';      // Accent coral
      if (pill.textContent.includes('Hook')) hoverColor = '#66CBFD';       // Accent blue
      
      pill.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease';
      
      pill.addEventListener('mouseenter', () => {
        gsap.to(pill, {
          scale: 1.08,
          borderColor: hoverColor,
          boxShadow: `0 8px 24px rgba(${gsap.utils.splitColor(hoverColor).join(',')}, 0.15)`,
          duration: 0.3,
          ease: 'elastic.out(1, 0.65)',
          overwrite: 'auto',
        });
      });

      pill.addEventListener('mouseleave', () => {
        gsap.to(pill, {
          scale: 1,
          borderColor: 'rgba(0,0,0,0.05)',
          boxShadow: 'none',
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    });

    // Magnetic Repulsion Cloud: pills slide away when the mouse approaches
    metricsCard.addEventListener('mousemove', (e) => {
      const rect = metricsCard.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      pills.forEach((pill) => {
        const pillRect = pill.getBoundingClientRect();
        const pillCenterX = (pillRect.left - rect.left) + pillRect.width / 2;
        const pillCenterY = (pillRect.top - rect.top) + pillRect.height / 2;

        const dx = pillCenterX - mouseX;
        const dy = pillCenterY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Within 110px radius, trigger magnetic push
        if (dist < 110) {
          const force = (110 - dist) / 110; // 0 to 1
          const pushX = (dx / dist) * force * 18; // Push pills away by up to 18px
          const pushY = (dy / dist) * force * 18;

          gsap.to(pill, {
            x: pushX,
            y: pushY,
            scale: 1.02,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    });

    metricsCard.addEventListener('mouseleave', () => {
      pills.forEach((pill) => {
        gsap.to(pill, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }
}

// ==========================================
// INIT ALL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroAnimations();
  initScrollReveals();
  initCardHovers();
  initMarqueeSystem();
  initFAQ();
  initPricingToggle();
  initPortfolioEffects();
  initCTABanner();
  initScrollIndicator();
  initRive();
  initPremiumBentoAnimations();
});

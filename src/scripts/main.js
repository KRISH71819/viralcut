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

// (Rive removed — hero now uses 3-phone mockups)

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

// ==========================================
// HERO METRICS MARQUEE
// ==========================================
function initMetricsMarquee() {
  const track = document.getElementById('hero-metrics-track');
  if (!track) return;

  const totalWidth = track.scrollWidth / 2;

  gsap.to(track, {
    x: -totalWidth,
    duration: 25,
    repeat: -1,
    ease: 'none',
  });
}

// ==========================================
// LOGO MARQUEE (GSAP-driven)
// ==========================================
function initLogoMarquee() {
  const track = document.getElementById('logo-track');
  if (!track) return;

  const totalWidth = track.scrollWidth / 2;

  gsap.to(track, {
    x: -totalWidth,
    duration: 30,
    repeat: -1,
    ease: 'none',
  });

  // Pause on hover
  track.addEventListener('mouseenter', () => {
    gsap.to(track, { timeScale: 0, duration: 0.5 });
  });
  track.addEventListener('mouseleave', () => {
    gsap.to(track, { timeScale: 1, duration: 0.5 });
  });
}

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
// TESTIMONIAL AUTO-SCROLL (GSAP)
// ==========================================
function initTestimonialScroll() {
  const track = document.getElementById('testimonial-track');
  if (!track) return;

  const totalWidth = track.scrollWidth / 2;

  const tween = gsap.to(track, {
    x: -totalWidth,
    duration: 40,
    repeat: -1,
    ease: 'none',
  });

  // Pause on hover
  track.addEventListener('mouseenter', () => {
    gsap.to(tween, { timeScale: 0, duration: 0.5, overwrite: true });
  });
  track.addEventListener('mouseleave', () => {
    gsap.to(tween, { timeScale: 1, duration: 0.5, overwrite: true });
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

// ==========================================
// FOOTER MARQUEE (GSAP)
// ==========================================
function initFooterMarquee() {
  const track = document.getElementById('footer-marquee-track');
  if (!track) return;

  const totalWidth = track.scrollWidth / 2;

  gsap.to(track, {
    x: -totalWidth,
    duration: 20,
    repeat: -1,
    ease: 'none',
  });
}

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
// INTERACTIVE CANVAS BACKGROUND CONSTELATION
// ==========================================
function initBackgroundAnimation() {
  const canvas = document.getElementById('bg-animation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  // Responsive particle density
  const maxParticles = Math.min(70, Math.floor((width * height) / 20000));
  const connectionDistance = 140;

  const mouse = {
    x: null,
    y: null,
    radius: 180,
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initRandom = false) {
      this.x = initRandom ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initRandom ? Math.random() * height : (Math.random() > 0.5 ? 0 : height);
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce/boundary reset
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Interactive mouse attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= dx * force * 0.015;
          this.y -= dy * force * 0.015;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Constellation lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.07;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================
// INIT ALL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroAnimations();
  initMetricsMarquee();
  initLogoMarquee();
  initScrollReveals();
  initCardHovers();
  initTestimonialScroll();
  initFAQ();
  initPricingToggle();
  initFooterMarquee();
  initPortfolioEffects();
  initCTABanner();
  initScrollIndicator();
  initRive();
  initBackgroundAnimation();
});

/* ============================================================
   ATELIER — Main Application
   Orchestrator: Lenis, cursor, parallax, magnetic buttons,
   scroll progress, initialization sequence
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------- 1. LENIS SMOOTH SCROLL ------- */
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn('[ATELIER] Lenis not available, using native scroll');
  }

  /* ------- 2. CUSTOM CURSOR ------- */
  const cursorDot  = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  let cursorVisible = true;

  if (cursorDot && cursorRing) {
    // Smooth follow
    document.addEventListener('mousemove', (e) => {
      if (!cursorVisible) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        cursorVisible = true;
      }
      gsap.to(cursorDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.12,
        ease: 'power2.out',
      });
      gsap.to(cursorRing, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    // Hover effects on interactive elements
    const interactiveSelector = 'a, button, .btn-magnetic, .footer-social-icon, .video-play-btn';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        gsap.to(cursorRing, {
          width: 60,
          height: 60,
          borderColor: 'rgba(0,0,0,0.6)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(cursorDot, { scale: 0.5, duration: 0.3 });
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        gsap.to(cursorRing, {
          width: 40,
          height: 40,
          borderColor: 'rgba(0,0,0,0.3)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(cursorDot, { scale: 1, duration: 0.3 });
      }
    });

    // Hide on leave
    document.addEventListener('mouseleave', () => {
      gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.3 });
      cursorVisible = false;
    });
    document.addEventListener('mouseenter', () => {
      gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.3 });
      cursorVisible = true;
    });

    // Press feedback
    document.addEventListener('mousedown', () => {
      gsap.to(cursorDot, { scale: 0.6, duration: 0.15 });
      gsap.to(cursorRing, { scale: 0.85, duration: 0.15 });
    });
    document.addEventListener('mouseup', () => {
      gsap.to(cursorDot, { scale: 1, duration: 0.15 });
      gsap.to(cursorRing, { scale: 1, duration: 0.15 });
    });

    // Hide cursor on mobile / touch
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      cursorDot.style.display = 'none';
      cursorRing.style.display = 'none';
      document.body.style.cursor = 'auto';
    }
  }

  /* ------- 3. SCROLL PROGRESS ------- */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop   = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight   = document.documentElement.scrollHeight - window.innerHeight;
      const progress    = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    if (lenis) lenis.on('scroll', updateProgress);
  }

  /* ------- 4. MAGNETIC BUTTONS ------- */
  const magneticBtns = document.querySelectorAll('.btn-magnetic');
  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      gsap.to(btn, {
        x: deltaX * 0.3,
        y: deltaY * 0.3,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)',
      });
    });
  });

  /* ------- 5. MOUSE PARALLAX ------- */
  let parallaxRaf;
  const heroShapes = document.querySelectorAll('.hero-shape');

  if (heroShapes.length) {
    const depths = [0.5, 1, 1.5, 2, 2.5];
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      targetY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    });

    const updateParallax = () => {
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      heroShapes.forEach((shape, i) => {
        const depth = depths[i % depths.length];
        const moveX = mouseX * depth * 40;
        const moveY = mouseY * depth * 30;
        gsap.set(shape, {
          x: moveX,
          y: `+=${moveY * 0.01}`, // Subtle — don't override float animation
        });
      });

      parallaxRaf = requestAnimationFrame(updateParallax);
    };

    // Only run parallax when hero is in view
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateParallax();
          } else {
            if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
          }
        });
      }, { threshold: 0.1 });
      heroObs.observe(heroSection);
    }

    // Hanger parallax
    const hangerUnits = document.querySelectorAll('.hanger-unit');
    if (hangerUnits.length) {
      const hangerSection = document.getElementById('hanger-section');
      if (hangerSection) {
        hangerSection.addEventListener('mousemove', (e) => {
          const rect = hangerSection.getBoundingClientRect();
          const mx = (e.clientX - rect.left - rect.width / 2) / rect.width;
          const my = (e.clientY - rect.top - rect.height / 2) / rect.height;

          hangerUnits.forEach((unit, i) => {
            const depth = 0.3 + i * 0.15;
            gsap.to(unit, {
              x: mx * depth * 20,
              y: my * depth * 10,
              duration: 0.8,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });
        });
      }
    }
  }

  /* ------- 6. INITIALIZATION SEQUENCE ------- */
  // Start the loading experience
  if (window.Animations && Animations.loading) {
    Animations.loading();
  }

  /* ------- 7. RESIZE HANDLER ------- */
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

  /* ------- 8. VIDEO PLAY/PAUSE ------- */
  const playBtn = document.querySelector('.video-play-btn');
  if (playBtn) {
    let paused = false;
    playBtn.addEventListener('click', () => {
      paused = !paused;
      const icon = playBtn.querySelector('svg');
      if (icon) {
        // Toggle icon visual feedback
        gsap.to(icon, {
          rotation: paused ? 90 : 0,
          scale: paused ? 0.8 : 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });
  }

  /* ------- 9. SMOOTH ANCHOR SCROLLING ------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { duration: 2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  console.log('[ATELIER] Application initialized');
});

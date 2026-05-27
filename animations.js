/* ============================================================
   ATELIER — Animation Engine
   GSAP ScrollTrigger timelines, scroll-locked storytelling,
   cinematic transitions, testimonial worlds
   ============================================================ */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

// Luxury easing curves
try {
  CustomEase.create('luxuryEase', 'M0,0 C0.16,1,0.3,1,1,1');
  CustomEase.create('springSettle', 'M0,0 C0.12,0 0.27,1.35 0.42,1 0.55,0.73 0.65,1.09 0.75,1 0.83,0.93 0.9,1.02 0.95,1 0.98,0.99 1,1 1,1');
  CustomEase.create('smoothReveal', 'M0,0 C0.25,0.46,0.45,0.94,1,1');
} catch(e) {
  // Fallback if CustomEase fails
  console.warn('[ATELIER] CustomEase fallback');
}

window.Animations = {};

/* ------- Helper: safe query ------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return gsap.utils.toArray(sel, ctx); }

/* ------- 1. LOADING ------- */
Animations.loading = function() {
  const tl = gsap.timeline();
  const letters = $$('.loader-letter');
  const pctEl   = $('#loader-percentage');
  const fillEl  = $('#loader-progress-fill');
  const tagEl   = $('#loader-tagline');

  if (!letters.length) return tl;

  // Set initial random positions for letters
  letters.forEach((l) => {
    gsap.set(l, {
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 200,
      opacity: 0,
      scale: 0.3,
      rotation: (Math.random() - 0.5) * 40,
    });
  });

  // Assemble logo
  tl.to(letters, {
    x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
    duration: 1.8,
    stagger: 0.07,
    ease: 'springSettle',
  })
  // Count percentage
  .to(pctEl, { opacity: 1, duration: 0.3 }, '-=0.8')
  .to({ val: 0 }, {
    val: 100,
    duration: 1.6,
    ease: 'power2.inOut',
    onUpdate: function() {
      if (pctEl) pctEl.textContent = Math.round(this.targets()[0].val);
    }
  }, '-=0.5')
  // Fill progress bar
  .to(fillEl, { width: '100%', duration: 1.6, ease: 'power2.inOut' }, '<')
  // Tagline
  .to(tagEl, { opacity: 1, y: 0, duration: 0.8, ease: 'luxuryEase' }, '-=0.4')
  // Pause
  .to({}, { duration: 0.6 })
  // Fade out loader
  .to('#loader', {
    opacity: 0,
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      const loader = $('#loader');
      if (loader) loader.style.display = 'none';
      // Reveal main content
      gsap.to('#main-content', {
        opacity: 1,
        duration: 0.8,
        ease: 'luxuryEase',
        onComplete: () => {
          Animations.hero();
          Animations.initAll();
        }
      });
    }
  });

  // Set initial states
  gsap.set(tagEl, { opacity: 0, y: 15 });
  gsap.set(pctEl, { opacity: 0 });

  return tl;
};

/* ------- 2. HERO ------- */
Animations.hero = function() {
  const words   = $$('.hero-word');
  const subtext = $('.hero-subtext');
  const buttons = $('.hero-buttons');
  const shapes  = $$('.hero-shape');

  if (!words.length) return;

  // Animate words
  gsap.set(words, { clipPath: 'inset(0 100% 0 0)', y: 40, opacity: 0 });
  gsap.to(words, {
    clipPath: 'inset(0 0% 0 0)',
    y: 0,
    opacity: 1,
    duration: 1.4,
    stagger: 0.12,
    ease: 'luxuryEase',
  });

  // Subtext
  if (subtext) {
    gsap.set(subtext, { opacity: 0, y: 20 });
    gsap.to(subtext, { opacity: 0.7, y: 0, duration: 1, delay: 0.9, ease: 'luxuryEase' });
  }

  // Buttons
  if (buttons) {
    gsap.set(buttons, { opacity: 0, y: 15 });
    gsap.to(buttons, { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: 'luxuryEase' });
  }

  // Floating shapes - continuous animation
  shapes.forEach((shape, i) => {
    const dur = 5 + Math.random() * 4;
    const yRange = 15 + Math.random() * 15;
    gsap.to(shape, {
      y: `+=${yRange}`,
      rotation: (Math.random() - 0.5) * 5,
      duration: dur,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.5,
    });
  });
};

/* ------- 3. HANGER SECTION (Scroll-Locked) ------- */
Animations.hangerSection = function() {
  const section = $('#hanger-section');
  if (!section) return;

  const units    = $$('.hanger-unit');
  const garments = $$('.hanger-garment');
  const stats    = $('.hanger-stats');
  const title    = $('.hanger-scene-title');
  const statNums = $$('#hanger-section .stat-number');

  if (window.innerWidth <= 768) {
    // Mobile simplified entrance
    gsap.set(units, { opacity: 0, x: 50 });
    gsap.to(units, {
      opacity: 1, x: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
      }
    });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hanger-section',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: '+=5000',
      anticipatePin: 1,
    }
  });

  // Title fade in
  if (title) {
    gsap.set(title, { opacity: 0, y: -20 });
    tl.to(title, { opacity: 0.4, y: 0, duration: 0.3, ease: 'luxuryEase' });
  }

  // Phase 1: Hangers enter from alternating sides
  units.forEach((unit, i) => {
    const fromLeft = i % 2 === 0;
    gsap.set(unit, { x: fromLeft ? -250 : 250, opacity: 0, rotation: fromLeft ? -12 : 12 });
    tl.to(unit, {
      x: 0, opacity: 1, rotation: 0,
      duration: 0.6,
      ease: 'springSettle',
    }, 0.3 + i * 0.1);
  });

  // Phase 2: Garments attach
  garments.forEach((g, i) => {
    gsap.set(g, { x: 300, y: -60, opacity: 0 });
    tl.to(g, {
      x: 0, y: 0, opacity: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    }, 1.5 + i * 0.15);

    // Swing after settling
    tl.to(g, {
      rotation: 8,
      duration: 0.3,
      ease: 'sine.out',
    }, 2.0 + i * 0.15)
    .to(g, {
      rotation: -5,
      duration: 0.4,
      ease: 'sine.inOut',
    }, 2.3 + i * 0.15)
    .to(g, {
      rotation: 3,
      duration: 0.3,
      ease: 'sine.inOut',
    }, 2.7 + i * 0.15)
    .to(g, {
      rotation: -1,
      duration: 0.25,
      ease: 'sine.inOut',
    }, 3.0 + i * 0.15)
    .to(g, {
      rotation: 0,
      duration: 0.2,
      ease: 'sine.inOut',
    }, 3.25 + i * 0.15);
  });

  // Phase 3: Statistics (now runs concurrently with hangers)
  if (stats) {
    const statItems = stats.querySelectorAll('.stat-item');
    gsap.set(stats, { opacity: 1 });
    
    statItems.forEach((item, i) => {
      const numEl = item.querySelector('.stat-number');
      const label = item.querySelector('.stat-label');
      const suffix = item.querySelector('.stat-suffix');
      
      // Dramatic slow fade up for the whole item
      gsap.set(item, { opacity: 0, y: 40, filter: 'blur(10px)' });
      tl.to(item, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: 'power3.out',
      }, 0.5 + (i * 0.2));

      // Separate slow fade for label to give that "dhire dhire text show ho" effect
      if (label) {
        gsap.set(label, { opacity: 0 });
        tl.to(label, { opacity: 0.6, duration: 1.5, ease: 'none' }, 1.0 + (i * 0.2));
      }
      
      if (suffix) {
        gsap.set(suffix, { opacity: 0 });
        tl.to(suffix, { opacity: 1, duration: 1 }, 1.2 + (i * 0.2));
      }

      // Count up numbers
      if (numEl) {
        const target = parseInt(numEl.dataset.target) || 0;
        tl.to({ val: 0 }, {
          val: target,
          duration: 2.0, // slower count
          ease: 'power2.out',
          onUpdate: function() {
            numEl.textContent = Math.round(this.targets()[0].val);
          }
        }, 0.8 + (i * 0.2));
      }
    });
  }

  // Phase 4: Exit
  tl.to([...units, stats], {
    opacity: 0, y: -40,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power2.in',
  }, 5.0);

  if (title) {
    tl.to(title, { opacity: 0, duration: 0.3 }, 5.0);
  }
};

/* ------- 4. STACKED CARDS JOURNEY (HORIZONTAL) ------- */
Animations.horizontalJourney = function() {
  const wrapper = $('#horizontal-journey');
  const worlds  = $$('.journey-world');

  if (!wrapper || !worlds.length) return;

  // Set initial position for all cards except the first one
  worlds.forEach((world, i) => {
    if (i > 0) gsap.set(world, { xPercent: 100, zIndex: i });
    else gsap.set(world, { xPercent: 0, zIndex: 0 });
  });

  // Main horizontal stacking scroll
  const horizontalTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#horizontal-journey',
      pin: true,
      scrub: 1,
      end: () => '+=' + (window.innerWidth * worlds.length * 0.6), // Faster scroll
      anticipatePin: 1,
    }
  });

  // Animate cards sliding in from the right
  worlds.forEach((world, i) => {
    if (i === 0) return;
    horizontalTl.to(world, {
      xPercent: 0,
      ease: 'none',
    });
  });

  // Per-world entrance animations (using containerAnimation if horizontal, or we can just let them trigger on container scroll)
  worlds.forEach((world) => {
    const title = world.querySelector('.world-title');
    const desc  = world.querySelector('.world-description');
    const num   = world.querySelector('.world-number');
    const vis   = world.querySelector('.world-visual');

    if (title) {
      gsap.set(title, { clipPath: 'inset(0 100% 0 0)', opacity: 0 });
      gsap.to(title, {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        duration: 1,
        ease: 'luxuryEase',
        scrollTrigger: {
          trigger: world,
          containerAnimation: horizontalTl,
          start: 'left 100%',
          toggleActions: 'play none none reset',
        }
      });
    }

    if (desc) {
      gsap.set(desc, { opacity: 0, y: 20 });
      gsap.to(desc, {
        opacity: 0.6,
        y: 0,
        duration: 1,
        ease: 'luxuryEase',
        scrollTrigger: {
          trigger: world,
          containerAnimation: horizontalTl,
          start: 'left 95%',
          toggleActions: 'play none none reset',
        }
      });
    }

    if (vis) {
      gsap.set(vis, { opacity: 0, scale: 0.9, y: 30 });
      gsap.to(vis, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'luxuryEase',
        scrollTrigger: {
          trigger: world,
          containerAnimation: horizontalTl,
          start: 'left 90%',
          toggleActions: 'play none none reset',
        }
      });
    }

    // Floating fabric swatches
    const swatches = world.querySelectorAll('.fabric-swatch');
    swatches.forEach((s, i) => {
      gsap.to(s, {
        y: `+=${10 + Math.random() * 15}`,
        rotation: (Math.random() - 0.5) * 8,
        duration: 3 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.8,
      });
    });
  });

  // World 7 stats count-up
  const w7 = worlds[6];
  if (w7) {
    const w7Stats = w7.querySelectorAll('.stat-number');
    w7Stats.forEach((el) => {
      const target = parseInt(el.dataset.target) || 0;
      gsap.to({ val: 0 }, {
        val: target,
        ease: 'power2.out',
        duration: 2,
        snap: { val: 1 },
        onUpdate: function() {
          el.textContent = Math.round(this.targets()[0].val);
        },
        scrollTrigger: {
          trigger: w7,
          containerAnimation: horizontalTl,
          start: 'left 50%',
          toggleActions: 'play none none reset',
        }
      });
    });
  }
};

/* ------- 5. CINEMATIC RUNWAY ------- */
Animations.runway = function() {
  const section = $('#cinematic-runway');
  if (!section) return;

  const text     = $('.runway-overlay-text');
  const figures  = $$('.runway-figure');
  const spots    = $$('.runway-spotlights > div');
  const fogLayers = $$('.runway-fog > div');

  // Reveal text on scroll
  if (text) {
    gsap.set(text, { scale: 2.5, opacity: 0 });
    gsap.to(text, {
      scale: 1, opacity: 0.9,
      duration: 1,
      ease: 'luxuryEase',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: 'top 10%',
        scrub: true,
      }
    });
  }

  // Figures walk in
  figures.forEach((fig, i) => {
    gsap.set(fig, { y: 80, opacity: 0 });
    gsap.to(fig, {
      y: 0,
      opacity: parseFloat(fig.style.opacity) || 0.6,
      duration: 1.2,
      ease: 'luxuryEase',
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        toggleActions: 'play none none reset',
      },
      delay: i * 0.2,
    });
  });

  // Spotlight sweep
  spots.forEach((spot, i) => {
    gsap.to(spot, {
      rotation: `+=${10 + i * 5}`,
      duration: 8 + i * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  // Fog drift
  fogLayers.forEach((fog, i) => {
    gsap.to(fog, {
      x: `+=${100 + i * 50}`,
      duration: 15 + i * 5,
      repeat: -1,
      yoyo: true,
      ease: 'none',
    });
  });
};

/* ------- 6. CLIENT SHOWCASE (PINNED CARDS) ------- */
Animations.pinnedVideo = function() {
  const section = $('#pinned-video');
  if (!section) return;

  const cards = $$('.client-card');
  if (!cards.length) return;

  // Showcase heading animation
  const heading = section.querySelector('.showcase-heading');
  if (heading) {
    gsap.set(heading, { opacity: 0, y: 30 });
    gsap.to(heading, {
      opacity: 1, y: 0,
      duration: 1.2,
      ease: 'luxuryEase',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reset',
      }
    });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#pinned-video',
      pin: true,
      scrub: 0.8,
      start: 'top top',
      end: '+=3500',
      anticipatePin: 1,
    }
  });

  // Initial state: all cards hidden below, first card visible
  cards.forEach((card, i) => {
    if (i > 0) {
      gsap.set(card, { 
        opacity: 0, 
        y: 150,
        scale: 0.9,
        zIndex: i // Newer cards get HIGHER z-index so they stack ON TOP
      });
    } else {
      gsap.set(card, { opacity: 1, y: 0, scale: 1, zIndex: 0 });
    }
  });

  // Transition: current card fades up & back, next card slides up ON TOP
  cards.forEach((card, i) => {
    if (i === 0) return;

    const enterTime = (i - 1) * 1.5;
    const prevCard = cards[i - 1];

    // Previous card gets pushed back and fades out (underneath new card)
    tl.to(prevCard, {
      y: -40,
      opacity: 0,
      scale: 0.9,
      duration: 1.0,
      ease: 'power2.inOut',
    }, enterTime);

    // New card slides up into view on top
    tl.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: 'power3.out',
    }, enterTime + 0.2);
  });
};

/* ------- 7. TESTIMONIAL WORLDS ------- */
Animations.testimonialWorld = function(sectionId, config = {}) {
  const section = $(sectionId);
  if (!section) return;

  const product     = section.querySelector('.world-product');
  const testimonial = section.querySelector('.world-testimonial');
  const scene       = section.querySelector('.world-scene');

  // Default entrance animations
  if (product) {
    gsap.set(product, { scale: 0.7, opacity: 0 });
    gsap.to(product, {
      scale: 1,
      opacity: 1,
      duration: 1.4,
      ease: 'luxuryEase',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reset',
      }
    });
  }

  if (testimonial) {
    gsap.set(testimonial, { opacity: 0, y: 40 });
    gsap.to(testimonial, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'luxuryEase',
      scrollTrigger: {
        trigger: section,
        start: 'top 40%',
        toggleActions: 'play none none reset',
      }
    });
  }

  /* ---------- Section-specific behaviors ---------- */

  // WATCH — cinematic zoom and rotate
  if (sectionId === '#watch-world') {
    if (product) {
      const watchTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      const img = product.querySelector('img');

      // Cinematic shoot-in reveal
      if (img) {
        gsap.set(img, { clipPath: 'inset(100% 0 0 0)', scale: 1.1 });
        watchTl.to(img, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.2, ease: 'power4.out' }, 0);
      }

      watchTl.fromTo(product,
        { y: 200, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' },
        0
      );

      // Gentle floating after shoot
      watchTl.to(product, {
        y: -10,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      }, 1.2);

      // Info Chips
      const infoReveal = product.querySelector('.world-info-reveal');
      const infoChips = product.querySelectorAll('.info-chip');
      if (infoReveal && infoChips.length) {
        gsap.set(infoReveal, { opacity: 1, y: 0 }); 
        infoChips.forEach((chip, i) => {
          gsap.set(chip, { opacity: 0, y: 20 });
          watchTl.to(chip, { opacity: 1, y: 0, duration: 0.5, ease: 'luxuryEase' }, 1.0 + i * 0.2);
        });
      }

      // Testimonial
      if (testimonial) {
        gsap.set(testimonial, { opacity: 0, y: 40 });
        watchTl.to(testimonial, { opacity: 1, y: 0, duration: 0.6 }, 3.0);
      }
    }
  }

  // JEWELRY — sparkle particles + slow rotation
  if (sectionId === '#jewelry-world') {
    const canvas = section.querySelector('.world-particles-canvas');
    if (canvas) {
      const ps = new PhysicsEngine.ParticleSystem(canvas, {
        type: 'sparkle',
        count: 60,
        color: { r: 210, g: 210, b: 220 },
        minSize: 1,
        maxSize: 3,
        speed: 0.2,
        life: 200,
      });
      ps.init();

      // Observe visibility
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? ps.start() : ps.stop());
      }, { threshold: 0.1 });
      obs.observe(section);

      // Track mouse for particles
      section.addEventListener('mousemove', (e) => ps.setMouse(e.clientX, e.clientY));
    }

    // Necklace sway
    if (product) {
      gsap.to(product, {
        rotation: 3,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }

  // CAFE — steam particles + floating beans
  if (sectionId === '#cafe-world') {
    const canvas = section.querySelector('.cafe-steam-canvas');
    if (canvas) {
      const ps = new PhysicsEngine.ParticleSystem(canvas, {
        type: 'steam',
        count: 40,
        color: { r: 160, g: 150, b: 140 },
        minSize: 3,
        maxSize: 10,
        speed: 0.3,
        gravity: -0.015,
        life: 150,
        mouseRadius: 80,
        mouseForce: 0.04,
      });
      ps.init();

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? ps.start() : ps.stop());
      }, { threshold: 0.1 });
      obs.observe(section);

      section.addEventListener('mousemove', (e) => ps.setMouse(e.clientX, e.clientY));
    }

    // Floating beans
    const beans = section.querySelectorAll('.cafe-bean');
    beans.forEach((bean, i) => {
      gsap.to(bean, {
        y: `+=${8 + Math.random() * 12}`,
        rotation: `+=${(Math.random() - 0.5) * 30}`,
        duration: 3 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.4,
      });
    });
  }

  // DESIGNER — floating sketches + moodboards
  if (sectionId === '#designer-world') {
    const sketches    = section.querySelectorAll('.designer-sketch');
    const swatches    = section.querySelectorAll('.designer-swatch');
    const moodboards  = section.querySelectorAll('.designer-moodboard');

    sketches.forEach((sk, i) => {
      gsap.set(sk, { opacity: 0, y: 40, rotation: (Math.random() - 0.5) * 10 });
      gsap.to(sk, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'luxuryEase',
        delay: i * 0.2,
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none reset',
        }
      });
      // Float
      gsap.to(sk, {
        y: `+=${10 + Math.random() * 10}`,
        rotation: `+=${(Math.random() - 0.5) * 4}`,
        duration: 4 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.6,
      });
    });

    swatches.forEach((sw, i) => {
      gsap.set(sw, { scale: 0, opacity: 0, rotation: (Math.random() - 0.5) * 20 });
      gsap.to(sw, {
        scale: 1,
        opacity: 1,
        rotation: (Math.random() - 0.5) * 5,
        duration: 0.8,
        ease: 'springSettle',
        delay: 0.5 + i * 0.15,
        scrollTrigger: {
          trigger: section,
          start: 'top 50%',
          toggleActions: 'play none none reset',
        }
      });
    });

    moodboards.forEach((mb, i) => {
      gsap.set(mb, { opacity: 0, y: 60 });
      gsap.to(mb, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'luxuryEase',
        delay: 0.3 + i * 0.2,
        scrollTrigger: {
          trigger: section,
          start: 'top 55%',
          toggleActions: 'play none none reset',
        }
      });
    });
  }

  // PERFUME — premium reveal + liquid fill
  if (sectionId === '#perfume-world') {
    if (product) {
      gsap.set(product, { scale: 0.3, opacity: 0 });
      gsap.to(product, {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: 'luxuryEase',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none reset',
        }
      });
      // Gentle float
      gsap.to(product, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
      });
    }
  }

  // SNEAKER — dramatic reveal with zoom
  if (sectionId === '#sneaker-world') {
    if (product) {
      const sneakerTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      const img = product.querySelector('img');

      // Cinematic shoot-in reveal
      if (img) {
        gsap.set(img, { clipPath: 'inset(100% 0 0 0)', scale: 1.1 });
        sneakerTl.to(img, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.2, ease: 'power4.out' }, 0);
      }

      // Elegant shoot-in
      sneakerTl.fromTo(product,
        { y: 200, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' },
        0
      );

      // Subtle atmospheric float after shoot
      sneakerTl.to(product, {
        y: -10,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1
      }, 1.2);

      // Info Chips
      const infoReveal = product.querySelector('.world-info-reveal');
      const infoChips = product.querySelectorAll('.info-chip');
      if (infoReveal && infoChips.length) {
        gsap.set(infoReveal, { opacity: 1, y: 0 });
        infoChips.forEach((chip, i) => {
          gsap.set(chip, { opacity: 0, y: 20 });
          sneakerTl.to(chip, { opacity: 1, y: 0, duration: 0.5, ease: 'luxuryEase' }, 1.5 + i * 0.2);
        });
      }

      // Testimonial
      if (testimonial) {
        gsap.set(testimonial, { opacity: 0, y: 40 });
        sneakerTl.to(testimonial, { opacity: 1, y: 0, duration: 0.6 }, 3.2);
      }
    }
  }

  // HANDBAG — stitch drawing animation
  if (sectionId === '#handbag-world') {
    const stitches = section.querySelectorAll('.handbag-stitch');
    stitches.forEach((path) => {
      try {
        const length = path.getTotalLength ? path.getTotalLength() : 200;
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: section,
            start: 'top 50%',
            toggleActions: 'play none none reset',
          }
        });
      } catch(e) { /* SVG path may not support getTotalLength */ }
    });

    // Breathing animation on product
    if (product) {
      gsap.to(product, {
        scale: 1.03,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      });
    }
  }
};

/* ------- 8. FOOTER ------- */
Animations.footer = function() {
  const footer = $('#footer');
  if (!footer) return;

  const headline = footer.querySelector('.footer-headline');
  const subtext  = footer.querySelector('.footer-subtext');
  const cta      = footer.querySelector('.footer-cta');
  const divider  = footer.querySelector('.footer-divider');
  const icons    = footer.querySelectorAll('.footer-social-icon');
  const logo     = footer.querySelector('.footer-logo-final');
  const fade     = footer.querySelector('.footer-fade');

  // Headline from right
  if (headline) {
    gsap.set(headline, { x: 80, clipPath: 'inset(0 100% 0 0)', opacity: 0 });
    gsap.to(headline, {
      x: 0,
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      duration: 1.4,
      ease: 'luxuryEase',
      scrollTrigger: {
        trigger: footer,
        start: 'top 70%',
        toggleActions: 'play none none reset',
      }
    });
  }

  if (subtext) {
    gsap.set(subtext, { opacity: 0, y: 20 });
    gsap.to(subtext, {
      opacity: 0.5, y: 0,
      duration: 1,
      ease: 'luxuryEase',
      scrollTrigger: { trigger: footer, start: 'top 60%', toggleActions: 'play none none reset' },
    });
  }

  if (cta) {
    gsap.set(cta, { opacity: 0, y: 20 });
    gsap.to(cta, {
      opacity: 1, y: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'luxuryEase',
      scrollTrigger: { trigger: footer, start: 'top 55%', toggleActions: 'play none none reset' },
    });
  }

  if (divider) {
    gsap.set(divider, { scaleX: 0 });
    gsap.to(divider, {
      scaleX: 1,
      duration: 1,
      ease: 'luxuryEase',
      scrollTrigger: { trigger: footer, start: 'top 50%', toggleActions: 'play none none reset' },
    });
  }

  icons.forEach((icon, i) => {
    gsap.set(icon, { opacity: 0, y: 20 });
    gsap.to(icon, {
      opacity: 1, y: 0,
      duration: 0.6,
      delay: 0.1 * i,
      ease: 'springSettle',
      scrollTrigger: { trigger: footer, start: 'top 45%', toggleActions: 'play none none reset' },
    });
  });

  if (logo) {
    gsap.set(logo, { opacity: 0, scale: 0.9 });
    gsap.to(logo, {
      opacity: 0.3, scale: 1,
      duration: 1,
      ease: 'luxuryEase',
      scrollTrigger: { trigger: footer, start: 'top 35%', toggleActions: 'play none none reset' },
    });
  }

  // Final fade to white
  if (fade) {
    gsap.set(fade, { opacity: 0 });
    gsap.to(fade, {
      opacity: 0.6,
      scrollTrigger: {
        trigger: footer,
        start: 'bottom 120%',
        end: 'bottom 80%',
        scrub: true,
      }
    });
  }
};

/* ------- 9. INIT ALL ------- */
Animations.initAll = function() {
  // Staggered initialization for scroll-dependent sections
  Animations.hangerSection();
  Animations.horizontalJourney();
  Animations.runway();
  Animations.pinnedVideo();

  // Testimonial worlds
  Animations.testimonialWorld('#watch-world');
  Animations.testimonialWorld('#jewelry-world');
  Animations.testimonialWorld('#cafe-world');
  Animations.testimonialWorld('#designer-world');
  Animations.testimonialWorld('#perfume-world');
  Animations.testimonialWorld('#sneaker-world');
  Animations.testimonialWorld('#handbag-world');

  // Footer
  Animations.footer();

  // Refresh after everything is set up
  setTimeout(() => ScrollTrigger.refresh(), 200);
};

console.log('[ATELIER] Animation engine loaded');

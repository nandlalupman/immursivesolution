/* ============================================================
   ATELIER — Physics Engine
   Spring dynamics, pendulum simulation, particles, counters
   ============================================================ */

window.PhysicsEngine = {};

/* ------- Spring ------- */
PhysicsEngine.Spring = class {
  constructor(config = {}) {
    this.stiffness = config.stiffness ?? 0.1;
    this.damping   = config.damping   ?? 0.8;
    this.mass      = config.mass      ?? 1;
    this.target    = config.target    ?? 0;
    this.position  = config.position  ?? 0;
    this.velocity  = 0;
  }
  update() {
    const displacement = this.position - this.target;
    const springForce  = -this.stiffness * displacement;
    const dampingForce = -this.damping * this.velocity;
    const acceleration = (springForce + dampingForce) / this.mass;
    this.velocity += acceleration;
    this.position += this.velocity;
    return this.position;
  }
  setTarget(val) { this.target = val; }
  isSettled(threshold = 0.01) {
    return Math.abs(this.velocity) < threshold &&
           Math.abs(this.position - this.target) < threshold;
  }
  reset(pos = 0) { this.position = pos; this.velocity = 0; }
};

/* ------- Pendulum ------- */
PhysicsEngine.Pendulum = class {
  constructor(config = {}) {
    this.length          = config.length   ?? 1;
    this.damping         = config.damping  ?? 0.98;
    this.gravity         = config.gravity  ?? 0.001;
    this.angle           = config.angle    ?? 0;
    this.angularVelocity = 0;
  }
  applyForce(force) { this.angularVelocity += force; }
  update() {
    const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle * Math.PI / 180);
    this.angularVelocity += angularAcceleration;
    this.angularVelocity *= this.damping;
    this.angle += this.angularVelocity;
    return this.angle;
  }
  getAngle() { return this.angle; }
  isSettled(threshold = 0.1) {
    return Math.abs(this.angularVelocity) < 0.001 &&
           Math.abs(this.angle) < threshold;
  }
};

/* ------- Particle System ------- */
PhysicsEngine.ParticleSystem = class {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouseX = -9999;
    this.mouseY = -9999;
    this.running = false;
    this.rafId = null;

    this.config = {
      count:       config.count       ?? 80,
      color:       config.color       ?? { r: 200, g: 200, b: 200 },
      minSize:     config.minSize     ?? 1,
      maxSize:     config.maxSize     ?? 3,
      speed:       config.speed       ?? 0.5,
      life:        config.life        ?? 300,
      gravity:     config.gravity     ?? 0,
      wind:        config.wind        ?? 0,
      mouseRadius: config.mouseRadius ?? 120,
      mouseForce:  config.mouseForce  ?? 0.02,
      type:        config.type        ?? 'float',   // float | sparkle | steam | mist
      connectDist: config.connectDist ?? 100,
    };

    this.resize();
    this._resizeHandler = () => this.resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement
      ? this.canvas.parentElement.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };
    this.canvas.width  = rect.width  * (window.devicePixelRatio > 1 ? 1.5 : 1);
    this.canvas.height = rect.height * (window.devicePixelRatio > 1 ? 1.5 : 1);
    this.canvas.style.width  = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  createParticle(x, y) {
    const c = this.config;
    const type = c.type;
    const p = {
      x: x ?? Math.random() * this.canvas.width,
      y: y ?? Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * c.speed,
      vy: (Math.random() - 0.5) * c.speed,
      size: c.minSize + Math.random() * (c.maxSize - c.minSize),
      opacity: type === 'sparkle' ? Math.random() : (0.3 + Math.random() * 0.4),
      life: c.life + Math.random() * c.life * 0.5,
      maxLife: c.life + Math.random() * c.life * 0.5,
      phase: Math.random() * Math.PI * 2,
    };
    if (type === 'steam') {
      p.vy = -(0.3 + Math.random() * 0.8);
      p.vx = (Math.random() - 0.5) * 0.3;
      p.size = c.minSize + Math.random() * (c.maxSize - c.minSize) * 2;
      p.y = y ?? this.canvas.height * 0.4;
      p.x = x ?? this.canvas.width * 0.35 + Math.random() * this.canvas.width * 0.3;
    }
    if (type === 'mist') {
      p.size = 20 + Math.random() * 40;
      p.opacity = 0.02 + Math.random() * 0.05;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.vy = (Math.random() - 0.5) * 0.1;
    }
    return p;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  update() {
    const c = this.config;
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Gravity & wind
      p.vy += c.gravity;
      p.vx += c.wind;

      // Mouse interaction
      if (this.mouseX > 0 && this.mouseY > 0) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < c.mouseRadius && dist > 0) {
          const force = (c.mouseRadius - dist) / c.mouseRadius * c.mouseForce;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Damping
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Move
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.phase += 0.02;

      // Sparkle flicker
      if (c.type === 'sparkle') {
        p.opacity = 0.3 + Math.sin(p.phase * 3) * 0.7;
      }

      // Steam expansion
      if (c.type === 'steam') {
        p.size += 0.03;
        p.opacity = (p.life / p.maxLife) * 0.25;
      }

      // Recycle or wrap
      if (p.life <= 0 || p.opacity <= 0) {
        this.particles[i] = this.createParticle();
      } else {
        // Wrap boundaries for float & mist
        if (c.type === 'float' || c.type === 'mist') {
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const c = this.config;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);

      if (c.type === 'sparkle') {
        // Glow effect
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, `rgba(${c.color.r},${c.color.g},${c.color.b},${p.opacity})`);
        grad.addColorStop(0.5, `rgba(${c.color.r},${c.color.g},${c.color.b},${p.opacity * 0.3})`);
        grad.addColorStop(1, `rgba(${c.color.r},${c.color.g},${c.color.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'steam') {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(${c.color.r},${c.color.g},${c.color.b},${p.opacity})`);
        grad.addColorStop(1, `rgba(${c.color.r},${c.color.g},${c.color.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'mist') {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(${c.color.r},${c.color.g},${c.color.b},${p.opacity})`);
        grad.addColorStop(1, `rgba(${c.color.r},${c.color.g},${c.color.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // float
        ctx.fillStyle = `rgba(${c.color.r},${c.color.g},${c.color.b},${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Connections for 'float' type
    if (c.type === 'float' && this.particles.length < 200) {
      ctx.strokeStyle = `rgba(${c.color.r},${c.color.g},${c.color.b},1)`;
      ctx.lineWidth = 0.4;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < c.connectDist) {
            ctx.globalAlpha = (1 - dist / c.connectDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  _loop() {
    if (!this.running) return;
    this.update();
    this.render();
    this.rafId = requestAnimationFrame(() => this._loop());
  }

  start() {
    if (this.running || !this.canvas) return;
    this.running = true;
    if (this.particles.length === 0) this.init();
    this._loop();
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resizeHandler);
    this.particles = [];
  }

  setMouse(x, y) {
    // Convert page coords to canvas coords
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.mouseX = (x - rect.left) * scaleX;
    this.mouseY = (y - rect.top) * scaleY;
  }
};

/* ------- CountUp ------- */
PhysicsEngine.CountUp = class {
  constructor(element, target, duration = 2, suffix = '') {
    this.element  = element;
    this.target   = target;
    this.duration = duration * 1000;
    this.suffix   = suffix;
    this.startTime = null;
    this.started  = false;
  }

  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  start(callback) {
    if (this.started || !this.element) return;
    this.started = true;
    this.startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const eased = this.easeOut(progress);
      const current = Math.round(eased * this.target);
      this.element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.element.textContent = this.target;
        if (callback) callback();
      }
    };

    requestAnimationFrame(tick);
  }
};

console.log('[ATELIER] Physics engine loaded');

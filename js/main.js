/* ===========================
   Nav
   =========================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===========================
   Scroll fade-in
   =========================== */
document.querySelectorAll('.about-grid, .pub-card, .contact-grid, .section-title')
  .forEach(el => el.classList.add('fade-in'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ===========================
   Hero Canvas — Tokyo Light Overlay
   Screen-blend bokeh orbs + light streaks
   float gently over the photo background.
   =========================== */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;

  /* ---- Bokeh orbs ---- */
  /* Soft glowing circles that drift slowly, like out-of-focus city lights */
  const N_BOKEH = 55;
  const bokeh = [];

  function spawnBokeh(b, randomAge) {
    b.x    = Math.random() * W;
    b.y    = Math.random() * H;
    b.r    = 18 + Math.random() * 60;       // radius 18–78 px
    b.vx   = (Math.random() - 0.5) * 0.18;
    b.vy   = (Math.random() - 0.5) * 0.12;
    b.maxAge = 280 + Math.random() * 400;
    b.age  = randomAge ? Math.random() * b.maxAge : 0;
    /* colour: warm white, amber, or soft red — like Tokyo street lights */
    const p = Math.random();
    if (p < 0.45)      b.h = 42  + Math.random() * 18;  // warm amber
    else if (p < 0.70) b.h = 10  + Math.random() * 15;  // red-orange
    else if (p < 0.88) b.h = 210 + Math.random() * 40;  // cool blue-white
    else               b.h = 55  + Math.random() * 20;  // yellow
    b.s = 60 + Math.random() * 35;
    b.l = 70 + Math.random() * 20;
  }

  function initBokeh() {
    bokeh.length = 0;
    for (let i = 0; i < N_BOKEH; i++) {
      const b = {};
      spawnBokeh(b, true);
      bokeh.push(b);
    }
  }

  function drawBokeh() {
    for (const b of bokeh) {
      const life = Math.sin((b.age / b.maxAge) * Math.PI); // 0→1→0
      const alpha = life * (0.12 + (b.r / 78) * 0.10);
      if (alpha < 0.005) continue;

      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grd.addColorStop(0,   `hsla(${b.h},${b.s}%,${b.l}%,${alpha})`);
      grd.addColorStop(0.45,`hsla(${b.h},${b.s}%,${b.l}%,${alpha * 0.4})`);
      grd.addColorStop(1,   `hsla(${b.h},${b.s}%,${b.l}%,0)`);

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      b.x += b.vx; b.y += b.vy; b.age++;
      if (b.age > b.maxAge) spawnBokeh(b, false);
    }
  }

  /* ---- Light streaks ---- */
  /* Horizontal and vertical streaks like distant car trails / neon reflections */
  const N_STREAKS = 22;
  const streaks = [];

  function spawnStreak(s, born) {
    s.vert  = Math.random() < 0.22;
    s.len   = 60 + Math.random() * 180;
    s.speed = 0.4 + Math.random() * 1.2;
    s.alpha = 0.06 + Math.random() * 0.12;
    /* colour: red/white/amber */
    const p = Math.random();
    if (p < 0.35)      s.col = [232, 25,  44];   // red (Tokyo Tower / taillights)
    else if (p < 0.65) s.col = [255, 220, 180];  // warm white headlights
    else               s.col = [255, 190, 80];   // amber
    s.lw = (p < 0.35) ? 1.3 : 0.65;
    if (s.vert) {
      s.x = Math.random() * W;
      s.y = born ? Math.random() * H : -s.len;
    } else {
      s.x = born ? Math.random() * W : -s.len;
      s.y = Math.floor(Math.random() * H * 0.9);
    }
  }

  function initStreaks() {
    streaks.length = 0;
    for (let i = 0; i < N_STREAKS; i++) {
      const s = {};
      spawnStreak(s, true);
      streaks.push(s);
    }
  }

  function drawStreaks() {
    for (const s of streaks) {
      const [r, g, b] = s.col;
      ctx.lineWidth = s.lw;
      ctx.beginPath();
      if (s.vert) {
        const grd = ctx.createLinearGradient(0, s.y, 0, s.y + s.len);
        grd.addColorStop(0,   `rgba(${r},${g},${b},0)`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${s.alpha})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.strokeStyle = grd;
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.len);
        s.y += s.speed;
        if (s.y > H + s.len) spawnStreak(s, false);
      } else {
        const grd = ctx.createLinearGradient(s.x, 0, s.x + s.len, 0);
        grd.addColorStop(0,   `rgba(${r},${g},${b},0)`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${s.alpha})`);
        grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.strokeStyle = grd;
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.len, s.y);
        s.x += s.speed;
        if (s.x > W + s.len) spawnStreak(s, false);
      }
      ctx.stroke();
    }
  }

  /* ---- Resize ---- */
  function resize() {
    const prevW = W;
    const prevH = H;
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;

    if (!prevW || !prevH || bokeh.length === 0) {
      initBokeh();
      initStreaks();
      return;
    }

    const sx = W / prevW;
    const sy = H / prevH;
    for (const b of bokeh) { b.x *= sx; b.y *= sy; }
    for (const s of streaks) { s.x *= sx; s.y *= sy; }
  }

  /* ---- Draw loop ---- */
  /* Canvas uses mix-blend-mode: screen in CSS, so only
     bright/coloured pixels add to the photo; black = invisible */
  let raf;
  function draw() {
    /* Clear to pure black — with screen blend, black = transparent over photo */
    ctx.clearRect(0, 0, W, H);

    drawBokeh();
    drawStreaks();

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    raf = requestAnimationFrame(draw);
  });

  resize();
  raf = requestAnimationFrame(draw);
})();

/* ===========================
   Publications Canvas — Typical Noise Hypershell
   Inspired by NoiseTilt (ECCV 2026): in high dimensions, Gaussian
   noise concentrates on a thin annular shell — the "typical set".
   Multiple shells at randomised positions; particles orbit each shell.
   Mouse acts as a reward gradient (σ∇r) pulling particles off-shell.
   =========================== */
(function () {
  const canvas = document.getElementById('pub-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = canvas.parentElement;

  let W, H, R;
  let tick = 0;
  const mouse = { x: -9999, y: -9999, active: false };

  const N_RINGS  = 6;    // number of shells — spans full width
  const N_PER    = 60;   // particles per shell
  const N        = N_RINGS * N_PER;
  const rings    = [];   // { cx, cy, phase } — phase offsets breathing
  const particles = [];

  /* Each ring has its own colour for the annulus glow.
     Particles stay multi-coloured but orbit the visible shell. */
  const RING_COLS = [
    [232,  25,  44],  // site red
    [108,  99, 255],  // ICLR purple
    [240, 147, 251],  // NeurIPS pink
    [255, 180,  50],  // arXiv amber
    [240, 240, 244],  // white
    [ 80, 200, 160],  // teal (extra ring)
  ];

  /* Physics */
  const SPRING    = 0.016;
  const DAMPING   = 0.90;
  const MAX_SPD      = 6.0;
  const MOUSE_F      = 0.60;  // stronger than repulsion
  const REPULSE_F    = 0.03;  // weak inter-particle repulsion
  const REPULSE_DIST_F = 0.3; // repulsion radius as fraction of R

  /* Ring breathing */
  const BREATHE_AMP    = 0.022;
  const BREATHE_PERIOD = 0.012;  // faster breathing

  function getRingR(ring) {
    return R * 0.672 * (1 + BREATHE_AMP * Math.sin(tick * BREATHE_PERIOD + ring.phase));
  }

  function initRings() {
    rings.length = 0;
    /* Store positions as fractions of W/H so resize can lerp smoothly. */
    for (let i = 0; i < N_RINGS; i++) {
      const fx = ((i + 0.5) / N_RINGS) + (Math.random() - 0.5) * 0.10;
      const fy = 0.18 + Math.random() * 0.64;
      rings.push({
        fx, fy,
        cx: fx * W,  cy: fy * H,   // current (lerped)
        tcx: fx * W, tcy: fy * H,  // target
        phase: (i / N_RINGS) * Math.PI * 2,
        col:   RING_COLS[i % RING_COLS.length],
      });
    }
  }

  function updateRingTargets() {
    for (const ring of rings) {
      ring.tcx = ring.fx * W;
      ring.tcy = ring.fy * H;
    }
  }

  function spawn(p, ringIdx) {
    const ring   = rings[ringIdx];
    p.ringIdx    = ringIdx;
    p.angle      = Math.random() * Math.PI * 2;
    p.dAngle     = (Math.random() - 0.5) * 0.011;  // tangential drift
    p.radOff     = (Math.random() - 0.5) * R * 0.065;
    p.r          = 1.4 + Math.random() * 1.8;
    /* Particles keep varied colours — ring identity shown by the glow, not dot colour */
    const PCOLS = [
      [240, 240, 244], [240, 240, 244], [240, 240, 244],
      [108,  99, 255], [240, 147, 251], [232,  25,  44], [255, 180,  50],
    ];
    p.col        = PCOLS[Math.floor(Math.random() * PCOLS.length)];
    p.baseAlpha  = 0.24 + Math.random() * 0.28;
    p.phase      = Math.random() * Math.PI * 2;
    p.vx = p.vy = 0;
    const rr = getRingR(ring) + p.radOff;
    p.x = ring.cx + Math.cos(p.angle) * rr;
    p.y = ring.cy + Math.sin(p.angle) * rr;
  }

  function init() {
    initRings();
    particles.length = 0;
    for (let ri = 0; ri < N_RINGS; ri++)
      for (let i = 0; i < N_PER; i++) { const p = {}; spawn(p, ri); particles.push(p); }
  }

  /* Annulus drawn as a radial gradient: transparent at centre, peaks at
     ringR, fades back to transparent — natural soft-edged surface. */
  function drawRing(ring) {
    const ringR  = getRingR(ring);
    const [cr, cg, cb] = ring.col;
    const outer  = ringR + R * 0.11;   // gradient outer radius
    const t_inner = Math.max(0, (ringR - R * 0.11) / outer);  // normalised inner edge
    const t_peak  = ringR / outer;                             // normalised peak

    const grd = ctx.createRadialGradient(ring.cx, ring.cy, 0, ring.cx, ring.cy, outer);
    grd.addColorStop(0,        `rgba(${cr},${cg},${cb},0)`);
    grd.addColorStop(t_inner,  `rgba(${cr},${cg},${cb},0)`);
    grd.addColorStop(t_peak,   `rgba(${cr},${cg},${cb},0.09)`);
    grd.addColorStop(1,        `rgba(${cr},${cg},${cb},0)`);

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(ring.cx, ring.cy, outer, 0, Math.PI * 2);
    ctx.fill();

    /* Dim centre glow (μ_θ reference) */
    const cGrd = ctx.createRadialGradient(ring.cx, ring.cy, 0, ring.cx, ring.cy, R * 0.09);
    cGrd.addColorStop(0, `rgba(${cr},${cg},${cb},0.040)`);
    cGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrd;
    ctx.beginPath();
    ctx.arc(ring.cx, ring.cy, R * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const MOUSE_R = R * 0.60;
    const CD      = R * 0.46;

    /* 1 — Lerp ring centres toward targets, then draw */
    for (const ring of rings) {
      ring.cx += (ring.tcx - ring.cx) * 0.04;
      ring.cy += (ring.tcy - ring.cy) * 0.04;
    }
    for (const ring of rings) drawRing(ring);

    /* 2 — Mouse spotlight */
    if (mouse.active) {
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_R);
      grd.addColorStop(0,   'rgba(232,25,44,0.040)');
      grd.addColorStop(0.5, 'rgba(232,25,44,0.012)');
      grd.addColorStop(1,   'rgba(232,25,44,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    /* 3 — Connections (only within same ring to keep it clean) */
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const pi = particles[i], pj = particles[j];
        if (pi.ringIdx !== pj.ringIdx) continue;
        const dx = pi.x - pj.x, dy = pi.y - pj.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d >= CD) continue;

        const tc = 1 - d / CD;
        const mx = (pi.x + pj.x) * 0.5, my = (pi.y + pj.y) * 0.5;
        const md = Math.sqrt((mx - mouse.x) ** 2 + (my - mouse.y) ** 2);
        const mp = mouse.active ? Math.max(0, 1 - md / MOUSE_R) : 0;

        const cr = Math.round(55  + (232 - 55)  * mp);
        const cg = Math.round(55  + (25  - 55)  * mp);
        const cb = Math.round(65  + (44  - 65)  * mp);
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${tc * (0.040 + 0.18 * mp)})`;
        ctx.lineWidth = 0.5 + mp * 0.8;
        ctx.stroke();
      }
    }

    /* 4a — Repulsion pre-pass: push same-ring particles apart */
    const RD = R * REPULSE_DIST_F;
    const RD2 = RD * RD;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const pi = particles[i], pj = particles[j];
        if (pi.ringIdx !== pj.ringIdx) continue;
        const dx = pi.x - pj.x, dy = pi.y - pj.y;
        const d2 = dx*dx + dy*dy;
        if (d2 >= RD2 || d2 < 0.01) continue;
        const d  = Math.sqrt(d2);
        const f  = REPULSE_F * (1 - d / RD);
        const nx = dx / d, ny = dy / d;
        pi.vx += nx * f;  pi.vy += ny * f;
        pj.vx -= nx * f;  pj.vy -= ny * f;
      }
    }

    /* 4b — Particles */
    for (const p of particles) {
      const ring  = rings[p.ringIdx];
      const ringR = getRingR(ring);

      /* Mouse attraction (σ∇r) */
      if (mouse.active) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MOUSE_R && d > 1) {
          const f = (1 - d / MOUSE_R) * MOUSE_F;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }

      /* Restoring spring to own shell */
      const dxc = p.x - ring.cx, dyc = p.y - ring.cy;
      const rc  = Math.sqrt(dxc*dxc + dyc*dyc);
      if (rc > 0.5) {
        const err = rc - (ringR + p.radOff);
        p.vx -= (dxc / rc) * err * SPRING;
        p.vy -= (dyc / rc) * err * SPRING;
      }

      /* Tangential Brownian drift */
      const ang = Math.atan2(p.y - ring.cy, p.x - ring.cx);
      p.vx -= Math.sin(ang) * p.dAngle;
      p.vy += Math.cos(ang) * p.dAngle;

      /* Damp + cap */
      const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
      if (spd > MAX_SPD) { p.vx *= MAX_SPD / spd; p.vy *= MAX_SPD / spd; }
      p.vx *= DAMPING; p.vy *= DAMPING;

      p.x += p.vx;
      p.y += p.vy;

      /* Off-shell brightness boost */
      const dxc2 = p.x - ring.cx, dyc2 = p.y - ring.cy;
      const rc2  = Math.sqrt(dxc2*dxc2 + dyc2*dyc2);
      const offShell = Math.min(1, Math.abs(rc2 - ringR) / (R * 0.13));

      p.phase += 0.013;
      const alpha = Math.min(0.95,
        p.baseAlpha * (0.72 + 0.28 * Math.sin(p.phase)) * (1 + offShell * 0.65)
      );

      const [r, g, b] = p.col;
      const pr = p.r;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 3.4);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grd.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.32})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pr * 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    tick++;
    requestAnimationFrame(draw);
  }

  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
    R = Math.min(W, H) * 0.38;
    if (rings.length === 0) { init(); } else { updateRingTargets(); }
  }

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  section.addEventListener('mouseleave', () => { mouse.active = false; });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════════════════════════════════════
   ROBOT CINEMA v1.0 — AetherLink Homepage Cinematic Animation

   The AetherLink robot walks in, lasers Grok & Ollama,
   grabs a heart, and becomes happy.

   Self-contained: injects own CSS, creates all DOM, runs timeline.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Only run on homepages ──
  if (!location.pathname.match(/\/(nl|en|fi)\/(index\.html)?$/)) return;

  // ── Respect reduced motion ──
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ════════════════════════════════════════════
     CONFIGURATION
     ════════════════════════════════════════════ */
  const CFG = {
    robotScale: 1,
    walkSpeed: 120,          // px per second
    laserDuration: 800,      // ms per laser shot
    explosionParticles: 35,
    startDelay: 3000,        // ms after hero visible
    heartSize: 32,
  };

  /* ════════════════════════════════════════════
     UTILITY HELPERS
     ════════════════════════════════════════════ */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(rand(min, max + 1));

  function animate(el, props, dur, ease = 'cubic-bezier(.4,0,.2,1)') {
    return new Promise(resolve => {
      el.style.transition = Object.keys(props).map(k => `${k} ${dur}ms ${ease}`).join(',');
      requestAnimationFrame(() => {
        Object.entries(props).forEach(([k, v]) => { el.style[k] = v; });
      });
      setTimeout(resolve, dur);
    });
  }

  function getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* ════════════════════════════════════════════
     CSS INJECTION
     ════════════════════════════════════════════ */
  function injectCSS() {
    const style = document.createElement('style');
    style.id = 'rc-styles';
    style.textContent = `
/* ── Robot Cinema Stage ── */
.rc-stage {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  overflow: hidden;
}

/* ── Robot Container ── */
.rc-robot {
  position: absolute;
  width: 80px;
  height: 140px;
  transform-origin: center bottom;
  z-index: 20;
  filter: drop-shadow(0 0 12px rgba(0,212,255,0.15));
}

/* ── Walking bob ── */
.rc-robot.rc-walking .rc-body-group {
  animation: rc-bob 0.5s ease-in-out infinite;
}
@keyframes rc-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ── Head ── */
.rc-head {
  position: absolute;
  left: 50%;
  top: 0;
  width: 38px;
  height: 32px;
  margin-left: -19px;
  background: linear-gradient(180deg, #151d38, #0d1228);
  border: 1.5px solid rgba(0,212,255,0.25);
  border-radius: 12px 12px 8px 8px;
  z-index: 3;
  transition: transform 0.5s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 0 16px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05);
}

/* ── Antenna ── */
.rc-antenna {
  position: absolute;
  left: 50%;
  top: -12px;
  width: 2px;
  height: 10px;
  margin-left: -1px;
  background: linear-gradient(180deg, rgba(0,212,255,0.6), rgba(0,212,255,0.1));
  border-radius: 1px;
}
.rc-antenna::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00d4ff;
  box-shadow: 0 0 8px #00d4ff, 0 0 16px rgba(0,212,255,0.4);
  animation: rc-antenna-pulse 2s ease-in-out infinite;
}
@keyframes rc-antenna-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* ── Eyes ── */
.rc-eye {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00d4ff;
  top: 10px;
  box-shadow: 0 0 6px #00d4ff, 0 0 12px rgba(0,212,255,0.4);
  transition: all 0.3s ease;
}
.rc-eye-l { left: 8px; }
.rc-eye-r { right: 8px; }

/* Eye charge-up for laser */
.rc-eye.rc-charging {
  background: #fff;
  box-shadow: 0 0 12px #fff, 0 0 24px #00d4ff, 0 0 40px rgba(0,212,255,0.6);
  transform: scale(1.4);
}

/* Happy eyes — upside down U shape */
.rc-eye.rc-happy {
  height: 4px;
  border-radius: 4px 4px 0 0;
  background: #ff6b9d;
  box-shadow: 0 0 8px #ff6b9d, 0 0 16px rgba(255,107,157,0.4);
}

/* ── Mouth ── */
.rc-mouth {
  position: absolute;
  left: 50%;
  top: 21px;
  width: 12px;
  height: 2px;
  margin-left: -6px;
  background: rgba(0,212,255,0.35);
  border-radius: 1px;
  transition: all 0.5s ease;
}
.rc-mouth.rc-happy {
  width: 14px;
  margin-left: -7px;
  height: 7px;
  border-radius: 0 0 7px 7px;
  background: #ff6b9d;
  top: 20px;
  box-shadow: 0 0 6px rgba(255,107,157,0.3);
}

/* ── Body ── */
.rc-body-group {
  position: relative;
  width: 100%;
  height: 100%;
}

.rc-torso {
  position: absolute;
  left: 50%;
  top: 30px;
  width: 34px;
  height: 40px;
  margin-left: -17px;
  background: linear-gradient(180deg, #121a30, #0a0f20);
  border: 1.5px solid rgba(0,212,255,0.2);
  border-radius: 6px 6px 8px 8px;
  z-index: 2;
  box-shadow: 0 0 12px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04);
  transition: all 0.8s ease;
}

/* ── Chest Panel ── */
.rc-chest {
  position: absolute;
  left: 50%;
  top: 8px;
  width: 18px;
  height: 14px;
  margin-left: -9px;
  background: rgba(0,212,255,0.06);
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 3px;
  overflow: hidden;
  transition: all 0.5s ease;
}
.rc-chest-lights {
  display: flex;
  gap: 3px;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.rc-chest-light {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #00d4ff;
  opacity: 0.5;
  animation: rc-chest-blink 1.5s ease-in-out infinite;
}
.rc-chest-light:nth-child(2) { animation-delay: 0.3s; background: #8b5cf6; }
.rc-chest-light:nth-child(3) { animation-delay: 0.6s; background: #00dfa2; }
@keyframes rc-chest-blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Heart in chest */
.rc-chest.rc-has-heart {
  border-color: rgba(255,107,157,0.5);
  background: rgba(255,107,157,0.15);
  box-shadow: 0 0 12px rgba(255,107,157,0.3);
}

/* ── Arms ── */
.rc-arm {
  position: absolute;
  top: 32px;
  width: 8px;
  height: 36px;
  z-index: 1;
  transform-origin: center top;
  transition: transform 0.3s ease;
}
.rc-arm-l { left: 12px; }
.rc-arm-r { right: 12px; }

.rc-arm-upper {
  width: 8px;
  height: 18px;
  background: linear-gradient(180deg, #151d38, #0d1228);
  border: 1px solid rgba(0,212,255,0.15);
  border-radius: 4px;
}
.rc-arm-lower {
  width: 7px;
  height: 16px;
  background: linear-gradient(180deg, #0d1228, #0a0e1c);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 3px;
  margin-top: 2px;
  margin-left: 0.5px;
}
.rc-arm-hand {
  width: 9px;
  height: 6px;
  background: #151d38;
  border: 1px solid rgba(0,212,255,0.15);
  border-radius: 2px 2px 4px 4px;
  margin-top: 1px;
  margin-left: -1px;
}

/* Arm walk cycle */
.rc-walking .rc-arm-l { animation: rc-arm-swing-l 0.5s ease-in-out infinite; }
.rc-walking .rc-arm-r { animation: rc-arm-swing-r 0.5s ease-in-out infinite; }
@keyframes rc-arm-swing-l {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}
@keyframes rc-arm-swing-r {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-20deg); }
  75% { transform: rotate(20deg); }
}

/* Arm raise for laser */
.rc-arm.rc-aim {
  animation: none !important;
  transform: rotate(-90deg) !important;
  transition: transform 0.4s cubic-bezier(.4,0,.2,1);
}

/* ── Legs ── */
.rc-leg {
  position: absolute;
  top: 68px;
  width: 10px;
  height: 38px;
  z-index: 1;
  transform-origin: center top;
  transition: transform 0.3s ease;
}
.rc-leg-l { left: 22px; }
.rc-leg-r { right: 22px; }

.rc-leg-thigh {
  width: 10px;
  height: 18px;
  background: linear-gradient(180deg, #121a30, #0d1228);
  border: 1px solid rgba(0,212,255,0.12);
  border-radius: 4px;
}
.rc-leg-shin {
  width: 9px;
  height: 14px;
  background: linear-gradient(180deg, #0d1228, #080c18);
  border: 1px solid rgba(0,212,255,0.08);
  border-radius: 3px;
  margin-top: 2px;
  margin-left: 0.5px;
}
.rc-leg-foot {
  width: 14px;
  height: 5px;
  background: #151d38;
  border: 1px solid rgba(0,212,255,0.15);
  border-radius: 2px 2px 5px 5px;
  margin-top: 1px;
  margin-left: -2.5px;
}

/* Leg walk cycle */
.rc-walking .rc-leg-l { animation: rc-leg-swing-l 0.5s ease-in-out infinite; }
.rc-walking .rc-leg-r { animation: rc-leg-swing-r 0.5s ease-in-out infinite; }
@keyframes rc-leg-swing-l {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-25deg); }
  75% { transform: rotate(25deg); }
}
@keyframes rc-leg-swing-r {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(25deg); }
  75% { transform: rotate(-25deg); }
}

/* ── Happy bounce ── */
.rc-robot.rc-happy-bounce {
  animation: rc-happy-dance 0.6s ease-in-out infinite;
}
@keyframes rc-happy-dance {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-12px) rotate(-5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-12px) rotate(5deg); }
}

/* ── Pink/Red transformation ── */
.rc-robot.rc-love .rc-head {
  border-color: rgba(255,107,157,0.4);
  background: linear-gradient(180deg, #2d1525, #1e0d18);
  box-shadow: 0 0 20px rgba(255,107,157,0.15);
}
.rc-robot.rc-love .rc-torso {
  border-color: rgba(255,107,157,0.3);
  background: linear-gradient(180deg, #251220, #1a0c15);
  box-shadow: 0 0 16px rgba(255,107,157,0.1);
}
.rc-robot.rc-love .rc-arm-upper,
.rc-robot.rc-love .rc-arm-lower,
.rc-robot.rc-love .rc-arm-hand {
  background: linear-gradient(180deg, #2d1525, #1e0d18);
  border-color: rgba(255,107,157,0.2);
}
.rc-robot.rc-love .rc-leg-thigh,
.rc-robot.rc-love .rc-leg-shin,
.rc-robot.rc-love .rc-leg-foot {
  background: linear-gradient(180deg, #251220, #1a0c15);
  border-color: rgba(255,107,157,0.15);
}
.rc-robot.rc-love .rc-antenna::after {
  background: #ff6b9d;
  box-shadow: 0 0 8px #ff6b9d, 0 0 16px rgba(255,107,157,0.5);
}
.rc-robot.rc-love .rc-chest-light {
  background: #ff6b9d !important;
}
.rc-robot.rc-love {
  filter: drop-shadow(0 0 20px rgba(255,107,157,0.25));
}

/* ── Laser Beam ── */
.rc-laser {
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg, #fff, #00d4ff 20%, rgba(0,212,255,0.3));
  border-radius: 2px;
  z-index: 25;
  pointer-events: none;
  box-shadow: 0 0 8px #00d4ff, 0 0 16px rgba(0,212,255,0.4), 0 0 32px rgba(0,212,255,0.2);
  transform-origin: left center;
  opacity: 0;
}
.rc-laser.rc-fire {
  opacity: 1;
  animation: rc-laser-pulse 0.15s ease-in-out infinite;
}
@keyframes rc-laser-pulse {
  0%, 100% { height: 3px; box-shadow: 0 0 8px #00d4ff, 0 0 16px rgba(0,212,255,0.4); }
  50% { height: 5px; box-shadow: 0 0 12px #00d4ff, 0 0 24px rgba(0,212,255,0.6), 0 0 48px rgba(0,212,255,0.3); }
}

/* ── Impact glow ── */
.rc-impact {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(0,212,255,0.5), transparent);
  z-index: 26;
  pointer-events: none;
  animation: rc-impact-grow 0.3s ease-out forwards;
}
@keyframes rc-impact-grow {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

/* ── Explosion Particles ── */
.rc-particle {
  position: absolute;
  border-radius: 50%;
  z-index: 27;
  pointer-events: none;
}
.rc-particle.rc-spark {
  animation: rc-spark-fly var(--dur) cubic-bezier(.2,0,.3,1) forwards;
}
@keyframes rc-spark-fly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  70% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

/* Shockwave ring */
.rc-shockwave {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255,165,0,0.8);
  z-index: 26;
  pointer-events: none;
  animation: rc-shockwave-expand 0.6s ease-out forwards;
}
@keyframes rc-shockwave-expand {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; border-width: 3px; }
  100% { transform: translate(-50%, -50%) scale(12); opacity: 0; border-width: 0.5px; }
}

/* Flash */
.rc-flash {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff, rgba(255,200,0,0.6), transparent);
  z-index: 28;
  pointer-events: none;
  animation: rc-flash-pop 0.3s ease-out forwards;
}
@keyframes rc-flash-pop {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}

/* ── Heart ── */
.rc-heart {
  position: absolute;
  z-index: 24;
  pointer-events: none;
  animation: rc-heart-float 1s ease-in-out infinite alternate;
}
@keyframes rc-heart-float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-6px) scale(1.05); }
}
.rc-heart svg {
  filter: drop-shadow(0 0 8px rgba(255,107,157,0.5));
}

/* ── Love particles (mini hearts) ── */
.rc-love-particle {
  position: absolute;
  z-index: 22;
  pointer-events: none;
  animation: rc-love-rise var(--dur) ease-out forwards;
  opacity: 0;
}
@keyframes rc-love-rise {
  0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--rot)); opacity: 0; }
}

/* ── Replay button ── */
.rc-replay {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 30;
  pointer-events: auto;
  background: rgba(10,13,26,0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 10px;
  padding: 8px 16px;
  color: #00d4ff;
  font-family: 'Syne', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rc-replay:hover {
  background: rgba(0,212,255,0.1);
  border-color: rgba(0,212,255,0.4);
  transform: translateY(-2px);
}
.rc-replay.rc-visible {
  opacity: 1;
}

/* ── Screen shake ── */
.rc-shake {
  animation: rc-screen-shake 0.3s ease-out;
}
@keyframes rc-screen-shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-3px, 2px); }
  20% { transform: translate(4px, -2px); }
  30% { transform: translate(-2px, 3px); }
  40% { transform: translate(3px, -1px); }
  50% { transform: translate(-1px, 2px); }
  60% { transform: translate(2px, -2px); }
  70% { transform: translate(-3px, 1px); }
  80% { transform: translate(1px, -1px); }
  90% { transform: translate(-1px, 1px); }
}

/* ── Desktop only ── */
@media (max-width: 1024px) {
  .rc-stage { display: none !important; }
}
`;
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════
     CREATE ROBOT DOM
     ════════════════════════════════════════════ */
  function createRobot() {
    const robot = document.createElement('div');
    robot.className = 'rc-robot';
    robot.innerHTML = `
      <div class="rc-body-group">
        <!-- Head -->
        <div class="rc-head">
          <div class="rc-antenna"></div>
          <div class="rc-eye rc-eye-l"></div>
          <div class="rc-eye rc-eye-r"></div>
          <div class="rc-mouth"></div>
        </div>
        <!-- Torso -->
        <div class="rc-torso">
          <div class="rc-chest">
            <div class="rc-chest-lights">
              <span class="rc-chest-light"></span>
              <span class="rc-chest-light"></span>
              <span class="rc-chest-light"></span>
            </div>
          </div>
        </div>
        <!-- Left Arm -->
        <div class="rc-arm rc-arm-l">
          <div class="rc-arm-upper"></div>
          <div class="rc-arm-lower"></div>
          <div class="rc-arm-hand"></div>
        </div>
        <!-- Right Arm -->
        <div class="rc-arm rc-arm-r">
          <div class="rc-arm-upper"></div>
          <div class="rc-arm-lower"></div>
          <div class="rc-arm-hand"></div>
        </div>
        <!-- Left Leg -->
        <div class="rc-leg rc-leg-l">
          <div class="rc-leg-thigh"></div>
          <div class="rc-leg-shin"></div>
          <div class="rc-leg-foot"></div>
        </div>
        <!-- Right Leg -->
        <div class="rc-leg rc-leg-r">
          <div class="rc-leg-thigh"></div>
          <div class="rc-leg-shin"></div>
          <div class="rc-leg-foot"></div>
        </div>
      </div>
    `;
    return robot;
  }

  function createHeart(size = 32) {
    const heart = document.createElement('div');
    heart.className = 'rc-heart';
    heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ff3366">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;
    return heart;
  }

  /* ════════════════════════════════════════════
     EFFECTS
     ════════════════════════════════════════════ */

  function createExplosion(stage, x, y) {
    const colors = ['#ff4400', '#ff8800', '#ffcc00', '#fff', '#ff6600', '#ff2200', '#ffaa00'];
    const particles = [];

    // Flash
    const flash = document.createElement('div');
    flash.className = 'rc-flash';
    flash.style.left = x + 'px';
    flash.style.top = y + 'px';
    stage.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Shockwave
    const wave = document.createElement('div');
    wave.className = 'rc-shockwave';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    stage.appendChild(wave);
    setTimeout(() => wave.remove(), 700);

    // Second shockwave (delayed)
    setTimeout(() => {
      const wave2 = document.createElement('div');
      wave2.className = 'rc-shockwave';
      wave2.style.left = x + 'px';
      wave2.style.top = y + 'px';
      wave2.style.borderColor = 'rgba(255,100,0,0.6)';
      stage.appendChild(wave2);
      setTimeout(() => wave2.remove(), 700);
    }, 100);

    // Particles
    for (let i = 0; i < CFG.explosionParticles; i++) {
      const p = document.createElement('div');
      p.className = 'rc-particle rc-spark';
      const size = rand(2, 10);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(40, 160);
      const dur = rand(400, 900);
      const color = colors[randInt(0, colors.length - 1)];

      p.style.cssText = `
        left: ${x}px; top: ${y}px;
        width: ${size}px; height: ${size}px;
        background: ${color};
        box-shadow: 0 0 ${size}px ${color};
        margin-left: ${-size / 2}px;
        margin-top: ${-size / 2}px;
        --tx: ${Math.cos(angle) * dist}px;
        --ty: ${Math.sin(angle) * dist}px;
        --dur: ${dur}ms;
      `;

      // Some particles elongated (shrapnel)
      if (Math.random() > 0.6) {
        p.style.borderRadius = '2px';
        p.style.width = size * 2.5 + 'px';
        p.style.transform = `rotate(${angle}rad)`;
      }

      stage.appendChild(p);
      particles.push(p);
      setTimeout(() => p.remove(), dur + 50);
    }

    return particles;
  }

  function createLaser(stage, fromX, fromY, toX, toY) {
    const laser = document.createElement('div');
    laser.className = 'rc-laser';

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    laser.style.cssText = `
      left: ${fromX}px;
      top: ${fromY - 1.5}px;
      width: ${length}px;
      transform: rotate(${angle}rad);
    `;

    stage.appendChild(laser);
    return laser;
  }

  function spawnLoveParticles(stage, x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'rc-love-particle';
      const s = rand(8, 16);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(30, 80);
      const dur = rand(800, 1500);
      p.innerHTML = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="#ff6b9d"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      p.style.cssText = `
        left: ${x}px; top: ${y}px;
        --tx: ${Math.cos(angle) * dist}px;
        --ty: ${-Math.abs(Math.sin(angle) * dist) - 20}px;
        --rot: ${rand(-180, 180)}deg;
        --dur: ${dur}ms;
      `;
      stage.appendChild(p);
      setTimeout(() => p.remove(), dur + 50);
    }
  }

  /* ════════════════════════════════════════════
     ANIMATION TIMELINE
     ════════════════════════════════════════════ */
  async function runCinema(stage, robot) {
    const hero = $('#hero');
    const heroRect = hero.getBoundingClientRect();
    const orbitWrap = $('.orbit-wrap');
    if (!orbitWrap) return;

    const orbitRect = orbitWrap.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    // Convert orbit center to stage-relative coordinates
    const orbitCenterX = orbitRect.left + orbitRect.width / 2 - stageRect.left;
    const orbitCenterY = orbitRect.top + orbitRect.height / 2 - stageRect.top;

    // Find Grok and Ollama orbital icons
    const allOi = $$('.oi');
    let grokEl = null, ollamaEl = null;
    allOi.forEach(oi => {
      const img = $('img', oi);
      if (!img) return;
      const alt = (img.alt || '').toLowerCase();
      if (alt.includes('grok')) grokEl = oi;
      if (alt.includes('ollama') || alt.includes('olama')) ollamaEl = oi;
    });

    // Robot start position (left side, bottom of hero)
    const startX = -100;
    const groundY = Math.min(orbitCenterY + 80, stageRect.height - 160);

    // Position robot
    robot.style.left = startX + 'px';
    robot.style.top = groundY + 'px';
    robot.style.opacity = '0';

    // Target: walk to near the orbital
    const targetX = orbitCenterX - 180;

    // ── ACT 1: Robot enters ──
    robot.style.opacity = '1';
    robot.style.transition = 'opacity 0.5s ease';
    await wait(100);

    // Start walking
    robot.classList.add('rc-walking');

    // Walk to target
    const walkDur = Math.abs(targetX - startX) / CFG.walkSpeed * 1000;
    await animate(robot, { left: targetX + 'px' }, walkDur, 'linear');

    // ── ACT 2: Stop, head turns to face orbital ──
    robot.classList.remove('rc-walking');
    await wait(300);

    // Head turns toward orbital
    const head = $('.rc-head', robot);
    head.style.transform = 'rotateY(-20deg) rotateZ(-3deg)';
    await wait(500);

    // ── ACT 3: Walk forward into depth (smaller, perspective) ──
    const depthX = orbitCenterX - 100;
    const depthY = groundY - 30;
    robot.classList.add('rc-walking');
    head.style.transform = 'rotateY(-15deg) rotateX(-5deg)';

    await animate(robot, {
      left: depthX + 'px',
      top: depthY + 'px',
      transform: 'scale(0.85)',
    }, 1200, 'ease-in-out');

    robot.classList.remove('rc-walking');
    await wait(200);

    // Head looks directly at orbital targets
    head.style.transform = 'rotateY(-25deg)';
    await wait(400);

    // ── ACT 4: Charge up eyes ──
    const eyeL = $('.rc-eye-l', robot);
    const eyeR = $('.rc-eye-r', robot);
    eyeL.classList.add('rc-charging');
    eyeR.classList.add('rc-charging');

    // Raise right arm to aim
    const armR = $('.rc-arm-r', robot);
    armR.classList.add('rc-aim');
    await wait(600);

    // ── ACT 5: LASER GROK ──
    if (grokEl) {
      // Pause orbital animations
      $$('.oi, .orbit-arc').forEach(el => {
        el.style.animationPlayState = 'paused';
      });
      await wait(200);

      // Get Grok position
      const grokPos = getCenter(grokEl);
      const robotEyeX = robot.getBoundingClientRect().left + 50;
      const robotEyeY = robot.getBoundingClientRect().top + 14;

      // Stage-relative positions
      const laserFromX = robotEyeX - stageRect.left;
      const laserFromY = robotEyeY - stageRect.top;
      const laserToX = grokPos.x - stageRect.left;
      const laserToY = grokPos.y - stageRect.top;

      // Create dual laser beams (from both eyes)
      const laser1 = createLaser(stage, laserFromX, laserFromY, laserToX, laserToY);
      const laser2 = createLaser(stage, laserFromX - 4, laserFromY, laserToX, laserToY);
      laser2.style.height = '2px';
      laser2.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(139,92,246,0.5) 20%, transparent)';
      laser2.style.boxShadow = '0 0 6px #8b5cf6';

      await wait(50);
      laser1.classList.add('rc-fire');
      laser2.classList.add('rc-fire');

      // Impact on Grok
      await wait(CFG.laserDuration);

      // EXPLOSION!
      createExplosion(stage, laserToX, laserToY);

      // Screen shake
      hero.classList.add('rc-shake');
      setTimeout(() => hero.classList.remove('rc-shake'), 350);

      // Remove lasers
      laser1.remove();
      laser2.remove();

      // Hide Grok
      grokEl.style.transition = 'opacity 0.3s ease';
      grokEl.style.opacity = '0';
      setTimeout(() => { grokEl.style.visibility = 'hidden'; }, 300);

      await wait(500);
    }

    // ── ACT 6: LASER OLLAMA ──
    if (ollamaEl) {
      // Get Ollama position
      const ollamaPos = getCenter(ollamaEl);
      const robotEyeX = robot.getBoundingClientRect().left + 50;
      const robotEyeY = robot.getBoundingClientRect().top + 14;

      const laserFromX = robotEyeX - stageRect.left;
      const laserFromY = robotEyeY - stageRect.top;
      const laserToX = ollamaPos.x - stageRect.left;
      const laserToY = ollamaPos.y - stageRect.top;

      // Head adjust to aim at Ollama
      const aimAngle = Math.atan2(ollamaPos.y - robotEyeY, ollamaPos.x - robotEyeX);
      head.style.transform = `rotateY(-20deg) rotateZ(${aimAngle > 0 ? 3 : -3}deg)`;
      await wait(300);

      const laser1 = createLaser(stage, laserFromX, laserFromY, laserToX, laserToY);
      const laser2 = createLaser(stage, laserFromX - 4, laserFromY, laserToX, laserToY);
      laser2.style.height = '2px';
      laser2.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(0,223,162,0.5) 20%, transparent)';
      laser2.style.boxShadow = '0 0 6px #00dfa2';

      await wait(50);
      laser1.classList.add('rc-fire');
      laser2.classList.add('rc-fire');

      await wait(CFG.laserDuration);

      // EXPLOSION!
      createExplosion(stage, laserToX, laserToY);

      hero.classList.add('rc-shake');
      setTimeout(() => hero.classList.remove('rc-shake'), 350);

      laser1.remove();
      laser2.remove();

      ollamaEl.style.transition = 'opacity 0.3s ease';
      ollamaEl.style.opacity = '0';
      setTimeout(() => { ollamaEl.style.visibility = 'hidden'; }, 300);

      await wait(500);
    }

    // ── ACT 7: Stop aiming, eyes back to normal ──
    eyeL.classList.remove('rc-charging');
    eyeR.classList.remove('rc-charging');
    armR.classList.remove('rc-aim');
    head.style.transform = 'rotateY(0deg)';
    await wait(400);

    // Resume orbital (minus destroyed icons)
    $$('.oi, .orbit-arc').forEach(el => {
      if (el !== grokEl && el !== ollamaEl) {
        el.style.animationPlayState = 'running';
      }
    });

    // ── ACT 8: Walk closer to grab heart ──
    robot.classList.add('rc-walking');
    const heartTargetX = orbitCenterX - 60;
    const heartTargetY = depthY - 10;

    await animate(robot, {
      left: heartTargetX + 'px',
      top: heartTargetY + 'px',
      transform: 'scale(0.8)',
    }, 1000, 'ease-in-out');
    robot.classList.remove('rc-walking');
    await wait(300);

    // ── ACT 9: Heart appears from orbital center ──
    const heart = createHeart(CFG.heartSize);
    heart.style.left = orbitCenterX + 'px';
    heart.style.top = orbitCenterY + 'px';
    heart.style.opacity = '0';
    heart.style.transform = 'translate(-50%, -50%) scale(0.3)';
    stage.appendChild(heart);

    await animate(heart, {
      opacity: '1',
      transform: 'translate(-50%, -50%) scale(1)',
    }, 600, 'cubic-bezier(.3,1.5,.7,1)');

    await wait(600);

    // ── ACT 10: Heart floats to robot ──
    const robotCenterX = robot.getBoundingClientRect().left + 40 - stageRect.left;
    const robotChestY = robot.getBoundingClientRect().top + 46 - stageRect.top;

    heart.style.animation = 'none';
    await animate(heart, {
      left: robotCenterX + 'px',
      top: robotChestY + 'px',
      transform: 'translate(-50%, -50%) scale(0.5)',
    }, 800, 'cubic-bezier(.4,0,.2,1)');

    // Heart enters chest
    await animate(heart, {
      transform: 'translate(-50%, -50%) scale(0)',
      opacity: '0',
    }, 400, 'ease-in');
    heart.remove();

    // Chest panel glows
    const chest = $('.rc-chest', robot);
    chest.classList.add('rc-has-heart');

    // Small burst of love particles
    spawnLoveParticles(stage, robotCenterX, robotChestY, 8);
    await wait(300);

    // ── ACT 11: TRANSFORMATION — Pink/Red + Happy! ──
    robot.classList.add('rc-love');
    await wait(300);

    // Happy eyes and mouth
    eyeL.classList.add('rc-happy');
    eyeR.classList.add('rc-happy');
    const mouth = $('.rc-mouth', robot);
    mouth.classList.add('rc-happy');
    await wait(200);

    // Happy dance!
    robot.classList.add('rc-happy-bounce');

    // Shower of love particles
    for (let i = 0; i < 4; i++) {
      await wait(400);
      spawnLoveParticles(stage, robotCenterX, robotChestY - 20, 6);
    }

    await wait(1500);

    // ── ACT 12: Calm down, gentle idle ──
    robot.classList.remove('rc-happy-bounce');
    robot.style.transition = 'transform 1s ease';
    robot.style.transform = 'scale(0.8)';
    await wait(1500);

    // ── ACT 13: Fade out — laser bot disappears ──
    robot.style.transition = 'opacity 2s ease, transform 2s ease';
    robot.style.opacity = '0';
    robot.style.transform = 'scale(0.5) translateY(20px)';
    await wait(2200);
    robot.style.display = 'none';

    // Show replay button
    const replay = stage.querySelector('.rc-replay');
    if (replay) replay.classList.add('rc-visible');
  }

  /* ════════════════════════════════════════════
     RESET & REPLAY
     ════════════════════════════════════════════ */
  function resetCinema(stage, robot) {
    // Remove replay visibility
    const replay = stage.querySelector('.rc-replay');
    if (replay) replay.classList.remove('rc-visible');

    // Reset robot state
    robot.className = 'rc-robot';
    robot.style.cssText = '';
    robot.style.display = '';
    robot.style.opacity = '1';
    const head = $('.rc-head', robot);
    if (head) head.style.transform = '';
    $$('.rc-eye', robot).forEach(e => { e.className = e.className.replace(/rc-(charging|happy)/g, '').trim(); });
    const mouth = $('.rc-mouth', robot);
    if (mouth) mouth.classList.remove('rc-happy');
    const chest = $('.rc-chest', robot);
    if (chest) chest.classList.remove('rc-has-heart');
    $$('.rc-arm', robot).forEach(a => a.classList.remove('rc-aim'));

    // Remove effects
    $$('.rc-laser, .rc-particle, .rc-impact, .rc-flash, .rc-shockwave, .rc-heart, .rc-love-particle', stage).forEach(e => e.remove());

    // Restore Grok & Ollama
    $$('.oi').forEach(oi => {
      oi.style.opacity = '';
      oi.style.visibility = '';
      oi.style.animationPlayState = '';
    });
    $$('.orbit-arc').forEach(a => {
      a.style.animationPlayState = '';
    });
  }

  /* ════════════════════════════════════════════
     INITIALIZATION
     ════════════════════════════════════════════ */
  function init() {
    injectCSS();

    const hero = $('#hero');
    if (!hero) return;

    // Make hero relative for staging
    hero.style.position = hero.style.position || 'relative';

    // Create stage overlay
    const stage = document.createElement('div');
    stage.className = 'rc-stage';

    // Replay button
    const replay = document.createElement('button');
    replay.className = 'rc-replay';
    replay.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Replay`;
    stage.appendChild(replay);

    // Create robot
    const robot = createRobot();
    stage.appendChild(robot);

    hero.appendChild(stage);

    // Replay handler
    replay.addEventListener('click', () => {
      resetCinema(stage, robot);
      setTimeout(() => runCinema(stage, robot), 500);
    });

    // Start cinema when hero is visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        setTimeout(() => runCinema(stage, robot), CFG.startDelay);
      }
    }, { threshold: 0.3 });
    observer.observe(hero);
  }

  // ── Boot ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

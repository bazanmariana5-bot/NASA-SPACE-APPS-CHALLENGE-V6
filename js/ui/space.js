/* js/ui/space.js — Campo de estrellas animado (canvas) con estrellas fugaces.
   Se detiene cuando la pestaña no está visible y respeta "reducir movimiento". */
"use strict";

(() => {
  const cv = document.getElementById("stars");
  if (!cv || !cv.getContext || typeof innerWidth === "undefined" || typeof requestAnimationFrame !== "function") return;
  const cx = cv.getContext("2d"),
    still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shoot = [];
  let W = 0,
    H = 0,
    stars = [],
    raf = 0,
    last = 0,
    nextShoot = 2500;

  function color() {
    return ["#ffffff", "#cfe0ff", "#ffe9c4"]; /* el fondo espacial es siempre el del modo oscuro */
  }

  function resize() {
    const dpr = Math.min(typeof devicePixelRatio === "number" ? devicePixelRatio : 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(260, (W * H) / 6500));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      z: Math.random() * 0.8 + 0.2,
      t: Math.random() * 6.28,
      s: Math.random() * 1.6 + 0.6,
      c: Math.random()
    }));
    draw(0);
  }

  function draw(dt) {
    cx.clearRect(0, 0, W, H);
    const pal = color();
    for (const s of stars) {
      s.y += s.z * dt * 0.012; /* deriva lenta hacia abajo */
      s.x -= s.z * dt * 0.004;
      if (s.y > H + 2) {
        s.y = -2;
        s.x = Math.random() * W;
      }
      if (s.x < -2) s.x = W + 2;
      s.t += dt * 0.001 * s.s;
      cx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(s.t));
      cx.fillStyle = pal[s.c < 0.7 ? 0 : s.c < 0.9 ? 1 : 2];
      cx.beginPath();
      cx.arc(s.x, s.y, s.r * s.z + 0.2, 0, 6.283);
      cx.fill();
    }
    for (let i = shoot.length - 1; i >= 0; i--) {
      const m = shoot[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt;
      const g = cx.createLinearGradient(m.x, m.y, m.x - m.vx * 160, m.y - m.vy * 160);
      g.addColorStop(0, pal[0]);
      g.addColorStop(1, "transparent");
      cx.globalAlpha = Math.max(0, m.life / m.max);
      cx.strokeStyle = g;
      cx.lineWidth = 1.8;
      cx.beginPath();
      cx.moveTo(m.x, m.y);
      cx.lineTo(m.x - m.vx * 160, m.y - m.vy * 160);
      cx.stroke();
      if (m.life <= 0) shoot.splice(i, 1);
    }
    cx.globalAlpha = 1;
  }

  function frame(ts) {
    const dt = Math.min(48, ts - (last || ts));
    last = ts;
    nextShoot -= dt;
    if (nextShoot <= 0) {
      nextShoot = 3500 + Math.random() * 5500;
      const a = Math.random() * 0.5 + 0.35;
      shoot.push({
        x: Math.random() * W * 0.8,
        y: Math.random() * H * 0.4,
        vx: Math.cos(a) * 0.9,
        vy: Math.sin(a) * 0.9,
        life: 900,
        max: 900
      });
    }
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function run() {
    if (still || raf) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function halt() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => (document.hidden ? halt() : run()));
  if (typeof MutationObserver === "function")
    new MutationObserver(() => draw(0)).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

  resize();
  run();
})();

/* Fondo según el entorno (estación, Marte o Luna): se lee del estado y se aplica como data-env. */
(() => {
  if (typeof S === "undefined" || typeof setInterval !== "function") return;
  const root = document.documentElement;
  let cur = "";
  const sync = () => {
    if (S.env !== cur) {
      cur = S.env;
      root.setAttribute("data-env", cur);
    }
  };
  sync();
  setInterval(sync, 300);
})();

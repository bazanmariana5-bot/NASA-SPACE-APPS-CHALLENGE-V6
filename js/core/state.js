/* apps.js — estado, motor fisiológico, persistencia, gamificación, panel, registro por zona y pruebas jugables. */
"use strict";

const $ = id => document.getElementById(id),
      esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const fmt = (p, v) => v.toFixed(p.d).replace(".", ","),
      bd = s => `<span class="bd t${s}">${SN[s]}</span>`;

/* día actual de la misión: la barra solo llega hasta aquí; se avanza de a poco */
const TK = "orbital_today_v1",
      loadToday = () => { try { return clamp(parseInt(localStorage.getItem(TK)) || 30, 30, 300); } catch (e) { return 30; } };

/* ningún parámetro admite negativos salvo T-score y Z-score */
const NEGOK = new Set(["pie.t", "pie.z"]);
const cleanV = v => {
  const o = {};
  Object.entries(v || {}).forEach(([k, x]) => {
    if (typeof x === "number" && x < 0 && !NEGOK.has(k)) return;
    o[k] = x;
  });
  return o;
};

const S = { crew: "c1", env: "iss", day: 30, today: loadToday(), tab: "panel", sel: {}, par: {}, cat: "all", cmp: 0, rl: "huesos", cc: {} };
CREW.forEach(c => S.cc[c.id] = { adh: 40, vas: 3 });

const cfg = (id = S.crew) => S.cc[id],
      crewOf = (id = S.crew) => CREW.find(x => x.id === id),
      layer = () => S.tab === "registro" ? S.rl : S.tab;

const out = (p, v) => (p.mx != null && v > p.mx) || (p.mn != null && v < p.mn);
const stat = (p, v) => p.dir === "none" ? -1 : out(p, v) ? 2 : p.dir === "lt" ? (v <= p.r ? 2 : v <= p.y ? 1 : 0) : (v >= p.r ? 2 : v >= p.y ? 1 : 0);
const sev = (p, v) => {
  if (p.dir !== "none" && out(p, v)) return 1;
  const q = p.r - p.base;
  return q ? clamp((v - p.base) / q, 0, 1) : 0;
};

const C = (day = S.day, cr = crewOf()) => {
  const e = ENVS[S.env], k = cfg(cr.id);
  return { d: day, h: cr.h, m: day / 30 * cr.sens, f: 1 - .6 * k.adh / 100, k: e.k, fk: e.fk, gz: e.gz, adh: k.adh / 100, vas: k.vas };
};

const refText = p => p.dir === "none" ? "Sin umbral definido" : `Base ${fmt(p, p.base)} · Precaución ${p.dir === "lt" ? "≤" : "≥"} ${fmt(p, p.y)} · Alerta ${p.dir === "lt" ? "≤" : "≥"} ${fmt(p, p.r)}`;
/* variables CSS: cambian solas con el tema (también funcionan dentro de atributos SVG) */
const SC = ["var(--ok)", "var(--warn)", "var(--bad)", "var(--s3)"];

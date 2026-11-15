/* js/ui/chart.js — Gráfico de línea SVG de evolución por parámetro. */
"use strict";

/* ---------- Gráfico de línea ---------- */
let UID = 0;
function lineChartRaw(z, p, o = {}) {
  const W = o.w || 340,
        H = o.h || 170,
        L = o.mini ? 30 : 34,
        R = 8,
        T = 10,
        B = 22,
        cr = crewOf(),
        key = z.id + "." + p.id,
        id = "lg" + (UID++);
  
  const XM = Math.max(30, S.today),
        stp = Math.max(1, Math.ceil(XM / 60)),
        model = [];
  
  for (let d = 0; d < XM; d += stp) model.push([d, p.v(C(d, cr))]);
  model.push([XM, p.v(C(XM, cr))]);

  const realOf = c => Object.entries(Store.days(c.id)).filter(([d, r]) => +d <= XM && r.v && r.v[key] != null).map(([d, r]) => [+d, r.v[key]]).sort((a, b) => a[0] - b[0]);
  const real = realOf(cr);
  /* Con "Comparar": se dibujan TODOS los tripulantes (no solo el seleccionado), cada uno con su modelo y sus datos reales. */
  const others = o.cmp ? CREW.filter(x => x.id !== cr.id).map(x => ({ x, pts: model.map(m => [m[0], p.v(C(m[0], x))]), real: realOf(x) })) : [];

  const vals = [...model.map(a => a[1]), ...real.map(a => a[1]), ...others.flatMap(q => [...q.pts.map(a => a[1]), ...q.real.map(a => a[1])]), p.base];
  if (p.dir !== "none") vals.push(p.y, p.r);
  
  let mn = Math.min(...vals),
      mx = Math.max(...vals);
  const pad = ((mx - mn) || 1) * .1;
  const nonneg = Math.min(...vals) >= 0;
  mn -= pad;
  mx += pad;
  if (nonneg && mn < 0) mn = 0;
  
  const sp = mx - mn,
        X = d => L + d / XM * (W - L - R),
        Y = v => T + (1 - (v - mn) / sp) * (H - T - B),
        cl = v => clamp(v, mn, mx),
        dec = p.d || (sp < 4 ? 1 : 0),
        tk = v => {
          const s = v.toFixed(dec);
          return (+s === 0 ? (0).toFixed(dec) : s).replace(".", ",");
        };

  const band = (a, b, c) => {
    const y1 = Y(cl(Math.max(a, b))),
          y2 = Y(cl(Math.min(a, b)));
    return y2 - y1 > .5 ? `<rect x="${L}" y="${y1}" width="${W - L - R}" height="${y2 - y1}" fill="${c}" opacity=".1"/>` : "";
  };

  const bands = p.dir === "none" ? "" : p.dir === "lt" ? band(mn, p.r, SC[2]) + band(p.r, p.y, SC[1]) + band(p.y, mx, SC[0]) : band(mn, p.y, SC[0]) + band(p.y, p.r, SC[1]) + band(p.r, mx, SC[2]);
  const th = (v, c) => p.dir === "none" && c !== "#7fb2ff" ? "" : `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="${c}" stroke-opacity=".85" stroke-dasharray="4 3"/>`;
  const pl = a => a.map(q => X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1)).join(" ");
  const area = `M${X(0)},${Y(mn)} L${pl(model).replace(/ /g, " L")} L${X(XM)},${Y(mn)}Z`;
  
  const rec = Store.get(cr.id, S.day),
        isReal = !!(rec && rec.v && rec.v[key] != null),
        cv = isReal ? rec.v[key] : p.v(C(S.day, cr)),
        cs = stat(p, cv),
        col = cs < 0 ? "#7fb2ff" : SC[cs];
        
  const grid = [mn, (mn + mx) / 2, mx].map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#8cb4ff" stroke-opacity=".1"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end" fill="#8d9bb8" font-size="9">${tk(v)}</text>`).join("");
  const xt = [0, Math.round(XM / 3), Math.round(XM * 2 / 3), XM].map(d => `<line x1="${X(d)}" x2="${X(d)}" y1="${T}" y2="${H - B}" stroke="#8cb4ff" stroke-opacity=".07"/><text x="${X(d)}" y="${H - 7}" text-anchor="${d === 0 ? "start" : d === XM ? "end" : "middle"}" fill="#8d9bb8" font-size="9">${d === 0 ? "Día 0" : d}</text>`).join("");

  return `<svg class="u-w-100pct u-h-auto u-d-block" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de ${esc(p.n)} de ${esc(cr.name)}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${cr.col}" stop-opacity=".28"/><stop offset="1" stop-color="${cr.col}" stop-opacity="0"/></linearGradient></defs>${bands}${grid}${xt}${th(p.base, "#7fb2ff")}${th(p.y, SC[1])}${th(p.r, SC[2])}<path d="${area}" fill="url(#${id})"/>${others.map(q => `<polyline fill="none" stroke="${q.x.col}" stroke-width="2.2" stroke-linejoin="round" points="${pl(q.pts)}"/>${q.real.length > 1 ? `<polyline fill="none" stroke="${q.x.col}" stroke-opacity=".9" stroke-width="1.4" stroke-dasharray="4 2" points="${pl(q.real)}"/>` : ""}${q.real.map(a => `<circle cx="${X(a[0])}" cy="${Y(a[1])}" r="3.4" fill="${q.x.col}" stroke="#fff" stroke-width="1.1"><title>${esc(q.x.name)} · día ${a[0]}: ${fmt(p, a[1])} ${esc(p.u)}</title></circle>`).join("")}`).join("")}<polyline fill="none" stroke="${cr.col}" stroke-width="2.2" stroke-linejoin="round" points="${pl(model)}"/>${real.length > 1 ? `<polyline fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.6" points="${pl(real)}"/>` : ""}${real.map(a => `<circle data-day="${a[0]}" data-k="${key}" data-v="${a[1]}" cx="${X(a[0])}" cy="${Y(a[1])}" r="3.8" fill="${SC[stat(p, a[1]) < 0 ? 0 : stat(p, a[1])]}" stroke="#fff" stroke-width="1.2"><title>Día ${a[0]}: ${fmt(p, a[1])} ${esc(p.u)}</title></circle>`).join("")}<line x1="${X(S.day)}" x2="${X(S.day)}" y1="${T}" y2="${H - B}" stroke="#fff" stroke-opacity=".4"/>${others.map(q => { const rc = Store.get(q.x.id, S.day), v = rc && rc.v && rc.v[key] != null ? rc.v[key] : p.v(C(S.day, q.x)); return `<circle cx="${X(S.day)}" cy="${Y(v)}" r="4" fill="${q.x.col}" stroke="#060912" stroke-width="2"/>`; }).join("")}<circle cx="${X(S.day)}" cy="${Y(cv)}" r="4.6" fill="${col}" stroke="#060912" stroke-width="2"/></svg>`;
}

const MEMO = new Map(),
      memo = (k, f) => {
        let v = MEMO.get(k);
        if (v === undefined) {
          if (MEMO.size > 400) MEMO.clear();
          MEMO.set(k, v = f());
        }
        return v;
      };

const dsig = () => { const k = cfg(); return [S.crew, S.env, k.adh, k.vas, S.day, S.today, Store.ver].join("|"); };
const lineChart = (z, p, o = {}) => memo(["lc", z.id, p.id, o.w, o.h, o.mini ? 1 : 0, o.cmp ? 1 : 0, dsig()].join("|"), () => lineChartRaw(z, p, o));
const chart = (z, p) => lineChart(z, p, { w: 320, h: 170, cmp: S.cmp });

/* js/ui/views.js — Vistas: inspector, tarjetas, panel y comparativas. */
"use strict";

/* ---------- Vistas ---------- */
/* Ganancia de estatura de 3 % o más (rango de alerta 3 a 5 %): se recomienda fortalecer la musculatura paravertebral. */
const HEIGHT_REC = "Entrenar musculatura paravertebral";
function heightRec(e) {
  const r = e.rows.find(x => x.p.id === "dhp");
  return r && r.v >= 3 ? `<div class="alert t2 u-m-6-0" role="status"><b>Recomendación:</b> ${HEIGHT_REC}. <small>Ganancia de estatura de ${fmt(r.p, r.v)} %.</small> <button class="btn o sm" data-go="plan">Ver plan de ejercicio</button></div>` : "";
}

function insp(z) {
  const e = Engine.ev(z),
        pi = Math.min(S.par[z.id] || 0, Math.max(0, z.p.length - 1)),
        pr = z.p[pi];
  return `<div class="rw u-jc-space-between"><b>${z.n}</b><span class="src ${e.real ? "r" : ""}">${e.real ? "Dato real" : "Modelo simulado"}</span></div><div class="u-m-6-0">${bd(e.st)} <small class="u-c-mu">${z.sys}</small></div>
${e.rows.length ? `<div class="pl">${e.rows.map((r, i) => `<button class="pr ${i === pi ? "on" : ""}" data-p="${i}"><span>${r.p.n}${r.real ? ' <i class="src r">Dato real</i>' : ""}</span><b class="mono">${fmt(r.p, r.v)} <em>${r.p.u}</em></b>${r.p.dir === "none" ? "" : `<span class="t${r.s}"><span class="bar"><i style="width:${r.sv * 100}%"></i></span></span>`}</button>`).join("")}</div>${z.id === "lumbar" ? heightRec(e) : ""}${chart(z, pr)}<div class="lg"><span class="u-c-7fb2ff">- - Base en Tierra ${fmt(pr, pr.base)}</span><span class="u-c-warn">- - Precaución</span><span class="u-c-bad">- - Alerta</span><span>━ Modelo</span><span class="u-c-fff">● Real</span></div>` : `<p class="u-c-mu u-fs-13">${z.txt}</p>`}
<details><summary>Ver detalle clínico</summary><p>${z.txt}</p><p>Fuente de datos: ${z.src}</p></details>${z.tab !== "mente" && z.p.length ? `<button class="btn o sm u-mt-10" data-reg="${z.id}">Registrar datos de esta zona</button>` : ""}`;
}

function cards(zs, sel, btn) {
  return zs.map(z => {
    const x = Engine.ev(z), f = x.rows[0];
    return `<div class="card ${z.id === sel ? "sel" : ""}" data-z="${z.id}" role="button" tabindex="0"><small>${z.n}</small>${f ? `<div class="v mono">${fmt(f.p, f.v)} <em>${f.p.u}</em></div>` : `<div class="v mono">—</div>`}${bd(x.st)} <span class="src ${x.real ? "r" : ""}">${x.real ? "Dato real" : "Modelo"}</span><small class="u-d-block u-m-6-0">${z.txt.split(". ")[0].slice(0, 110)}</small>${btn && x.rows.length ? `<button class="btn sm" data-open="${z.id}">Iniciar registro</button>` : ""}</div>`;
  }).join("");
}

const NECK_IDS = ["ecm", "trapecio", "esplenio", "largocuello", "multifidos"];

/* Recuadro "vista lateral del cuello" (solo en la capa de músculos); los botones identifican cada músculo. */
const neckBox = (cls, chips) => `<div class="neckz">${neckFigure(id => cls[id])}${chips ? `<div class="row u-jc-center u-mt-8">${NECK_IDS.map(id => `<button class="chip zc ${/sel/.test(cls[id]) ? "on" : ""}" data-z="${id}"><i class="t${cls[id][1]}">●</i> ${ZONES.find(q => q.id === id).n}</button>`).join("")}</div>` : ""}</div>`;

const zoneFig = (tab, zs, sel, nochips) => {
  const cls = {};
  zs.forEach(z => cls[z.id] = "s" + Engine.ev(z).st + (z.id === sel.id ? " sel" : ""));
  return memo("fig|" + tab + "|" + (nochips ? 1 : 0) + "|" + JSON.stringify(cls), () => figure(tab, id => cls[id]) + (tab === "musculos" ? neckBox(cls, !nochips) : ""));
};

const legend = () => `<div class="lg u-jc-center">${SN.map((n, i) => `<span class="t${i}">● ${n}</span>`).join("")}</div>`;

function viewBody(tab) {
  const t = TABS.find(x => x.id === tab),
        zs = ZONES.filter(z => z.tab === tab),
        sel = zs.find(z => z.id === S.sel[tab]) || zs[0];
  S.sel[tab] = sel.id;
  return `<div class="two fig"><div class="g pn"><div class="svgw" id="svgw">${zoneFig(tab, zs, sel)}</div>${legend()}</div><div class="g pn" id="insp">${insp(sel)}</div></div>
<div class="g pn"><p class="u-m-0-0-10 u-c-mu u-fs-13"><b class="u-c-tx">Contramedida.</b> ${t.cm}</p><div class="rw"><button class="ib" data-r="cards" data-d="-1" aria-label="Anterior">‹</button><div class="rail" id="cards">${cards(zs, sel.id)}</div><button class="ib" data-r="cards" data-d="1" aria-label="Siguiente">›</button></div></div>`;
}

function viewTests() {
  const zs = ZONES.filter(z => z.tab === "mente"),
        sel = zs.find(z => z.id === S.sel.mente) || zs[0];
  S.sel.mente = sel.id;
  return `<div class="g pn"><p class="u-m-0-0-10 u-c-mu u-fs-13">${TABS.find(t => t.id === "mente").cm} Cada tarjeta abre su prueba; los resultados se guardan como “Dato real” del día ${S.day}.</p><div class="rw"><button class="ib" data-r="cards" data-d="-1" aria-label="Anterior">‹</button><div class="rail" id="cards">${cards(zs, sel.id, 1)}</div><button class="ib" data-r="cards" data-d="1" aria-label="Siguiente">›</button></div></div><div class="g pn" id="insp">${insp(sel)}</div>
<div class="g pn"><b>Protocolo de prueba de esfuerzo (CEVIS)</b><details open><summary>Ver las 8 fases</summary><div class="u-ox-auto"><table class="tb"><tr><th>Fase</th><th>Duración</th><th>Carga</th><th>Cadencia</th><th>Objetivo</th></tr>${CPET.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div></details></div>`;
}

function viewRisks() {
  return `<div class="g pn" id="hz"><b>Los 5 peligros del Programa de Investigación Humana de la NASA</b><p class="u-c-mu u-fs-13">Cada peligro se traduce en indicadores que el tripulante puede medir. ${esc(ENVS[S.env].note)}</p><div class="rail u-fw-wrap u-ov-visible">${HAZARDS.map(h => `<div class="card u-w-min-100pct-360"><b>${h.n}</b><p class="u-fs-13 u-c-mu u-m-6-0">${h.eff}</p><details><summary>Indicadores y cuándo pedir ayuda</summary><p><b class="u-c-tx">Indicadores:</b> ${h.ind}</p><p><b class="u-c-tx">Pedir ayuda:</b> ${h.call}</p><p><b class="u-c-tx">Prevención:</b> ${h.prev}</p></details><button class="btn o sm u-mt-8" data-go="${h.go}">Ver en la app</button></div>`).join("")}</div></div>
<div class="g pn" id="guia"><b>Guía rápida de indicadores</b>${GUIDE.map(g => `<details><summary>${g[0]}</summary><p>${g[1]}</p></details>`).join("")}</div>
<div class="g pn" id="rec"><b>Recursos oficiales</b><ul>${LINKS.map(l => `<li><a href="${l[1]}" target="_blank" rel="noopener">${l[0]}</a></li>`).join("")}</ul></div>`;
}

function viewPanel() {
  const cr = crewOf(),
        items = PANEL.filter(a => S.cat === "all" || a[2] === S.cat);
  const cc = CREW.map(x => {
    const sm = Engine.summary(x);
    return `<button class="cc ${x.id === S.crew ? "on" : ""}" data-c="${x.id}" style="--cc:${x.col}" aria-pressed="${x.id === S.crew}"><div class="av" style="background:${x.col};color:var(--on-ac)">${x.name.split(" ")[1][0]}</div><div class="ci"><b>${x.name}</b><span>${x.role}</span><div class="mini">${sm.n.map((v, i) => `<i class="t${i}">${v} ${["normal", "precaución", "alerta"][i]}</i>`).join("")}</div></div></button>`;
  }).join("");
  
  const grid = items.map(([zi, pi]) => {
    const z = ZONES.find(q => q.id === zi),
          idx = z.p.findIndex(q => q.id === pi),
          p = z.p[idx],
          r = Engine.ev(z).rows[idx],
          nreal = Object.values(Store.days(cr.id)).filter(q => q.v && q.v[zi + "." + pi] != null).length;
    return `<article class="gc" data-gz="${zi}:${idx}" tabindex="0" role="button" aria-label="Abrir ${esc(z.n)}"><header><small>${z.n}</small><b>${p.n}</b></header><div class="gv"><span class="mono t${r.s < 0 ? 3 : r.s}">${fmt(p, r.v)}</span><em>${p.u}</em>${r.s >= 0 ? bd(r.s) : ""}${r.real ? '<i class="src r">Dato real</i>' : ""}</div>${lineChart(z, p, { w: 340, h: 168, mini: 1, cmp: S.cmp })}<footer><span>${refText(p)}</span>${nreal ? `<span class="src r">${nreal} real${nreal > 1 ? "es" : ""}</span>` : ""}</footer></article>`;
  }).join("");

  return `<div class="g pn"><div class="rw u-jc-space-between u-fw-wrap"><div><b>Selecciona un tripulante</b><p class="u-m-2-0-0 u-c-mu u-fs-13">Cada gráfico muestra la evolución de un estado de salud de <b class="u-c-tx">${cr.name}</b> desde el día 0 hasta el día ${S.today} de la misión.</p></div></div><div class="ccw">${cc}</div></div>
<div class="g pn"><div class="rw u-fw-wrap u-gap-8">${CATS.map(c => `<button class="chip ${S.cat === c[0] ? "on" : ""}" data-cat="${c[0]}">${c[1]}</button>`).join("")}<span class="u-flex-1"></span><button class="chip ${S.cmp ? "on" : ""}" data-cmp="1" aria-pressed="${!!S.cmp}">Comparar con el resto de la tripulación</button></div>
<div class="lg u-mt-10"><span style="color:${cr.col}">━ ${cr.name} (modelo)</span><span class="u-c-fff">● Dato real registrado</span><span class="u-c-7fb2ff">- - Base en Tierra</span><span class="u-c-warn">- - Precaución</span><span class="u-c-bad">- - Alerta</span><span>│ Día ${S.day}</span>${S.cmp ? CREW.filter(x => x.id !== cr.id).map(x => `<span style="color:${x.col}">━ ${x.name} (modelo)</span>`).join("") : ""}</div></div>
<div class="cg">${grid}</div><p class="u-c-mu u-fs-12 u-m-0-4">Toca un gráfico para ver la zona del cuerpo. Los puntos blancos son registros reales guardados en la pestaña Registro; la línea de color es el modelo simulado según el entorno, el cumplimiento de ejercicio y el día de misión.</p>`;
}

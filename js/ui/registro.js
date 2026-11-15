/* js/ui/registro.js — Registro de datos por zona del cuerpo. */
"use strict";

/* --- Registro por zona del cuerpo --- */
const RL = [["huesos", "Huesos"], ["musculos", "Músculos"], ["organos", "Órganos"]];
function regForm(z) {
  const rec = Store.get(S.crew, S.day) || { v: {} },
        note = (rec.zn || {})[z.id] || "",
        c = C(),
        has = z.p.length > 0;
  if (!has) return `<div class="rw u-jc-space-between"><b>${z.n}</b>${bd(3)}</div><p class="u-c-mu u-fs-13">${z.txt}</p>`;
  return `<div class="rw u-jc-space-between"><b>${z.n}</b>${bd(Engine.ev(z).st)}</div><p class="u-m-2-0-10 u-c-mu u-fs-13">${esc(crewOf().name)} · ${z.src}</p>
<div class="fg"><label>Día de misión<input type="number" id="fday" min="0" max="${S.today}" value="${S.day}"></label><div class="u-as-end u-fs-12 u-c-mu">Deja vacío un campo para usar el modelo simulado.</div>
${z.p.map((p, i) => {
  const k = z.id + "." + p.id,
        v = rec.v && rec.v[k] != null ? rec.v[k] : "",
        cv = v !== "" ? v : p.v(c),
        s = stat(p, cv);
  return `<label>${esc(p.n)} (${esc(p.u)})<input type="number" step="any" inputmode="decimal" data-f="${k}" ${NEGOK.has(k) ? "" : 'min="0"'} value="${v}" placeholder="${fmt(p, p.v(c))}"><span class="rf"><span id="rs-${p.id}">${s >= 0 ? bd(s) : ""}</span> ${refText(p)}</span></label>`;
}).join("")}
<label class="w">Observaciones de esta zona<textarea id="zn" rows="2" placeholder="Ej.: molestia al agacharse, medición repetida…">${esc(note)}</textarea></label></div>
<div class="row u-jc-flex-end u-mt-12"><button class="btn o" id="zdel">Borrar esta zona del día</button><button class="btn" id="zsv">Guardar registro</button></div>`;
}

function regHistory(z) {
  if (!z.p.length) return "";
  const days = Store.days(S.crew),
        pre = z.id + ".",
        rows = Object.entries(days).filter(([d, r]) => Object.keys(r.v || {}).some(k => k.indexOf(pre) === 0)).sort((a, b) => b[0] - a[0]).slice(0, 14),
        pi = Math.min(S.par[z.id] || 0, z.p.length - 1),
        pr = z.p[pi];
  return `<div class="g pn"><b>Historial de ${esc(crewOf().name.split(" ").slice(-1)[0])} · ${z.n}</b><div class="row u-m-10-0">${z.p.map((p, i) => `<button class="chip ${i === pi ? "on" : ""}" data-p="${i}">${esc(p.n)}</button>`).join("")}</div>${lineChart(z, pr, { w: 560, h: 220, cmp: S.cmp })}
${rows.length ? `<div class="u-ox-auto u-mt-10"><table class="tb"><tr><th>Día</th>${z.p.map(p => `<th>${esc(p.n)}</th>`).join("")}<th>Observación</th></tr>${rows.map(([d, r]) => `<tr class="${+d === S.day ? "cur" : ""}"><td><button class="chip" data-day="${d}">${d}</button></td>${z.p.map(p => { const v = r.v[pre + p.id]; return v == null ? "<td>—</td>" : `<td class="mono t${Math.max(0, stat(p, v))}">${fmt(p, v)}</td>`; }).join("")}<td>${esc((r.zn && r.zn[z.id]) || "")}</td></tr>`).join("")}</table></div>` : `<p class="u-c-mu u-fs-13">Aún no hay registros reales de esta zona. Guarda el primero en el formulario; mientras tanto la curva es el modelo simulado.</p>`}</div>`;
}

function viewRegistro() {
  const cr = crewOf(),
        L = S.rl,
        zs = ZONES.filter(z => z.tab === L),
        sel = zs.find(z => z.id === S.sel[L]) || zs[0];
  S.sel[L] = sel.id;
  const days = Store.days(cr.id),
        nd = Object.keys(days).length,
        mz = zs.filter(z => Object.values(days).some(r => Object.keys(r.v || {}).some(k => k.indexOf(z.id + ".") === 0))).length;
  return `<div class="g pn"><div class="rw u-jc-space-between u-fw-wrap u-gap-10"><div><b>Registro de ${cr.name}</b><p class="u-m-2-0-0 u-c-mu u-fs-13">Elige la zona del cuerpo, completa sus controles y revisa su historial. ${nd} día${nd === 1 ? "" : "s"} con datos · ${mz} de ${zs.length} zonas de esta capa con registro.</p></div><div class="row">${CREW.map(x => `<button class="chip ${x.id === S.crew ? "on" : ""}" data-c="${x.id}">${x.name.split(" ").slice(-1)[0]}</button>`).join("")}</div></div></div>
<div class="two fig"><div class="g pn"><div class="row u-jc-center u-mb-6">${RL.map(l => `<button class="chip ${l[0] === L ? "on" : ""}" data-rl="${l[0]}">${l[1]}</button>`).join("")}</div><div class="svgw" id="svgw">${zoneFig(L, zs, sel, 1)}</div>${legend()}
<div class="row u-mt-10 u-jc-center">${zs.map(z => { const st = Engine.ev(z).st; return `<button class="chip zc ${z.id === sel.id ? "on" : ""}" data-z="${z.id}"><i class="dot t${st}"></i>${z.n.split(" (")[0]}</button>`; }).join("")}</div></div>
<div class="u-d-grid u-gap-12 u-ac-start"><div class="g pn" id="regform">${regForm(sel)}</div>${regHistory(sel)}</div></div>
<div class="g pn"><b>Pruebas y autorregistros del día ${S.day}</b><p class="u-m-2-0-10 u-c-mu u-fs-13">Sueño, memoria, reacción, ánimo y esfuerzo se registran con sus propias pruebas.</p><div class="rw"><button class="ib" data-r="cards" data-d="-1" aria-label="Anterior">‹</button><div class="rail" id="cards">${cards(ZONES.filter(z => z.tab === "mente"), "", 1)}</div><button class="ib" data-r="cards" data-d="1" aria-label="Siguiente">›</button></div></div>`;
}

function renderChrome() {
  const cr = crewOf(),
        al = Engine.alerts(),
        cx = Engine.cross(al),
        sm = Engine.summary(cr),
        n = sm.n,
        w = sm.w,
        k = cfg();
  $("dd").textContent = S.day + " / " + S.today;
  $("day").max = S.today;
  $("day").value = S.day;
  for (const i of ["env", "env2"]) $(i).value = S.env;
  $("envnote").textContent = ENVS[S.env].note + " Latencia de comunicación: " + ENVS[S.env].lat + ".";
  $("adh").value = k.adh;
  $("adho").textContent = k.adh + " %";
  $("vas").value = k.vas;
  $("vaso").textContent = k.vas;
  $("crew").innerHTML = CREW.map(x => `<button class="crew ${x.id === S.crew ? "on" : ""}" data-c="${x.id}"><div class="av" style="background:${x.col};color:var(--on-ac)">${x.name.split(" ")[1][0]}</div><div><b>${x.name}</b><span>${x.role}</span></div></button>`).join("");
  $("hero").innerHTML = `<div>${bd(w)}<h2>${cr.name}</h2><p>${cr.role} · ${cr.bio}</p></div><div class="kp">${n.map((v, i) => `<div><small>${SN[i]}</small><b class="mono t${i}">${v}</b></div>`).join("")}</div>
<details class="u-w-100pct"><summary>Alertas activas (${al.length})</summary>${al.length ? al.map(a => `<p>${bd(a.r.s)} ${a.z.n} · ${a.r.p.n}: <b class="mono">${fmt(a.r.p, a.r.v)} ${a.r.p.u}</b></p>`).join("") : "<p>Sin alertas: todos los parámetros están dentro de lo esperado.</p>"}${cx.map(t => `<p class="t1">${t}</p>`).join("")}</details>`;
  $("tabs").innerHTML = TABS.map(t => `<button class="tab ${t.id === S.tab ? "on" : ""}" data-t="${t.id}">${t.ic ? t.ic + " " : ""}${t.n}</button>`).join("");
}

function render() { Nav.render(); }
function State(p) { Object.assign(S, p); Nav.render(); }
function toast(t) {
  const e = $("toast");
  e.textContent = t;
  e.classList.add("on");
  setTimeout(() => e.classList.remove("on"), 1900);
}

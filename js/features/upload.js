/* js/features/upload.js — Carga de días anteriores (SVG o CSV). */
"use strict";

/* ---------- Carga de días anteriores (SVG o CSV) ---------- */
const KNOWN = () => {
  const k = new Set();
  ZONES.forEach(z => z.p.forEach(p => k.add(z.id + "." + p.id)));
  return k;
};

const crewRes = x => {
  const t = norm(x);
  if (!t) return S.crew;
  const c = CREW.find(q => norm(q.id) === t || norm(q.name) === t || norm(q.name.split(" ").slice(-1)[0]) === t);
  return c ? c.id : null;
};

const crewFor = tg => x => {
  const t = norm(x);
  if (tg === "all") return t ? crewRes(x) : null;
  if (!t) return tg;
  return crewRes(x) === tg ? tg : null;
};

function svgParse(txt) {
  const doc = new DOMParser().parseFromString(txt, "image/svg+xml"),
        root = doc.documentElement;
  if (!root || doc.querySelector("parsererror") || root.localName !== "svg") return null;
  const rows = [],
        push = (c, d, k, v) => rows.push({ c: c || "", d: parseNum(d), k: String(k || "").trim(), v: parseNum(v) });
  
  doc.querySelectorAll("metadata").forEach(m => {
    try {
      const j = JSON.parse(m.textContent);
      Object.entries(j.data || {}).forEach(([d, o]) => Object.entries(o || {}).forEach(([k, v]) => push(j.crew, d, k, v)));
      Object.entries(j.crews || {}).forEach(([c, dd]) => Object.entries(dd || {}).forEach(([d, o]) => Object.entries(o || {}).forEach(([k, v]) => push(c, d, k, v))));
    } catch (e) {}
  });
  
  doc.querySelectorAll("[data-k][data-v]").forEach(el => {
    const dn = el.closest("[data-day]"), cn = el.closest("[data-crew]");
    push(cn && cn.getAttribute("data-crew"), el.getAttribute("data-day") != null ? el.getAttribute("data-day") : dn && dn.getAttribute("data-day"), el.getAttribute("data-k"), el.getAttribute("data-v"));
  });
  return rows;
}

function applyRows(rows, tg) {
  const { good, rej } = validateRows(rows, { today: S.today, known: KNOWN(), crew: crewFor(tg), negOk: k => NEGOK.has(k) }),
        by = {};
  let over = 0;
  
  good.forEach(r => {
    const o = by[r.c + "|" + r.d] = by[r.c + "|" + r.d] || { c: r.c, d: r.d, v: {} },
          pv = Store.get(r.c, r.d);
    if (pv && pv.v && pv.v[r.k] != null && pv.v[r.k] !== r.v) over++;
    o.v[r.k] = r.v;
  });
  
  Object.values(by).forEach(o => Store.put(o.c, o.d, { v: o.v }));
  const per = {};
  good.forEach(r => per[r.c] = (per[r.c] || 0) + 1);
  return { per, ok: good.length, days: Object.keys(by).length, over, rej };
}

const impReport = (r, tg) => {
  const j = r.rej,
        x = [
          [j.neg, "con valor negativo (no permitido)"],
          [j.rng, `con día fuera de 0 a ${S.today - 1}`],
          [j.unk, "con parámetro desconocido"],
          [j.bad, "con valor no numérico"],
          [j.crew, tg === "all" ? "sin tripulante o desconocido (con “Los 3 juntos” cada fila debe indicar su tripulante)" : "de otro tripulante o desconocido (solo se cargan las filas de " + crewOf(tg).name + " o sin tripulante)"]
        ].filter(q => q[0]);
  return alertBox(r.ok ? (x.length ? 1 : 0) : 2, `Se cargaron <b>${r.ok}</b> valores en <b>${r.days}</b> día${r.days === 1 ? "" : "s"}${r.over ? ` (${r.over} reemplazaron valores anteriores)` : ""}.` + (tg === "all" && r.ok ? "<br>" + CREW.map(c => c.name + ": " + (r.per[c.id] || 0)).join(" · ") : "") + x.map(q => `<br>${q[0]} ${q[1]}.`).join(""));
};

const histHtml = c => {
  const rows = Object.entries(Store.days(c)).filter(([d, r]) => r.v && Object.keys(r.v).length).sort((a, b) => b[0] - a[0]),
        tot = rows.reduce((s, [d, r]) => s + Object.keys(r.v).length, 0);
  return `<b>Historial de ${esc(crewOf(c).name)}</b> <small class="u-c-mu">${rows.length} día${rows.length === 1 ? "" : "s"} · ${tot} valores reales</small>` + (rows.length ? `<div class="u-ox-auto u-maxh-150 u-mt-6"><table class="tb"><tr><th>Día</th><th>Valores</th></tr>${rows.slice(0, 10).map(([d, r]) => `<tr><td>${d}</td><td>${Object.keys(r.v).length}</td></tr>`).join("")}</table></div>` : '<p class="u-c-mu u-fs-13 u-m-6-0-0">Sin registros reales todavía.</p>');
};

const histFor = t => t === "all" ? CREW.map(c => histHtml(c.id)).join('<hr class="u-bd-0 u-bt-1-solid-line u-m-10-0">') : histHtml(t);
const csvCell = x => { x = String(x); return /[",;\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };

function download(name, type, body) {
  const u = URL.createObjectURL(new Blob([body], { type })),
        l = document.createElement("a");
  l.href = u;
  l.download = name;
  document.body.appendChild(l);
  l.click();
  l.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1500);
}

function csvExport(tg) {
  const ids = tg === "all" ? CREW.map(c => c.id) : [tg || S.crew],
        L = ["dia,tripulante,parametro,valor"];
  ids.forEach(cid => Object.entries(Store.days(cid)).filter(([d]) => +d < S.today).sort((a, b) => a[0] - b[0]).forEach(([d, r]) => Object.entries(r.v || {}).forEach(([k, v]) => L.push([d, cid, k, v].map(csvCell).join(",")))));
  download(`respaldo_${tg === "all" ? "tripulacion" : tg || S.crew}_dia${S.today}.csv`, "text/csv;charset=utf-8", "\uFEFF" + L.join("\r\n") + "\r\n");
}

function svgExport(tg) {
  tg = tg || S.crew;
  const zs = ZONES.find(z => z.id === S.sel[layer()]) || ZONES.find(z => z.tab === "musculos"),
        pr = zs.p.length ? zs.p[Math.min(S.par[zs.id] || 0, zs.p.length - 1)] : null;
  const of = cid => {
    const o = {};
    Object.entries(Store.days(cid)).forEach(([d, r]) => { if (+d < S.today && r.v && Object.keys(r.v).length) o[d] = r.v; });
    return o;
  };
  const pl = tg === "all" ? { app: "kinesoft-orbital", crews: Object.fromEntries(CREW.map(c => [c.id, of(c.id)])) } : { app: "kinesoft-orbital", crew: tg, data: of(tg) };
  const meta = `<metadata>${esc(JSON.stringify(pl))}</metadata><desc>Formato: data = {día: {zona.parametro: valor}}. Solo se leen días anteriores al día ${S.today}.</desc>`,
        ch = pr ? lineChartRaw(zs, pr, { w: 560, h: 220 }) : '<svg viewBox="0 0 560 220"></svg>';
  download(`respaldo_${tg === "all" ? "tripulacion" : tg}_dia${S.today}.svg`, "image/svg+xml", ch.replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/<svg[^>]*>/, m => m + meta));
}

const readText = f => f.text ? f.text() : new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(r.result);
  r.onerror = () => no(new Error("no se pudo leer el archivo"));
  r.readAsText(f);
});

async function loadFile(f) {
  const res = $("res");
  if (!f) return;
  res.innerHTML = alertBox(1, "Leyendo " + esc(f.name) + "…");
  try {
    const txt = await readText(f),
          csv = /\.csv$/i.test(f.name) || /csv/.test(f.type);
    let rows;
    if (csv) {
      const tb = tableToRows(csvParse(txt));
      if (tb.err) return res.innerHTML = alertBox(2, esc(tb.err));
      rows = tb.rows;
    } else {
      rows = svgParse(txt);
      if (!rows) return res.innerHTML = alertBox(2, "El archivo no es un SVG válido. Si es una tabla, usa .csv.");
    }
    if (!rows.length) return res.innerHTML = alertBox(1, "El archivo no trae datos que leer.");
    res.innerHTML = impReport(applyRows(rows, upTarget), upTarget);
    $("hist").innerHTML = histFor(upTarget);
  } catch (e) {
    res.innerHTML = alertBox(2, "No se pudo leer el archivo: " + esc(e.message));
  }
}

let upTarget = S.crew;
function openUpload() {
  const t = S.today;
  upTarget = S.crew;
  openDlg(head("Cargar días anteriores", "Archivo SVG or CSV con días de 0 a " + (t - 1) + ".") +
    `<div class="row u-mb-10" id="ups"><b class="u-fs-13">Cargar para:</b>${CREW.map(c => `<button type="button" class="chip ${c.id === upTarget ? "on" : ""}" data-up="${c.id}">${esc(c.name)}</button>`).join("")}<button type="button" class="chip" data-up="all">Los 3 juntos</button></div>
    <div class="row"><label class="btn u-cur-pointer" for="upf">Elegir archivo (.svg o .csv)</label><input class="u-pos-absolute u-w-1 u-h-1 u-op-0" type="file" id="upf" accept=".svg,.csv,image/svg+xml,text/csv">
    <button type="button" class="btn o sm" id="csvx">Plantilla CSV</button><button type="button" class="btn o sm" id="svgx">Plantilla SVG</button></div>
    <div class="u-m-10-0 u-p-14 u-bd-1-dashed-line u-br-12 u-ta-center u-c-mu u-fs-13" id="drop">o arrastra aquí el archivo</div>
    <details><summary>Formato aceptado</summary><p><b class="u-c-tx">CSV</b>: <code>dia,tripulante,parametro,valor</code>.</p><p><b class="u-c-tx">SVG</b>: <code>&lt;metadata&gt;</code> con JSON.</p></details>
    <div id="res"></div><div class="u-mt-10" id="hist">${histHtml(S.crew)}</div>` + foot());
  
  $("upf").onchange = e => { loadFile(e.target.files[0]); e.target.value = ""; };
  $("csvx").onclick = () => csvExport(upTarget);
  $("svgx").onclick = () => svgExport(upTarget);
  
  $("ups").onclick = e => {
    const b = e.target.closest("[data-up]");
    if (!b) return;
    upTarget = b.dataset.up;
    $("ups").querySelectorAll("[data-up]").forEach(x => x.classList.toggle("on", x === b));
    $("hist").innerHTML = histFor(upTarget);
    $("res").innerHTML = "";
  };

  const dz = $("drop");
  dz.ondragover = e => { e.preventDefault(); dz.style.borderColor = "var(--ac)"; };
  dz.ondragleave = () => { dz.style.borderColor = ""; };
  dz.ondrop = e => { e.preventDefault(); dz.style.borderColor = ""; loadFile(e.dataTransfer.files[0]); };
}

/* js/ui/suit.js — Traje inteligente INTI, visor HUD del casco, asistente de chat y selector de tripulante.
   Las lecturas salen de los mismos datos de la app (Engine); lo que no tiene sensor propio se simula a partir del estado de salud. */
"use strict";

/* ---------- Telemetría del traje ---------- */
const SUIT_LAYERS = ["Ropa interior biométrica", "Regulación térmica (capa 7)", "Amortiguamiento", "Fibra de kevlar", "Capas reflectantes externas"];

const SENS = [
  { n: "Actividad cerebral", loc: "Electrodos EEG · interior del casco", hz: "256 Hz", f: t => t.fat, u: "% fatiga", d: 0, dir: "gt", y: 50, r: 75 },
  { n: "Actividad muscular", loc: "Sensores EMG · guantes, botas y extremidades", hz: "1024 Hz", f: t => t.emg, u: "% tensión", d: 0, dir: "gt", y: 60, r: 80 },
  { n: "Frecuencia cardíaca", loc: "PPG · auriculares y ropa interior", hz: "500 Hz", f: t => t.hr, u: "lpm", d: 0, dir: "gt", y: 100, r: 115 },
  { n: "Oxigenación (SpO₂)", loc: "Oxímetro · ropa interior", hz: "500 Hz", f: t => t.spo2, u: "%", d: 1, dir: "lt", y: 95, r: 92 },
  { n: "Pupila (dilatación)", loc: "Cámaras de alta resolución · casco", hz: "25 fps", f: t => t.pup, u: "mm", d: 1, dir: "none" },
  { n: "Temperatura central", loc: "Termopares · capas internas", hz: "1 Hz", f: t => t.temp, u: "°C", d: 1, dir: "gt", y: 37.5, r: 38.2 },
  { n: "Radiación espacial", loc: "Sensores · capas externas", hz: "1 Hz", f: t => t.rad, u: "µSv/h", d: 0, dir: "gt", y: 60, r: 100 }
];

const nfx = (v, d) => Number(v).toFixed(d).replace(".", ",").replace("-", "−");
const sst = (r, v) => r.dir === "none" ? -1 : r.dir === "gt" ? (v >= r.r ? 2 : v >= r.y ? 1 : 0) : (v <= r.r ? 2 : v <= r.y ? 1 : 0);

function tele(cr = crewOf()) {
  const sm = Engine.summary(cr),
        w = sm.w,
        lack = 100 - cfg(cr.id).adh,
        row = {};
  ZONES.forEach(z => Engine.ev(z, C(S.day, cr), cr.id).rows.forEach(r => { row[z.id + "." + r.p.id] = r.v; }));
  const rad = { iss: 20, mars: 75, moon: 58 }[S.env] || 20;
  return {
    cr, sm, w,
    hr: row["corazon.hr"] != null ? row["corazon.hr"] : 66 + 9 * w + lack / 12,
    spo2: row["pulmones.spo2"] != null ? row["pulmones.spo2"] : 98 - 1.1 * w,
    temp: row["intestino.temp"] != null ? row["intestino.temp"] : 36.7 + .25 * w,
    fat: 12 + 20 * w + lack / 6,
    emg: 28 + 14 * w + lack / 5,
    pup: 4.1 + .25 * w,
    rad: rad * (cr.sens || 1)
  };
}

const jitter = v => v * (1 + (Math.random() - .5) * .03);

/* ---------- Vista: Traje INTI ---------- */
function sensRows(t) {
  return SENS.map(r => {
    const v = jitter(r.f(t)), s = sst(r, v);
    return `<tr><td>${r.n}</td><td><small>${r.loc}</small></td><td class="mono">${r.hz}</td><td class="mono"><span class="t${s < 0 ? 3 : s}"><i class="dot"></i></span><b>${nfx(v, r.d)}</b> <small>${r.u}</small></td></tr>`;
  }).join("");
}

function viewBetta() {
  const cr = crewOf(), t = tele(cr);
  return `<div class="g pn suit-grid">
  <div class="suit-main">
    <h3 class="suit-h">Telemetría del traje en vivo</h3>
    <div class="suit-tw"><table class="suit-tbl" id="sens"><thead><tr><th>Parámetro</th><th>Sensor</th><th>Muestreo</th><th>Lectura</th></tr></thead><tbody>${sensRows(t)}</tbody></table></div>
    <p class="suit-note mono" id="slink">ESP32 · BLE · 1,5 kbps · ADC sigma-delta 24 bits · latencia 60 ms (objetivo: menos de 100 ms)</p>
    <h3 class="suit-h">Capas del traje</h3>
    <ul class="suit-layers">${SUIT_LAYERS.map(x => `<li>${x}</li>`).join("")}</ul>
    <p class="suit-note">Procesamiento central: ESP32 con memoria extra en la mochila de soporte vital y en el casco. Frecuencia cardíaca, oxigenación y temperatura salen de las mismas mediciones de la app; el resto se simula a partir del estado de salud de ${esc(cr.name)}.</p>
  </div>
  <div class="suit-side">
    <h2 class="suit-t">INTI</h2>
    <p class="suit-note">Asistente de voz y texto. Responde dudas, da indicaciones y revisa el estado de ${esc(cr.name)}.</p>
    <div class="qks">${INTI_QUICK.map(q => `<button type="button" class="chip" data-bq="${esc(q[1])}">${q[0]}</button>`).join("")}</div>
    <div class="suit-cta"><button type="button" class="btn" data-bopen>Hablar con INTI</button><button type="button" class="btn o" data-go="hud">Ver visor del casco</button></div>
    <p class="suit-note">El asistente funciona con reglas sobre los datos de la app. No reemplaza a la médica de vuelo ni a control de misión.</p>
  </div>
</div>`;
}

/* ---------- Vista: Casco HUD ---------- */
const arc = (id, lab, u) => `<div class="hg hs0" id="${id}w"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" class="hg0"/><circle cx="50" cy="50" r="40" class="hg1" id="${id}a" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 50 50)"/><text x="50" y="56" text-anchor="middle" class="hv" id="${id}v">--</text></svg><small>${lab}<br>${u}</small></div>`;
const hbar = (k, lab) => `<div class="hbar hs0" id="hb${k}w"><div><span>${lab}</span><b id="hb${k}">--</b></div><i><u id="hb${k}f"></u></i></div>`;

function viewHud() {
  const cr = crewOf();
  let tk = "";
  for (let i = 0; i < 36; i++) {
    const a = i * 10 * Math.PI / 180, r2 = i % 3 ? 70 : 76;
    tk += `<line x1="${(66 * Math.sin(a)).toFixed(1)}" y1="${(-66 * Math.cos(a)).toFixed(1)}" x2="${(r2 * Math.sin(a)).toFixed(1)}" y2="${(-r2 * Math.cos(a)).toFixed(1)}" stroke="currentColor" stroke-width="${i % 3 ? 1 : 2}"/>`;
  }
  S.hk = null;
  setTimeout(() => { updHud(); wave(); }, 0);
  return `<div class="hud" id="hud"><div class="hscan"></div><div class="hgrid">
<div class="htop"><span>${esc(cr.name.toUpperCase())}</span><span>${esc(cr.role.toUpperCase())}</span><span>DÍA ${S.day}</span><span>${esc(ENVS[S.env].n.toUpperCase())}</span><span id="hlat"></span></div>
<div class="hwarn" id="hwarn"></div>
<div class="hl">${arc("hr", "FRECUENCIA CARDÍACA", "lpm")}${arc("sp", "OXIGENACIÓN SpO₂", "%")}${arc("tp", "TEMP. CENTRAL", "°C")}</div>
<svg class="hc hs0" id="hret" viewBox="-100 -100 200 200" aria-hidden="true"><g class="rot"><circle r="92" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 7"/></g><g class="rot r2"><circle r="82" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20 10 20" opacity=".7"/></g><circle r="60" fill="none" stroke="currentColor" opacity=".5"/>${tk}<path d="M-96 -70v-26h26M96 -70v-26h-26M-96 70v26h26M96 70v26h-26" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-30 0h-20M30 0h20M0 -30v-20M0 30v20" stroke="currentColor" stroke-width="1.5"/><text id="hhr" text-anchor="middle" y="8" fill="currentColor" style="font:700 30px var(--mono, monospace)">--</text><text y="24" text-anchor="middle" fill="currentColor" font-size="8" opacity=".8">LPM · INTI EN LÍNEA</text></svg>
<div class="hr">${hbar(0, "EEG · FATIGA")}${hbar(1, "EMG · TENSIÓN")}${hbar(2, "RADIACIÓN")}${hbar(3, "PUPILA")}<svg viewBox="0 0 200 40" class="hwv" aria-hidden="true"><polyline id="hw" fill="none" stroke="#5ff3ff" stroke-width="1.5" points=""/></svg></div>
<div class="hbx" id="hsub">INTI: iniciando monitoreo continuo...</div></div></div>
<div class="g pn hud-ctl">
  <div class="qks">${INTI_QUICK.map(q => `<button type="button" class="chip" data-bq="${esc(q[1])}">${q[0]}</button>`).join("")}</div>
  <div class="suit-cta"><button type="button" class="btn" data-bopen>Hablar con INTI</button></div>
  <p class="suit-note">Vista simulada del visor: las lecturas salen de los mismos datos del traje. Cambia de tripulante, día o entorno para ver cómo reacciona el HUD.</p>
</div>`;
}

function updHud() {
  if (!$("hud")) return;
  const t = tele(), al = [];
  [[2, "hr", 40, 140], [3, "sp", 85, 100], [5, "tp", 35, 40]].forEach(([i, id, lo, hi]) => {
    const r = SENS[i], v = jitter(r.f(t)), s = Math.max(0, sst(r, v));
    $(id + "a").setAttribute("stroke-dasharray", clamp((v - lo) / (hi - lo), 0, 1) * 100 + " 100");
    $(id + "v").textContent = nfx(v, r.d);
    $(id + "w").className = "hg hs" + s;
    if (id === "hr") { $("hhr").textContent = Math.round(v); $("hret").setAttribute("class", "hc hs" + s); }
    if (s > 0) al.push(r.n.toLowerCase());
  });
  [0, 1, 6, 4].forEach((i, k) => {
    const r = SENS[i], v = jitter(r.f(t)), s = Math.max(0, sst(r, v));
    $("hb" + k).textContent = nfx(v, r.d) + " " + r.u;
    $("hb" + k + "w").className = "hbar hs" + s;
    $("hb" + k + "f").style.width = clamp(r.dir === "none" ? (v - 2) / 6 : v / (r.r * 1.2), 0, 1) * 100 + "%";
    if (s > 0) al.push(r.n.toLowerCase());
  });
  $("hlat").textContent = "LAT " + Math.round(45 + Math.random() * 45) + " ms";
  const w = $("hwarn"), key = al.join(", ");
  w.textContent = key ? "ALERTA: " + key.toUpperCase() : "";
  w.className = "hwarn" + (key ? " b" : "");
  if (key !== S.hk && !S.hudSay) {
    S.hk = key;
    $("hsub").textContent = key ? `INTI: Detecto ${key}. Di "análisis completo" para un diagnóstico.` : "INTI: En línea. Monitoreo continuo activo, todos los parámetros normales.";
  }
}

function wave() {
  const el = $("hw");
  if (!el) return;
  S.ph = (S.ph || 0) + .6;
  const t = S.tw || tele(), A = 4 + t.fat / 8, p = [];
  for (let i = 0; i < 80; i++) p.push((i * 2.5) + "," + (20 + Math.sin(i * .45 + S.ph) * A * .5 + Math.sin(i * 1.7 + S.ph * 2) * A * .3 + (Math.random() - .5) * A * .4).toFixed(1));
  el.setAttribute("points", p.join(" "));
}

setInterval(() => {
  if (S.tab === "betta" && $("sens")) {
    const t = tele();
    $("sens").querySelector("tbody").innerHTML = sensRows(t);
    $("slink").textContent = `ESP32 · BLE · 1,5 kbps · ADC sigma-delta 24 bits · latencia ${Math.round(45 + Math.random() * 45)} ms (objetivo: menos de 100 ms)`;
  }
  if (S.tab === "hud") { S.tw = tele(); updHud(); }
}, 1000);
setInterval(() => { if (S.tab === "hud") wave(); }, 250);

/* ---------- Selector de tripulante visible en todas las secciones ---------- */
function renderCrewBar() {
  const el = $("crewbar");
  if (!el) return;
  el.innerHTML = `<span class="cb-l">Tripulante</span>` + CREW.map(x => {
    const w = Engine.summary(x).w;
    return `<button type="button" class="cb ${x.id === S.crew ? "on" : ""}" data-c="${x.id}" aria-pressed="${x.id === S.crew}" title="${esc(x.role)}"><span class="av" style="background:${x.col};color:var(--on-ac)">${esc(x.name.trim().split(/\s+/).pop()[0].toUpperCase())}</span><span class="cb-n">${esc(x.name)}</span><span class="t${w}"><i class="dot"></i></span></button>`;
  }).join("") + `<button type="button" class="cb add" data-addcrew title="Agregar un tripulante nuevo"><span class="av">+</span><span class="cb-n">Agregar tripulante</span></button>`;
}

/* ---------- Asistente INTI (chat) ---------- */
const INTI_QUICK = [
  ["Análisis completo", "Inicia análisis completo. Me siento algo mareado"],
  ["Estado general", "Estado general"],
  ["Alertas activas", "Alertas activas"],
  ["Qué hago hoy", "Qué ejercicio me toca hoy"],
  ["Qué es la HRV", "Qué es la HRV y qué valor es normal"],
  ["Parámetros", "Qué parámetros hay en la app"],
  ["Paro cardíaco", "Qué hago ante un paro cardiorrespiratorio"],
  ["Ayuda", "Ayuda"]
];

const nz = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const sn = n => SN[n] ? SN[n].toLowerCase() : "";

const flagged = cr => Engine.alerts(cr).sort((a, b) => b.r.s - a.r.s);
const itx = a => `${a.z.n.split(" (")[0]}, ${a.r.p.n.toLowerCase()}: ${fmt(a.r.p, a.r.v)} ${a.r.p.u} (${sn(a.r.s)})`;

/* Indicaciones y respuestas a dudas frecuentes */
const INTI_KB = [
  [/paro|rcp|reanim|desfibril|no respira|sin pulso|inconsciente/,
   "Paro cardiorrespiratorio, protocolo a bordo:\n1. Confirma: no responde y no respira con normalidad. Activa la alarma y avisa a la médica de vuelo.\n2. Sujeta al paciente con el sistema de restricción de RCP y empieza las compresiones: 100 a 120 por minuto, con el tórax hundiéndose unos 5 cm.\n3. Acerca el desfibrilador y sigue sus indicaciones de voz.\n4. Antes de cada descarga: despejen la zona. Nadie toca al paciente.\n5. Continúa hasta que llegue ayuda o haya signos de vida. Informa a control de misión."],
  [/mare|vertigo|nausea|desorient|vomit/,
   "Mareo o náuseas en órbita son frecuentes al inicio. Detén el movimiento brusco de cabeza, fija la vista en un punto, respira lento y toma líquidos. Si persisten más de 30 minutos, hay vómitos repetidos o se suma dolor de cabeza intenso, avisa a la médica de vuelo."],
  [/lumbar|espalda|columna|dolor de espalda/,
   "En microgravedad la columna se alarga y puede doler la zona lumbar. Haz el protocolo de movilidad lumbar del plan de ejercicio, usa el traje de compresión axial 1 a 2 horas y registra el dolor de 0 a 10. Si pasa de 7 o hay hormigueo en las piernas, avisa a la médica de vuelo."],
  [/hidrat|agua|sed\b|beber|liquido/,
   "Bebe agua o líquidos de forma regular aunque no sientas sed: en órbita la sed se percibe menos. Evita el exceso de sodio. Orina muy concentrada, dolor de cabeza o mareo al ponerte de pie son señales de poca hidratación."],
  [/sueno|dormir|insomnio|descans|desvel/,
   "Para dormir mejor: horarios fijos, luz cálida en la cabina antes de acostarte, evita pantallas la última hora y no hagas ejercicio intenso justo antes. Registra tu sueño en Evaluaciones cada mañana; si dormiste menos de 6 horas, reevalúa antes de tareas de precisión."],
  [/radiacion|tormenta solar|dosimetro|\bsv\b/,
   "Ante un aumento de radiación, ve al refugio de la nave (zona con mayor blindaje) y quédate hasta que control de misión lo indique. Revisa tu dosímetro en el HUD del casco y registra la dosis acumulada."],
  [/\beva\b|caminata|extravehicular|salida al exterior/,
   "Antes de una caminata espacial: sueño registrado, prueba de reacción con puntaje 6 o más, hidratación y revisión de presión del traje. Si algún parámetro está en alerta, no se autoriza la salida hasta que la médica de vuelo lo revise."],
  [/ejercicio|rutina|entren|plan de|ared|cicloerg|que me toca/,
   "RUTINA"],
  [/co2|dioxido|aire|falta de aire|ahog|respirar|disnea/,
   "Si sientes falta de aire o dolor de cabeza con somnolencia, revisa primero los depuradores de CO₂ de la cabina: puede ser la cabina y no tú. Respira lento, reduce el esfuerzo y avisa a control de misión. Si la saturación baja de 92 %, usa oxígeno suplementario."],
  [/fiebre|temperatura|calor|frio|escalofrio/,
   "Temperatura central normal: 36,5 a 37,5 °C. Si sube de 37,5 °C, baja el ritmo, aumenta la refrigeración de la capa 7 del traje y toma líquidos. Con 38 °C o más avisa a la médica de vuelo."],
  [/vision|ojo|vista|borros/,
   "En microgravedad los líquidos suben a la cabeza y pueden cambiar la visión. Si ves borroso o notas cambios, avisa a la médica de vuelo y registra la fecha. Se controla con ecografía del nervio óptico (ver Órganos, Cerebro)."],
  [/comida|aliment|dieta|comer|apetito/,
   "Come en horarios regulares, con buena proteína y vitamina D. En órbita el apetito baja: fracciona las comidas. Modera la sal para cuidar huesos y riñones."],
  [/estres|animo|ansied|triste|solo|soledad|miedo/,
   "Es normal sentir estrés en misiones largas. Mantén rutinas, habla con tus compañeros y programa una llamada con Tierra. Registra tu ánimo en Evaluaciones. Si lo sientes muy pesado, avisa a la médica de vuelo: pedir ayuda es parte del trabajo."],
  [/golpe|lesion|caida|cortad|sangr|herida/,
   "Detén el sangrado con presión directa y gasa. Inmoviliza la zona golpeada, limpia la herida y avisa a la médica de vuelo. Anota cómo ocurrió: ayuda a prevenir que se repita."],
  [/latencia|comunicaci|control de misi|tierra/,
   "Tiempo de comunicación con Tierra en este entorno: " + "LATENCIA" + ". Si es largo, trabaja con el protocolo autónomo y envía reportes por escrito para que control responda cuando pueda."],
  [/medic|botiquin|pastilla|analges/,
   "No tomes medicación sin indicación de la médica de vuelo; en órbita algunos fármacos actúan distinto. Consulta el botiquín y registra cada toma."]
];

S.chat = S.chat || {};
S.pend = S.pend || {};
S.voice = S.voice !== false;

function zoneFor(q) {
  let best = null, bs = 0;
  ZONES.forEach(z => {
    const ws = nz(z.n).split(/[^a-z0-9]+/).filter(w => w.length >= 5);
    const sc = ws.filter(w => q.includes(w.slice(0, Math.max(5, w.length - 2)))).length;
    if (sc > bs) { bs = sc; best = z; }
  });
  return best;
}


/* ----- consultas sobre cualquiera de los parámetros de la app ----- */
const zShort = z => z.n.split(" (")[0];

function paramCands(q) {
  const qn = q.replace(/-/g, " "),
        toks = qn.split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !GLOS_STOP.has(t)),
        zm = zoneFor(q),
        out = [];
  ZONES.forEach(z => z.p.forEach(p => {
    const g = GLOS[z.id + "." + p.id] || GLOS[p.id], nm = nz(p.n).replace(/-/g, " ");
    let sc = 0, strong = false;
    if (qn.includes(nm)) { sc += 6; strong = true; }
    if (g && g[3]) g[3].split("|").forEach(a => {
      const al = a.replace(/-/g, " ");
      if (al.length >= 2 && new RegExp("(^|[^a-z0-9])" + al + "($|[^a-z0-9])").test(qn)) { sc += 4; strong = true; }
    });
    toks.forEach(t => { if (t.length >= 4 && nm.includes(t.slice(0, Math.max(4, t.length - 2)))) sc += 1; });
    if (sc > 0 && zm && zm.id === z.id) sc += 3;
    if (sc > 0) out.push({ z, p, sc, strong });
  }));
  return { out: out.sort((a, b) => b.sc - a.sc), zm };
}

function paramText(z, p, cr) {
  const g = GLOS[z.id + "." + p.id] || GLOS[p.id],
        row = Engine.ev(z, C(S.day, cr), cr.id).rows.find(r => r.p.id === p.id),
        th = p.dir === "none" ? "Es un dato informativo: no tiene umbral de alerta."
           : p.dir === "lt" ? `Pasa a precaución si baja de ${fmt(p, p.y)} y a alerta si baja de ${fmt(p, p.r)} ${p.u}.`
           : `Pasa a precaución si sube de ${fmt(p, p.y)} y a alerta si sube de ${fmt(p, p.r)} ${p.u}.`,
        val = row ? `${fmt(p, row.v)} ${p.u} (${row.s < 0 ? "informativo" : sn(row.s)}${row.real ? ", dato real" : ""})` : "sin dato";
  return `${p.n} · ${zShort(z)}\n` +
    (g ? `Qué mide: ${g[0]}\nPor qué cambia en el espacio: ${g[1]}\n` : `${z.txt}\n`) +
    `Valor de ${cr.name.split(" ")[0]}: ${val}.\nReferencia (basal): ${fmt(p, p.base)} ${p.u}. ${th}` +
    (g ? `\nQué hacer: ${g[2]}` : "");
}

function paramAnswer(q, cr) {
  const { out, zm } = paramCands(q);
  if (!out.length) return null;
  const top = out[0];
  if (!top.strong && top.sc < 2) return null;
  const tops = out.filter(c => c.sc === top.sc);
  const same = tops.every(c => c.p.id === top.p.id);
  if (same && tops.length > 1 && !zm) {
    const g = GLOS[top.p.id];
    const vals = tops.map(c => {
      const r = Engine.ev(c.z, C(S.day, cr), cr.id).rows.find(x => x.p.id === c.p.id);
      return r ? `- ${zShort(c.z)}: ${fmt(c.p, r.v)} ${c.p.u} (${r.s < 0 ? "informativo" : sn(r.s)})` : null;
    }).filter(Boolean).slice(0, 12);
    return `${top.p.n}\n` + (g ? `Qué mide: ${g[0]}\nPor qué cambia en el espacio: ${g[1]}\nQué hacer: ${g[2]}\n` : "") +
      `Valores de ${cr.name.split(" ")[0]} (se mide en varias zonas):\n${vals.join("\n")}\nPregúntame por una zona concreta para ver sus umbrales.`;
  }
  const others = [...new Set(tops.slice(1).map(c => c.p.n))].filter(n => n !== top.p.n).slice(0, 3);
  return paramText(top.z, top.p, cr) + (others.length ? `\nTambién podrías referirte a: ${others.join("; ")}.` : "");
}

function listParams(q, cr) {
  const z = zoneFor(q);
  if (z) return z.p.length ? `Parámetros de ${zShort(z)}:\n` + z.p.map(p => `- ${p.n} (${p.u})`).join("\n") : `${zShort(z)} todavía no tiene parámetros con sensor.`;
  const n = ZONES.reduce((a, z) => a + z.p.length, 0);
  return `La app sigue ${n} parámetros en ${ZONES.length} zonas del cuerpo, repartidos en huesos, músculos, órganos y evaluaciones de mente y rendimiento. Pregúntame por cualquiera (por ejemplo: "qué es la HRV", "valor normal de la SpO₂", "por qué baja la densidad ósea") o por una zona para ver su lista.`;
}

function describeZone(z, cr) {
  const e = Engine.ev(z, C(S.day, cr), cr.id);
  const rows = e.rows.map(r => `- ${r.p.n}: ${fmt(r.p, r.v)} ${r.p.u} (${r.s < 0 ? "informativo" : sn(r.s)})`).join("\n");
  return `${z.n.split(" (")[0]} de ${cr.name}: estado ${e.st < 3 ? sn(e.st) : "sin sensor"}.\n${rows}`;
}

function bettaReply(raw, cr) {
  const q = nz(raw), t = tele(cr), pend = S.pend[cr.id];
  S.pend[cr.id] = false;
  const lvl = t.fat < 35 ? "leve" : t.fat < 60 ? "moderada" : "alta";

  if (pend && /^(si|dale|ok|claro|envialo|enviar|confirmo)/.test(q.trim()))
    return `Reporte telemétrico enviado a control de misión (simulado). Latencia con Tierra: ${ENVS[S.env].lat}.`;

  const sw = CREW.find(c => c.id !== cr.id && q.match(/(cambia|cambiar|pasa|ver|mostra|mostrar).*(a|de)\b/) && q.includes(nz(c.name.split(" ")[0])));
  if (sw) { State({ crew: sw.id }); return `Listo, ahora estás viendo a ${sw.name} (${sw.role}).`; }

  const go = [["huesos", /hueso|densidad/], ["musculos", /musculo|masa muscular/], ["organos", /organo/], ["mente", /evaluacion|test|prueba/], ["plan", /plan de ejercicio|ir al plan|abre el plan/], ["registro", /registro/], ["riesgos", /riesgo/], ["hud", /casco|visor|hud/], ["betta", /traje|telemetria/]]
    .find(([, re]) => /^(ir a|abre|abrir|llevame|muestrame|ve a)\b/.test(q) && re.test(q));
  if (go) { Nav.go({ tab: go[0] }); return `Abriendo la sección ${TABS.find(x => x.id === go[0]).n}.`; }

  if (/^(hola|buen|ayuda|que puedes|que sabes|help)/.test(q) || q.trim() === "")
    return "Soy INTI, tu asistente. Puedes preguntarme:\n- Análisis completo, estado general o alertas activas.\n- Estado de una zona (corazón, pulmones, columna lumbar) y la lista de sus parámetros.\n- Qué significa, cuál es el valor normal y qué hacer con cualquiera de los 99 parámetros de la app (por ejemplo: \"qué es la HRV\").\n- Qué ejercicio te toca hoy.\n- Qué hacer ante mareo, dolor lumbar, falta de aire, radiación, paro cardíaco y más.\n- Cambiar de tripulante: \"cambia a Mariana\".";

  if (/analisis|diagnos|me siento|siento mal|cansa|mareado|revisame/.test(q)) {
    const f = flagged(cr).slice(0, 3).map(itx);
    const rec = ["Todo está dentro de lo esperado; continúa con tu rutina.", "Recomiendo reducir el ritmo de trabajo 10 minutos y aumentar la refrigeración de la capa 7.", "Recomiendo detener la actividad, hidratarte y avisar ahora a la médica de vuelo."][t.w];
    S.pend[cr.id] = true;
    return `Activando protocolo de diagnóstico para ${cr.name}.\nEEG y pupila (${nfx(t.pup, 1)} mm): fatiga ${lvl}. Frecuencia cardíaca ${Math.round(t.hr)} lpm, oxigenación ${nfx(t.spo2, 0)} % y tensión muscular ${Math.round(t.emg)} %.\n${f.length ? "En seguimiento: " + f.join("; ") + ".\n" : ""}${rec}\n¿Quieres que envíe este reporte a control de misión?`;
  }

  if (/alerta|en seguimiento|problema|pendiente/.test(q)) {
    const f = flagged(cr);
    return f.length ? `${cr.name} tiene ${f.length} parámetros en seguimiento. Los más importantes:\n` + f.slice(0, 5).map(a => "- " + itx(a)).join("\n") : `${cr.name} no tiene alertas: todos los parámetros están normales.`;
  }

  if (/estado|como estoy|resumen|general/.test(q) && !zoneFor(q))
    return `Estado general de ${cr.name}: ${sn(t.w)}. ${t.sm.n[0]} zonas normales, ${t.sm.n[1]} en precaución y ${t.sm.n[2]} en alerta. Frecuencia cardíaca ${Math.round(t.hr)} lpm, SpO₂ ${nfx(t.spo2, 0)} %, temperatura ${nfx(t.temp, 1)} °C.`;

  if (/(que|cuales|cuantos|lista).*parametros/.test(q)) return listParams(q, cr);

  const pa = paramAnswer(q, cr);
  if (pa && !/^(que hago|que debo)/.test(q)) return pa;

  const kb = INTI_KB.find(([re]) => re.test(q));
  if (kb) {
    if (kb[1] === "RUTINA") { setTimeout(() => Nav.go({ tab: "plan" }), 400); return "Tu rutina del día está en la pestaña Plan de ejercicio, ordenada según el estado de cada zona. La abro ahora. Recuerda registrar la carga y las repeticiones al terminar."; }
    return kb[1].replace("LATENCIA", ENVS[S.env].lat);
  }

  const z = zoneFor(q);
  if (z) return describeZone(z, cr);
  if (pa) return pa;

  const kk = /hueso|densidad/.test(q) ? "huesos" : /musculo|masa/.test(q) ? "musculos" : /organo/.test(q) ? "organos" : null;
  if (kk) {
    const f = flagged(cr).filter(a => a.z.tab === kk);
    return f.length ? `En ${TABS.find(x => x.id === kk).n.toLowerCase()} de ${cr.name} están en seguimiento: ${f.slice(0, 5).map(itx).join("; ")}.` : `${TABS.find(x => x.id === kk).n}: todos los parámetros de ${cr.name} están normales.`;
  }

  return "No estoy segura de haber entendido. Prueba con: \"análisis completo\", \"estado del corazón\", \"qué hago si me mareo\", \"qué ejercicio me toca hoy\" o \"ayuda\".";
}

/* ----- panel del chat ----- */
function buildChat() {
  if ($("bchat")) return;
  const w = document.createElement("div");
  w.innerHTML = `<button type="button" id="bfab" class="bfab" aria-expanded="false" aria-controls="bchat"><span class="bfab-i" aria-hidden="true"></span>Asistente INTI</button>
<section id="bchat" class="bchat g" role="dialog" aria-label="Asistente INTI" hidden>
  <header class="bc-h"><div><b>INTI</b><small id="bwho"></small></div><div class="bc-hb"><label class="bc-v"><input type="checkbox" id="bvoice" checked> Voz</label><button type="button" class="ib" id="bclose" aria-label="Cerrar asistente"><span class="icon-close" aria-hidden="true"></span></button></div></header>
  <div class="bc-log" id="blog" aria-live="polite"></div>
  <div class="bc-q">${INTI_QUICK.map(q => `<button type="button" class="chip" data-bq="${esc(q[1])}">${q[0]}</button>`).join("")}</div>
  <form class="bc-f" id="bform" autocomplete="off"><input type="text" id="bin" placeholder="Escribe tu duda o indicación" aria-label="Mensaje para INTI"><button type="submit" class="btn">Enviar</button><button type="button" class="btn o" id="bmic" hidden>Hablar</button></form>
</section>`;
  while (w.firstChild) document.body.appendChild(w.firstChild);

  const open = o => {
    $("bchat").hidden = !o;
    $("bfab").setAttribute("aria-expanded", String(o));
    $("bfab").classList.toggle("on", o);
    if (o) { renderChat(); setTimeout(() => $("bin").focus(), 50); }
  };
  window.bettaOpen = open;
  $("bfab").onclick = () => open($("bchat").hidden);
  $("bclose").onclick = () => open(false);
  $("bvoice").checked = S.voice;
  $("bvoice").onchange = e => { S.voice = e.target.checked; if (!S.voice) try { speechSynthesis.cancel(); } catch (x) {} };
  $("bform").onsubmit = e => { e.preventDefault(); const i = $("bin"); ask(i.value); i.value = ""; };
  addEventListener("keydown", e => { if (e.key === "Escape" && !$("bchat").hidden) open(false); });

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    $("bmic").hidden = false;
    $("bmic").onclick = () => { try { const r = new SR(); r.lang = (typeof KSLang !== "undefined" && KSLang.get() === "en") ? "en-US" : "es-AR"; r.onresult = e => ask(e.results[0][0].transcript); r.start(); } catch (x) {} };
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-bq]");
    if (b) { open(true); ask(b.dataset.bq); return; }
    if (e.target.closest("[data-bopen]")) open(true);
  });
}

function renderChat() {
  const cr = crewOf(), l = S.chat[cr.id] || [], el = $("blog");
  if (!el) return;
  $("bwho").textContent = " · " + cr.name;
  el.innerHTML = l.length
    ? l.map(m => `<div class="msg ${m.u ? "u" : "b"}">${esc(m.t).replace(/\n/g, "<br>")}</div>`).join("")
    : `<div class="msg b">Hola ${esc(cr.name.split(" ")[0])}, soy INTI. Pídeme un análisis completo, pregúntame por una zona o dime cómo te sientes.</div>`;
  el.scrollTop = el.scrollHeight;
}

/* Habla en el idioma elegido: en inglés se traduce el texto antes de decirlo. */
/* Elige la voz más natural disponible: prioriza las "neuronales" y las femeninas cálidas conocidas. */
const VOICE_PREF = {
  es: ["natural", "online", "neural", "google español", "paulina", "monica", "mónica", "sabina", "helena", "laura", "elena", "lucia", "lucía", "marisol", "dalia", "salome", "elvira", "female"],
  en: ["natural", "online", "neural", "google us english", "samantha", "aria", "jenny", "zira", "karen", "serena", "moira", "ava", "allison", "female"]
};
function bestVoice(l) {
  const vs = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(l)), pf = VOICE_PREF[l];
  const score = v => {
    const n = v.name.toLowerCase();
    let sc = 0;
    pf.forEach((k, i) => { if (n.includes(k)) sc += (k === "natural" || k === "neural" || k === "online") ? 30 : 20 - Math.min(i, 15); });
    if (/(es-ar|es-mx|es-us|en-us)/.test(v.lang.toLowerCase())) sc += 2;
    if (/(jorge|diego|juan|carlos|pablo|david|mark|james|george|alex|daniel|male)/.test(n) && !n.includes("female")) sc -= 12;
    if (/espeak|compact/.test(n)) sc -= 20;
    return sc;
  };
  return vs.sort((a, b) => score(b) - score(a))[0] || null;
}
function speakIn(txt, l) {
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = l === "en" ? "en-US" : "es-AR";
  const v = bestVoice(l);
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = .9;      /* ritmo pausado */
  u.pitch = 1.08;   /* un poco más cálido */
  u.volume = .95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  return u;
}
function bettaSay(x, cb) {
  try {
    if (!S.voice || !window.speechSynthesis) return;
    const clean = x.replace(/\n+/g, ". ").replace(/^- /gm, "").replace(/\s*·\s*/g, ", ").replace(/\s{2,}/g, " "),
          en = typeof KSLang !== "undefined" && KSLang.get() === "en";
    if (en && KSLang.tr) KSLang.tr(clean, (t, ok) => { try { const u = speakIn(t, ok ? "en" : "es"); if (cb) cb(u); } catch (e) {} });
    else { const u = speakIn(clean, "es"); if (cb) cb(u); }
  } catch (e) {}
}

function ask(q) {
  q = String(q).trim();
  if (!q) return;
  const cr = crewOf(), l = S.chat[cr.id] = S.chat[cr.id] || [];
  l.push({ u: 1, t: q });
  const a = bettaReply(q, cr);
  l.push({ t: a });
  renderChat();
  S.hudSay = 1;
  if ($("hsub")) $("hsub").textContent = "INTI: " + a.replace(/\n/g, " ");
  setTimeout(() => { S.hudSay = 0; S.hk = null; }, 12000);
  bettaSay(a);
}

/* ---------- Integración con la app ---------- */
(() => {
  const base = renderChrome;
  renderChrome = function () {
    base();
    renderCrewBar();
    renderChat();
  };
  buildChat();
})();

/* ---------- Saludo de INTI al ingresar ---------- */
function introText() {
  const parts = CREW.map(cr => {
    const w = Engine.summary(cr).w, name = cr.name;
    if (w === 0) return `${name}: bueno.`;
    if (w === 1) return `${name}: precaución.`;
    const crit = flagged(cr).filter(a => a.r.s === 2).slice(0, 3).map(itx).join("; ");
    return `${name}: crítico. Detalle: ${crit || "valores fuera de rango"}.`;
  });
  return `Saludos tripulantes, bienvenidos al sistema de monitoreo KINESOFT. Estamos en el día número ${S.day} de nuestro viaje. Sus parámetros son: ${parts.join(" ")}`;
}

(() => {
  if (typeof document === "undefined" || typeof setTimeout !== "function" || !$("bchat")) return;
  let txt = "", started = false, done = false;
  const speak = () => {
    if (done) return;
    started = false;
    bettaSay(txt, u => {
      u.onstart = () => { started = true; done = true; };
      u.onerror = () => { started = false; };
    });
  };
  const unlock = () => { if (!done) speak(); removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); };
  const go = () => setTimeout(() => {
    try {
      txt = introText();
      const l = S.chat[S.crew] = S.chat[S.crew] || [];
      l.unshift({ t: txt });
      if (typeof bettaOpen === "function") bettaOpen(true);
      renderChat();
      speak();
      addEventListener("pointerdown", unlock, { passive: true });
      addEventListener("keydown", unlock, { passive: true });
    } catch (e) {}
  }, 500);
  if (typeof KSSplash === "undefined" || KSSplash.done) go(); else document.addEventListener("ks-splash-done", go, { once: true });
})();

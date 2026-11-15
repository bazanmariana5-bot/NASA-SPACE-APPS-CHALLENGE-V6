/* js/ui/plan.js — Pestaña "Plan de ejercicio": rutinas priorizadas por el estado de cada zona (modelo del html Control de Salud Orbital),
   entrenamiento cervical con casco lastrado y plan de estabilización para el regreso (parámetros del PDF NASA). */
"use strict";

/* ---------- Rutinas: zones = zonas cuyo estado fija la prioridad; adh = puntos de cumplimiento que suma al completarla ---------- */
const ROUT = [
  { id: "ared", t: "Resistencia en ARED: tren inferior", min: 45, adh: 10, zones: ["pelvis", "femur", "tibia", "pie", "muslo", "cadera", "pantorrilla"], why: "Carga el hueso y el músculo para frenar la pérdida de densidad y de masa.", steps: ["Sentadillas con barra: 3 series de 10", "Peso muerto: 3 series de 8", "Elevación de talones: 3 series de 15", "Registrar la carga (kgf) y las repeticiones logradas"] },
  { id: "lumbar", t: "Movilidad lumbar y contramedidas para la columna vertebral", min: 20, adh: 5, zones: ["lumbar", "core"], why: "Alivia los discos que se expandieron y protege la columna.", steps: ["Colocar el traje de compresión axial durante 1 a 2 horas", "Llevar las rodillas al pecho: 3 repeticiones de 30 segundos", "Rotación suave de tronco sentado: 10 por lado", "Puntuar el dolor lumbar de 0 a 10"] },
  { id: "casco", t: "Entrenamiento con casco lastrado de resistencia multidireccional", min: 15, adh: 5, zones: ["cervical", "ecm", "trapecio", "esplenio", "largocuello", "multifidos"], why: "Incluye los movimientos de flexión cervical, extensión cervical, inclinación derecha e izquierda y rotaciones, todos con resistencia ajustable para permitir el fortalecimiento de la musculatura cervical.", steps: ["Flexión cervical con resistencia ajustable", "Extensión cervical con resistencia ajustable", "Inclinación derecha e izquierda con resistencia ajustable", "Rotaciones derecha e izquierda con resistencia ajustable", "Registrar la resistencia usada en cada movimiento"] },
  { id: "eva", t: "Movilidad post-EVA: manos y hombros", min: 10, adh: 5, zones: ["hombros", "brazos", "antebrazo", "humero"], why: "Recupera movilidad tras el uso del traje espacial.", steps: ["Círculos de hombros: 2 series de 10", "Estiramiento de flexores de muñeca: 30 segundos por lado", "Apertura y cierre de manos: 3 series de 15", "Medir la fuerza de agarre con el dinamómetro"] },
  { id: "cardio", t: "Aeróbico con arnés e hidratación", min: 35, adh: 5, zones: ["corazon", "vasos", "pulmones"], why: "Mantiene el corazón y la circulación activos frente al corrimiento de líquidos.", steps: ["Beber 500 mL antes de empezar", "30 minutos de trote en cinta con arnés a ritmo moderado", "Enfriar 5 minutos y registrar la frecuencia cardíaca"] },
  { id: "resp", t: "Respiración diafragmática y descompresión mental", min: 10, adh: 0, zones: ["pulmones", "cerebro"], why: "Mejora la ventilación y ayuda a sobrellevar el aislamiento.", steps: ["Sentarse con la espalda apoyada y una mano en el abdomen", "Inhalar 4 segundos y exhalar 6 segundos, 5 minutos", "Cerrar con 3 minutos de atención en los sonidos del entorno"] },
  { id: "vest", t: "Equilibrio y entrenamiento vestibular", min: 15, adh: 0, zones: ["cerebro", "corazon"], why: "Prepara el sistema del equilibrio para volver a la gravedad.", steps: ["Movimientos lentos de cabeza con la vista fija: 2 series de 10", "Marcha en tándem con apoyo: 2 pasadas", "Pasar de acostado a de pie en 3 tiempos"] },
  { id: "hid", t: "Hidratación y prevención renal", min: 5, adh: 0, zones: ["rinones"], why: "Diluye el calcio en orina y reduce el riesgo de cálculos.", steps: ["Planificar entre 2,5 y 3 L de agua en el día", "Revisar el sodio de las comidas", "Registrar la diuresis"] },
  { id: "regreso", t: "Plan estabilización y acondicionamiento para el regreso", min: 25, adh: 5, zones: ["corazon", "vasos"], why: "Para contrarrestar la hipovolemia plasmática, la falla vasomotora y barorrefleja, utiliza los parámetros del PDF de la NASA: índice de Valsalva, curva de presión arterial y evaluación de compensación de fuerza G.", steps: ["Fase 1, pre-reentrada (72 a 24 h): maniobra anti-G M-1/L-1 con biofeedback y carga resistiva del tren inferior", "Fase 2, reentrada (1,5 G a 4 G): contracción isométrica de miembros inferiores con metrónomo M-1/L-1", "Fase 3, posaterrizaje (2 h): bombeo de tobillos, sedestación asistida y bipedestación progresiva"] }
];

const PLAN_LV = ["Mantenimiento", "Recomendada", "Prioridad alta"];

/* ---------- Progreso por tripulante (localStorage): rutinas completadas por día y datos del test de Valsalva ---------- */
const Plan = {
  K: "orbital_plan_v1",
  ver: 0,
  d: {},
  load() {
    try { this.d = JSON.parse(localStorage.getItem(this.K) || "{}") || {}; } catch (e) { this.d = {}; }
  },
  save() {
    try { localStorage.setItem(this.K, JSON.stringify(this.d)); } catch (e) {}
  },
  of(c = S.crew) {
    const o = this.d[c] = this.d[c] || {};
    o.done = o.done || {};
    o.vs = o.vs || {};
    return o;
  },
  isDone(rid) {
    const o = this.of();
    return !!(o.done[S.day] && o.done[S.day][rid]);
  }
};
Plan.load();

/* ---------- Clasificación del PDF NASA: índice de Valsalva + curva de presión arterial (Fase II tardía y Fase IV) ---------- */
const VS_OK = 1.21,   /* mayor a 1,21 = respuesta autonómica intacta (óptimo 1,4 a 1,5) */
      VS_RED = 1.10;  /* menor a 1,10 = riesgo crítico de síncope */

const VS_LV = [
  ["Nivel verde", "Apto estándar"],
  ["Nivel amarillo", "Riesgo moderado: alerta de precarga"],
  ["Nivel rojo", "Riesgo crítico de síncope"]
];

const nf = (v, d = 2) => v.toFixed(d).replace(".", ",");

function vsEval(v = {}) {
  const ratio = v.fmax > 0 && v.fmin > 0 ? v.fmax / v.fmin : null,
        red = [],
        yel = [];

  if (ratio != null) {
    if (ratio < VS_RED) red.push(`Índice de Valsalva ${nf(ratio)} (menor a 1,10)`);
    else if (ratio <= VS_OK) yel.push(`Índice de Valsalva ${nf(ratio)} (entre 1,10 y 1,21)`);
  }
  if (v.f2 === "cae") red.push("Fase II tardía: la presión sigue cayendo sin recuperarse (falla vasoconstrictora)");
  if (v.f4 === "ausente") red.push("Fase IV: ausencia total de rebote de la presión arterial");
  else if (v.f4 === "atenuado") yel.push("Fase IV: rebote atenuado");

  const full = ratio != null && !!v.f2 && !!v.f4,
        any = ratio != null || !!v.f2 || !!v.f4;
  let lv = null;
  if (red.length) lv = 2;
  else if (yel.length) lv = 1;
  else if (full) lv = 0;

  return { ratio, lv, why: lv === 2 ? red.concat(yel) : yel, full, any, g: v.g || null };
}

const vsBadge = r => r.lv == null ? `<span class="bd t3">${r.any ? "Evaluación incompleta" : "Sin evaluar"}</span>` : `<span class="bd t${r.lv}">${VS_LV[r.lv][0]}</span>`;

/* Dosificación del plan según el nivel (PDF): verde = estándar; amarillo y rojo = bloques ampliados. */
function vsPlan(lv) {
  const strong = lv >= 1,
        dose = strong ? "5 bloques de 6 ciclos, 3 veces al día, vigilando que la frecuencia cardíaca suba de forma controlada y sin mareos" : "3 bloques de 4 ciclos (3 s de tensión y 1 s de respiro), 2 veces al día";
  return { dose, strong };
}

function vsResult(r) {
  const odd = r.ratio != null && (r.ratio < 1 || r.ratio > 3) ? `<div class="alert t1">Revisa las frecuencias cardíacas: el cociente ${nf(r.ratio)} es poco plausible (la FC máxima de la Fase II debería ser mayor que la mínima de la Fase IV).</div>` : "";
  const lead = odd + (r.lv == null
    ? `<p class="u-fs-13 u-c-mu">${r.any ? "Faltan datos para clasificar: se necesitan el índice de Valsalva (FC máxima de Fase II y FC mínima de Fase IV), la Fase II tardía y la Fase IV." : "Ingresa los parámetros del test de Valsalva para clasificar al tripulante."}</p>`
    : `<div class="alert t${r.lv}"><b>${VS_LV[r.lv][0]} · ${VS_LV[r.lv][1]}.</b>${r.why.length ? `<ul class="u-m-6-0">${r.why.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}${r.lv === 0 ? " Índice de Valsalva sobre 1,21 con recuperación en Fase II tardía y rebote presente en Fase IV." : ""}${r.lv === 1 ? " Indica pérdida significativa de volumen plasmático: requiere expansión volémica y entrenamiento muscular previo." : ""}${r.lv === 2 ? " Requiere protocolo máximo de contramedidas físicas, carga hidrosalina obligatoria, prendas anti-G y reentrada y aterrizaje estrictamente en decúbito." : ""}${!r.full && r.lv < 2 ? " <small>Resultado provisional: faltan datos por ingresar.</small>" : ""}</div>`);
  const g = r.g === "pierde" ? `<div class="alert t1"><b>Compensación de fuerza G alterada.</b> Pérdida de visión periférica (grey-out) o blackout: repetir el entrenamiento de la maniobra M-1/L-1 en centrífuga. <small>El PDF no asigna este parámetro al nivel automático; se muestra como indicador aparte.</small></div>`
    : r.g === "ok" ? `<div class="alert t0"><b>Compensación de fuerza G conservada.</b> Mantiene perfusión cerebral y visión periférica entre 1,5 G y 4 G.</div>` : "";
  const dz = r.lv != null ? vsPlan(r.lv) : null;
  const plan = dz ? `<p class="u-fs-13"><b class="u-c-tx">Dosis de la Fase 1 para este nivel:</b> ${dz.dose}.${r.lv === 2 ? " En la reentrada: contracción isométrica continua de miembros inferiores durante todo el pico de desaceleración, con inflado automático del traje anti-G." : ""}</p>` : "";
  return lead + g + plan;
}

/* ---------- Prioridad de cada rutina (0 mantenimiento, 1 recomendada, 2 alta) ---------- */
function routineLevel(r) {
  if (r.id === "regreso") {
    const e = vsEval(Plan.of().vs);
    if (e.lv != null) return e.lv;
  }
  return Math.max(0, ...r.zones.map(id => {
    const z = ZONES.find(q => q.id === id),
          s = z ? Engine.ev(z).st : 3;
    return s < 3 ? s : 0;
  }));
}

const planRows = () => ROUT.map(r => ({ r, p: routineLevel(r) })).sort((a, b) => b.p - a.p);

function planToday() {
  const R = planRows(),
        pri = R.filter(x => x.p > 0),
        mins = pri.reduce((a, x) => a + x.r.min, 0),
        z = ZONES.find(q => q.id === "lumbar"),
        gain = z && Engine.ev(z).rows.find(x => x.p.id === "dhp"),
        rec = gain && gain.v >= 3 ? `<div class="alert t2" role="status"><b>Recomendación:</b> ${HEIGHT_REC}. <small>Ganancia de estatura de ${fmt(gain.p, gain.v)} %.</small></div>` : "";
  return `<b>Receta del día ${S.day}</b>${rec}${pri.length ? `<p class="u-m-6-0 u-fs-13">${pri.length} rutina${pri.length === 1 ? "" : "s"} recomendada${pri.length === 1 ? "" : "s"}, unos ${mins} minutos. Prioridad: <b class="u-c-tx">${pri[0].r.t}</b>.</p>` : `<p class="u-m-6-0 u-fs-13">Sin prioridades. Mantén la rutina normal de misión.</p>`}`;
}

/* ---------- Tarjeta del test de Valsalva y plan en 3 fases (PDF NASA) ---------- */
function regresoBody() {
  const v = Plan.of().vs,
        sel = (k, opts) => `<select data-vs="${k}" aria-label="${k}"><option value="">Sin dato</option>${opts.map(o => `<option value="${o[0]}" ${v[k] === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select>`,
        num = (k, ph) => `<input type="number" step="any" inputmode="decimal" min="1" data-vs="${k}" placeholder="${ph}" value="${v[k] != null ? v[k] : ""}">`,
        r = vsEval(v);

  return `<div class="fg vsf">
<label>FC máxima en Fase II (lpm)${num("fmax", "Ej.: 95")}</label>
<label>FC mínima en Fase IV (lpm)${num("fmin", "Ej.: 68")}</label>
<label class="w">Curva de presión arterial · Fase II tardía (antes de los 15 s)${sel("f2", [["rec", "Recupera: la presión sube de nuevo"], ["cae", "Caída continua sin recuperación"]])}</label>
<label class="w">Curva de presión arterial · Fase IV (rebote u overshoot)${sel("f4", [["presente", "Presente: supera el valor basal"], ["atenuado", "Atenuado"], ["ausente", "Ausente"]])}</label>
<label class="w">Evaluación de compensación de fuerza G (maniobra M-1/L-1, 1,5 G a 4 G)${sel("g", [["ok", "Mantiene perfusión cerebral y visión periférica"], ["pierde", "Pierde visión periférica (grey-out) o blackout"]])}</label>
</div>
<p class="u-fs-12 u-c-mu u-m-6-0">Índice de Valsalva = FC máxima de la Fase II ÷ FC mínima de la Fase IV. Normal: mayor a 1,21 (óptimo 1,4 a 1,5). Valor calculado: <b class="mono u-c-tx" id="vsratio">${r.ratio != null ? nf(r.ratio) : "—"}</b></p>
<div id="vsres">${vsResult(r)}</div>
<details><summary>Plan en 3 fases</summary>
<p><b class="u-c-tx">Fase 1 · Acondicionamiento pre-reentrada (últimas 72 a 24 horas en órbita).</b> Reactivar el tono vasoconstrictor simpático, estimular la retención de volumen plasmático y entrenar la bomba muscular periférica.</p>
<ul>
<li>Maniobra anti-G (M-1/L-1) con biofeedback: contracción isométrica máxima de pantorrillas, cuádriceps, glúteos y faja abdominal combinada con pujos cortos de 3 a 4 s contra glotis semicerrada (M-1) o cerrada con intercambio de aire menor a 1 s (L-1). Nivel verde: 3 bloques de 4 ciclos (3 s de tensión y 1 s de respiro), 2 veces al día. Nivel amarillo o rojo: 5 bloques de 6 ciclos, 3 veces al día.</li>
<li>Carga resistiva del tren inferior (ARED o bandas de alta tensión): sentadillas y elevaciones de talones, 4 series de 12 a 15 repeticiones al 70 % de intensidad, exhalando en el esfuerzo. Sin Valsalva sostenido de 15 s en microgravedad para no elevar la presión intracraneal.</li>
</ul>
<p><b class="u-c-tx">Fase 2 · Estabilización activa durante la reentrada (1,5 G a 4 G).</b> Evitar el secuestro de sangre en miembros inferiores y prevenir el blackout.</p>
<ul>
<li>Asistente M-1/L-1 en tiempo real: al superar 1,5 G, metrónomo visual y táctil con ciclos de 3,5 s de tensión muscular con pujo corto y 0,5 s de intercambio respiratorio.</li>
<li>Nivel rojo: mantener la contracción isométrica de miembros inferiores durante todo el pico de desaceleración, con inflado automático del traje o pantalón anti-G.</li>
</ul>
<p><b class="u-c-tx">Fase 3 · Reacondicionamiento ortostático posaterrizaje (primeras 2 horas en 1 G).</b> Estabilizar la presión arterial y evitar el síncope al pasar de decúbito a sedestación y bipedestación.</p>
<ul>
<li>Minutos 0 a 20, acostado o en asiento reclinado: bombeo tibio-peroneo con flexo-extensión máxima de tobillos (20 repeticiones cada 3 min) y contracción alterna de glúteos y cuádriceps (5 s de contracción y 5 s de relajación). Avanzar con frecuencia cardíaca basal estabilizada y sin síntomas prodrómicos.</li>
<li>Minutos 20 a 60, sedestación asistida: cruce de piernas con contracción de muslos y glúteos durante 30 s al incorporarse, y prensión manual isométrica (30 a 40 % de la fuerza máxima) durante 2 min.</li>
<li>Minutos 60 a 120, bipedestación progresiva: prohibido quedarse quieto de pie; elevar los talones cada 2 s hasta confirmar que la presión sistólica no cae más de 20 mmHg respecto del basal acostado.</li>
</ul></details>
<details><summary>Reglas de seguridad</summary>
<ul>
<li>Bloqueo de Valsalva puro en Tierra: si el tripulante contiene la respiración más de 4 s sin contracción muscular periférica al levantarse, avisar de inmediato: “¡Suelta el aire y contrae las piernas!”.</li>
<li>Alerta prodrómica: ante visión en túnel, sudoración fría o náuseas, suspender la bipedestación y pasar a posición horizontal con las piernas elevadas a 45°.</li>
</ul></details>`;
}

function routineCard(x) {
  const { r, p } = x,
        ok = Plan.isDone(r.id),
        reg = r.id === "regreso";
  return `<section class="card plc" id="pl-${r.id}"><div class="rw u-jc-space-between u-gap-8"><h3>${r.t}</h3><span class="bd t${p}" ${reg ? 'id="vsbd"' : ""}>${PLAN_LV[p]}</span></div><p class="mono u-m-6-0">${r.min} min</p><p class="u-m-0 u-fs-13 u-c-mu">${r.why}</p><ol class="steps">${r.steps.map(s => `<li>${s}</li>`).join("")}</ol><div class="plb">${reg ? '<button class="btn o sm" data-vs-open>Test de Valsalva y plan detallado</button>' : ""}<button class="btn" data-done="${r.id}" ${ok ? "disabled" : ""}>${ok ? "Completada" : "Completar rutina"}</button></div></section>`;
}

function viewPlan() {
  const cr = crewOf();
  return `<div class="g pn"><div class="rw u-jc-space-between u-fw-wrap u-gap-10"><div><b>Plan de ejercicio de ${cr.name}</b><p class="u-m-2-0-0 u-c-mu u-fs-13">Las rutinas se ordenan según el estado de cada zona del cuerpo en el día ${S.day}. Completar una rutina mejora el cumplimiento de ejercicio del modelo.</p></div></div></div>
<div class="g pn" id="pl-hoy">${planToday()}</div>
<div class="plg" id="pl-rut">${planRows().map(routineCard).join("")}</div>`;
}

/* ---------- Eventos de la pestaña ---------- */
document.addEventListener("click", e => {
  if (!e.target.closest("[data-vs-open]")) return;
  openDlg(head("Test de Valsalva y plan en 3 fases", "Parámetros del PDF de la NASA.") + regresoBody() + foot());
});

document.addEventListener("click", e => {
  const b = e.target.closest("[data-done]");
  if (!b || b.disabled) return;
  const r = ROUT.find(x => x.id === b.dataset.done);
  if (!r) return;
  const o = Plan.of();
  (o.done[S.day] = o.done[S.day] || {})[r.id] = 1;
  cfg().adh = Math.min(100, cfg().adh + r.adh);
  Plan.save();
  Plan.ver++;
  toast("Rutina completada");
  render();
});

/* Cada cambio del test de Valsalva actualiza solo el resultado (sin remontar la vista, para no perder el foco al escribir). */
function vsInput(e) {
  const el = e.target,
        k = el.dataset && el.dataset.vs;
  if (!k) return;
  const v = Plan.of().vs;
  if (el.tagName === "SELECT") v[k] = el.value || null;
  else { const n = parseFloat(el.value); v[k] = n > 0 ? n : null; }
  Plan.save();
  const r = vsEval(v),
        set = (id, h) => { const n = $(id); if (n) n.innerHTML = h; };
  set("vsres", vsResult(r));
  set("vsratio", r.ratio != null ? nf(r.ratio) : "—");
  set("pl-hoy", planToday());
  const bd2 = $("vsbd");
  if (bd2) {
    const p = routineLevel(ROUT.find(x => x.id === "regreso"));
    bd2.className = "bd t" + p;
    bd2.textContent = PLAN_LV[p];
  }
}
document.addEventListener("input", vsInput);
document.addEventListener("change", vsInput);

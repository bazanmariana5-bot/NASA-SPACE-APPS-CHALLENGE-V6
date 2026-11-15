/* js/features/alerts.js — Alertas dinámicas.
   Precaución: aviso grande arriba a la derecha que se cierra solo.
   Alerta crítica: panel grande y centrado con acciones.
   Emergencia vital: pantalla completa; el paro cardiorrespiratorio se confirma, avisa que se despeje la zona y habla en voz alta. */
"use strict";

const ALERT_MS = { yellow: 8000, red: 14000 };

let activeAlertTarget = null;
let lastAlertSignature = "";
const alertTimers = { yellow: null, red: null, vital: null };
let lastVitalSig = "";
let defibTimer = null;

const alertEls = () => ({ yellow: $("alert-toast-yellow"), red: $("alert-toast-red"), vital: $("alert-toast-vital") });

/* ---------- Íconos dibujados (SVG, sin caracteres especiales) ---------- */
const ICON_WARN = `<svg viewBox="0 0 48 48" class="alert-ico" aria-hidden="true" focusable="false"><path class="tri" d="M24 4.5c1 0 1.9.5 2.4 1.4l18.6 32.1c1.1 1.9-.3 4.2-2.4 4.2H5.4c-2.1 0-3.5-2.300-2.400-4.200L21.600 5.900c.5-.9 1.400-1.400 2.400-1.400z"/><rect class="ex" x="22" y="16.500" width="4" height="13.500" rx="2"/><circle class="ex" cx="24" cy="35.500" r="2.500"/></svg>`;

const ICON_HEART = `<svg viewBox="0 0 64 60" class="vital-heart-svg" aria-hidden="true" focusable="false"><path d="M32 57C9 40 3 27 3 18 3 9.500 9.500 3 18 3c6 0 11 3 14 8 3-5 8-8 14-8 8.500 0 15 6.500 15 15 0 9-6 22-29 39z"/><rect class="ex" x="28.500" y="13" width="7" height="22" rx="3.500"/><circle class="ex" cx="32" cy="43.500" r="4"/></svg>`;

const setVeil = lv => {
  const v = $("alert-veil");
  if (v) v.dataset.level = lv || "";
};

function hideAlert(kind) {
  const el = alertEls()[kind];
  clearTimeout(alertTimers[kind]);
  if (el) el.classList.remove("on", "paused");
  if (kind === "red" || kind === "vital") setVeil("");
  if (kind === "vital") {
    clearTimeout(defibTimer);
    if (typeof Voice !== "undefined") Voice.stop();
    document.documentElement.classList.remove("vital-open");
  }
}

/* Muestra el aviso y lo oculta tras ALERT_MS. */
function showAlert(kind, html) {
  const el = alertEls()[kind];
  if (!el) return;

  hideAlert(kind === "red" ? "yellow" : "red");

  el.innerHTML = html;
  el.style.setProperty("--alert-ms", ALERT_MS[kind] + "ms");

  /* reinicia la barra de cuenta regresiva */
  el.classList.remove("on", "paused");
  void el.offsetWidth;
  el.classList.add("on");
  if (kind === "red") setVeil("red");

  clearTimeout(alertTimers[kind]);
  alertTimers[kind] = setTimeout(() => hideAlert(kind), ALERT_MS[kind]);
}

/* Busca emergencias vitales en los 3 tripulantes */
function findEmergencies() {
  const out = [];
  CREW.forEach(cr =>
    ZONES.forEach(z => {
      Engine.ev(z, C(S.day, cr), cr.id).rows.forEach(r => {
        const rules = EMERG[z.id + "." + r.p.id];
        if (!rules) return;
        const hit = rules.find(([op, lim]) => (op === "lt" ? r.v <= lim : r.v >= lim));
        if (hit) out.push({ cr, z, r, txt: hit[2], arrest: hit[3] === "paro" });
      });
    })
  );
  return out;
}

const alertValue = a =>
  `<span class="alert-zone">${esc(a.z.n)}</span><span class="alert-param">${esc(a.r.p.n)}</span><span class="alert-val mono">${fmt(a.r.p, a.r.v)} <small>${esc(a.r.p.u)}</small></span>`;

/* ---------- Emergencia vital ---------- */
function showVital(e) {
  const el = alertEls().vital;
  if (!el) return;
  activeAlertTarget = e;
  const name = esc(e.cr.name),
    pv = `${esc(e.z.n)} · ${esc(e.r.p.n)}: ${fmt(e.r.p, e.r.v)} ${esc(e.r.p.u)}`;

  const arrest = e.arrest;
  const title = arrest ? "Paro cardiorrespiratorio confirmado" : "Emergencia vital",
    who = arrest
      ? `El tripulante <b>${name}</b> está sufriendo un paro cardiorrespiratorio.`
      : `El tripulante <b>${name}</b> presenta ${esc(e.txt)}.`,
    defib = arrest
      ? `<div class="vital-defib"><div class="defib-text"><b>Despejen la zona</b><span id="defib-msg">El desfibrilador está a punto de activarse. Nadie debe tocar al paciente.</span></div><div class="defib-charge" role="progressbar" aria-label="Carga del desfibrilador"><i></i></div></div>`
      : `<p class="vital-note">Se solicita asistencia inmediata. Mantengan la calma y sigan los protocolos de emergencia.</p>`;

  el.classList.toggle("arrest", !!arrest);
  el.innerHTML = `
    <div class="vital-card">
      <button type="button" class="alert-x" data-alert-close="vital" aria-label="Descartar emergencia"><span class="icon-close" aria-hidden="true"></span></button>
      <div class="vital-row">
        <div class="vital-emblem">${arrest ? ICON_HEART : ICON_WARN}<i class="vital-ring"></i><i class="vital-ring r2"></i></div>
        <div class="vital-text">
          <div class="vital-kicker">Emergencia vital</div>
          <h2 class="vital-title">${title}</h2>
          <p class="vital-who">${who}</p>
        </div>
      </div>
      ${defib}
      <div class="vital-meta mono">${pv}</div>
      <div class="vital-actions">
        <button type="button" class="btn" data-alert-go>Ir a la zona</button>
        <button type="button" class="btn o" data-voice-toggle>${Voice.muted ? "Activar voz" : "Silenciar voz"}</button>
        <button type="button" class="btn o" data-alert-close="vital">Descartar</button>
      </div>
    </div>`;
  el.classList.add("on");
  setVeil("vital");
  document.documentElement.classList.add("vital-open");

  if (arrest) {
    clearTimeout(defibTimer);
    defibTimer = setTimeout(() => {
      const m = $("defib-msg");
      if (m) m.textContent = "Desfibrilador cargado. Aléjense del paciente.";
      el.classList.add("charged");
    }, 8000);
    Voice.start({
      es: `El tripulante ${e.cr.name} está sufriendo un paro cardiorrespiratorio. Despejen la zona. El desfibrilador está a punto de activarse.`,
      en: `Crew member ${e.cr.name} is suffering a cardiorespiratory arrest. Clear the area. The defibrillator is about to activate.`
    });
  } else {
    Voice.start({
      es: `Emergencia vital. El tripulante ${e.cr.name} requiere asistencia inmediata.`,
      en: `Vital emergency. Crew member ${e.cr.name} needs immediate assistance.`
    });
  }
  el.classList.remove("charged");
  const card = el.querySelector(".vital-card");
  if (card) {
    card.setAttribute("tabindex", "-1");
    card.focus({ preventScroll: true });
  }
}

function checkAndTriggerAlerts(force = false) {
  const al = Engine.alerts();

  const em = findEmergencies();
  if (em.length) {
    const e = em[0];
    const vs = `${e.cr.id}|${S.day}|${e.z.id}.${e.r.p.id}`;
    if (force || vs !== lastVitalSig) {
      lastVitalSig = vs;
      hideAlert("yellow");
      hideAlert("red");
      showVital(e);
    }
    return;
  }
  lastVitalSig = "";
  hideAlert("vital");

  if (!al.length) {
    lastAlertSignature = "";
    activeAlertTarget = null;
    hideAlert("yellow");
    hideAlert("red");
    return;
  }

  const redAlert = al.find(a => a.r.s === 2);
  const yellowAlert = al.find(a => a.r.s === 1);
  const target = redAlert || yellowAlert;

  const sig = `${S.crew}|${S.day}|${S.env}|${target.z.id}.${target.r.p.id}|${target.r.s}`;
  if (!force && sig === lastAlertSignature) return;
  lastAlertSignature = sig;

  if (redAlert) triggerRedAlert(redAlert);
  else triggerYellowAlert(yellowAlert);
}

/* ---------- Precaución ---------- */
function triggerYellowAlert(a) {
  activeAlertTarget = a;
  showAlert(
    "yellow",
    `
    <div class="alert-emblem">${ICON_WARN}</div>
    <div class="alert-main">
      <div class="alert-head"><span class="alert-kicker">Precaución</span><span class="alert-go">Ver zona</span></div>
      <div class="alert-info">${alertValue(a)}</div>
    </div>
    <i class="alert-bar"></i>
  `
  );
}

/* ---------- Alerta crítica: panel grande ---------- */
function triggerRedAlert(a) {
  activeAlertTarget = a;
  showAlert(
    "red",
    `
    <button type="button" class="alert-x" data-alert-close="red" aria-label="Descartar aviso"><span class="icon-close" aria-hidden="true"></span></button>
    <div class="alert-row">
      <div class="alert-emblem">${ICON_WARN}<i class="vital-ring"></i></div>
      <div class="alert-main">
        <div class="alert-kicker">Alerta crítica</div>
        <h2 class="alert-title">${esc(a.z.n)}</h2>
        <div class="alert-info">
          <span class="alert-param">${esc(a.r.p.n)}</span>
          <span class="alert-val mono">${fmt(a.r.p, a.r.v)} <small>${esc(a.r.p.u)}</small></span>
        </div>
        <p class="alert-hint">El valor superó el umbral de alerta. Revisa la zona y confirma la medición.</p>
      </div>
    </div>
    <div class="alert-actions">
      <button type="button" class="btn" data-alert-go>Ir a la zona</button>
      <button type="button" class="btn o" data-alert-close="red">Entendido</button>
    </div>
    <i class="alert-bar"></i>
  `
  );
}

function goToAlertTarget() {
  const t = activeAlertTarget;
  if (!t) return;
  hideAlert("yellow");
  hideAlert("red");
  hideAlert("vital");
  activeAlertTarget = null;
  if (t.cr) S.crew = t.cr.id;
  Nav.go({ tab: t.z.tab, z: t.z.id, p: t.r.p.id });
}

/* Un solo listener: cerrar aviso, ir a la zona, voz y botón "Cerrar" del diálogo */
document.addEventListener("click", e => {
  const close = e.target.closest("[data-alert-close]");
  if (close) {
    e.stopPropagation();
    hideAlert(close.dataset.alertClose);
    return;
  }

  if (e.target.closest("[data-alert-go]")) return goToAlertTarget();

  const vt = e.target.closest("[data-voice-toggle]");
  if (vt) {
    Voice.setMuted(!Voice.muted);
    vt.textContent = Voice.muted ? "Activar voz" : "Silenciar voz";
    return;
  }

  /* el aviso de precaución entero es un atajo a la zona */
  if (e.target.closest("#alert-toast-yellow") && activeAlertTarget) return goToAlertTarget();

  if (e.target.closest("[data-dlg-close]")) dlg.close();
});

/* Pausa la cuenta regresiva mientras el cursor o el foco están sobre el aviso */
["yellow", "red"].forEach(kind => {
  const el = alertEls()[kind];
  if (!el) return;
  const pause = () => {
    clearTimeout(alertTimers[kind]);
    el.classList.add("paused");
  };
  const resume = () => {
    if (!el.classList.contains("on")) return;
    el.classList.remove("paused");
    alertTimers[kind] = setTimeout(() => hideAlert(kind), 3000);
  };
  el.addEventListener("mouseenter", pause);
  el.addEventListener("mouseleave", resume);
  el.addEventListener("focusin", pause);
  el.addEventListener("focusout", resume);
});

addEventListener("keydown", e => {
  if (e.key === "Escape") {
    hideAlert("red");
    hideAlert("yellow");
    hideAlert("vital");
  }
});

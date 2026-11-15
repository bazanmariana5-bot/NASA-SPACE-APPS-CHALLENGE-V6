/* js/features/alerts.js — Alertas dinámicas (amarilla y roja). */
"use strict";

/* ==========================================================================
   Sistema de alertas dinámicas (amarilla y roja)
   Ambas son avisos flotantes que NO bloquean la pantalla y se cierran solos.
   ========================================================================== */
const ALERT_MS = { yellow: 6500, red: 5000 };

let activeAlertTarget = null;
let lastAlertSignature = "";
const alertTimers = { yellow: null, red: null, vital: null };
let lastVitalSig = "";

const alertEls = () => ({ yellow: $("alert-toast-yellow"), red: $("alert-toast-red"), vital: $("alert-toast-vital") });

function hideAlert(kind) {
  const el = alertEls()[kind];
  clearTimeout(alertTimers[kind]);
  if (el) el.classList.remove("on", "paused");
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

  clearTimeout(alertTimers[kind]);
  alertTimers[kind] = setTimeout(() => hideAlert(kind), ALERT_MS[kind]);
}
/* Busca emergencias vitales en los 3 tripulantes */
function findEmergencies() {
  const out = [];
  CREW.forEach(cr => ZONES.forEach(z => {
    Engine.ev(z, C(S.day, cr), cr.id).rows.forEach(r => {
      const rules = EMERG[z.id + "." + r.p.id];
      if (!rules) return;
      const hit = rules.find(([op, lim]) => op === "lt" ? r.v <= lim : r.v >= lim);
      if (hit) out.push({ cr, z, r, txt: hit[2], arrest: !!hit[3] });
    });
  }));
  return out;
}

/* Corazón que late rápido con signo de exclamación (paro cardiorrespiratorio). */
const HEART_ALERT = `<div class="vital-heart" aria-hidden="true"><span class="vital-ring"></span><svg viewBox="0 0 24 24" focusable="false"><path class="vh-body" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/><rect x="10.9" y="6.2" width="2.2" height="7" rx="1.1" fill="#fff"/><circle cx="12" cy="16.2" r="1.4" fill="#fff"/></svg></div>`;

function showVital(e) {
  const el = alertEls().vital;
  if (!el) return;
  activeAlertTarget = e;
  el.classList.toggle("arrest", e.arrest);
  const head = e.arrest ? "[ ! ] PARO CARDIORRESPIRATORIO CONFIRMADO" : "[ ! ] ALERTA CRÍTICA · EMERGENCIA VITAL",
        body = e.arrest
          ? `<div class="vital-cmd">¡DESPEJEN LA ZONA!</div><div class="vital-cmd2">Desfibrilador a punto de activarse</div><div class="alert-body">${esc(ARREST_MSG(e.cr.name))}</div>`
          : `<div class="alert-body">${esc(EMERG_MSG(e.cr.name, e.txt))}</div>`;
  el.innerHTML = `
    <button type="button" class="alert-x" data-alert-close="vital" aria-label="Descartar emergencia"><span class="icon-close" aria-hidden="true"></span></button>
    ${e.arrest ? HEART_ALERT : ""}
    <div class="vital-txt">
      <div class="alert-head"><span>${head}</span><span class="alert-go">Ir →</span></div>
      ${body}
      <div class="alert-sub mono">${esc(e.z.n)} · ${esc(e.r.p.n)}: ${fmt(e.r.p, e.r.v)} ${esc(e.r.p.u)}</div>
    </div>
  `;
  el.classList.add("on");
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

const alertValue = a =>
  `${esc(a.z.n)} · ${esc(a.r.p.n)}: <span class="mono">${fmt(a.r.p, a.r.v)} ${esc(a.r.p.u)}</span>`;

function triggerYellowAlert(alertObj) {
  activeAlertTarget = alertObj;
  showAlert("yellow", `
    <div class="alert-head">
      <span>PRECAUCIÓN</span>
      <span class="alert-go">Ir →</span>
    </div>
    <div class="alert-body">${alertValue(alertObj)}</div>
    <i class="alert-bar"></i>
  `);
}

function triggerRedAlert(alertObj) {
  activeAlertTarget = alertObj;
  showAlert("red", `
    <button type="button" class="alert-x" data-alert-close="red" aria-label="Descartar aviso"><span class="icon-close" aria-hidden="true"></span></button>
    <div class="alert-head">
      <span>[ ! ] ALERTA CRÍTICA</span>
      <span class="alert-go">Ir →</span>
    </div>
    <div class="alert-body">${alertValue(alertObj)}</div>
    <i class="alert-bar"></i>
  `);
}

/* Un solo listener: cerrar aviso, ir a la zona y botón "Cerrar" del diálogo */
document.addEventListener("click", e => {
  const close = e.target.closest("[data-alert-close]");
  if (close) {
    e.stopPropagation();
    hideAlert(close.dataset.alertClose);
    return;
  }

    const toastEl = e.target.closest("#alert-toast-yellow, #alert-toast-red, #alert-toast-vital");
  if (toastEl && activeAlertTarget) {
    const t = activeAlertTarget;
    hideAlert("yellow");
    hideAlert("red");
    hideAlert("vital");
    activeAlertTarget = null;
    if (t.cr) S.crew = t.cr.id;
    Nav.go({ tab: t.z.tab, z: t.z.id, p: t.r.p.id });
    return;
  }

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
    alertTimers[kind] = setTimeout(() => hideAlert(kind), 2000);
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
  }
});

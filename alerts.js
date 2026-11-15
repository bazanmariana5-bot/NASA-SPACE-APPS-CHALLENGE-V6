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
      if (hit) out.push({ cr, z, r, txt: hit[2] });
    });
  }));
  return out;
}

function showVital(e) {
  const el = alertEls().vital;
  if (!el) return;
  activeAlertTarget = e;
  el.innerHTML = `
    <button type="button" class="alert-x" data-alert-close="vital" aria-label="Descartar emergencia"><span class="icon-close" aria-hidden="true"></span></button>
    <div class="alert-head"><span>[ ! ] ALERTA CRÍTICA · EMERGENCIA VITAL</span><span class="alert-go">Ir →</span></div>
    <div class="alert-body">${esc(EMERG_MSG(e.cr.name, e.txt))}</div>
    <div class="alert-sub mono">${esc(e.z.n)} · ${esc(e.r.p.n)}: ${fmt(e.r.p, e.r.v)} ${esc(e.r.p.u)}</div>
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

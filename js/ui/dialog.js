/* js/ui/dialog.js — Diálogo modal y despachador de pruebas. */
"use strict";

/* ---------- Diálogo y pruebas jugables ---------- */
let TM = [];
const later = (f, ms) => TM.push(setTimeout(f, ms)),
  clr = () => {
    TM.forEach(clearTimeout);
    TM = [];
  };

const dlg = $("dlg");
dlg.addEventListener("close", () => {
  clr();
  render();
});

function openDlg(h) {
  clr();
  $("dbody").innerHTML = h;
  if (!dlg.open) dlg.showModal();
}

const head = (t, s) =>
  `<h3 class="dlg-title">${t}</h3><p class="dlg-sub">${crewOf().name} · día ${S.day}. ${s || ""}</p>`;
const foot = ok => `<div class="row dlg-foot"><button class="btn o" data-dlg-close>Cerrar</button>${ok || ""}</div>`;
const num = (id, l, x = "") =>
  `<label>${l}<input type="number" step="any" inputmode="decimal" min="0" id="${id}" ${x}></label>`;
const V = id => {
  const e = $(id);
  return e && e.value !== "" ? parseFloat(e.value) : null;
};

function save(v, t, msg) {
  Store.put(S.crew, S.day, { v, t });
  toast(msg || "Dato real guardado");
}

const alertBox = (c, t) => `<div class="alert t${c}">${t}</div>`;
function openTest(id) {
  ({ sueno: tSleep, cognicion: tColors, reaccion: tPVT, animo: tMood, estres: tStress, esfuerzo: tCpet })[id]();
}

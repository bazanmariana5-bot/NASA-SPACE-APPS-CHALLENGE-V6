/* js/features/days.js — Días de misión. */
"use strict";

/* ---------- Días de misión ---------- */
function setToday(n) {
  n = clamp(Math.round(+n || 0), S.today, 300);
  try { localStorage.setItem(TK, String(n)); } catch (e) {}
  State({ today: n, day: n });
}

function openDays() {
  const t = S.today;
  openDlg(head("Días de misión", "La barra y los gráficos llegan hasta el día actual.") +
    `<div class="alert t0">Día actual de la misión: <b>${t}</b> de 300</div>
    <div class="row u-mt-10"><button type="button" class="btn" id="dnext" ${t >= 300 ? "disabled" : ""}>Pasar al día ${Math.min(t + 1, 300)}</button>
    <label class="ctl">o elegir día<input class="u-w-90" type="number" id="dgo" min="${t + 1}" max="300" value="${Math.min(t + 1, 300)}"></label><button type="button" class="btn o" id="dgob" ${t >= 300 ? "disabled" : ""}>Ir</button></div>
    <p class="u-c-mu u-fs-12 u-m-8-0-0">Solo se puede avanzar. Los días anteriores se completan a mano o con “Cargar archivo”.</p>` + foot());
  
  $("dnext").onclick = () => { setToday(S.today + 1); openDays(); };
  $("dgob").onclick = () => {
    const v = Math.round(+$("dgo").value);
    if (!(v > S.today && v <= 300)) return toast("Elige un día posterior a " + S.today);
    setToday(v);
    openDays();
  };
}

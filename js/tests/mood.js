/* js/tests/mood.js — Prueba: ánimo. */
"use strict";

/* --- Ánimo --- */
function tMood() {
  let sc = null, tags = [];
  openDlg(head("Ánimo del día", "Menos de 30 segundos antes de dormir.") +
    `<div class="sw" id="sw">${MOOD.map(m => `<button data-m="${m[0]}" style="background:hsl(${(m[0] - 1) * 13} 70% 62%)">${m[0]}</button>`).join("")}</div><p class="u-minh-40 u-c-mu" id="mm">Toca un número para ver su significado.</p><div class="row">${TAGS.map(t => `<button class="chip" data-g="${t}">${t}</button>`).join("")}</div><label class="fg u-mt-10"><span class="w u-fs-12 u-c-mu">Resume tu día en dos líneas (lo mejor y lo más difícil)</span><textarea class="w" id="jr" rows="2"></textarea></label><div id="res"></div>` +
    foot('<button class="btn" id="go">Guardar</button>'));
  
  $("sw").onclick = e => {
    const b = e.target.closest("[data-m]");
    if (!b) return;
    sc = +b.dataset.m;
    const m = MOOD.find(x => x[0] === sc);
    $("mm").innerHTML = `<b class="u-c-tx">${m[1]}.</b> ${m[2]}`;
  };

  $("dbody").querySelectorAll("[data-g]").forEach(b => b.onclick = () => {
    const t = b.dataset.g;
    if (tags.includes(t)) tags = tags.filter(x => x !== t);
    else if (tags.length < 2) tags.push(t);
    b.classList.toggle("on", tags.includes(t));
  });

  $("go").onclick = () => {
    if (!sc) return toast("Elige un número");
    const days = Store.days(S.crew);
    let prev = null;
    for (let d = S.day - 1; d >= 0; d--) if (days[d] && days[d].v && days[d].v["animo.mood"] != null) { prev = days[d].v["animo.mood"]; break; }
    
    let mono = true;
    for (let d = S.day - 6; d < S.day; d++) {
      const m = days[d] && days[d].v && days[d].v["animo.mood"];
      if (m !== 5 && m !== 6) mono = false;
    }
    mono = mono && (sc === 5 || sc === 6);
    save({ "animo.mood": sc }, { mood: { tags, journal: $("jr").value.trim() } });
    
    let h = "";
    if (sc <= 3 || (prev != null && prev - sc >= 4)) h += alertBox(2, "Alerta roja: se sugiere descanso y se avisa de forma confidencial al equipo médico en Tierra.");
    if (mono) h += alertBox(1, "Alerta amarilla por monotonía: 7 días seguidos en 5 o 6. Agenda una videollamada con tu familia o varía tus tareas.");
    $("res").innerHTML = h || alertBox(0, "Registro guardado. ¡Buen trabajo!");
  };
}

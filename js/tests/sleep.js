/* js/tests/sleep.js — Prueba: sueño. */
"use strict";

/* --- Sueño --- */
function tSleep() {
  openDlg(
    head("Registro de sueño", "Telemetría del anillo biométrico más autorreporte matutino de 15 segundos.") +
      `<div class="fg">${num("tst", "Tiempo total de sueño (h)", 'value="6.2"')}${num("eff", "Eficiencia (%)", 'value="84"')}${num("hrv", "HRV nocturna (ms)", 'value="55"')}
${[
  ["r1", "¿Qué tan descansado te sientes? (1 agotado, 5 renovado)"],
  ["r2", "Continuidad del sueño (1 fragmentado, 5 continuo)"],
  ["r3", "Claridad mental al despertar (1 somnolencia, 5 alerta máxima)"]
]
  .map(
    a =>
      `<label class="w">${a[1]}<input class="u-w-100pct" type="range" id="${a[0]}" min="1" max="5" value="3"></label>`
  )
  .join("")}</div><div id="res"></div>` +
      foot('<button class="btn" id="go">Calcular y guardar</button>')
  );
  $("go").onclick = () => {
    const g = k => V(k),
      s = { tst: g("tst"), eff: g("eff") },
      obj = sleepObj(s),
      subj = clamp(Math.round((g("r1") + g("r2") + g("r3")) / 3), 1, 5),
      glob = clamp(Math.round(0.6 * obj + 0.4 * subj), 1, 5);
    save(
      { "sueno.tst": s.tst, "sueno.eff": s.eff, "sueno.nhrv": g("hrv"), "sueno.sq": glob },
      { sleep: { obj, subj, glob } }
    );
    let h = `<div class="alert t${glob <= 2 ? 2 : glob === 3 ? 1 : 0}">Calidad objetiva <b>${obj}/5</b> · subjetiva <b>${subj}/5</b> · global <b>${glob}/5 — ${SLEEP_CAT[glob]}</b></div>`;
    if (Math.abs(obj - subj) >= 2)
      h += alertBox(
        1,
        "Discordancia objetivo-subjetiva: se prioriza el dato fisiológico y se restringen tareas de alto riesgo cognitivo."
      );
    if (glob <= 2)
      h += alertBox(
        2,
        "Calidad 2 o menor: reducir 15–20 % el volumen de ARED pesado si se repite dos noches seguidas."
      );
    $("res").innerHTML = h;
  };
}

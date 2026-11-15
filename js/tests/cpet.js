/* js/tests/cpet.js — Prueba: esfuerzo (CEVIS). */
"use strict";

/* --- Prueba de esfuerzo --- */
function tCpet() {
  openDlg(head("Prueba de esfuerzo (CEVIS)", "Control de seguridad cada segundo y resultados del rendimiento.") +
    `<div class="fg">${num("hr", "FC (lpm)")}${num("spo2", "SpO₂ (%)", 'value="97"')}${num("spo2b", "SpO₂ basal (%)", 'value="98"')}${num("ptc", "PtcCO₂ (mmHg)", 'value="38"')}${num("sbp", "Presión sistólica")}${num("dbp", "Presión diastólica")}${num("sbpP", "Sistólica en la etapa previa")}<label>Síntoma o arritmia<select id="sym"><option value="0">No</option><option value="1">Sí (mareo, dolor torácico, calambres, ST)</option></select></label>
${num("vo2", "VO₂máx estimado (mL/kg/min)")}${num("awe", "Eficiencia aeróbica (mL O₂/min/W)")}${num("pw", "Potencia en VT1 (W/kg)")}${num("hrr", "Recuperación de FC al minuto (lpm)")}${num("borg", "Borg Etapa 2 (6–20)")}</div><div id="res"></div>` +
    foot('<button class="btn" id="go">Verificar y guardar</button>'));
  
  $("go").onclick = () => {
    const g = V,
          r = cpetCheck({
            age: crewOf().age,
            hr: g("hr") || 0,
            spo2: g("spo2") || 98,
            spo2b: g("spo2b") || 98,
            ptc: g("ptc") || 0,
            sbp: g("sbp") || 0,
            dbp: g("dbp") || 0,
            sbpPrev: g("sbpP"),
            sym: $("sym").value === "1"
          });
    const m = {};
    [["vo2", "vo2"], ["awe", "awe"], ["pw", "pw"], ["hrr", "hrr"], ["borg", "borg"], ["ptc", "co2"]].forEach(([a, b]) => {
      const x = g(a);
      if (x != null) m["esfuerzo." + b] = x;
    });
    if (Object.keys(m).length) save(m, { cpet: { stop: r } }, "Prueba guardada");
    $("res").innerHTML = r.length ? alertBox(2, "<b>DETENER AHORA</b>: pasar a la Fase 6 (recuperación activa a 40 W).<br>• " + r.join("<br>• ")) : alertBox(0, "Sin criterios de detención. Continuar el protocolo.");
  };
}

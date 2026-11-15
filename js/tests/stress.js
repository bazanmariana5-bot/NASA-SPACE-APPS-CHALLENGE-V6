/* js/tests/stress.js — Prueba: estrés percibido (4 preguntas tipo PSS-4, adaptadas). Puntaje de 1 a 10 (más alto es mejor). */
"use strict";

const STRESS_Q = [
  ["En las últimas 24 horas, ¿con qué frecuencia te sentiste nervioso o estresado?", 0],
  ["¿Con qué frecuencia sentiste que no podías controlar las cosas importantes de tu trabajo?", 0],
  ["¿Con qué frecuencia te sentiste seguro de poder manejar tus problemas?", 1],
  ["¿Con qué frecuencia sentiste que las cosas iban como querías?", 1]
];
const STRESS_OPT = ["Nunca", "Casi nunca", "A veces", "Con frecuencia", "Siempre"];

/* Puntaje de 1 a 10 (10 = máxima calma): 1 a 5 crítico (rojo), 6 a 7 precaución (amarillo), 8 a 10 bueno (verde) */
const stressLevel = v => v <= 5 ? [2, "Crítico"] : v <= 7 ? [1, "Precaución"] : [0, "Bueno"];

function tStress() {
  const ans = [];
  openDlg(head("Test de estrés", "Cuatro preguntas, menos de 30 segundos. Responde pensando en las últimas 24 horas.") +
    STRESS_Q.map((q, i) => `<div class="u-m-6-0"><b class="u-fs-13">${i + 1}. ${q[0]}</b><div class="sw" data-q="${i}">${STRESS_OPT.map((o, k) => `<button type="button" data-v="${k}">${o}</button>`).join("")}</div></div>`).join("") +
    `<div id="res"></div>` + foot('<button class="btn" id="go">Guardar</button>'));

  $("dbody").querySelectorAll("[data-q]").forEach(box => box.onclick = e => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    ans[+box.dataset.q] = +b.dataset.v;
    box.querySelectorAll("[data-v]").forEach(x => x.classList.toggle("on", x === b));
  });

  $("go").onclick = () => {
    if (STRESS_Q.some((_, i) => ans[i] == null)) return toast("Responde las 4 preguntas");
    const raw = STRESS_Q.reduce((a, q, i) => a + (q[1] ? 4 - ans[i] : ans[i]), 0),   /* 0 a 16 de estrés; las preguntas 3 y 4 puntúan al revés */
          v = Math.max(1, Math.min(10, Math.round(10 - raw * 9 / 16))),                /* 10 = sin estrés, 1 = estrés máximo */
          lv = stressLevel(v),
          tip = lv[0] === 0 ? "Sin señales de estrés relevante. Mantén tus rutinas de sueño y ejercicio."
            : lv[0] === 1 ? "Estrés moderado. Haz 5 minutos de respiración lenta (inspira 4 s, espira 6 s), una pausa de movimiento y un contacto breve con tus compañeros."
              : "Estrés alto. Detén tareas críticas si puedes, respira lento 5 a 10 minutos, descansa y avisa a la médica de vuelo; programa una llamada de apoyo con Tierra.";
    save({ "estres.pss": v }, { stress: { raw, ans } });
    $("go").disabled = true;
    $("res").innerHTML = alertBox(lv[0], `Puntaje de estrés <b>${v}/10</b> · ${lv[1]}<br>${tip}`);
  };
}

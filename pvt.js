/* js/tests/pvt.js — Prueba: PVT de reacción. */
"use strict";

/* --- Reacción (PVT) --- */
function tPVT() {
  openDlg(head("Test de reacción", "Toca en cuanto el botón cambie de rojo a verde. 3 intentos válidos.") +
    `<div class="big" id="bx">Preparado</div><div id="res"></div>` +
    foot('<button class="btn" id="go">Comenzar</button>'));
  let st = "idle", t0 = 0, tr = [], fs = 0;
  const bx = $("bx");

  function wait() {
    st = "red";
    bx.style.background = "#b8323f";
    bx.textContent = "ESPERA…";
    later(() => {
      st = "green";
      bx.style.background = "#1fbf86";
      bx.style.color = "#04140d";
      bx.textContent = "¡AHORA!";
      t0 = performance.now();
    }, 2000 + Math.random() * 4000);
  }

  bx.addEventListener("pointerdown", () => {
    if (st === "red") {
      clr();
      fs++;
      st = "pause";
      bx.textContent = "¡Muy pronto! Espera al verde";
      later(wait, 1200);
    } else if (st === "green") {
      const t = Math.round(performance.now() - t0);
      tr.push(t);
      st = "pause";
      bx.textContent = t + " ms";
      later(() => tr.length < 3 ? wait() : fin(), 1500);
    }
  });

  $("go").onclick = () => {
    $("go").disabled = true;
    wait();
  };

  function fin() {
    st = "done";
    const avg = tr.reduce((a, b) => a + b, 0) / 3,
          base = REACT.find(r => avg <= r[0]),
          lap = tr.filter(t => t > 500).length;
    let sc = base[1];
    if (fs >= 2) sc -= 1;
    if (lap >= 1) sc -= 2;
    sc = Math.max(1, sc);
    save({ "reaccion.rt": Math.round(avg), "reaccion.fast": Math.min(...tr), "reaccion.rs": sc, "reaccion.fs": fs, "reaccion.rl": lap }, { pvt: { trials: tr, sc } });
    bx.style.background = "#10192e";
    bx.style.color = "";
    bx.textContent = "Fin";
    $("res").innerHTML = alertBox(sc >= 6 ? 0 : sc >= 5 ? 1 : 2, `Puntaje <b>${sc}/10</b> · ${base[2]}. ${base[3]}<br>Habilitación para EVA: <b>${sc >= 6 ? "sí" : "no"}</b> (se requiere 6 o más)`) + `<p class="mono u-fs-12 u-c-mu">Intentos ${tr.join(" · ")} ms · promedio ${Math.round(avg)} ms · salidas en falso ${fs} · lapsos ${lap}</p>`;
  }
}

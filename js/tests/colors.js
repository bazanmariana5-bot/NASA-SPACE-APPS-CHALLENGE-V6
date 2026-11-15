/* js/tests/colors.js — Prueba: test de colores. */
"use strict";

/* --- Test de colores --- */
function tColors() {
  const seq = [];
  while (seq.length < 10) {
    const i = Math.floor(Math.random() * 10),
          n = seq.length;
    if (n >= 2 && seq[n - 1] === i && seq[n - 2] === i) continue;
    seq.push(i);
  }
  openDlg(head("Test secuencial de colores", "Memoriza 10 colores y repítelos en el mismo orden. Dura menos de 45 s.") +
    `<div class="big" id="bx">Preparado</div><div id="pad" class="sw">${PALETTE.map((p, i) => `<button data-k="${i}" style="background:${p[1]}">${p[0]}</button>`).join("")}</div><div id="res"></div>` +
    foot('<button class="btn" id="go">Comenzar</button>'));
  $("go").onclick = () => {
    $("go").disabled = true;
    let c = 3;
    const bx = $("bx");
    const tick = () => {
      if (c > 0) {
        bx.textContent = c--;
        later(tick, 1000);
      } else show(0);
    };
    tick();

    function show(i) {
      if (i >= 10) {
        bx.style.background = "var(--bx)";
        bx.textContent = "¡Repite la secuencia!";
        $("pad").style.display = "grid";
        return play();
      }
      bx.style.background = PALETTE[seq[i]][1];
      bx.textContent = PALETTE[seq[i]][0];
      bx.style.color = "#06101f";
      later(() => {
        bx.style.background = "var(--bx)";
        bx.textContent = "";
        later(() => show(i + 1), 300);
      }, 600);
    }

    function play() {
      const taps = [], t0 = performance.now();
      later(() => fin(taps, t0), 30000);
      $("pad").onclick = e => {
        const b = e.target.closest("[data-k]");
        if (!b || taps.length >= 10) return;
        taps.push([+b.dataset.k, performance.now()]);
        bx.textContent = taps.length + " / 10";
        if (taps.length === 10) {
          clr();
          fin(taps, t0);
        }
      };
    }

    function fin(taps, t0) {
      $("pad").style.display = "none";
      const acc = taps.filter((t, i) => t[0] === seq[i]).length;
      let span = 0;
      while (span < taps.length && taps[span][0] === seq[span]) span++;
      const T = taps.length === 10 ? taps[9][1] - t0 : 30000,
            lat = taps.length ? taps[0][1] - t0 : 30000,
            gaps = taps.map((t, i) => t[1] - (i ? taps[i - 1][1] : t0)),
            itv = taps.length > 1 ? gaps.slice(1).reduce((a, b) => a + b, 0) / (taps.length - 1) : 0,
            lap = gaps.slice(1).filter(g => g > 2000).length;
      const sv = T <= 6000 ? 20 : T <= 12000 ? 20 * (1 - (T - 6000) / 6000) : 0,
            score = Math.round(clamp(acc * 5 + span * 3 + sv - lap * 5, 0, 100)),
            cls = COG.find(c => score >= c[0]);
      save({ "cognicion.cog": score, "cognicion.acc": acc, "cognicion.span": span, "cognicion.lat": Math.round(lat), "cognicion.itv": Math.round(itv), "cognicion.lap": lap }, { colors: { score, cls: cls[1] } });
      $("res").innerHTML = alertBox(score >= 85 ? 0 : score >= 70 ? 1 : 2, `Puntaje <b>${score}/100</b> · ${cls[1]}<br>${cls[2]}`) + `<p class="mono u-fs-12 u-c-mu">Aciertos ${acc}/10 · racha ${span} · latencia ${Math.round(lat)} ms · intervalo medio ${Math.round(itv)} ms · lapsos ${lap}</p>`;
      $("bx").textContent = "Fin";
    }
  };
}

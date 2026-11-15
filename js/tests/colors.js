/* js/tests/colors.js — Prueba: memoria de 10 colores.
   Se muestran los 10 colores en un orden aleatorio que no repite ningún patrón ya usado por ese tripulante;
   después la persona los coloca en el mismo orden. Cada acierto de posición suma 1 punto (escala 1 a 10). */
"use strict";

/* Escala: puntos -> nivel (0 verde, 1 amarillo, 2 rojo) y etiqueta. */
function colorLevel(n) {
  return n >= 10
    ? [0, "Excelente"]
    : n >= 8
      ? [0, "Muy bueno"]
      : n >= 7
        ? [0, "Bueno"]
        : n >= 4
          ? [1, "Precaución"]
          : [2, "Deficiente / crítico"];
}

/* Orden aleatorio de los 10 colores que nunca coincide con uno ya mostrado a este tripulante. */
function newColorSeq() {
  const key = "ks-colseq-" + S.crew;
  let used = [];
  try {
    used = JSON.parse(localStorage.getItem(key) || "[]");
  } catch (e) {}
  let s,
    tries = 0;
  do {
    s = PALETTE.map((_, i) => i);
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [s[i], s[j]] = [s[j], s[i]];
    }
    tries++;
  } while (used.includes(s.join("")) && tries < 1000);
  used.push(s.join(""));
  try {
    localStorage.setItem(key, JSON.stringify(used.slice(-500)));
  } catch (e) {}
  return s;
}

function tColors() {
  const seq = newColorSeq();
  openDlg(
    head(
      "Test de memoria de 10 colores",
      "Observa los 10 colores y colócalos en el mismo orden. Cada acierto suma 1 punto (escala de 1 a 10)."
    ) +
      `<div class="big" id="bx">Preparado</div>
     <div id="slots" class="sw" style="display:none;margin:8px 0">${PALETTE.map((_, i) => `<button type="button" disabled data-s="${i}" aria-label="Posición ${i + 1}">${i + 1}</button>`).join("")}</div>
     <div id="pad" class="sw" style="display:none">${PALETTE.map((p, i) => `<button type="button" data-k="${i}" style="background:${p[1]};color:#06101f">${p[0]}</button>`).join("")}</div>
     <div id="res"></div>` +
      foot(
        '<button class="btn o" id="undo" style="display:none">Deshacer</button><button class="btn" id="go">Comenzar</button>'
      )
  );
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
        bx.textContent = "Coloca los colores en el mismo orden";
        $("pad").style.display = "grid";
        $("slots").style.display = "grid";
        $("undo").style.display = "";
        return play();
      }
      bx.style.background = PALETTE[seq[i]][1];
      bx.textContent = i + 1 + " / 10 · " + PALETTE[seq[i]][0];
      bx.style.color = "#06101f";
      later(() => {
        bx.style.background = "var(--bx)";
        bx.textContent = "";
        later(() => show(i + 1), 300);
      }, 800);
    }

    function play() {
      const taps = [],
        t0 = performance.now();
      const paint = () => {
        document.querySelectorAll("#slots [data-s]").forEach((b, i) => {
          const t = taps[i];
          b.style.background = t ? PALETTE[t[0]][1] : "";
          b.style.color = t ? "#06101f" : "";
          b.textContent = t ? PALETTE[t[0]][0] : String(i + 1);
        });
        document.querySelectorAll("#pad [data-k]").forEach(b => {
          b.disabled = taps.some(t => t[0] === +b.dataset.k);
          b.style.opacity = b.disabled ? ".3" : "";
        });
        bx.textContent = taps.length + " / 10 colocados";
      };
      paint();
      let done = false;
      const end = () => {
        if (!done) {
          done = true;
          clr();
          fin(taps, t0);
        }
      };
      later(end, 60000);
      $("undo").onclick = () => {
        if (!done && taps.length) {
          taps.pop();
          paint();
        }
      };
      $("pad").onclick = e => {
        const b = e.target.closest("[data-k]");
        if (done || !b || b.disabled || taps.length >= 10) return;
        taps.push([+b.dataset.k, performance.now()]);
        paint();
        if (taps.length === 10) end();
      };
    }

    function fin(taps, t0) {
      $("pad").style.display = "none";
      $("slots").style.display = "none";
      $("undo").style.display = "none";
      const acc = taps.filter((t, i) => t[0] === seq[i]).length;
      let span = 0;
      while (span < taps.length && taps[span][0] === seq[span]) span++;
      const score = Math.max(1, acc),
        lat = taps.length ? taps[0][1] - t0 : 60000,
        gaps = taps.map((t, i) => t[1] - (i ? taps[i - 1][1] : t0)),
        itv = taps.length > 1 ? gaps.slice(1).reduce((a, b) => a + b, 0) / (taps.length - 1) : 0,
        lap = gaps.slice(1).filter(g => g > 4000).length,
        lv = colorLevel(score);
      save(
        {
          "cognicion.cog": score,
          "cognicion.acc": acc,
          "cognicion.span": span,
          "cognicion.lat": Math.round(lat),
          "cognicion.itv": Math.round(itv),
          "cognicion.lap": lap
        },
        { colors: { score, cls: lv[1], seq: seq.join("") } }
      );
      const shown = seq
        .map(
          i =>
            `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:6px;background:${PALETTE[i][1]};color:#06101f">${PALETTE[i][0]}</span>`
        )
        .join("");
      $("res").innerHTML =
        alertBox(
          lv[0],
          `Puntaje <b>${score}/10</b> · ${lv[1]}<br>${acc} de 10 colores en la posición correcta (${acc} ${acc === 1 ? "punto" : "puntos"}).`
        ) +
        `<p class="u-fs-12 u-c-mu">Orden mostrado:</p><div>${shown}</div><p class="mono u-fs-12 u-c-mu">Racha sin error ${span} · latencia ${Math.round(lat)} ms · intervalo medio ${Math.round(itv)} ms · lapsos ${lap}</p>`;
      $("bx").textContent = "Fin";
    }
  };
}

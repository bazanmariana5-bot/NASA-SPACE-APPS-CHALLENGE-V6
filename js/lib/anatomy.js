/* anatomy.js — modelo anatómico vectorial completo (viewBox 200×470).
   Se dibuja la mitad izquierda y se espeja.
   Capas: silueta + huesos, músculos y órganos.
   Cada zona es un <g class="z"> con data-z = id de zona. */
"use strict";

/* Helpers de primitivas SVG */
const sym = (s) => `${s}<g transform="translate(200 0) scale(-1 1)">${s}</g>`;

const Rc = (x, y, w, h, r = 2, c = "f") =>
  `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;

const Ln = (x1, y1, x2, y2, w, c = "s") =>
  `<path class="${c}" style="stroke-width:${w}" d="M${x1} ${y1}L${x2} ${y2}"/>`;

const El = (cx, cy, rx, ry, c = "f", rot = 0) =>
  `<ellipse class="${c}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${
    rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ""
  }/>`;

const Ci = (cx, cy, r, c = "f") =>
  `<circle class="${c}" cx="${cx}" cy="${cy}" r="${r}"/>`;

const Pa = (d, c = "f") => `<path class="${c}" d="${d}"/>`;

/* ---------- Primitivas anatómicas ---------- */
const f1 = n => Math.round(n * 10) / 10;

/* Vértebra de frente: cuerpo con cintura, apófisis transversas y (opcional) pedículos */
const vb = (y, w, h, tp = 0, tw = 1.5) => {
  const a = 100 - w / 2, b = 100 + w / 2;
  return `<path class="f" d="M${a} ${y}Q100 ${f1(y + 1)} ${b} ${y}L${f1(b - .7)} ${f1(y + h)}Q100 ${f1(y + h - 1)} ${f1(a + .7)} ${f1(y + h)}z"/>` +
    (tp ? `<path class="s" style="stroke-width:${tw}" d="M${a - tp} ${f1(y + h / 2)}H${a}M${b} ${f1(y + h / 2)}H${b + tp}"/>` : "");
};

/* Pila de vértebras: ancho creciente de w0 a w1 */
const stack = (y, n, w0, w1, h, g, tp, tw) =>
  Array.from({ length: n }, (_, i) =>
    vb(f1(y + i * (h + g)), f1(w0 + ((w1 - w0) * i) / Math.max(1, n - 1)), h, tp, tw)
  ).join("");

/* Lumbares: cuerpos grandes con apófisis transversas y mamilares */
const lumbar = () =>
  Array.from({ length: 5 }, (_, i) => {
    const y = 176 + i * 9.6, w = 15 + i * 1.1;
    return vb(y, w, 7.6, 0) +
      sym(`<path class="f" d="M${100 - w / 2} ${y + 2}L${100 - w / 2 - 6.5} ${y + 3}Q${100 - w / 2 - 8} ${y + 4.4} ${100 - w / 2 - 6.5} ${y + 5.2}L${100 - w / 2} ${y + 5.6}z"/>`);
  }).join("");

/* Caja torácica: 10 costillas + 2 flotantes, esternón con manubrio, cuerpo y xifoides */
const ribs = () => {
  const arcs = Array.from({ length: 10 }, (_, i) => {
    const y0 = 94 + i * 7.4;
    const w = 11 + 18 * Math.sin((Math.PI * (i + 0.7)) / 11);
    const x = 100 - w;
    const y1 = y0 + 14 - (i >= 7 ? (i - 6) * 3 : 0);
    return sym(
      `<path class="s" style="stroke-width:${i < 7 ? 1.9 : 1.5}" d="M96 ${y0}C${100 - w * 0.6} ${y0 - 7} ${x} ${y0 - 1} ${x} ${y0 + 10}C${x} ${y0 + 20} ${100 - w * 0.35} ${y1 + 5} 98.5 ${y1}"/>`
    );
  }).join("");
  const floating = sym(`<path class="s" style="stroke-width:1.4" d="M96 168C86 168 78 175 75 184M96 176C88 178 82 187 80 193"/>`);
  return arcs + floating;
};
const sternum = () =>
  Pa("M91.5 87Q100 84.6 108.5 87L107.6 99H92.4z") +
  Pa("M93.5 100.4H106.5L105.2 137H94.8z") +
  Pa("M97.4 138.2H102.6L100 147.5z") +
  Pa("M96.8 99.7H103.2M95 118H105M95 128H105", "d") +
  Pa("M96 86.4Q100 87.4 104 86.4", "d");

/* Mano: carpo (2 filas), metacarpianos y falanges con articulaciones */
const hand = (x) => {
  const car = [[-5, 233], [-1.5, 232.5], [2, 233], [5, 234.5], [-3.6, 237.4], [0, 237.4], [3.6, 238]]
    .map((p) => Ci(f1(x + p[0]), p[1], 2.1)).join("");
  const dig = [
    [-6, 240, -12, 250, -15, 257, -17, 263],   /* pulgar */
    [-3, 240, -6, 253, -8, 260, -9, 267],
    [1, 240, 0, 255, 0, 263, 0, 270],
    [5, 240, 6, 253, 8, 260, 9, 266],
    [8, 239, 12, 250, 14, 257, 15, 262]
  ].map((d) => {
    const s = x + d[0], mx = x + d[2], px = x + d[4], tx = x + d[6];
    return Ln(f1(s), d[1], f1(mx), d[3], 2.3) + Ln(f1(mx), d[3], f1(px), d[5], 1.9) + Ln(f1(px), d[5], f1(tx), d[7], 1.6) +
      Ci(f1(mx), d[3], 1.5) + Ci(f1(px), d[5], 1.2);
  }).join("");
  return car + dig;
};

/* Pie: tarso (talus y calcáneo), metatarsianos y falanges */
const footBones = () =>
  El(81, 443, 6.6, 4.4) + El(78.5, 450, 6.8, 4.6) + El(86, 449, 4.2, 3.6) +
  [[72, 454, 70.6, 459.6], [76, 455, 75.4, 461], [80.5, 455.4, 80.5, 461.6], [85, 455, 85.8, 460.8], [89, 454, 91.4, 459]]
    .map((l) => Ln(l[0], l[1], l[2], l[3], 2.5) + Ci(l[2], l[3], 1.3)).join("") +
  [[70.6, 459.6, 69.6, 463], [75.4, 461, 74.8, 464.6], [80.5, 461.6, 80.5, 465], [85.8, 460.8, 86.4, 464], [91.4, 459, 92.6, 462]]
    .map((l) => Ln(l[0], l[1], l[2], l[3], 1.8)).join("");

/* Intestino delgado: asas en serpentina dentro del marco cólico */
const loops = () => {
  let d = "M84 202";
  [202, 209, 216, 223].forEach((y, i) => {
    const dir = i % 2 ? -1 : 1, x0 = dir > 0 ? 84 : 116, x1 = dir > 0 ? 116 : 84;
    d += `L${x0} ${y}`;
    for (let k = 1; k <= 4; k++) d += `Q${f1(x0 + (x1 - x0) * (k - .5) / 4)} ${y + (k % 2 ? -3.2 : 3.2)} ${f1(x0 + (x1 - x0) * k / 4)} ${y}`;
    if (i < 3) d += `Q${x1 + dir * 2.5} ${y + 3.5} ${x1} ${y + 7}`;
  });
  return `<path class="s" style="stroke-width:3.2" d="${d}"/>`;
};

/* ---------- Diccionario de capas y zonas anatómicas ---------- */
const ANAT = {
  huesos: {
    craneo:
      Pa("M80 34C78 15 89 6 100 6s22 9 20 28c-1 6-3 10-5 13H85c-2-3-4-7-5-13z") +
      Pa("M85 45C84 52 88 58 94 60L100 61L106 60C112 58 116 52 115 45z") +
      Pa("M83 44C82 54 86 62 93 65Q100 68.5 107 65C114 62 118 54 117 44L113.5 46C113.5 54 110 60 106 62.4Q100 64.6 94 62.4C90 60 86.5 54 86.5 46z") +
      El(91, 36, 5.2, 4.4, "k") + El(109, 36, 5.2, 4.4, "k") +
      Pa("M100 40.5l-3 8.5h6z", "k") +
      Pa("M100 7V22M84 22C92 17 108 17 116 22", "d") +
      Pa("M82 40C84 46 88 48.5 92 48.5M118 40C116 46 112 48.5 108 48.5", "d") +
      Pa("M92.5 54.5H107.5M94.5 52.8v3.4M97.5 52.8v3.4M100 52.8v3.4M102.5 52.8v3.4M105.5 52.8v3.4", "d"),

    cervical:
      Pa("M91.5 65.2Q100 63.4 108.5 65.2L109.3 68.4Q100 70.4 90.7 68.4z") + Ln(84, 66.6, 91, 66.8, 1.6) + Ln(109, 66.8, 116, 66.6, 1.6) +
      Pa("M92 69.8Q100 70.6 108 69.8L107.4 73.6Q100 74.6 92.6 73.6z") + Pa("M98 67.2L100 63.8L102 67.2z") +
      stack(74.6, 5, 10, 12.4, 3.5, 1.1, 4.2, 1.3),

    toracica: stack(96, 12, 12.4, 17, 5.1, 1.4, 5.4, 1.5),

    lumbar: lumbar(),

    costillas: ribs() + sternum(),

    humero: sym(
      Pa("M98 88.4C94 85.6 90 87 86 88.6C80 90.2 74 85 66 84.8L66.4 87C74 87.8 80 93 86 91C90 90 94 88.4 98 90.6z") +
        Pa("M86 98L74 93C70 98 68 108 69 120L74 137C80 131 85 119 86 105z") + Pa("M71 99C74 107 75 118 74 130", "d") +
        El(66, 96, 3, 5.2, "k") + Pa("M68 87C63 85 58 85.5 55 87", "d") +
        Ci(59, 94, 6.4) + El(54.4, 91.4, 2.6, 2.4) +
        Pa("M55 99.5L63.4 101.6L53 158L44 156z") + El(54.6, 124, 1.8, 3, "k") +
        El(45.4, 163.2, 7.4, 4.6, "f", -12) + Ci(41.2, 162.4, 2.6) + Ci(50.2, 164.4, 2.6)
    ),

    antebrazo: sym(
      Pa("M52.6 165L56.8 166.6L48 224L43.6 223.4z") + El(54.2, 164.4, 3.1, 3.6) +
        Pa("M45.2 168L49 168L39.2 224.4L33 222z") + El(45.8, 168.6, 3, 2.6) +
        El(36.6, 226.4, 4.6, 2.6) + El(45.2, 225.2, 2.5, 3.6) +
        hand(40)
    ),

    pelvis:
      sym(
        Pa("M96.6 203C88 198 72 197 63 206C58 214 58 226 63 236L72 245L78 238C84 232 90 228 93.4 224L96 214z") +
          Pa("M72 245L70.4 259L76 266L86 262.4L91 253L88.6 245L82 247L78 238z") +
          El(78.4, 254.4, 3.6, 5.2, "k") + Ci(73, 243.4, 4.6, "k") + Ci(63.6, 208, 1.7, "k") +
          Pa("M64 207C74 200 88 201 95 207", "d") + Pa("M93.6 224L96 212", "d")
      ) +
      Pa("M91 214H109L105.4 244C103.6 252 101.6 258 100 263C98.4 258 96.4 252 94.6 244z") +
      sym(El(96.4, 224, 1.1, 1.1, "k") + El(97, 232.5, 1, 1, "k") + El(97.7, 240, 1, 1, "k")) +
      Pa("M98 263h4l-2 9z") + Pa("M100 214V260", "d") + Pa("M96.4 254.2h7.2", "d"),

    femur: sym(
      Ci(72, 241.4, 7) +
        Pa("M71 246L67 252L61.2 249C60.8 255 62.4 260 66 262L72.4 256z") + El(63.6, 252.4, 4.2, 5.6) +
        Pa("M62.6 261C64 258 70 258 70.6 262L82.4 340L74.6 343z") +
        Pa("M66.6 345C66 351 72 358 80.4 358C82 352 82 348 80.6 344z") + Pa("M80.6 344C82 348 82 352 80.4 358C90 358 92 350 90 344z") +
        Pa("M79 350L81 358", "d") +
        El(79.6, 354.4, 4.6, 5.4, "k")
    ),

    tibia: sym(
      Pa("M70 360.6C70 357.6 90 357.6 92 360.6C92 364 88 366 81.6 366C74 366 70 364 70 360.6z") +
        Pa("M77.4 366H85.6L83.8 433L79 433z") + El(81.4, 372.4, 2.3, 2.6, "k") +
        Pa("M70.6 364C72.4 363.6 74.6 364.4 74.6 366.6C75 391 74.4 414 74.6 433L71.8 433C71.8 414 71 391 70.6 364z") +
        El(70.6, 364.6, 2.6, 3.4) +
        Pa("M78.6 433H85.8L87.6 438C87.6 441 84 442 82 441.4C79.2 441.4 77.6 440 78.6 433z") +
        Pa("M71.4 432L74.8 432L75.4 441C73 441.8 70.6 440 71 436z")
    ),

    pie: sym(footBones())
  },

  musculos: {
    ecm: sym(
      Pa("M88.4 51.4L91.6 50.6C95 62 98.2 73.4 99.4 84L96.6 87.4C94 76 90.4 63 88.4 51.4z") +
        Pa("M91.8 57C92.8 66 91.8 76 88.6 86.4L84.8 86.8C87.4 77 89.6 67 90.2 58z") +
        Pa("M90.6 57C92.8 66 95 75 96.6 84", "d") + Pa("M90 62C90 70 88.2 78 86.4 85", "d")
    ),

    trapecio: sym(
      Pa("M94 58C90.4 68 91.6 78 96.4 88L100 88.4V61z") +
        Pa("M95.4 68C85 73.6 74 78.6 62 83.6L65.4 93.4C75 91 87 86.6 97 82z") +
        Pa("M94.4 66C93 74 94 82 97.4 88M92 74C85 78 76 83 68 88M89 70C82 74 74 79 66 84", "d")
    ),

    hombros: sym(
      Pa("M97 93C88 90 78 93 70 100C69 108 72 118 78 124C84 128 91 128 97 124z") +
        Pa("M96 96.4L74 102M96.6 104L72 110.4M96.6 111.6L73.6 118M96.6 119L78 124", "d") +
        Pa("M66 86C57 83 50 88 48 98C47 108 52 118 58 121L66 119C64 108 64 98 70 92z") +
        Pa("M62 86.4C56 94 54 104 56 116M66 90C60 98 59 108 62 118", "d")
    ),

    brazos: sym(
      Pa("M58 104C50 118 46 142 48 158C53 162 58 161 60 158C64 140 65 120 64 104z") +
        Pa("M56 108C53 124 52 142 53 156M60.4 110C59.6 126 58 142 56.4 158M62.4 104C63 120 62 138 59.6 158", "d") +
        Pa("M49.4 156.4C51 160 56 160.6 58.6 158.2L58 162.4C54 164 50 163.6 48.2 161z")
    ),

    antebrazom: sym(
      Pa("M42 164C38 186 34 208 33 226L43 228C47 208 54 186 57 166z") +
        Pa("M44 166C41.6 186 38.4 208 36.6 226M50 168C48 188 45 208 43 227", "d") +
        Pa("M34.6 230L36.4 242C34 247 32 244 33.4 238z") +
        Pa("M33.8 232C33 238 33.8 246 37.4 250C40.6 250 42.8 247 42.8 241L42.2 231z") +
        Pa("M37 230V250M39.6 230V251M42 230V248", "d")
    ),

    core: sym(
      Pa("M99.4 144H90C87.4 160 87.4 182 90 203H99.4z") +
        Pa("M89 157H99.4M88.4 169.4H99.4M88.4 181.6H99.4M89.6 193H99.4", "d") +
        Pa("M88 142C76 146 70 164 71 188C72 196 76 202 82 206L88.6 206C86.4 184 86.2 160 88 142z") +
        Pa("M86 150L76 160M86 160L74 172M86 170L73 184M86 180L75 195", "d") +
        Pa("M71 112C65 122 65 138 69 148L73 150C71 138 71 124 75 114z") +
        Pa("M67 120L72.4 121M66.6 128L72 128.6M67.4 136L72.4 136M69 144L73 144", "d")
    ),

    cadera: sym(
      Pa("M64 208C57 226 57 246 63 262L84 266L90 240L86 212z") +
        Pa("M86 216C80 232 78 246 82 260", "d") + Pa("M70 214C66 230 66 248 70 262M76 212C72 230 72 248 76 264", "d")
    ),

    muslo: sym(
      Pa("M63 266C58 296 61 328 68 350L77.4 350C74 326 72 296 74.4 266z") +
        Pa("M75.6 262C74.4 290 76 320 79 346L85 346C86 320 85 290 84 262z") +
        Pa("M86 270C90 296 92 322 91 347L85.6 349C85.6 330 85 300 86 270z") +
        Pa("M93.2 266C95.4 292 95 322 93 342L91 340C93 320 92.6 292 90.4 266z") +
        Pa("M65 280C64 304 67 328 71 346M80 270C80.6 298 82 322 82.6 344M89.6 288C91 308 91 326 90 344", "d") +
        Pa("M90 262C86 290 82 320 76 346", "d")
    ),

    pantorrilla: sym(
      Pa("M68 364C63 384 66 410 74 434L78 432C75 408 74 384 76 364z") +
        Pa("M79.4 364C77.6 384 78.6 410 81.4 434L86.4 434C86.4 410 86 384 85 364z") +
        Pa("M90 364C95 386 95 410 89 434L85.6 433C88.4 410 88.4 384 86 364z") +
        Pa("M70 372C68 392 71 412 75 430M82 370C81.4 392 82.6 412 83.8 430M91 372C92.6 392 92 412 88.6 430", "d")
    ),

    bia: sym(
      Ci(37, 252, 4.6) +
        Ci(82, 456, 4.6) +
        `<path class="s" style="stroke-width:1.5;stroke-dasharray:3 3;opacity:.75" d="M37 252L50 160L60 100L100 96M82 456L80 350L72 248L100 250"/>`
    ),
  },

  organos: {
    medula:
      (() => {
        /* contorno de la médula: bulbo, engrosamiento cervical, torácica, engrosamiento lumbar y cono medular */
        const W = [[54, 5], [62, 5.4], [70, 6.8], [80, 7.6], [92, 6.8], [102, 4.8], [140, 4.4], [152, 5.2], [164, 7], [176, 6.2], [184, 3.8], [190, .8]];
        const L = W.map(p => [f1(100 - p[1] / 2), p[0]]), R = W.map(p => [f1(100 + p[1] / 2), p[0]]).reverse();
        const q = pts => pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join("");
        const roots = Array.from({ length: 24 }, (_, i) => {
          const y = 62 + i * 5;
          return `M98.4 ${y}L${f1(94.8 - i * .06)} ${y + 2}M101.6 ${y}L${f1(105.2 + i * .06)} ${y + 2}`;
        }).join("");
        const cauda = [-7, -5, -3.2, -1.4, 1.4, 3.2, 5, 7].map((o, i) => `M100 190C${100 + o * .3} 208 ${100 + o} 228 ${100 + o * .8} ${250 - (i % 3) * 3}`).join("");
        return Pa(q(L) + "L" + q(R).slice(1) + "z") +
          `<path class="s" style="stroke-width:.9" d="${cauda}"/>` +
          `<path class="s" style="stroke-width:.7" d="M100 190L100 266"/>` +
          Pa(roots, "d") +
          Pa("M96.4 74C88 76 80 82 74 92M96 84C88 88 82 96 78 106M103.6 74C112 76 120 82 126 92M104 84C112 88 118 96 122 106", "d") +
          Pa("M99 54V186", "d");
      })(),

    higado:
      Pa("M66 150C78 141 100 141 112 146C114 158 104 170 90 173L82 172C72 170 66 162 66 150z") +
      El(85, 173, 3, 4.2, "k") + Pa("M96 145.6C96 156 94.6 164 92 171", "d") + Pa("M72 152C82 150 94 150 106 149M70 160C80 160 88 158 96 156", "d"),

    estomago:
      Pa("M111 149C123 144 134 153 132 167C130 179 118 185 110 179C106 175 110 170 116 169C120 168 121 160 116 157C113 155 111 152 111 149z") +
      Pa("M117 152C124 152 128 160 126 168M118 160C122 162 123 168 121 172", "d") + Pa("M110 179C104 182 100 181 96 185", "d"),

    intestino:
      `<path class="s" style="stroke-width:5" d="M76 228V200C76 192 80 188 88 188H112C120 188 124 192 124 200V228"/>` +
      `<path class="s" style="stroke-width:5" d="M76 228C76 236 90 236 100 232C108 230 116 232 124 228"/>` +
      `<path class="s" style="stroke-width:1.1;stroke-dasharray:1.6 3;opacity:.9" d="M76 228V200C76 192 80 188 88 188H112C120 188 124 192 124 200V228"/>` +
      loops() + Pa("M76 230C72 234 71 238 74 239", "d"),

    rinones: sym(
      Pa("M90 172C82 170 78 180 79 190C80 200 88 204 93 198C90 194 89 190 90 186C91 180 92 176 90 172z") +
        El(87, 168.4, 4.2, 2.4, "f", -18) +
        Pa("M83 178C82 186 84 194 88 198M88 186C86 188 85 191 86 194", "d") +
        `<path class="s" style="stroke-width:1.6" d="M90 196C91 212 94 224 97 236"/>`
    ),

    vejiga: Pa("M91 238C91 229 109 229 109 238C109 248 91 249 91 238z") + Pa("M94 235H106", "d") + Pa("M99 248.4L100 256L101 248.4", "d"),

    pulmones:
      Rc(98, 60, 4, 30, 2) +
      Pa("M98.4 65h3.2M98.4 69.4h3.2M98.4 73.8h3.2M98.4 78.2h3.2M98.4 82.6h3.2M98.4 87h3.2", "d") +
      `<path class="s" style="stroke-width:2" d="M100 90L90 102M100 90L110 100"/>` +
      Pa("M96 92C88 88 75 92 71 104C67 122 67 142 73 154C81 159 93 154 96 144z") +
      Pa("M96 114L72 111M96 128L70 124", "d") + Pa("M94 100L84 112M94 118L80 130", "d") +
      Pa("M104 92C113 88 125 92 129 104C133 122 133 142 127 154C119 159 109 156 105 148L105 144C110 138 112 128 108 120C106 116 104 114 104 108z") +
      Pa("M129 118L110 124", "d") + Pa("M108 102L118 112M110 124L122 134", "d"),

    vasos: sym(
      `<path class="s" style="stroke-width:4.2" d="M92.6 98C93 84 94 72 94.4 58"/>` +
        `<path class="s" style="stroke-width:2.6" d="M97.4 98C97.8 84 98.2 72 98.6 60"/>` +
        `<path class="s" style="stroke-width:1.8" d="M98.6 60L96.4 53M98.6 60L101 53"/>` +
        `<path class="s" style="stroke-width:2" d="M92.6 98C86 96 78 93 70 92"/>`
    ),

    corazon:
      Pa("M95 121C95 113 103 108 110 112C118 114 122 122 118 128C113 134 108 140 105 143C101 138 95 130 95 121z") +
      Pa("M92 114C90 108 94 104 99 106L100.4 117z") + Pa("M112 108C116 104 122 108 120.4 114.4L113.6 114z") +
      `<path class="s" style="stroke-width:2.6" d="M103 110C103 100 108 96 114 99C118.4 102 119 108 118 113"/>` +
      `<path class="s" style="stroke-width:1.8" d="M97 104C95.6 98 95.6 94 96.4 90"/>` +
      `<path class="s" style="stroke-width:2" d="M108 108C110 103 114 103 116.4 105.4"/>` +
      Pa("M104 114C106 124 106.4 134 105 142.6M97.4 119C103 123 109 124.6 115 121", "d"),

    cerebro:
      sym(
        Pa("M99.4 8C88 6 80 14 81 26C82 34 90 39 99.4 38.4z") +
          Pa("M99 14C94 14 92 18 88 17M99 21C94 20 90 24 85 22M99 28C94 27 91 31 86 30M99 34C95 34 92 36 89 36.6M92 10C91 14 94 17 94 21", "d") +
          Pa("M81.6 28C80.8 36 84.6 40.6 91 41.4", "d")
      ) +
      Pa("M86.6 38.4C90 44.6 95 47.4 100 47.4C105 47.4 110 44.6 113.4 38.4C107 41 93 41 86.6 38.4z") +
      Pa("M90 43.4C96 45 104 45 110 43.4", "d") +
      Pa("M96 40H104V54L102.4 58.6H97.6L96 54z") + Pa("M100 8V38.6", "d"),
  },
};

/* Vista lateral del cuello (cara a la izquierda). Cada músculo es un <g class="z"> con data-z = id de zona. */
const lerp = (a, b, t) => a + (b - a) * t;
const bez = (P, t) => {
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
};
const smoothD = (pts, close) => {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(m[0])} ${f1(m[1])}`;
  }
  const l = pts[pts.length - 1];
  return d + `L${f1(l[0])} ${f1(l[1])}` + (close ? "z" : "");
};
/* Músculo en banda: P = curva guía (4 puntos), w = función de ancho(t), fib = fracciones del ancho para dibujar fibras */
const strap = (P, w, fib) => {
  const N = 16, Lp = [], Rp = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = bez(P, Math.max(0, t - .02)), b = bez(P, Math.min(1, t + .02)), c = bez(P, t);
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const n = Math.hypot(nx, ny) || 1;
    nx /= n; ny /= n;
    Lp.push([c[0] + nx * w(t) / 2, c[1] + ny * w(t) / 2]);
    Rp.push([c[0] - nx * w(t) / 2, c[1] - ny * w(t) / 2]);
  }
  const body = Pa(smoothD(Lp.concat(Rp.slice().reverse()), true));
  const lines = (fib || []).map(fr => Pa(smoothD(Lp.map((p, i) => [lerp(p[0], Rp[i][0], fr), lerp(p[1], Rp[i][1], fr)]).slice(1, -1)), "d")).join("");
  return body + lines;
};

/* Columna cervical lateral: eje (curva lordótica) y posición de cada vértebra */
const NECK_Y = i => 76 + i * 10.4,
      NECK_X = i => 112 - 9 * Math.sin(Math.PI * i / 6.6) - i * .5;

const neckMuscles = () => {
  const m = {};
  /* Esternocleidomastoideo: apófisis mastoides -> manubrio y clavícula (dos cabezas) */
  m.ecm = strap([[128, 70], [112, 96], [97, 124], [87, 152]], t => 5 + 6.2 * Math.sin(Math.PI * Math.min(1, t * 1.04)) ** .7 + (t > .86 ? (t - .86) * 22 : 0), [.3, .5, .72]) +
    Pa("M89 140L85.6 153M94 141L97 153", "d");
  /* Trapecio (fibras superiores): línea nucal y ligamento nucal -> tercio lateral de la clavícula y acromion */
  m.trapecio = strap([[142, 70], [151, 100], [158, 128], [178, 154]], t => 11 + 7 * Math.sin(Math.PI * t) + (t > .8 ? 4 : 0), [.25, .5, .75]);
  /* Esplenio de la cabeza y del cuello: ligamento nucal y T1-T3 -> mastoides y C1-C3 */
  m.esplenio = strap([[118, 146], [121, 118], [126, 94], [133, 72]], t => 7 + 4.4 * Math.sin(Math.PI * t), [.3, .5, .7]);
  /* Largo del cuello y de la cabeza: cara anterior de las vértebras, de T3 a la base del cráneo */
  const lc = Array.from({ length: 15 }, (_, k) => { const i = -0.5 + k * .56; return [NECK_X(i) - 10.4, NECK_Y(i) + 3]; });
  const lcR = lc.map(p => [p[0] + 5.8, p[1]]);
  m.largocuello = Pa(smoothD(lc.concat(lcR.slice().reverse()), true)) + Pa(smoothD(lc.map(p => [p[0] + 2.9, p[1]]).slice(1, -1)), "d");
  /* Multífidos y semiespinoso: fascículos oblicuos sobre las apófisis espinosas */
  m.multifidos = Array.from({ length: 6 }, (_, k) => {
    const i = k + .5, tx = NECK_X(i - 1.6) + 9.4, ty = NECK_Y(i - 1.6) + 2, bx = NECK_X(i + 1.1) + 14, by = NECK_Y(i + 1.1) + 6;
    return Pa(`M${f1(tx)} ${f1(ty)}L${f1(tx + 6)} ${f1(ty + .4)}L${f1(bx + 3.4)} ${f1(by)}L${f1(bx - 3.6)} ${f1(by + 2.4)}z`);
  }).join("") + Pa(smoothD(Array.from({ length: 9 }, (_, k) => [NECK_X(k * .78) + 14.6, NECK_Y(k * .78) + 5])), "d");
  return m;
};
const NECK = neckMuscles();
const NECK_ORDER = ["largocuello", "multifidos", "esplenio", "trapecio", "ecm"];

function neckFigure(cls) {
  const SP = [0, 0, 11, 8, 9, 11, 17];       /* longitud de la apófisis espinosa: C2 y C7 son las más largas */
  const bones = Array.from({ length: 7 }, (_, i) => {
    const x = NECK_X(i), y = NECK_Y(i), h = i === 0 ? 5.6 : 8, w = i === 0 ? 13 : 10.4 + i * .3;
    const body = `M${f1(x - w / 2)} ${f1(y)}Q${f1(x)} ${f1(y + 1)} ${f1(x + w / 2)} ${f1(y)}L${f1(x + w / 2 - .7)} ${f1(y + h)}Q${f1(x)} ${f1(y + h - 1)} ${f1(x - w / 2 + .7)} ${f1(y + h)}z`;
    const arch = i === 0
      ? `M${f1(x + w / 2)} ${f1(y + 1)}Q${f1(x + w / 2 + 9)} ${f1(y + 1.4)} ${f1(x + w / 2 + 11)} ${f1(y + 3.4)}L${f1(x + w / 2)} ${f1(y + h)}z`
      : `M${f1(x + w / 2 - .5)} ${f1(y + 1.6)}L${f1(x + 9.6)} ${f1(y + 2)}L${f1(x + 10.4 + SP[i])} ${f1(y + 4.4 + (i > 4 ? 1.4 : 0))}L${f1(x + 9.6)} ${f1(y + h - 1.2)}L${f1(x + w / 2 - .5)} ${f1(y + h - 1.4)}z`;
    return Pa(body, "f") + Pa(arch, "f") + (i ? Ln(f1(x - w / 2), f1(y + h - 2), f1(x - w / 2 - 5), f1(y + h + .8), 1.5) : "") +
      Pa(`M${f1(x - w / 2 + 1)} ${f1(y + h + .4)}Q${f1(x)} ${f1(y + h + 2.4)} ${f1(x + w / 2 - 1)} ${f1(y + h + .4)}`, "s");
  }).join("");
  const T1 = Pa(`M${f1(NECK_X(7) - 6)} ${f1(NECK_Y(7))}H${f1(NECK_X(7) + 6)}L${f1(NECK_X(7) + 5)} ${f1(NECK_Y(7) + 9)}H${f1(NECK_X(7) - 5)}z`, "f") +
    Pa(`M${f1(NECK_X(7) + 5)} ${f1(NECK_Y(7) + 2)}L${f1(NECK_X(7) + 30)} ${f1(NECK_Y(7) + 8)}L${f1(NECK_X(7) + 5)} ${f1(NECK_Y(7) + 7)}z`, "f");
  const head =
    Pa("M82 38L79 44L72 56L77 59L76 63L77 66L76 69L78 77L84 80C94 82 104 80 108 74L116 76L132 74L144 70C152 62 158 50 156 36C154 20 142 8 126 6C112 4 98 8 90 16C83 22 80 30 82 38z") +
    Pa("M82 38C84 36 88 36 90 38M110 74C112 66 112 60 110 56", "s") +
    El(91, 41, 5.2, 3.8, "f") + Pa("M92 50C102 52 112 52 118 50", "s") + Pa("M77 66H86", "s") +
    Pa("M100 67C112 67 124 69 138 70", "s") +
    El(122, 58, 4.4, 8, "f", -8) + Pa("M121 54C123 56 123 61 121 63", "s") + Ci(129, 69, 3.4, "f");
  const skin =
    Pa("M84 80C80 98 80 124 82 152", "s") + Pa("M146 72C151 84 151 104 153 122C155 138 163 150 184 158", "s");
  const deep =  /* músculos sin zona propia, solo de referencia */
    strap([[112, 84], [104, 110], [99, 134], [94, 154]], t => 5.4 + 2 * Math.sin(Math.PI * t)) +
    strap([[118, 80], [132, 104], [148, 128], [170, 148]], t => 5 + 2 * Math.sin(Math.PI * t));
  const context =
    `<path class="s" style="stroke-width:3.6;opacity:.55" d="M90 98C88 112 88 130 91 152"/>` + /* tráquea */
    Array.from({ length: 9 }, (_, i) => `<path class="s" style="stroke-width:.8" d="M86 ${100 + i * 5.6}H94.6"/>`).join("") +
    Pa("M82 96C80 91 85 87 91 89L93 98C89 100 85 100 82 96z", "f") + /* cartílago tiroides */
    Pa("M88 80L102 78L100 85L90 87z", "f") + /* hueso hioides */
    Pa("M94 156C106 161 120 160 134 156C148 158 164 162 184 166", "s") + /* clavícula */
    Pa("M80 150L96 148L98 180L84 182z", "f") + /* manubrio */
    Pa("M132 146L190 160M140 154L186 172", "s") /* espina y borde de la escápula */;
  return `<svg class="body neck" viewBox="30 -14 170 204" role="group" aria-label="Vista lateral del cuello: músculos cervicales">
<g class="gh">${skin}${head}${deep}${bones}${T1}${context}</g>
${NECK_ORDER.map(id => `<g class="z ${cls(id)}" data-z="${id}" tabindex="0" role="button">${NECK[id]}</g>`).join("")}
<text class="nl1" x="34" y="-4">Vista lateral</text><text class="nl2" x="34" y="6">Anterior</text><text class="nl2" x="196" y="6" text-anchor="end">Posterior</text>
</svg>`;
}

/* Orden de apilamiento Z para capas superpuestas */
const ORDER = {
  huesos: ["costillas", "humero", "antebrazo", "pelvis", "femur", "tibia", "pie", "craneo", "cervical", "toracica", "lumbar"],
  organos: [
    "vasos",
    "pulmones",
    "higado",
    "estomago",
    "rinones",
    "intestino",
    "vejiga",
    "corazon",
    "medula",
    "cerebro",
  ],
};

/* Silueta: tres pasadas (contorno, base oscura, tinte)
   para obtener un borde limpio de la unión de piezas */
const SILH =
  `<path d="M79 32C79 14 89 6 100 6s21 8 21 26c0 12-5 22-12 28l-9 5-9-5c-7-6-12-16-12-28z"/>` +
  `<path d="M91 56h18v28H91z"/>` +
  sym(
    `<path d="M100 76L91 78C78 80 64 82 57 90L60 112C64 140 69 168 71 192C69 210 63 226 64 240L68 254L100 256z"/>` +
      `<path d="M58 82C48 96 44 130 40 162C36 190 32 210 31 228C28 244 30 258 34 270L44 270C48 258 50 244 46 228C50 210 56 190 58 164C62 140 64 120 66 104z"/>` +
      `<path d="M64 236C58 266 60 306 67 350C65 378 67 412 72 440L70 454C69 460 74 464 82 464C92 464 95 460 94 454L92 440C93 412 93 378 92 350C95 316 100 284 100 254z"/>`
  ) +
  `<ellipse cx="78.5" cy="36" rx="3" ry="6"/>` +
  `<ellipse cx="121.5" cy="36" rx="3" ry="6"/>`;

const BODY = `
  <g class="sil-a">${SILH}</g>
  <g class="sil-b">${SILH}</g>
  <g class="sil-c">${SILH}</g>
`;

const GHOST = Object.values(ANAT.huesos).join("");

/* Renderizador principal de la figura SVG */
function figure(tab, cls) {
  const set = ANAT[tab];
  if (!set) return "";

  const ids = ORDER[tab] || Object.keys(set);

  return `<svg class="body" viewBox="0 0 200 470" role="group" aria-label="Figura anatómica interactiva: ${tab}"><defs><radialGradient id="bg" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#7fb2ff" stop-opacity=".22"/><stop offset="1" stop-color="#7fb2ff" stop-opacity="0"/></radialGradient><linearGradient id="bs" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9ec5ff"/><stop offset="1" stop-color="#4a63c8"/></linearGradient></defs><ellipse cx="100" cy="235" rx="98" ry="228" fill="url(#bg)"/><g class="rings"><circle cx="100" cy="235" r="98"/><circle cx="100" cy="235" r="74"/></g>${BODY}${tab === "huesos" ? "" : `<g class="gh">${GHOST}</g>`}<rect class="scan" x="0" y="0" width="200" height="3"/>${ids
    .map((id) => (set[id] ? `<g class="z ${cls(id)}" data-z="${id}" tabindex="0" role="button">${set[id]}</g>` : ""))
    .join("")}</svg>`;
}

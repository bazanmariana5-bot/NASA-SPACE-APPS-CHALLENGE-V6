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

/* Pila de vértebras con apófisis transversas */
const stack = (y, n, w0, w1, h, g, tp) =>
  Array.from({ length: n }, (_, i) => {
    const w = w0 + ((w1 - w0) * i) / Math.max(1, n - 1);
    const yy = y + i * (h + g);
    const rect = Rc(100 - w / 2, yy, w, h, 2);
    const processes = tp
      ? `<path class="s" style="stroke-width:1.5" d="M${100 - w / 2 - tp} ${
          yy + h / 2
        }H${100 - w / 2}M${100 + w / 2} ${yy + h / 2}H${100 + w / 2 + tp}"/>`
      : "";

    return rect + processes;
  }).join("");

/* Caja torácica: 10 costillas verdaderas/falsas + 2 flotantes */
const ribs = () => {
  const trueAndFalseRibs = Array.from({ length: 10 }, (_, i) => {
    const y0 = 94 + i * 7.4;
    const w = 11 + 18 * Math.sin((Math.PI * (i + 0.7)) / 11);
    const x = 100 - w;
    const y1 = y0 + 14 - (i >= 7 ? (i - 6) * 3 : 0);

    return sym(
      `<path class="s" style="stroke-width:1.9" d="M96 ${y0}C${
        100 - w * 0.6
      } ${y0 - 7} ${x} ${y0 - 1} ${x} ${y0 + 10}C${x} ${y0 + 20} ${
        100 - w * 0.35
      } ${y1 + 5} 98.5 ${y1}"/>`
    );
  }).join("");

  const floatingRibs = sym(
    `<path class="s" style="stroke-width:1.7" d="M96 168C86 168 78 175 75 184M96 176C88 178 82 187 80 193"/>`
  );

  return trueAndFalseRibs + floatingRibs;
};

/* Dedos de la mano */
const hand = (x) =>
  [
    [x - 7, 243, x - 13, 268],
    [x - 3, 245, x - 6, 271],
    [x + 1, 246, x + 1, 272],
    [x + 5, 245, x + 8, 270],
    [x + 7, 240, x + 14, 256],
  ]
    .map((l) => Ln(l[0], l[1], l[2], l[3], 2.4))
    .join("");

/* Diccionario de capas y zonas anatómicas */
const ANAT = {
  huesos: {
    craneo:
      Pa("M80 32C79 15 89 6 100 6s21 9 20 26c0 9-3 15-7 19l-1 5H88l-1-5c-4-4-7-10-7-19z") +
      Pa("M88 54L90 62Q100 68 110 62L112 54z") +
      El(91, 35, 5.5, 6, "k") +
      El(109, 35, 5.5, 6, "k") +
      Pa("M100 41l-3.5 9h7z", "k") +
      Pa("M100 12v9M93 60h14", "d"),

    cervical: stack(62, 7, 9, 12, 3, 1.3, 3),

    toracica: stack(90, 12, 11, 15, 5.6, 1.4, 5),

    lumbar: stack(176, 5, 15, 18, 7.5, 2, 6),

    costillas:
      ribs() +
      Pa("M93 87H107L108 99H106V138L100 148L94 138V99H92Z"),

    humero: sym(
      Ln(97, 88, 72, 85, 3.2) +
        Ln(72, 85, 60, 84, 3.2) +
        Pa("M85 96L67 92Q62 100 66 112L73 134Q81 124 85 110z") +
        Ci(59, 93, 6.5) +
        Ln(58, 97, 47, 160, 5.6) +
        El(47, 163, 7.2, 4.6, "f", -12)
    ),

    antebrazo: sym(
      Ln(52, 166, 43, 228, 3.6) +
        Ln(45, 166, 36, 226, 3.4) +
        El(39, 236, 7, 6) +
        hand(40)
    ),

    pelvis:
      sym(
        Pa(
          "M98 200C86 195 68 197 61 211C57 224 62 238 69 246L71 262L83 266L91 259L97 254L97 244L93 233L93 221L98 214z"
        ) +
          Ci(74, 243, 4.3, "k") +
          El(83, 254, 4.4, 6.5, "k")
      ) +
      Pa("M90 222H110L105 250L100 262L95 250z") +
      Pa("M97 259h6l-3 9z") +
      Pa("M100 226V256", "d"),

    femur: sym(
      Ci(72, 241, 7) +
        Ln(72, 243, 65, 254, 6) +
        El(65, 254, 4.5, 6) +
        Ln(67, 258, 79, 340, 7.5) +
        El(79, 347, 10.5, 6.5) +
        El(81, 356, 5, 6.5)
    ),

    tibia: sym(
      El(80, 361, 11, 3.8) +
        Ln(81, 364, 81, 430, 6) +
        Ln(72, 366, 74, 434, 3.4) +
        El(81, 437, 6, 5) +
        El(73, 437, 3.6, 5)
    ),

    pie: sym(
      El(82, 443, 7.5, 5.5) +
        [[76, 449, 72, 459], [79, 450, 77, 461], [82, 450, 82, 462], [85, 450, 87, 461], [88, 449, 92, 458]]
          .map((l) => Ln(l[0], l[1], l[2], l[3], 2.4))
          .join("")
    ),
  },

  musculos: {
    ecm: sym(Pa("M87 52L91 51L99 82L97 86L93 84z") + Pa("M91 56L96 80", "d")),

    trapecio: sym(
      Pa("M94 60C91 68 92 77 96 86L100 86C98 77 98 69 98 62z") +
        Pa("M95 68C86 74 74 79 62 84L66 92C76 90 88 84 97 80z")
    ),

    hombros: sym(
      Pa("M97 94C88 90 76 93 68 101C67 111 73 124 84 129C91 129 96 126 97 120z") +
        Pa("M64 84C53 82 47 90 47 102C47 111 51 118 57 120C61 110 64 98 69 92z") +
        Pa(
          "M96 98L74 104M96 106L72 110M96 114L76 120M60 86C54 94 52 104 54 114",
          "d"
        )
    ),

    brazos: sym(
      Pa("M56 104C48 118 44 142 47 160C52 163 57 162 59 159C63 140 65 118 64 104z") +
        Pa("M56 108C53 124 52 142 53 158", "d")
    ),

    antebrazom: sym(
      Pa("M42 164C38 186 34 208 33 226L43 228C47 208 54 186 57 166z") +
        El(39, 243, 6, 11) +
        Pa("M48 168C45 188 42 208 40 224", "d")
    ),

    core: sym(
      Pa("M90 142C77 148 72 172 74 198L88 205z") +
        Pa("M70 114C64 138 66 170 74 190L73 150z") +
        Pa(
          "M80 150C77 164 77 180 81 196M84 146C82 162 82 178 86 198",
          "d"
        ) +
        [146, 163, 180, 197].map((y) => Rc(92, y, 7.5, 14, 3)).join("")
    ),

    cadera: sym(
      Pa("M64 208C57 226 57 246 63 262L84 266L90 240L86 212z") +
        Pa("M86 216C80 232 78 246 82 260", "d")
    ),

    muslo: sym(
      Pa("M63 262C58 292 62 326 69 350L93 350C96 326 97 292 95 264z") +
        Pa(
          "M72 266C70 296 72 326 76 346M84 266C84 296 86 326 86 346",
          "d"
        )
    ),

    pantorrilla: sym(
      Pa("M70 362C65 384 68 412 77 436L89 436C95 412 96 384 93 362z") +
        Pa(
          "M78 368C76 388 80 410 83 432M88 368C88 388 88 410 87 430",
          "d"
        )
    ),

    bia: sym(
      Ci(37, 252, 4.6) +
        Ci(82, 456, 4.6) +
        `<path class="s" style="stroke-width:1.5;stroke-dasharray:3 3;opacity:.75" d="M37 252L50 160L60 100L100 96M82 456L80 350L72 248L100 250"/>`
    ),
  },

  organos: {
    higado:
      Pa("M68 150C80 141 100 142 110 147C108 163 98 173 84 173C73 171 67 162 68 150z") +
      El(92, 167, 3.6, 2.4, "k") +
      Pa("M76 152C84 156 94 158 104 155", "d"),

    estomago:
      Pa("M111 150C127 146 133 160 127 172C121 180 109 176 109 164z") +
      Pa("M116 154C124 156 127 164 123 170", "d"),

    intestino:
      `<path class="s" style="stroke-width:7" d="M76 228V200C76 192 80 188 88 188H112C120 188 124 192 124 200V228"/>` +
      `<path class="s" style="stroke-width:5" d="M88 202H112C118 202 118 209 112 209H88C82 209 82 216 88 216H112C118 216 118 223 112 223H88"/>` +
      Pa("M88 202H112M88 216H112", "d"),

    rinones: sym(
      Pa("M88 174C82 172 79 184 83 194C87 200 93 196 93 188C93 182 91 176 88 174z") +
        El(87, 170, 3.6, 2.2) +
        `<path class="s" style="stroke-width:1.6" d="M90 198C91 212 94 224 97 236"/>`
    ),

    vejiga: Pa("M92 238C92 230 108 230 108 238C108 248 92 248 92 238z"),

    pulmones:
      Rc(98, 60, 4, 34, 2) +
      `<path class="s" style="stroke-width:2" d="M100 94L90 104M100 94L110 104"/>` +
      sym(
        Pa("M96 92C88 88 75 92 71 104C67 122 67 142 73 154C81 159 93 154 96 144z") +
          Pa("M96 104L84 112M96 116L82 128M96 128L84 142", "d")
      ),

    vasos: sym(
      `<path class="s" style="stroke-width:4.2" d="M94.5 60C94.5 72 93.5 84 92 96"/>` +
        `<path class="s" style="stroke-width:2.8" d="M99 60C98.5 72 98 84 97 94"/>`
    ),

    corazon:
      Pa("M104 112C96 102 86 110 92 122C96 130 102 138 106 142C112 134 124 126 122 116C119 104 108 104 104 112z") +
      `<path class="s" d="M100 110C100 98 110 96 114 104"/>` +
      Pa(
        "M100 118C104 122 108 128 108 136M110 112C114 114 118 118 118 122",
        "d"
      ),

    cerebro:
      Pa("M100 9C90 5 80 10 82 19C78 24 80 30 86 31H114C120 30 122 24 118 19C120 10 110 5 100 9z") +
      Pa(
        "M100 9V31M88 15C92 19 96 17 98 21M112 15C108 19 104 17 102 21M85 25C91 23 95 27 98 25M115 25C109 23 105 27 102 25",
        "d"
      ) +
      sym(Ci(89, 40, 4.6) + Ci(89, 40, 1.9, "k") + Pa("M91 36L97 31", "d")),
  },
};

/* Vista lateral del cuello (cara a la izquierda): permite ver los músculos profundos que la vista frontal oculta.
   Cada músculo es un <g class="z"> con data-z = id de zona, igual que en la figura principal. */
const NECK_Y = i => 58 + i * 10.8,
      NECK_X = i => 96 - 7 * Math.sin(Math.PI * i / 6);

const NECK = {
  multifidos: Pa("M99 60C103 72 104 98 100 124L106 124C110 98 109 72 105 58z") + Pa("M102 64C105 80 105 100 103 120", "d"),
  esplenio: Pa("M108 50C114 66 118 96 119 124L126 124C126 94 121 62 114 48z") + Pa("M112 60C117 80 120 100 121 120", "d"),
  largocuello: Pa("M86 58C80 68 77 78 77 90C77 102 82 114 88 124L92 124C87 114 83 102 83 90C83 78 85 68 91 58z") + Pa("M84 62C80 74 80 100 86 118", "d"),
  trapecio: Pa("M114 44C130 62 140 90 152 116L144 126C132 104 122 84 108 60z") + Pa("M118 56C130 74 138 94 146 114", "d"),
  ecm: Pa("M100 46L107 50C98 74 84 104 76 130L66 130C76 104 90 74 100 46z") + Pa("M101 52C92 76 80 104 72 126", "d")
};

const NECK_ORDER = ["multifidos", "esplenio", "largocuello", "trapecio", "ecm"];

function neckFigure(cls) {
  const bones = Array.from({ length: 7 }, (_, i) => {
    const x = NECK_X(i), y = NECK_Y(i);
    return Rc(x - 4.5, y, 9, 8, 2) + Ln(x + 4.5, y + 4, x + 13, y + 6, 1.6);
  }).join("");

  return `<svg class="body neck" viewBox="0 0 170 150" role="group" aria-label="Vista lateral del cuello: músculos cervicales">
<g class="gh">${El(92, 28, 32, 24) + Pa("M62 36C58 48 62 58 72 62L84 60", "s") + bones}</g>
${NECK_ORDER.map(id => `<g class="z ${cls(id)}" data-z="${id}" tabindex="0" role="button">${NECK[id]}</g>`).join("")}
<text class="nl1" x="8" y="12">Vista lateral</text><text class="nl2" x="162" y="12" text-anchor="end">Frente ←</text>
</svg>`;
}

/* Orden de apilamiento Z para capas superpuestas */
const ORDER = {
  organos: [
    "vasos",
    "pulmones",
    "higado",
    "estomago",
    "rinones",
    "intestino",
    "vejiga",
    "corazon",
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

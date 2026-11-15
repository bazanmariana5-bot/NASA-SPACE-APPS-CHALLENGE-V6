/* clinicalconfig.js — toda la configuración clínica. Agregar tripulantes, zonas o parámetros = añadir un objeto. */
"use strict";

const CREW = [
  { id: "c1", name: "Juli Diaz", role: "Comandante", bio: "Especialista EVA · 28 años · 1,62 m · 57 kg", age: 42, h: 162, sens: 1, col: "#7fb2ff" },
  { id: "c2", name: "Mariana Bazán", role: "Médico de vuelo", bio: "Biología espacial · 38 años · 1,68 m · 62 kg", age: 38, h: 168, sens: 1.12, col: "#ff8ad8" },
  { id: "c3", name: "Pablo Gómez", role: "Ing. de sistemas", bio: "Robótica y soporte · 35 años · 1,75 m · 70 kg", age: 35, h: 175, sens: .9, col: "#ffd23f" }
];

const ENVS = {
  iss: { n: "Estación Espacial (microgravedad)", k: 1, fk: 1, gz: 1, lat: "0,3 s", note: "Órbita baja: microgravedad total, 16 amaneceres al día y comunicación casi inmediata con Tierra." },
  mars: { n: "Tránsito a Marte (espacio profundo)", k: 1.1, fk: 1, gz: 1, lat: "hasta 22 min", note: "Más radiación y retraso de comunicación: el tripulante debe autoevaluarse con autonomía." },
  moon: { n: "Base lunar Artemis (1/6 g)", k: .5, fk: .3, gz: .2, lat: "1,3 s", note: "Gravedad parcial: la pérdida ósea y muscular es menor, pero hay polvo lunar y radiación." }
};

const TABS = [
  { id: "panel", n: "Panel", cm: "" },
  { id: "huesos", n: "Huesos", cm: "Protocolo ARED: sentadilla y peso muerto, bisfosfonatos y vitamina D. El cumplimiento de ejercicio se ajusta en el menú de tripulación." },
  { id: "musculos", n: "Músculos", cm: "Cicloergómetro y resistencia isoinercial (ARED) 45 min diarios." },
  { id: "organos", n: "Órganos", cm: "Control de fluidos, sodio moderado y pantalones de presión negativa (LBNP)." },
  { id: "mente", n: "Evaluaciones", cm: "Registro matutino de sueño, test de colores, reacción y ánimo; obligatorio antes de una EVA o acoplamiento." },
  { id: "registro", n: "Registro", cm: "" },
  { id: "riesgos", n: "Riesgos NASA", cm: "" },
  { id: "plan", n: "Plan de ejercicio", cm: "" }
];

const SN = ["Normal", "Precaución", "Alerta", "Sin sensor"];

/* ---- helpers de modelo fisiológico ---- */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const P = (id, n, u, base, v, dir, y, r, d = 1, x = {}) => ({ id, n, u, base, v, dir, y, r, d, ...x });
const dens = r => P("dens", "Densidad ósea relativa", "% del basal", 100, c => 100 - r * c.m * c.f * c.k, "lt", 97, 94);
const load = () => P("load", "Carga mecánica diaria", "% de la meta", 100, c => c.d ? 55 + 45 * c.adh : 100, "lt", 85, 70, 0);
const mus = (id, n, u, b, r, ty = .05, tr = .1, d = 1) => P(id, n, u, b, c => b * (1 - r / 100 * c.m * c.f * c.k), "lt", b * (1 - ty), b * (1 - tr), d);

/* rigidez muscular (miotonómetro): cae con la atrofia/hipotonía en microgravedad. stiff(id, nombre, base, %caída por mes) */
const stiff = (id, n, b, r) => mus(id, n, "N/m", b, r, .05, .1);
const mt = (id, n, u, b, r, dir, y, rd, d = 1) => P(id, n, u, b, c => b * (1 + r / 100 * c.m * c.f * c.k), dir, y, rd, d);
const fl = (id, n, u, b, r, dir, y, rd, d = 1) => P(id, n, u, b, c => b * (1 + r / 100 * c.m * c.fk), dir, y, rd, d);
const ev0 = (id, n, u, fn, y, r) => P(id, n, u, 0, fn, "gt", y, r, 0);

const SI0 = .67 * 85 + .28 * 1600 - 420,
      buaF = c => 85 * (1 - .012 * c.m * c.f * c.k),
      sosF = c => 1600 * (1 - .0015 * c.m * c.f * c.k),
      siF = c => .67 * buaF(c) + .28 * sosF(c) - 420,
      tF = c => (siF(c) - SI0) / 8,
      zF = c => tF(c) + .4,
      lossF = c => (SI0 - siF(c)) / SI0 * 100;

const fiF = c => clamp(Math.round(6 + 5 * Math.max(0, lossF(c)) + 14 * Math.max(0, -(zF(c) + .5))), 0, 100),
      dH = c => 4.6 * (1 - Math.exp(-c.d / 18)) * c.gz;

const Z = (tab, id, n, txt, p, src, sys) => ({ tab, id, n, txt, p, sys: sys || tab, src });
const MSN = "Ecografía muscular, miotonometría y dinamometría manual del cuello.",
      BS = "Modelo de pérdida ósea: ultrasonido del calcáneo (QUS), carga plantar y ARED.",
      MS = "Ecografía muscular, dinamómetro y rendimiento en el ARED.",
      NO = "Este órgano todavía no tiene sensor ni parámetros definidos. Se incorpora sumando una variable a su lista.";

const ZONES = [
  Z("huesos", "craneo", "Cráneo y mandíbula", "El cráneo no soporta peso, por eso casi no pierde densidad. Lo que sí se vigila es la presión dentro de la cabeza (ver Órganos, Cerebro y ojos).", [dens(0)], BS),
  Z("huesos", "cervical", "Columna cervical", "Las vértebras del cuello cargan poco peso incluso en la Tierra, así que pierden poca densidad.", [dens(.3)], BS),
  Z("huesos", "toracica", "Columna torácica", "Se mantiene bastante estable porque se apoya en la caja torácica.", [dens(.5)], BS),
  Z("huesos", "lumbar", "Columna lumbar", "En microgravedad los discos entre las vértebras absorben líquido y se expanden: la estatura aumenta y puede doler la zona lumbar. Además las vértebras pierden carga y densidad, y cambian las curvaturas de la columna (lordosis lumbar y cervical, cifosis torácica).", [dens(1.2), P("dhp", "Ganancia de estatura", "%", 0, c => dH(c) / c.h * 100, "gt", 1, 3), P("disc", "Altura del disco L4-L5", "mm", 10.5, c => 10.5 * (1 + .028 * dH(c)), "gt", 11.55, 12.08), P("lord", "Ángulo de lordosis lumbar", "°", 50, c => 50 * (1 - .055 * dH(c)), "lt", 42.5, 35, 0), mt("cif", "Ángulo de cifosis torácica", "°", 35, 10, "gt", 45, 50, 0), mt("lcerv", "Ángulo de lordosis cervical", "°", 30, -8, "lt", 20, 10, 0), P("vas", "Dolor lumbar", "/10", 0, c => c.d ? c.vas : 0, "gt", 4, 7, 0)], BS),
  Z("huesos", "costillas", "Costillas y esternón", "Las costillas se mueven con cada respiración, por eso conservan mejor su densidad.", [dens(.2)], BS),
  Z("huesos", "humero", "Hombros y brazos (clavícula, escápula, húmero)", "Los brazos no soportan peso en órbita, pero se usan en las caminatas espaciales y en el ejercicio resistivo.", [dens(.3)], BS),
  Z("huesos", "antebrazo", "Antebrazo y mano", "Radio, cúbito y huesos de la mano pierden poca densidad. Se controla la fatiga por el uso del traje de actividad extravehicular.", [dens(.3)], BS),
  Z("huesos", "pelvis", "Pelvis y cadera", "La pelvis normalmente sostiene todo el peso del cuerpo. Sin gravedad es una de las zonas que más hueso pierde, entre 1 % y 2 % por mes sin contramedidas.", [dens(1.6)], BS),
  Z("huesos", "femur", "Fémur y rótula", "Es el hueso más largo y carga peso al caminar. En órbita se adelgaza si no se compensa con ejercicio resistivo.", [dens(1.3), load()], BS),
  Z("huesos", "tibia", "Tibia y peroné", "Reciben el impacto de cada paso en la Tierra. En flotación esa carga desaparece y el hueso empieza a reabsorberse.", [dens(1.1), load()], BS),
  Z("huesos", "pie", "Pie y calcáneo (QUS)", "El talón se mide con ultrasonido cuantitativo porque es hueso esponjoso muy activo. La velocidad y la atenuación de la onda cambian cuando las trabéculas se adelgazan.", [P("si", "Índice de rigidez (SI)", "índice", SI0, siF, "lt", SI0 * .97, SI0 * .92), P("sos", "Velocidad del sonido (SOS)", "m/s", 1600, sosF, "lt", 1576, 1568, 0), P("bua", "Atenuación de banda ancha (BUA)", "dB/MHz", 85, buaF, "lt", 80.75, 78.2), P("t", "T-score estimado", "DE", 0, tF, "lt", -1, -2.5), P("z", "Z-score estimado", "DE", .4, zF, "lt", -.5, -1), P("fi", "Índice de fragilidad", "0 a 100", 6, fiF, "gt", 25, 50, 0), load()], BS),
  Z("musculos", "ecm", "Esternocleidomastoideo", "Flexiona, inclina y rota la cabeza. Sin gravedad ya no sostiene su peso, pero se reactiva al frenar la cabeza en la reentrada y tras el aterrizaje.", [mus("esp", "Espesor del esternocleidomastoideo", "mm", 9, 1.5), mus("rig", "Rigidez del esternocleidomastoideo (miotonómetro)", "N/m", 210, 1.8, .05, .1, 0), mus("fle", "Fuerza de flexión cervical (dinamómetro)", "kgf", 12, 2, .1, .2)], MSN),
  Z("musculos", "trapecio", "Trapecio superior", "Eleva el hombro y extiende e inclina el cuello. Se sobrecarga con el traje de actividad extravehicular y con la tensión de la postura neutra en órbita.", [mus("esp", "Espesor del trapecio superior", "mm", 8, 1.2), mus("rig", "Rigidez del trapecio superior (miotonómetro)", "N/m", 290, 1.5, .05, .1, 0)], MSN),
  Z("musculos", "esplenio", "Esplenio del cuello", "Extiende y rota el cuello del mismo lado. Es un extensor antigravitatorio: sostiene la cabeza en la Tierra y pierde tono en órbita.", [mus("esp", "Espesor del esplenio del cuello", "mm", 12, 2), mus("rig", "Rigidez del esplenio del cuello (miotonómetro)", "N/m", 260, 2.2, .05, .1, 0), mus("ext", "Fuerza de extensión cervical (dinamómetro)", "kgf", 18, 2.2, .1, .2)], MSN),
  Z("musculos", "largocuello", "Largo del cuello y de la cabeza", "Son los flexores profundos del cuello y estabilizan la curvatura cervical. Al ser profundos se evalúan con ecografía y con el test de flexión craneocervical.", [mus("esp", "Espesor del largo del cuello (eco)", "mm", 8, 2.2), mt("ccft", "Test de flexión craneocervical (nivel alcanzado)", "mmHg", 30, -3, "lt", 26, 22, 0)], "Ecografía cervical anterior y test de flexión craneocervical con biofeedback de presión."),
  Z("musculos", "multifidos", "Multífidos cervicales", "Estabilizan cada vértebra del cuello. Son músculos profundos que se atrofian con la falta de carga axial y se evalúan con ecografía o resonancia.", [mus("esp", "Espesor de los multífidos cervicales (eco)", "mm", 10, 2.5), mus("area", "Área transversal de los multífidos (eco)", "cm²", 2.4, 2.8)], "Ecografía o resonancia del cuello (nivel C5)."),
  Z("musculos", "hombros", "Pectoral y hombros", "El deltoides y el pectoral trabajan poco sin gravedad, pero se mantienen mejor que las piernas.", [mus("delt", "Espesor del deltoides", "mm", 28, .9), mus("pec", "Espesor del pectoral mayor", "mm", 22, .9)], MS),
  Z("musculos", "brazos", "Brazos (bíceps y tríceps)", "Bíceps y tríceps pierden poca masa porque se usan para desplazarse y ejercitarse.", [mus("bic", "Espesor del bíceps", "mm", 30, .7), mus("tri", "Espesor del tríceps", "mm", 26, .8), stiff("rigb", "Rigidez del bíceps braquial (miotonómetro)", 12, 1.5)], MS),
  Z("musculos", "antebrazom", "Antebrazo y mano", "La fuerza de agarre se mide con dinamómetro y se compara con el valor previo al vuelo. El traje espacial agrega fatiga.", [mus("grip", "Fuerza de agarre", "kgf", 42, .8), mus("fle", "Espesor de flexores", "mm", 24, .6)], MS),
  Z("musculos", "core", "Abdomen y espalda", "Los músculos que sostienen la postura trabajan menos sin gravedad y pierden tono.", [mus("rec", "Espesor del recto abdominal", "mm", 11, 2), mus("ere", "Espesor de erectores espinales", "mm", 30, 1.8)], MS),
  Z("musculos", "cadera", "Cadera y glúteos", "El glúteo mayor es de los que más se activan al caminar en la Tierra y de los que más pierden en órbita.", [mus("glu", "Espesor del glúteo mayor", "mm", 28, 2.6)], MS),
  Z("musculos", "muslo", "Muslo (cuádriceps)", "El cuádriceps es el gran músculo antigravitatorio. Si el área de corte baja de 60 a 52 cm² en tres meses, el software calcula el porcentaje de cambio y avisa.", [mus("quad", "Área del cuádriceps (eco)", "cm²", 60, 3.6), mus("isq", "Área de isquiotibiales (eco)", "cm²", 34, 2.6), mus("ared", "Repeticiones en ARED (sentadilla, 80 kgf)", "rep", 15, 3, .1, .2), stiff("rigq", "Rigidez del cuádriceps (miotonómetro)", 10, 2.5), stiff("rigi", "Rigidez de isquiotibiales (miotonómetro)", 11, 2)], MS),
  Z("musculos", "pantorrilla", "Pantorrilla", "Sóleo y gastrocnemio sostienen el cuerpo de pie y son los que más rápido se atrofian en microgravedad.", [mus("sur", "Espesor del tríceps sural", "mm", 52, 4), mus("tal", "Elevación de talones (rep)", "rep", 25, 3.5, .1, .2), stiff("rigg", "Rigidez de gemelos (miotonómetro)", 12, 3), stiff("rigs", "Rigidez del sóleo (miotonómetro)", 13, 3)], MS),
  Z("musculos", "bia", "Composición corporal (BIA)", "La bioimpedancia, con electrodos en manos y pies, estima la masa libre de grasa y el agua corporal total; separa pérdida muscular de cambios de líquidos.", [mus("ffm", "Masa libre de grasa (BIA)", "kg", 62, 1.1), P("tbw", "Agua corporal total (BIA)", "L", 45, c => 45 * (1 - .01 * c.m * c.fk), "none", 0, 0)], "Bioimpedancia eléctrica."),
  Z("organos", "cerebro", "Cerebro y ojos", "En microgravedad los líquidos suben hacia la cabeza. Esto puede aumentar la presión dentro del cráneo y deformar la parte posterior del ojo. " + NO, [], "Sin sensor.", "Neuro-ocular"),
  Z("organos", "vasos", "Cuello: yugular y carótida", "La sangre se acumula en el cuello y la vena yugular puede estancarse, con riesgo de coágulos. Las arterias además se vuelven más rígidas.", [P("ijv", "Estasis de la vena yugular", "grado 1 a 4", 1, c => 1 + .012 * c.d * c.fk, "gt", 2, 3), fl("stif", "Rigidez carotídea", "m/s", 6, 2, "gt", 6.36, 6.72, 2)], "Ecografía vascular Doppler.", "Cardiovascular"),
  Z("organos", "pulmones", "Pulmones", "Sin gravedad las vísceras abdominales suben y el diafragma se eleva: baja la capacidad residual. También se vigila el polvo en cabina y tras caminatas espaciales.", [fl("fvc", "Capacidad vital forzada", "L", 4.8, -1.4, "lt", 4.56, 4.32, 2), fl("fev1", "Volumen espiratorio en 1 s", "L", 3.9, -1.1, "lt", 3.7, 3.51, 2), fl("frc", "Capacidad residual funcional", "L", 2.6, -2.8, "lt", 2.21, 2.08, 2), fl("spo2", "Saturación de oxígeno", "%", 98, -.1, "lt", 95, 94), fl("pi", "Índice de perfusión", "%", 4, -4, "lt", 1, .5)], "Espirometría y oximetría de pulso.", "Respiratorio"),
  Z("organos", "corazon", "Corazón", "Sin gravedad el corazón trabaja menos y se achica un poco. También cambia la regulación de la presión al ponerse de pie, lo que causa mareos al volver a la gravedad.", [fl("lvef", "Fracción de eyección", "%", 62, -.8, "lt", 55, 50), mt("lvm", "Índice de masa del ventrículo izquierdo", "g/m²", 80, -2.5, "lt", 74, 72), fl("sv", "Volumen sistólico", "mL", 78, -2.6, "lt", 70, 66.3), fl("hr", "Frecuencia cardíaca en reposo", "lpm", 66, 1.2, "gt", 85, 95, 0), fl("hrv", "Variabilidad de la frecuencia (RMSSD)", "ms", 52, -4, "lt", 45, 39, 0), fl("ort", "Índice de tolerancia ortostática", "0 a 100", 90, -4.5, "lt", 75, 60, 0), fl("sbp", "Presión sistólica", "mmHg", 118, .6, "gt", 130, 140, 0), fl("dbp", "Presión diastólica", "mmHg", 76, .5, "gt", 85, 90, 0)], "Ecocardiografía, Holter, tensiómetro y prueba de presión negativa (LBNP).", "Cardiovascular"),
  Z("organos", "higado", "Hígado y glucosa", "El hígado regula la glucosa. Aunque aún no tiene sensor propio, la glucosa capilar es un indicador básico de autoevaluación (estrés, nutrición y resistencia a la insulina).", [fl("glu", "Glucosa en sangre", "mg/dL", 90, .4, "gt", 110, 126, 0)], "Glucómetro capilar.", "Metabólico"),
  Z("organos", "estomago", "Estómago", "\u200b" + NO, [], "Sin sensor.", "Otro"),
  Z("organos", "rinones", "Riñones", "El hueso que se pierde libera calcio que los riñones eliminan por la orina. Junto con menos agua ingerida, sube el riesgo de cálculos renales.", [mt("cal", "Calcio en orina", "mg/día", 180, 8, "gt", 230, 300, 0), fl("diu", "Diuresis", "L/día", 2.4, -3, "lt", 2, 1.7)], "Ecografía renal y balance hídrico.", "Renal"),
  Z("organos", "intestino", "Intestino y temperatura corporal", NO + " La temperatura corporal sí se vigila como indicador básico de infección o estrés térmico.", [fl("temp", "Temperatura corporal", "°C", 36.6, .05, "gt", 37.5, 38.3, 1)], "Termómetro de oído o cutáneo.", "Otro"),
  Z("organos", "vejiga", "Vejiga", "\u200b" + NO, [], "Sin sensor.", "Otro"),
  Z("mente", "sueno", "Sueño", "Combina el anillo biométrico (actigrafía y PPG) con un autorreporte de 15 s. En órbita se duerme 6,0–6,5 h en vez de 8,5 h.", [fl("tst", "Tiempo total de sueño (TST)", "h", 7.5, -1.5, "lt", 6, 5), fl("eff", "Eficiencia del sueño", "%", 90, -.5, "lt", 82, 75, 0), fl("nhrv", "HRV nocturna (RMSSD)", "ms", 60, -1.5, "lt", 54, 48, 0), fl("sq", "Calidad global (1 a 5)", "puntos", 4.5, -1.5, "lt", 3, 2)], "Anillo biométrico (actigrafía triaxial y fotopletismografía) y autorreporte matutino.", "Neurocognitivo"),
  Z("mente", "cognicion", "Memoria de trabajo (test de colores)", "Secuencia de 10 colores en menos de 45 s. Exige corteza prefrontal e hipocampo y es el primero en fallar por SANS, hipercapnia de cabina, falta de sueño o radiación. Puntaje de 0 a 100: 85+ óptimo, 70–84 normal, 55–69 deterioro leve, menos de 55 alerta crítica.", [fl("cog", "Puntaje cognitivo", "0 a 100", 92, -1, "lt", 70, 55, 0), fl("acc", "Aciertos de posición", "de 10", 9.2, -1, "lt", 8, 7), fl("span", "Racha sin error", "pasos", 8.5, -2, "lt", 6, 5), fl("lat", "Latencia de inicio", "ms", 650, 1, "gt", 1000, 1200, 0), fl("itv", "Intervalo entre toques", "ms", 480, 1.5, "gt", 560, 624, 0), ev0("lap", "Lapsos atencionales", "eventos", c => Math.max(0, (c.d - 120) / 60), 1, 2)], "Test secuencial cromático inspirado en WinSCAT y bloques de Corsi.", "Neurocognitivo"),
  Z("mente", "reaccion", "Velocidad de reacción", "Tres intentos tras el cambio de rojo a verde. El puntaje de 1 a 10 habilita caminatas espaciales con 6 o más y las bloquea con 4 o menos. Las salidas en falso restan 1 punto y un intento de más de 500 ms resta 2.", [fl("rt", "Tiempo medio de reacción", "ms", 220, 1.5, "gt", 260, 320, 0), fl("fast", "Mejor intento", "ms", 190, 1.5, "gt", 230, 280, 0), fl("rs", "Puntaje de reacción (1 a 10)", "puntos", 8.5, -1, "lt", 6, 4), ev0("fs", "Salidas en falso", "eventos", c => Math.max(0, (c.d - 150) / 70), 1, 2), ev0("rl", "Intentos mayores a 500 ms", "eventos", c => Math.max(0, (c.d - 180) / 60), 1, 2)], "Adaptación de la tarea de vigilancia psicomotora (PVT) de la NASA.", "Neurocognitivo"),
  Z("mente", "animo", "Ánimo del día", "Escala del 1 al 10 con etiquetas rápidas y bitácora de dos líneas. Con 3 o menos, o una caída de 4 puntos, se avisa de forma confidencial al equipo médico; 5 o 6 durante 7 días seguidos sugiere una videollamada con la familia.", [fl("mood", "Puntaje de ánimo (1 a 10)", "puntos", 7.5, -.8, "lt", 5, 3)], "Autorreporte nocturno de menos de 30 s.", "Emocional"),
  Z("mente", "esfuerzo", "Prueba de esfuerzo (CEVIS)", "Ergoespirometría en cicloergómetro: modo submáximo en órbita cada 15 a 21 días (se detiene al 85 % de FC máx. o RER 1,05) y máximo antes y después del vuelo. Se detiene sola con SpO₂ menor a 90 %, PtcCO₂ mayor a 55 mmHg, presión sistólica mayor a 220 mmHg o arritmia.", [mt("vo2", "VO₂máx estimado", "mL/kg/min", 50, -.6, "lt", 45, 42.5, 0), mt("awe", "Eficiencia aeróbica del trabajo", "mL O₂/min/W", 10.2, .8, "gt", 11.5, 12.5), mt("pw", "Potencia en umbral ventilatorio", "W/kg", 2.6, -1, "lt", 2.4, 2.29), mt("hrr", "Recuperación de FC al minuto", "lpm", 22, -1.2, "lt", 18, 12, 0), mt("borg", "Esfuerzo percibido Borg (Etapa 2)", "6 a 20", 12, 1.5, "gt", 14, 17, 0), fl("co2", "PtcCO₂ de cabina", "mmHg", 38, .8, "gt", 48, 55, 0)], "Cicloergómetro con aislamiento de vibraciones y analizador de gases respiración a respiración.", "Cardiopulmonar")
];

/* límites de validez: fuera de [mn,mx] el valor se marca ALERTA. null = sin límite */
const LIM = {
  "*.dens": [0, 100],
  "*.load": [0, 150],
  "lumbar.disc": [9, null],
  "lumbar.dhp": [0, null],
  "lumbar.lord": [null, 60],
  "lumbar.cif": [10, 80],
  "lumbar.lcerv": [0, 45],
  "lumbar.vas": [0, 10],
  "pie.si": [null, 110],
  "pie.sos": [null, 1600],
  "pie.bua": [null, 85],
  "pie.t": [null, 1.5],
  "pie.z": [null, 1.5],
  "pie.fi": [0, 100],
  "vasos.ijv": [1, 4],
  "vasos.stif": [5, null],
  "pulmones.fvc": [null, 5.5],
  "pulmones.fev1": [null, 4.5],
  "pulmones.frc": [null, 3],
  "pulmones.spo2": [null, 100],
  "pulmones.pi": [null, 10],
  "corazon.lvef": [null, 70],
  "corazon.lvm": [null, 102],
  "corazon.sv": [null, 100],
  "corazon.hr": [45, null],
  "corazon.hrv": [null, 75],
  "corazon.ort": [null, 100],
  "corazon.sbp": [90, null],
  "corazon.dbp": [50, null],
  "higado.glu": [70, null],
  "rinones.cal": [50, null],
  "rinones.diu": [null, 4],
  "intestino.temp": [35, null],
  "sueno.tst": [null, 10],
  "sueno.eff": [null, 100],
  "sueno.nhrv": [null, 120],
  "sueno.sq": [null, 5],
  "cognicion.cog": [null, 100],
  "cognicion.acc": [null, 10],
  "cognicion.span": [null, 10],
  "cognicion.lat": [150, null],
  "cognicion.itv": [100, null],
  "reaccion.rt": [100, null],
  "reaccion.fast": [100, null],
  "reaccion.rs": [null, 10],
  "animo.mood": [null, 10],
  "esfuerzo.vo2": [null, 80],
  "esfuerzo.awe": [7, null],
  "esfuerzo.pw": [null, 6],
  "esfuerzo.hrr": [null, 60],
  "esfuerzo.borg": [6, 20],
  "esfuerzo.co2": [30, null]
};

ZONES.forEach(z => z.p.forEach(p => {
  if (p.dir === "none") return;
  const l = LIM[z.id + "." + p.id] || LIM["*." + p.id];
  if (l) {
    p.mn = l[0];
    p.mx = l[1];
  } else if (p.dir === "lt") {
    p.mx = p.base * 1.10;
  } else {
    p.mn = p.base > 0 ? p.base * 0.90 : 0;
  }
}));
/* ---- emergencias vitales: "zona.param": [[operador, umbral, situación], ...] ----
   Solo los parámetros listados acá disparan el aviso de Emergencia vital. lt = menor o igual, gt = mayor o igual. */
const EMERG = {
  "corazon.hr":    [["lt", 30, "paro cardiorrespiratorio confirmado", true], ["gt", 180, "taquicardia extrema con posible arritmia grave"]],
  "corazon.lvef":  [["lt", 30, "falla cardíaca severa"]],
  "corazon.sbp":   [["lt", 70, "hipotensión grave con posible shock"], ["gt", 180, "crisis hipertensiva"]],
  "pulmones.spo2": [["lt", 85, "hipoxia severa (saturación de oxígeno críticamente baja)"]],
  "esfuerzo.co2":  [["gt", 70, "hipercapnia severa (exceso de CO₂)"]],
  "intestino.temp":[["gt", 40, "hipertermia severa"], ["lt", 34, "hipotermia severa"]],
  "higado.glu":    [["lt", 50, "hipoglucemia grave"], ["gt", 400, "hiperglucemia grave"]]
};

/* Paro cardiorrespiratorio confirmado: mensaje propio, sin "posible" y con la orden de despejar la zona. */
const ARREST_MSG = nombre =>
  `Paro cardiorrespiratorio confirmado. El astronauta ${nombre} no tiene actividad cardíaca efectiva. ¡DESPEJEN LA ZONA! El desfibrilador está a punto de activarse. No toquen al paciente.`;

const EMERG_MSG = (nombre, situacion) =>
  `Emergencia vital. El astronauta ${nombre} presenta ${situacion}. Se solicita asistencia inmediata. Mantengan la calma y sigan los protocolos de emergencia.`;

/* ---- configuración de pruebas (PDF) ---- */
const MOOD = [
  [10, "Excelente", "Con máxima energía, muy motivado y disfrutando la misión."],
  [9, "Muy bien", "Optimista, activo y con muy buen ánimo frente a las tareas."],
  [8, "Bien", "Tranquilo, enfocado y conforme con el trabajo del día."],
  [7, "Estable", "Día equilibrado y normal, sin desgaste emocional."],
  [6, "Rutinario", "Día repetitivo o en “piloto automático”, sin grandes emociones."],
  [5, "Plano / Aburrido", "Sensación de monotonía, tedio o encierro leve."],
  [4, "Tenso / Nostálgico", "Algo impaciente, sensible al entorno o extrañando casa."],
  [3, "Frustrado / Irritable", "Estresado, con poca paciencia o ganas de aislarse."],
  [2, "Agotado", "Sobrepasado por el cansancio mental o la carga de trabajo."],
  [1, "Muy mal", "Angustia profunda, bloqueo emocional o malestar severo."]
];

const TAGS = ["Calma", "Motivado", "Rutina", "Nostalgia", "Cansado", "Estrés"];

const REACT = [
  [190, 10, "Excepcional", "Alerta cortical máxima y respuesta ultrarrápida."],
  [215, 9, "Óptimo alto", "Excelente; apto para maniobras de alta precisión."],
  [240, 8, "Óptimo", "Rendimiento normal de un astronauta descansado."],
  [265, 7, "Estable", "Dentro del rango basal en órbita; sin fatiga."],
  [295, 6, "Aceptable", "Leve enlentecimiento, funcional para la rutina."],
  [325, 5, "Fatiga leve", "Atención reducida; vigilar sueño y CO₂."],
  [360, 4, "Alerta amarilla", "Enlentecimiento moderado; evitar tareas críticas sin supervisión."],
  [410, 3, "Fatiga marcada", "Requiere descanso antes de operar."],
  [480, 2, "Alerta roja", "Riesgo alto de error operativo."],
  [1e9, 1, "Crítico", "Bloqueo preventivo de actividades críticas o EVA."]
];

const COG = [
  [85, "OPTIMAL", "Memoria y velocidad intactas. Habilitado sin restricciones para operaciones críticas y EVA."],
  [70, "NORMAL_VARIATION", "Leve oscilación dentro de tolerancia orbital. Mantener rutina y repetir en 24 h."],
  [55, "MILD_IMPAIRMENT", "Deterioro leve o fatiga ejecutiva. Reasignar tareas de precisión; revisar sueño y ventilación."],
  [-1, "CRITICAL_ALERT", "Déficit significativo. Bloqueo preventivo de tareas críticas y EVA; protocolo médico con Tierra."]
];

const PALETTE = [
  ["Rojo", "#ff4d5a"],
  ["Azul", "#3d7bff"],
  ["Verde", "#2ee6a6"],
  ["Amarillo", "#ffd23f"],
  ["Naranja", "#ff8a3d"],
  ["Violeta", "#9b6bff"],
  ["Cian", "#27d8ee"],
  ["Magenta", "#ff4fd8"],
  ["Blanco", "#f2f5ff"],
  ["Lima", "#b6f23a"]
];

const CPET = [
  ["0. Reposo basal", "3 min", "0 W", "0 rpm", "Calibra el analizador y captura VO₂, VCO₂, FC, TA, SpO₂ y PtcCO₂ en reposo."],
  ["1. Calentamiento", "3 min", "50 W", "60–70 rpm", "Activación muscular y cinética inicial de VO₂."],
  ["2. Etapa 1 · aeróbica ligera", "3 min", "100 W", "70–80 rpm", "Metabolismo aeróbico puro (RER 0,85–0,90)."],
  ["3. Etapa 2 · moderada", "3 min", "150 W", "75–85 rpm", "Detección del umbral ventilatorio 1 (VT1)."],
  ["4. Etapa 3 · intensa", "3 min", "200 W", "80–90 rpm", "Transición aeróbica-anaeróbica; límite habitual del protocolo submáximo."],
  ["5. Etapa 4+ · carga pico", "2 min/escalón", "+25 W", "80–95 rpm", "Solo en modo máximo, hasta agotamiento (RER ≥ 1,10)."],
  ["6. Recuperación activa", "3 min", "40–50 W", "50–60 rpm", "Lavado de lactato y prevención de estancamiento venoso."],
  ["7. Recuperación pasiva", "2 min", "0 W", "0 rpm", "Mide la recuperación de la FC (HRR) y normaliza los gases."]
];

const cpetCheck = i => {
  const r = [],
        fmax = 208 - .7 * i.age;
  if (i.hr >= .85 * fmax) r.push(`FC ${i.hr} lpm ≥ 85 % de la FC máx. calculada (${Math.round(.85 * fmax)} lpm)`);
  if (i.spo2 < 90 || i.spo2 < i.spo2b * .96) r.push("Desaturación de oxígeno (SpO₂ menor a 90 % o caída de más del 4 % del basal)");
  if (i.ptc > 55) r.push("PtcCO₂ mayor a 55 mmHg: reinhalación de CO₂ alrededor del tripulante");
  if (i.sbp > 220 || i.dbp > 115 || (i.sbpPrev && i.sbpPrev - i.sbp > 10)) r.push("Respuesta hipertensiva o hipotensiva");
  if (i.sym) r.push("Arritmia, depresión del ST o síntoma clínico (mareo, dolor torácico, calambres)");
  return r;
};

const sleepObj = s => {
  const a = s.tst >= 7 ? 5 : s.tst >= 6.5 ? 4 : s.tst >= 5.8 ? 3 : s.tst >= 5 ? 2 : 1,
        b = s.eff > 88 ? 5 : s.eff >= 82 ? 4 : s.eff >= 75 ? 3 : s.eff >= 65 ? 2 : 1;
  return clamp(Math.round((a + b) / 2), 1, 5);
};

const SLEEP_CAT = ["", "Crítica (privación)", "Deficiente", "Regular", "Buena", "Óptima (reparadora)"];
const NO_RISK = 0;

/* ---- 5 peligros del Programa de Investigación Humana de la NASA ---- */
const HAZARDS = [
  { n: "Radiación espacial", eff: "Daña el ADN, debilita el sistema inmunitario y eleva el riesgo cardiovascular y de cáncer; también afecta la memoria de trabajo.", ind: "Dosímetro personal, hemograma, puntaje cognitivo, HRV.", call: "Dosis acumulada sobre el límite de misión o caída sostenida del puntaje cognitivo.", prev: "Refugiarse en zonas blindadas durante tormentas solares y registrar la dosis a diario.", go: "mente" },
  { n: "Aislamiento y confinamiento", eff: "Monotonía, tensión interpersonal, alteraciones del sueño y trastornos del ánimo.", ind: "Ánimo del día (1 a 10), horas de sueño, bitácora.", call: "Ánimo de 3 o menos, caída de 4 puntos, o 7 días seguidos en 5 o 6.", prev: "Videollamadas con la familia, variar tareas y mantener horarios de luz regulados.", go: "mente" },
  { n: "Distancia de la Tierra", eff: "Sin evacuación rápida ni ayuda inmediata: el tripulante debe autoevaluarse y tratar con autonomía.", ind: "Signos vitales, glucosa, temperatura, ecografías guiadas.", call: "En Marte la comunicación demora hasta 22 minutos: las decisiones críticas son locales.", prev: "Botiquín, protocolos claros y esta propia herramienta de autoevaluación.", go: "organos" },
  { n: "Campos gravitatorios", eff: "Pérdida de densidad ósea, atrofia muscular, desacondicionamiento cardiovascular y síndrome neuro-ocular (SANS).", ind: "Densidad ósea (QUS), áreas musculares, FC y síntomas visuales reportados.", call: "T-score por debajo de −1, atrofia de más del 10 % o cambios visuales nuevos.", prev: "Ejercicio resistivo ARED, cicloergómetro, vitamina D y control de fluidos.", go: "huesos" },
  { n: "Entornos cerrados hostiles", eff: "Hipercapnia de cabina, ruido (~60 dB), microbioma alterado y mala nutrición.", ind: "PtcCO₂, sueño, glucosa, temperatura, reacción.", call: "PtcCO₂ mayor a 48 mmHg junto con enlentecimiento psicomotor.", prev: "Revisar depuradores de CO₂, ventilación del compartimento y nutrición equilibrada.", go: "mente" }
];

const GUIDE = [
  ["Presión arterial", "Se mide con tensiómetro automático, sentado y en calma. En órbita tiende a ser algo menor, pero al volver a la gravedad aparecen mareos. Consultar con más de 140/90 mmHg."],
  ["Frecuencia cardíaca", "Se toma en reposo, al despertar. Una subida sostenida indica desacondicionamiento, deshidratación o estrés. Alerta con más de 95 lpm en reposo."],
  ["Glucosa en sangre", "Glucómetro capilar en ayunas. Un valor sobre 126 mg/dL requiere revisar nutrición y consultar al médico de vuelo."],
  ["Temperatura corporal", "Termómetro de oído o cutáneo. Sin convección, el calor se acumula; más de 38,3 °C requiere atención."],
  ["Horas de sueño", "Las mide el anillo biométrico. Menos de 6 h es precaución y menos de 5 h es crítico."],
  ["Estado de ánimo", "Escala del 1 al 10 y bitácora de dos líneas, en menos de 30 segundos antes de dormir."]
];

const LINKS = [
  ["NASA · 5 peligros de los vuelos espaciales", "https://www.nasa.gov/hrp/hazards/"],
  ["NASA · Riesgos de los vuelos espaciales", "https://www.nasa.gov/hrp/risks/"],
  ["NASA · Investigación en curso (HRP)", "https://www.nasa.gov/hrp/ongoing-hrp-research/"],
  ["CSA · Monitorización de radiación", "https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp"],
  ["CSA · ¿Por qué hacemos ciencia en el espacio?", "https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp"]
];

/* ---- panel principal: indicadores que se grafican por tripulante [zona, parámetro, categoría] ---- */
const CATS = [
  ["all", "Todos"],
  ["huesos", "Huesos"],
  ["musculos", "Músculos"],
  ["organos", "Órganos"],
  ["mente", "Mente y sueño"]
];

const PANEL = [
  ["pelvis", "dens", "huesos"],
  ["lumbar", "dhp", "huesos"],
  ["lumbar", "vas", "huesos"],
  ["pie", "t", "huesos"],
  ["ecm", "esp", "musculos"],
  ["multifidos", "esp", "musculos"],
  ["muslo", "quad", "musculos"],
  ["pantorrilla", "sur", "musculos"],
  ["antebrazom", "grip", "musculos"],
  ["bia", "ffm", "musculos"],
  ["corazon", "lvef", "organos"],
  ["corazon", "hr", "organos"],
  ["corazon", "sbp", "organos"],
  ["corazon", "ort", "organos"],
  ["pulmones", "fvc", "organos"],
  ["pulmones", "spo2", "organos"],
  ["rinones", "cal", "organos"],
  ["higado", "glu", "organos"],
  ["intestino", "temp", "organos"],
  ["sueno", "sq", "mente"],
  ["sueno", "tst", "mente"],
  ["cognicion", "cog", "mente"],
  ["reaccion", "rt", "mente"],
  ["animo", "mood", "mente"],
  ["esfuerzo", "vo2", "mente"],
  ["esfuerzo", "co2", "mente"]
];

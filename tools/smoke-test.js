/* tools/smoke-test.js — carga todos los .js en el orden de index.html dentro de un DOM falso
   y falla si alguno lanza una excepción al iniciar (referencias rotas, orden incorrecto, etc.).
   Uso: node tools/smoke-test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);

/* Objeto "comodín": acepta cualquier propiedad, llamada o asignación. */
function stub() {
  const target = function () {};
  const store = {};
  const p = new Proxy(target, {
    get(_, k) {
      if (k === Symbol.toPrimitive) return () => "";
      if (k === Symbol.iterator) return function* () {};
      if (k === "length") return 0;
      if (k === "then") return undefined;
      if (k in store) return store[k];
      return (store[k] = stub());
    },
    set(_, k, v) {
      store[k] = v;
      return true;
    },
    has() {
      return true;
    },
    apply() {
      return stub();
    },
    construct() {
      return stub();
    }
  });
  return p;
}

const ctx = {
  console,
  setTimeout: () => 0,
  clearTimeout() {},
  setInterval: () => 0,
  clearInterval() {},
  requestAnimationFrame: () => 0,
  cancelAnimationFrame() {},
  matchMedia: () => ({ matches: false }),
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { hash: "" },
  history: { replaceState() {} },
  innerWidth: 1200,
  innerHeight: 800,
  addEventListener() {},
  document: new Proxy(
    {},
    {
      get: (_, k) => (k === "addEventListener" ? () => {} : stub())
    }
  )
};
ctx.window = ctx;
vm.createContext(ctx);

let failed = 0;
for (const f of files) {
  try {
    vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
    console.log("  ok   " + f);
  } catch (e) {
    failed++;
    console.log("  FAIL " + f + "\n       " + e.name + ": " + e.message);
    break;
  }
}
/* Los datos iniciales deben cubrir los días 0 a 30 de cada tripulante base y usar solo parámetros existentes. */
if (!failed) {
  const problems = vm.runInContext(
    `(() => {
      const known = new Set(), errs = [];
      ZONES.forEach(z => z.p.forEach(p => known.add(z.id + "." + p.id)));
      CREW.slice(0, 3).forEach(c => {
        const series = SEED[c.id];
        if (!series) return errs.push("sin datos para " + c.id);
        known.forEach(k => { if (!series[k]) errs.push(c.id + " falta " + k); });
        Object.entries(series).forEach(([k, a]) => {
          if (!known.has(k)) errs.push(c.id + " parámetro desconocido " + k);
          if (a.length !== SEED_DAYS) errs.push(c.id + " " + k + " tiene " + a.length + " valores");
          if (a.some(v => typeof v !== "number" || !isFinite(v))) errs.push(c.id + " " + k + " con valores no numéricos");
        });
      });
      return errs;
    })()`,
    ctx
  );
  if (problems.length) {
    failed++;
    console.log("  FAIL datos iniciales:\n       " + problems.slice(0, 10).join("\n       "));
  } else console.log("  ok   datos iniciales (3 tripulantes x 31 días)");
}
/* Diccionario ES -> EN: cada traducción debe conservar los "#" (números) y "@" (nombres) de su clave,
   y unos textos de muestra deben traducirse sin internet. */
if (!failed) {
  const problems = vm.runInContext(
    `(() => {
      const errs = [], count = (s, ch) => s.split(ch).length - 1, e = KSTranslate.entries();
      Object.keys(e).forEach(k => {
        if (count(k, "#") !== count(e[k], "#") || count(k, "@") !== count(e[k], "@")) errs.push("marcadores distintos: " + k);
      });
      [["Alerta crítica", "Critical alert"], ["Presión intracraneal (PIC)", "Intracranial pressure (ICP)"],
       ["Evolución de Glucosa en sangre de Juli Diaz", "Evolution of Blood glucose for Juli Diaz"]].forEach(([es, en]) => {
        const r = KSTranslate.tr(es);
        if (!r.ok || r.text !== en) errs.push("traducción inesperada: " + es + " -> " + r.text);
      });
      return errs;
    })()`,
    ctx
  );
  if (problems.length) {
    failed++;
    console.log("  FAIL diccionario inglés:\n       " + problems.slice(0, 10).join("\n       "));
  } else console.log("  ok   diccionario inglés (marcadores y muestras)");
}
console.log(failed ? "\nSMOKE TEST: FALLÓ" : `\nSMOKE TEST: OK (${files.length} archivos)`);
process.exit(failed ? 1 : 0);

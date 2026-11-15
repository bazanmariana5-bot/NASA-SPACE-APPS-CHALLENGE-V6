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
    set(_, k, v) { store[k] = v; return true; },
    has() { return true; },
    apply() { return stub(); },
    construct() { return stub(); },
  });
  return p;
}

const ctx = {
  console,
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  matchMedia: () => ({ matches: false }),
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { hash: "" }, history: { replaceState() {} },
  innerWidth: 1200, innerHeight: 800,
  addEventListener() {},
  document: new Proxy({}, {
    get: (_, k) => k === "addEventListener" ? () => {} : stub(),
  }),
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
console.log(failed ? "\nSMOKE TEST: FALLÓ" : `\nSMOKE TEST: OK (${files.length} archivos)`);
process.exit(failed ? 1 : 0);

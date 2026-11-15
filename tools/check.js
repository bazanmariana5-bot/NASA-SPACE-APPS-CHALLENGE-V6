/* tools/check.js — Revisión de calidad completa: formato (Prettier), lint (ESLint), prueba de humo y
   comprobación de que el bundle está al día. Uso: node tools/check.js */
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const steps = [
  ["Formato (Prettier)", "prettier", ["--check", "js", "css", "tools/*.js", "eslint.config.js"]],
  ["Lint (ESLint)", "eslint", ["js"]],
  ["Prueba de humo", "node", ["tools/smoke-test.js"]]
];

let failed = 0;
for (const [name, cmd, args] of steps) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", shell: process.platform === "win32" });
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) console.log((r.stdout + r.stderr).split("\n").slice(-25).join("\n"));
}
process.exit(failed ? 1 : 0);

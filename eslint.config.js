/* eslint.config.js — Los scripts comparten ámbito global (se cargan por <script> en el orden de index.html),
   así que los nombres declarados al nivel superior de cada archivo se registran aquí como globales. */
"use strict";
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);

const declared = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(__dirname, f), "utf8");
  for (const m of src.matchAll(/^(?:const|let|var|function\*?|async function|class)\s+([A-Za-z_$][\w$]*)/gm))
    declared[m[1]] = "writable";
  /* declaraciones múltiples separadas por coma al nivel superior */
  for (const m of src.matchAll(/^(?:const|let)\s+[^;]*?;/gms)) {
    for (const n of m[0].matchAll(/^(?:const|let)\s+|^,?\s{0,8}([A-Za-z_$][\w$]*)\s*=(?!=)/gm))
      if (n[1]) declared[n[1]] = "writable";
  }
}

const windowGlobals = ["KSLang", "KSSplash", "bettaOpen"]; // asignados con window.X = ...

const browser = Object.fromEntries(
  (
    "window document localStorage navigator location history console setTimeout clearTimeout setInterval clearInterval " +
    "requestAnimationFrame cancelAnimationFrame URL Blob FileReader DOMParser matchMedia speechSynthesis " +
    "SpeechSynthesisUtterance fetch AudioContext webkitAudioContext getComputedStyle CustomEvent Event " +
    "MutationObserver IntersectionObserver ResizeObserver performance Intl Promise requestIdleCallback XMLSerializer Image devicePixelRatio innerWidth innerHeight addEventListener removeEventListener"
  )
    .split(" ")
    .map(n => [n, "readonly"])
);

module.exports = [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...browser, ...declared, ...Object.fromEntries(windowGlobals.map(n => [n, "readonly"])) }
    },
    rules: {
      "no-undef": "error",
      "no-const-assign": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-redeclare": ["error", { builtinGlobals: false }],
      "no-unreachable": "error",
      "no-self-assign": "error",
      "no-unused-labels": "error",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-var": "warn",
      "prefer-const": "warn",
      eqeqeq: ["warn", "always", { null: "ignore" }],
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none", vars: "local" }]
    }
  }
];

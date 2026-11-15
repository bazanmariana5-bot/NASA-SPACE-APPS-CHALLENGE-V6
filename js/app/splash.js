/* js/app/splash.js — Retira la pantalla de carga: espera a que cargue la página y a que pasen
   al menos MIN ms, y la desliza hacia arriba. Avisa con el evento "ks-splash-done". */
"use strict";

window.KSSplash = { done: false };
(() => {
  const MIN = 2000,                 /* tiempo mínimo visible (ms) */
        el = typeof document !== "undefined" && document.getElementById("splash");
  const finish = () => {
    window.KSSplash.done = true;
    if (typeof document.dispatchEvent === "function" && typeof CustomEvent === "function") document.dispatchEvent(new CustomEvent("ks-splash-done"));
  };
  if (!el || typeof setTimeout !== "function") return finish();
  const t0 = Date.now();
  let gone = false;
  const hide = () => {
    if (gone) return;
    gone = true;
    el.classList.add("out");
    el.setAttribute("aria-hidden", "true");
    setTimeout(() => { el.hidden = true; finish(); }, 750);
  };
  const ready = () => setTimeout(hide, Math.max(0, MIN - (Date.now() - t0)));
  if (document.readyState === "complete") ready(); else addEventListener("load", ready);
  setTimeout(hide, 6000);           /* tope: nunca queda trabada */
})();

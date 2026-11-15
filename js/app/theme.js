/* theme.js — Modo claro/oscuro: botón del encabezado, persistencia y sincronía con el sistema. */
"use strict";

(() => {
  const KEY = "ks-theme",
    root = document.documentElement,
    btn = document.getElementById("theme"),
    mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: light)") : null;

  const saved = () => {
    try {
      const t = localStorage.getItem(KEY);
      return t === "light" || t === "dark" ? t : null;
    } catch (e) {
      return null;
    }
  };
  const system = () => (mq && mq.matches ? "light" : "dark");

  function apply(t) {
    root.setAttribute("data-theme", t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#eef2fa" : "#060912");
    if (btn) {
      const label = t === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }
  }

  apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (btn)
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      apply(next);
    });

  /* Mientras la persona no haya elegido, se sigue el cambio de tema del sistema. */
  if (mq && mq.addEventListener)
    mq.addEventListener("change", () => {
      if (!saved()) apply(system());
    });
})();

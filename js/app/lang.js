/* js/app/lang.js — Selector de idioma ES | EN.
   Traduce el texto de la página al inglés con el diccionario incluido en la app (KSTranslate, ver
   js/app/translate.js y los dict-en-*.js): no usa internet, así que funciona igual sin conexión.
   Los textos nuevos que dibuja la app se traducen al aparecer; un texto que no está en el diccionario
   se deja en español. Al volver a ES se restauran los originales. */
(function () {
  "use strict";
  const box = document.getElementById("lang-container");
  if (!box || typeof MutationObserver !== "function" || typeof KSTranslate === "undefined") return;

  const btns = box.querySelectorAll("button[data-lang]"),
    KEY = "ks-lang",
    ATTRS = ["title", "aria-label", "placeholder"],
    SKIP = { SCRIPT: 1, STYLE: 1, CANVAS: 1, TEXTAREA: 1, CODE: 1, NOSCRIPT: 1 },
    orig = new WeakMap() /* nodo o elemento -> texto original en español */,
    TITLE_ES = document.title;
  let lang = "es",
    observer = null,
    busy = false; /* true mientras la propia traducción modifica el DOM (evita bucles) */

  const hasWords = t => /[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}/.test(t);

  function storedLang() {
    try {
      return localStorage.getItem(KEY) === "en" ? "en" : "es";
    } catch (e) {
      return "es";
    }
  }

  function paint(l) {
    btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    document.documentElement.setAttribute("lang", l);
  }

  /* ---- traducción de nodos ---- */
  function translateText(node) {
    const current = node.nodeValue;
    let es = orig.get(node);
    /* si la app escribió un texto nuevo sobre el nodo, ese es el nuevo original */
    if (es === undefined || (current !== es && current !== KSTranslate.tr(es).text)) {
      es = current;
      orig.set(node, es);
    }
    if (!hasWords(es)) return;
    const res = KSTranslate.tr(es);
    if (res.ok && node.nodeValue !== res.text) {
      busy = true;
      node.nodeValue = res.text;
      busy = false;
    }
  }

  function translateAttr(el, attr) {
    const value = el.getAttribute(attr);
    if (!value) return;
    const rec = orig.get(el) || {};
    if (rec[attr] === undefined || (value !== rec[attr] && value !== KSTranslate.tr(rec[attr]).text)) rec[attr] = value;
    orig.set(el, rec);
    const res = hasWords(rec[attr]) ? KSTranslate.tr(rec[attr]) : { ok: false };
    if (res.ok && el.getAttribute(attr) !== res.text) {
      busy = true;
      el.setAttribute(attr, res.text);
      busy = false;
    }
  }

  const skipped = el => el.closest && el.closest(".notranslate,[translate=no]");

  function walk(root) {
    if (root.nodeType === 3) {
      if (root.parentNode && !SKIP[root.parentNode.nodeName]) translateText(root);
      return;
    }
    if (root.nodeType !== 1 || skipped(root)) return;
    ATTRS.forEach(a => {
      if (root.hasAttribute(a)) translateAttr(root, a);
    });
    if (SKIP[root.nodeName]) return; /* scripts, estilos y cajas de texto: solo sus atributos */
    for (let c = root.firstChild; c; c = c.nextSibling) walk(c);
  }

  function restore(root) {
    if (root.nodeType === 3) {
      const es = orig.get(root);
      if (es !== undefined && root.nodeValue !== es) root.nodeValue = es;
      return;
    }
    if (root.nodeType !== 1) return;
    const rec = orig.get(root);
    if (rec) ATTRS.forEach(a => rec[a] !== undefined && root.setAttribute(a, rec[a]));
    for (let c = root.firstChild; c; c = c.nextSibling) restore(c);
  }

  function observe() {
    observer =
      observer ||
      new MutationObserver(list => {
        if (busy || lang !== "en") return;
        list.forEach(m => {
          if (m.type === "characterData") walk(m.target);
          else if (m.type === "attributes") {
            if (m.target.closest && !m.target.closest(".notranslate")) translateAttr(m.target, m.attributeName);
          } else m.addedNodes.forEach(walk);
        });
      });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  function setLang(l) {
    lang = l;
    try {
      localStorage.setItem(KEY, l);
    } catch (e) {
      /* sin almacenamiento: el idioma solo dura esta sesión */
    }
    paint(l);
    if (l === "en") {
      walk(document.body);
      observe();
      const t = KSTranslate.tr(TITLE_ES);
      document.title = t.ok ? t.text : TITLE_ES;
    } else {
      if (observer) observer.disconnect();
      observer = null;
      busy = true;
      restore(document.body);
      busy = false;
      document.title = TITLE_ES;
    }
    document.dispatchEvent(new CustomEvent("ks-lang", { detail: l }));
  }

  box.addEventListener("click", e => {
    const b = e.target.closest("button[data-lang]");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    setLang(b.dataset.lang);
  });

  /* Traduce un texto largo (para la voz de INTI). cb(texto, ok): ok es true si todo se pudo traducir;
     si no, el texto vuelve en español y quien lo dice usa la voz en español. */
  function tr(text, cb) {
    const res = KSTranslate.tr(text);
    cb(res.text, res.ok);
  }

  window.KSLang = {
    get: () => lang,
    tr
  };

  paint(storedLang());
  if (storedLang() === "en") setLang("en");
})();

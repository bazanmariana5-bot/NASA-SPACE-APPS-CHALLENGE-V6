/* js/app/lang.js — Selector de idioma ES | EN.
   Traduce el texto de la página al inglés por sí mismo (sin el widget de Google Translate, que falla
   fuera de un servidor web). Pide cada texto una sola vez y lo guarda en el equipo; los textos nuevos
   que dibuja la app se traducen al aparecer. Al volver a ES se restauran los originales. */
(function () {
  "use strict";
  var box = document.getElementById("lang-container");
  if (!box || typeof fetch !== "function" || typeof MutationObserver !== "function") return;
  var btns = box.querySelectorAll("button[data-lang]"),
      KEY = "ks-lang", CK = "ks-tr-cache-v1",
      ATTRS = ["title", "aria-label", "placeholder"],
      SKIP = { SCRIPT: 1, STYLE: 1, CANVAS: 1, TEXTAREA: 1, CODE: 1, NOSCRIPT: 1 },
      orig = new WeakMap(),      /* nodo o atributo -> texto original en español */
      cache = {}, pending = {}, active = 0, queue = [], lang = "es", mo, busy = false, failed = false;

  try { cache = JSON.parse(localStorage.getItem(CK) || "{}") || {}; } catch (e) { cache = {}; }
  var saveT = 0;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(function () { try { localStorage.setItem(CK, JSON.stringify(cache)); } catch (e) {} }, 800);
  }

  var names = (typeof CREW !== "undefined" ? CREW : []).map(function (c) { return c.name; });
  var worth = function (t) { return /[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}/.test(t) && names.indexOf(t.trim()) < 0; };

  function stored() { try { var v = localStorage.getItem(KEY); return v === "en" ? "en" : "es"; } catch (e) { return "es"; } }
  function paint(l) {
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    document.documentElement.setAttribute("lang", l);
  }

  /* ---- petición de traducción (límite de 6 a la vez) ---- */
  function pump() {
    while (active < 6 && queue.length) {
      (function (txt) {
        active++;
        fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=" + encodeURIComponent(txt))
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (j) {
            cache[txt] = (j[0] || []).map(function (s) { return s[0]; }).join("");
            save();
          })
          .catch(function () { failed = true; })
          .then(function () {
            active--;
            var fns = pending[txt] || []; delete pending[txt];
            fns.forEach(function (f) { f(); });
            pump();
            if (!active && !queue.length && failed && lang === "en") note();
          });
      })(queue.shift());
    }
  }
  function need(txt, done) {
    if (pending[txt]) { pending[txt].push(done); return; }
    pending[txt] = [done];
    queue.push(txt);
    pump();
  }
  function note() {
    failed = false;
    var t = document.getElementById("toast");
    if (t) { t.textContent = "No se pudo traducir: revisa tu conexión a internet."; t.classList.add("on"); setTimeout(function () { t.classList.remove("on"); }, 4000); }
  }

  /* ---- aplicar a nodos ---- */
  function setText(n, es) {
    var en = cache[es.trim()];
    if (!en) return false;
    var lead = es.match(/^\s*/)[0], trail = es.match(/\s*$/)[0];
    if (n.nodeValue !== lead + en + trail) { busy = true; n.nodeValue = lead + en + trail; busy = false; }
    return true;
  }
  function doText(n) {
    var cur = n.nodeValue, es = orig.get(n);
    if (es === undefined || (cur !== es && cache[es.trim()] && cur !== null && cur.trim() !== cache[es.trim()])) { es = cur; orig.set(n, es); }
    var t = es.trim();
    if (!worth(t)) return;
    if (!setText(n, es)) need(t, function () { if (lang === "en" && orig.get(n) === es) setText(n, es); });
  }
  function doAttr(el, a) {
    var key = el.getAttribute(a);
    if (!key) return;
    var rec = orig.get(el) || {};
    if (rec[a] === undefined || (key !== rec[a] && key !== cache[rec[a]])) rec[a] = key;
    orig.set(el, rec);
    var es = rec[a];
    if (!worth(es)) return;
    var apply = function () { if (lang === "en" && cache[es] && el.getAttribute(a) !== cache[es]) { busy = true; el.setAttribute(a, cache[es]); busy = false; } };
    if (cache[es]) apply(); else need(es, apply);
  }
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentNode && !SKIP[root.parentNode.nodeName]) doText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName] || (root.closest && root.closest(".notranslate,[translate=no]"))) return;
    ATTRS.forEach(function (a) { if (root.hasAttribute(a)) doAttr(root, a); });
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }

  function restore(root) {
    if (root.nodeType === 3) { var es = orig.get(root); if (es !== undefined && root.nodeValue !== es) root.nodeValue = es; return; }
    if (root.nodeType !== 1) return;
    var rec = orig.get(root);
    if (rec) ATTRS.forEach(function (a) { if (rec[a] !== undefined) root.setAttribute(a, rec[a]); });
    for (var c = root.firstChild; c; c = c.nextSibling) restore(c);
  }

  function observe() {
    mo = mo || new MutationObserver(function (list) {
      if (busy || lang !== "en") return;
      list.forEach(function (m) {
        if (m.type === "characterData") walk(m.target);
        else if (m.type === "attributes") { if (m.target.closest && !m.target.closest(".notranslate")) doAttr(m.target, m.attributeName); }
        else m.addedNodes.forEach(walk);
      });
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function set(l) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    paint(l);
    if (l === "en") { walk(document.body); observe(); }
    else { if (mo) mo.disconnect(); mo = null; busy = true; restore(document.body); busy = false; }
    document.dispatchEvent(new CustomEvent("ks-lang", { detail: l }));
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-lang]");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    set(b.dataset.lang);
  });

  window.KSLang = { get: function () { return lang; } };
  paint(stored());
  if (stored() === "en") set("en");
})();

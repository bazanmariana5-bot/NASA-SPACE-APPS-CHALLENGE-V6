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

  /* ---- petición de traducción ----
     Varios textos viajan en una sola petición (separados por saltos de línea) y se reparten al volver;
     si la respuesta no trae las mismas líneas, cada texto se pide por separado. Hasta 3 peticiones a la vez
     y 2 reintentos con espera creciente si falla la red. */
  var MAXB = 3, BCH = 1400, BN = 24, tries = {}, stat = null, statT = 0;

  function pendingCount() { return Object.keys(pending).length; }
  function showStat() {
    clearTimeout(statT);
    statT = setTimeout(function () {
      var n = pendingCount();
      if (!stat) {
        stat = document.createElement("div");
        stat.className = "trstat notranslate";
        stat.setAttribute("translate", "no");
        stat.setAttribute("role", "status");
        document.body.appendChild(stat);
      }
      stat.textContent = n && lang === "en" ? "Translating… (" + n + ")" : "";
      stat.classList.toggle("on", !!(n && lang === "en"));
    }, 120);
  }
  function trim() {
    var ks = Object.keys(cache);
    if (ks.length > 6000) { ks.slice(0, 3000).forEach(function (k) { delete cache[k]; }); }
  }
  function resolve(txt) {
    var fns = pending[txt] || []; delete pending[txt];
    fns.forEach(function (f) { f(); });
  }
  function fail(batch, soft) {
    batch.forEach(function (txt) {
      tries[txt] = (tries[txt] || 0) + 1;
      if (tries[txt] <= 2) { setTimeout(function () { queue.push(txt); pump(); }, 700 * tries[txt]); }
      else { failed = true; resolve(txt); }
    });
  }
  function ask(batch, single, done) {
    var q = single ? batch[0] : batch.join("\n");
    fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=" + encodeURIComponent(q))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        var full = (j[0] || []).map(function (s) { return s[0] || ""; }).join("");
        if (single) { cache[batch[0]] = full; save(); resolve(batch[0]); }
        else {
          var parts = full.replace(/\n+$/, "").split("\n");
          if (parts.length === batch.length) {
            batch.forEach(function (t, i) { cache[t] = parts[i].trim() || t; resolve(t); });
            save();
          } else { batch.forEach(function (t) { single1.push(t); }); }   /* no coincide: pedir de a uno */
        }
      })
      .catch(function () { fail(batch, single); })
      .then(function () { done(); });
  }
  var single1 = [];
  function pump() {
    while (active < MAXB && (queue.length || single1.length)) {
      var batch = [], single = false, len = 0;
      if (single1.length) { batch = [single1.shift()]; single = true; }
      else {
        while (queue.length && batch.length < BN && len + queue[0].length < BCH) {
          var t = queue.shift();
          if (/\n/.test(t)) { if (!batch.length) { batch = [t]; single = true; } else queue.unshift(t); break; }
          batch.push(t); len += t.length;
        }
        if (!batch.length) batch = [queue.shift()], single = true;
      }
      active++;
      ask(batch, single, function () {
        active--; trim(); showStat();
        pump();
        if (!active && !queue.length && !single1.length && failed && lang === "en") note();
      });
    }
    showStat();
  }
  function need(txt, done) {
    if (pending[txt]) { pending[txt].push(done); return; }
    pending[txt] = [done];
    queue.push(txt);
    clearTimeout(need.t);
    need.t = setTimeout(pump, 30);               /* junta lo que llegue en 30 ms en una sola petición */
    showStat();
  }
  function note() {
    failed = false;
    var t = document.getElementById("toast");
    if (t) { t.textContent = "No se pudo traducir parte del texto: revisa tu conexión a internet."; t.classList.add("on"); setTimeout(function () { t.classList.remove("on"); }, 4000); }
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
    titleSwap(l);
    document.dispatchEvent(new CustomEvent("ks-lang", { detail: l }));
    showStat();
  }
  var T0 = document.title;
  function titleSwap(l) {
    if (l === "en") {
      if (cache[T0]) document.title = cache[T0];
      else need(T0, function () { if (lang === "en" && cache[T0]) document.title = cache[T0]; });
    } else document.title = T0;
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-lang]");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    set(b.dataset.lang);
  });

  /* Traduce un texto largo línea por línea (para la voz de INTI). cb(texto, ok) */
  function tr(text, cb) {
    var lines = String(text).split(/(?<=[.:;])\s+|\n/).filter(function (x) { return x.trim(); }), left = lines.length, out = [], over = false, fired = false;
    if (!left) return cb("", false);
    var fire = function (ok) { if (fired) return; fired = true; clearTimeout(tm); cb(lines.map(function (q, i) { return out[i] || cache[q.trim()] || q; }).join(" "), ok); },
        tm = setTimeout(function () { over = true; fire(false); }, 3500);   /* sin red: habla en español en vez de quedarse callada */
    lines.forEach(function (ln, i) {
      var t = ln.trim(), fin = function () { out[i] = cache[t] || t; if (!--left && !over) fire(lines.every(function (q) { return cache[q.trim()]; })); };
      if (cache[t]) fin(); else need(t, fin);
    });
  }
  window.KSLang = { get: function () { return lang; }, tr: tr };
  paint(stored());
  if (stored() === "en") set("en");
})();

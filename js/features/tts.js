/* js/features/tts.js — Motor de voz compartido (INTI, saludo y alertas).
   - Elige la voz más natural del dispositivo para cada idioma (o la que la persona elija).
   - Espera a que el navegador cargue sus voces.
   - Divide los textos largos en frases (Chrome corta las locuciones largas) y las dice en cola.
   - Pronuncia unidades y decimales como se dicen (mmHg, ms, %, 93,0 -> 93.0 en inglés).
   - Si el navegador exige un toque antes de hablar, queda en espera y habla en el primer toque. */
"use strict";

const TTS = (() => {
  const ok = typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined",
        PREF = {
          es: ["natural", "online", "neural", "paulina", "sabina", "helena", "monica", "mónica", "dalia", "elvira", "salome", "lucia", "lucía", "marisol", "elena", "laura", "google español", "female"],
          en: ["natural", "online", "neural", "aria", "jenny", "ava", "samantha", "serena", "karen", "moira", "allison", "zira", "google us english", "female"]
        },
        MALE = /(jorge|diego|juan|carlos|pablo|raul|raúl|david|mark|james|george|alex|daniel|guy|ryan|male)/,
        LKEY = "ks-tts-voice-";

  let queue = [], cur = null, speaking = false, waiting = null, token = 0;

  const lang = () => (typeof KSLang !== "undefined" && KSLang.get() === "en") ? "en" : "es";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const emit = () => { try { document.dispatchEvent(new CustomEvent("ks-tts", { detail: { speaking } })); } catch (e) {} };

  /* Voces disponibles para el idioma, la mejor primero */
  function score(v, l) {
    const n = v.name.toLowerCase();
    let sc = 0;
    PREF[l].forEach((k, i) => { if (n.includes(k)) sc += (k === "natural" || k === "neural" || k === "online") ? 30 : 20 - Math.min(i, 15); });
    if (/(es-ar|es-mx|es-us|es-es|en-us|en-gb)/.test(v.lang.toLowerCase())) sc += 2;
    if (MALE.test(n) && !n.includes("female")) sc -= 12;
    if (/espeak|compact/.test(n)) sc -= 20;
    return sc;
  }
  function voices(l = lang()) {
    if (!ok) return [];
    return speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith(l)).sort((a, b) => score(b, l) - score(a, l));
  }
  function pick(l = lang()) {
    const vs = voices(l), chosen = store.get(LKEY + l);
    return (chosen && vs.find(v => v.name === chosen)) || vs[0] || null;
  }
  function choose(name, l = lang()) { store.set(LKEY + l, name || ""); }

  /* Texto para decir: unidades y números como se pronuncian */
  const UNITS = {
    es: [[/\bmmHg\b/g, "milímetros de mercurio"], [/\bms\b/g, "milisegundos"], [/\bm\/s\b/g, "metros por segundo"], [/\bml\/100 g\/min\b/g, "mililitros por cien gramos por minuto"], [/\bbpm\b/gi, "latidos por minuto"], [/\bmg\/dL\b/g, "miligramos por decilitro"], [/\bHz\b/g, "hercios"], [/\bkg\b/g, "kilos"], [/ ?%/g, " por ciento"], [/ ?°/g, " grados"], [/\bPIC\b/g, "presión intracraneal"], [/\bEVA\b/g, "E V A"], [/\bEEG\b/g, "E E G"], [/CO₂/g, "dióxido de carbono"], [/\bSpO₂\b/g, "saturación de oxígeno"]],
    en: [[/\bmmHg\b/g, "millimeters of mercury"], [/\bms\b/g, "milliseconds"], [/\bm\/s\b/g, "meters per second"], [/\bbpm\b/gi, "beats per minute"], [/\bmg\/dL\b/g, "milligrams per deciliter"], [/\bHz\b/g, "hertz"], [/\bkg\b/g, "kilograms"], [/ ?%/g, " percent"], [/ ?°/g, " degrees"], [/\bEVA\b/g, "E V A"], [/\bEEG\b/g, "E E G"], [/CO₂/g, "carbon dioxide"], [/\bSpO₂\b/g, "oxygen saturation"]]
  };
  function clean(t, l) {
    let x = String(t).replace(/<[^>]+>/g, " ").replace(/\n+/g, ". ").replace(/^- /gm, "").replace(/\s*[·|]\s*/g, ", ").replace(/[“”"]/g, "").replace(/\s{2,}/g, " ");
    if (l === "en") x = x.replace(/(\d),(\d)/g, "$1.$2");
    (UNITS[l] || []).forEach(r => { x = x.replace(r[0], r[1]); });
    return x.replace(/\.\s*\./g, ".").replace(/:\s*\./g, ":").trim();
  }
  function chunks(t) {
    /* frases completas (el punto de un decimal como 12.5 no corta) agrupadas hasta ~170 caracteres: menos pausas robóticas */
    const out = [];
    let acc = "";
    const push = s => { s = s.trim(); if (s) out.push(s); };
    String(t).split(/(?<=[.!?;])\s+/).forEach(sent => {
      while (sent.length > 190) {
        let i = sent.lastIndexOf(",", 190); if (i < 60) i = sent.lastIndexOf(" ", 190);
        if (acc) { push(acc); acc = ""; }
        push(sent.slice(0, i + 1)); sent = sent.slice(i + 1).trim();
      }
      if ((acc + " " + sent).length > 170) { push(acc); acc = sent; } else acc = acc ? acc + " " + sent : sent;
    });
    push(acc);
    return out;
  }

  function stop() {
    token++; queue = []; waiting = null;
    if (ok) try { speechSynthesis.cancel(); } catch (e) {}
    if (speaking) { speaking = false; emit(); }
  }

  function next(my, l, v, opts) {
    if (my !== token) return;
    if (!queue.length) { speaking = false; emit(); if (opts && opts.onend) opts.onend(); return; }
    const u = new SpeechSynthesisUtterance(queue.shift());
    u.lang = v ? v.lang : (l === "en" ? "en-US" : "es-AR");
    if (v) u.voice = v;
    u.rate = (opts && opts.rate) || .93;
    u.pitch = 1.05;
    u.volume = 1;
    u.onstart = () => { if (my !== token) return; if (!speaking) { speaking = true; emit(); } if (opts && opts.onstart && !opts._s) { opts._s = 1; opts.onstart(); } };
    u.onend = () => setTimeout(() => next(my, l, v, opts), 60);
    u.onerror = e => {
      if (my !== token) return;
      if (e && e.error === "not-allowed") { waiting = () => speakNow(opts._txt, l, opts); return; }
      if (e && (e.error === "canceled" || e.error === "interrupted")) return;
      next(my, l, v, opts);
    };
    try { speechSynthesis.speak(u); } catch (e) {}
  }

  function speakNow(text, l, opts) {
    stop();
    const my = token;
    opts = opts || {}; opts._txt = text; opts._s = 0;
    queue = chunks(clean(text, l));
    if (!queue.length) return;
    const go = () => { if (my === token) next(my, l, pick(l), opts); };
    if (speechSynthesis.getVoices().length) go();
    else {                                      /* las voces cargan de forma asíncrona */
      let done = false;
      const f = () => { if (done) return; done = true; speechSynthesis.removeEventListener && speechSynthesis.removeEventListener("voiceschanged", f); go(); };
      speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", f);
      setTimeout(f, 900);
    }
  }

  /* Dice un texto en español; si el idioma elegido es inglés lo traduce antes.
     opts: { onstart, onend, rate, lang: "es"|"en" (fuerza el idioma del texto, sin traducir) } */
  function speak(textEs, opts) {
    if (!ok || !textEs) return;
    opts = opts || {};
    const l = lang();
    if (opts.lang || l === "es" || typeof KSLang === "undefined" || !KSLang.tr) return speakNow(textEs, opts.lang || "es", opts);
    const my = ++token;
    KSLang.tr(textEs, (t, done) => { if (my === token) speakNow(t, done ? "en" : "es", opts); });
  }

  const unlock = () => { if (waiting) { const w = waiting; waiting = null; w(); } };
  if (typeof addEventListener === "function") ["pointerdown", "keydown"].forEach(t => addEventListener(t, unlock, { passive: true }));
  if (typeof document !== "undefined" && document.addEventListener) document.addEventListener("ks-lang", stop);

  return { speak, stop, voices, pick, choose, get speaking() { return speaking; }, get supported() { return ok; }, lang };
})();

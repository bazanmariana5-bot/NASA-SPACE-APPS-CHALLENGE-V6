/* js/features/voice.js — Aviso hablado de las emergencias (síntesis de voz del navegador).
   Dice el mensaje al abrirse la alerta y lo repite cada pocos segundos hasta que se cierra.
   Si el navegador bloquea el audio hasta que la persona toque la pantalla, queda en espera y
   habla en el primer toque. La preferencia de silencio se guarda en el equipo. */
"use strict";

const Voice = (() => {
  const KEY = "ks-voice-muted",
        EVERY = 11000,
        ok = typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";

  let muted = false,
      timer = null,
      current = null,   /* { es, en } mensaje activo */
      waiting = false;  /* el navegador exigió un toque antes de hablar */

  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) {}

  /* La página se traduce con Google Translate: KSLang dice el idioma que la persona eligió. */
  const lang = () => (typeof KSLang !== "undefined" && KSLang.get() === "en") ? "en" : "es";

  function voiceFor(l) {
    const vs = speechSynthesis.getVoices();
    return vs.find(v => v.lang.toLowerCase().startsWith(l === "en" ? "en" : "es-") && v.localService) ||
           vs.find(v => v.lang.toLowerCase().startsWith(l)) || null;
  }

  function say() {
    if (!ok || muted || !current) return;
    const l = lang(),
          u = new SpeechSynthesisUtterance(current[l]);
    u.lang = l === "en" ? "en-US" : "es-AR";
    const v = voiceFor(l);
    if (v) u.voice = v;
    u.rate = .92;
    u.pitch = 1;
    u.volume = 1;
    u.onerror = e => { if (e.error === "not-allowed") waiting = true; };
    u.onstart = () => { waiting = false; };
    try {
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* Primer toque o tecla: si el navegador había bloqueado el audio, habla ahora. */
  const unlock = () => { if (waiting && current) { waiting = false; say(); } };
  ["pointerdown", "keydown"].forEach(t => addEventListener(t, unlock, { passive: true }));

  function start(msg) {
    stop();
    current = msg;
    say();
    timer = setInterval(say, EVERY);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    current = null;
    waiting = false;
    if (ok) try { speechSynthesis.cancel(); } catch (e) {}
  }

  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {}
    if (muted) { if (ok) try { speechSynthesis.cancel(); } catch (e) {} }
    else say();
  }

  if (ok && speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", () => {});

  return { start, stop, setMuted, get muted() { return muted; }, get supported() { return ok; } };
})();

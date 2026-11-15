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
    current = null; /* { es, en } mensaje activo */

  try {
    muted = localStorage.getItem(KEY) === "1";
  } catch (e) {}

  /* El motor TTS elige la mejor voz y el idioma (ES o EN) de la página. */
  function say(repeat) {
    if (!ok || muted || !current) return;
    if (repeat && TTS.speaking) return; /* no interrumpir una locución en curso */
    const en = TTS.lang() === "en" && current.en;
    TTS.speak(en ? current.en : current.es, { lang: en ? "en" : "es" });
  }

  function start(msg) {
    stop();
    current = msg;
    say();
    timer = setInterval(() => say(true), EVERY);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    current = null;
    TTS.stop();
  }

  function setMuted(m) {
    muted = !!m;
    try {
      localStorage.setItem(KEY, muted ? "1" : "0");
    } catch (e) {}
    if (muted) TTS.stop();
    else say();
  }

  if (ok && speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", () => {});

  return {
    start,
    stop,
    setMuted,
    get muted() {
      return muted;
    },
    get supported() {
      return ok;
    }
  };
})();

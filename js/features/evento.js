/* js/features/evento.js — Evento programado de la demostración.
   A los 90 segundos de abrir la página, uno de los tripulantes sufre un infarto: se le suben la frecuencia
   cardíaca y la presión y salta la emergencia vital (ver showVital en alerts.js).
   Los valores del evento viven solo en memoria: no se guardan en el registro y desaparecen al recargar. */
"use strict";

const LiveEvent = (() => {
  const DELAY_MS = 90000;
  /* Valores durante el infarto; la frecuencia cardíaca supera el límite de emergencia (EMERG). */
  const VALUES = { "corazon.hr": 188, "corazon.sbp": 84, "corazon.hrv": 18 };
  let crewId = null;

  /* Valor forzado de un parámetro del tripulante afectado en el día actual de la misión. */
  const value = (cid, key, day) =>
    crewId === cid && day === S.today && VALUES[key] !== undefined ? VALUES[key] : undefined;

  /* Emergencia con el mismo formato que devuelve findEmergencies(). */
  function emergency() {
    if (!crewId || S.day !== S.today) return null;
    const cr = CREW.find(c => c.id === crewId),
      z = ZONES.find(q => q.id === "corazon");
    if (!cr || !z) return null;
    const r = Engine.ev(z, C(S.day, cr), cr.id).rows.find(x => x.p.id === "hr");
    return r ? { cr, z, r, txt: "un infarto agudo de miocardio", arrest: false, infarct: true } : null;
  }

  function start(id) {
    const pick = id || CREW[Math.floor(Math.random() * CREW.length)].id;
    crewId = pick;
    render();
    checkAndTriggerAlerts(true);
  }

  if (CREW.length) setTimeout(() => start(), DELAY_MS);

  return {
    value,
    emergency,
    start,
    DELAY_MS,
    get crewId() {
      return crewId;
    }
  };
})();

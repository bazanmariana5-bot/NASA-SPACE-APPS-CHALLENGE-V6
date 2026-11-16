/* js/features/evento.js — Evento programado de la demostración.
   Al minuto de abrir la página, uno de los tripulantes sufre un paro cardiorrespiratorio: el pulso y la presión
   caen a cero y salta la emergencia vital con aviso de desfibrilador (ver showVital en alerts.js).
   Los valores del evento viven solo en memoria: no se guardan en el registro y desaparecen al recargar. */
"use strict";

const LiveEvent = (() => {
  const DELAY_MS = 60000;
  /* Valores durante el paro; la frecuencia cardíaca queda por debajo del límite de EMERG ("paro"). */
  const VALUES = { "corazon.hr": 0, "corazon.sbp": 0, "corazon.hrv": 0 };
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
    return r ? { cr, z, r, txt: "paro cardiorrespiratorio", arrest: true } : null;
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

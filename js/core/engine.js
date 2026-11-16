/* js/core/engine.js — Motor fisiológico: evalúa parámetros, estados y alertas. */
"use strict";

/* ---------- PhysiologyEngine ---------- */
const Engine = {
  ev(z, c = C(), cid = S.crew) {
    const rec = Store.get(cid, S.day),
      rows = z.p.map(p => {
        const k = z.id + "." + p.id,
          real = !!(rec && rec.v && rec.v[k] != null),
          forced = typeof LiveEvent !== "undefined" ? LiveEvent.value(cid, k, S.day) : undefined,
          v = forced !== undefined ? forced : real ? rec.v[k] : p.v(c);
        return { p, v, real, s: stat(p, v), sv: sev(p, v) };
      });
    return { rows, st: rows.length ? Math.max(...rows.map(r => r.s)) : 3, real: rows.some(r => r.real) };
  },
  alerts(cr = crewOf()) {
    const o = [];
    ZONES.forEach(z =>
      this.ev(z, C(S.day, cr), cr.id).rows.forEach(r => {
        if (r.s > 0) o.push({ z, r });
      })
    );
    return o;
  },
  summary(cr) {
    const n = [0, 0, 0];
    ZONES.forEach(z => {
      const s = this.ev(z, C(S.day, cr), cr.id).st;
      if (s < 3) n[s]++;
    });
    return { n, w: n[2] ? 2 : n[1] ? 1 : 0 };
  },
  cross(al) {
    const g = id => al.find(a => a.z.id + "." + a.r.p.id === id),
      m = [];
    if (g("sueno.sq") && g("cognicion.cog"))
      m.push(
        "Deterioro cognitivo por déficit de sueño: siesta estratégica de 25 min y luz azul enriquecida antes de reevaluar."
      );
    if (g("reaccion.rt"))
      m.push(
        "Fatiga neuroconductual: reevaluar o descansar 20 min antes de autorizar tareas de precisión; EVA sin habilitar si el puntaje es 4 o menos."
      );
    if (g("cognicion.lat") && (g("cognicion.lap") || g("esfuerzo.co2")))
      m.push(
        "Posible hipercapnia de cabina: revisar los depuradores de CO₂ antes de atribuirlo a fatiga del tripulante."
      );
    if (g("estres.pss") || g("estres.cort") || g("estres.lfhf") || g("estres.eda"))
      m.push(
        g("sueno.sq") || g("sueno.tst")
          ? "Estrés elevado con sueño alterado: priorizar el descanso, respiración lenta de 5 minutos y llamada con Tierra; el sueño corto sostiene el estrés."
          : "Estrés elevado: pausa de respiración diafragmática de 5 minutos, ejercicio aeróbico suave, contacto con la familia o con Tierra y aviso a la médica de vuelo si persiste más de 48 horas."
      );
    if (g("cerebro.pic") || g("cerebro.ppc"))
      m.push(
        "Presión intracraneal o de perfusión cerebral alterada: reposo con la cabeza elevada, evitar maniobras de esfuerzo (Valsalva) y avisar al médico de vuelo."
      );
    if (g("cerebro.gcs"))
      m.push(
        "Glasgow menor a 15: reevaluar el nivel de conciencia, revisar oxígeno y CO₂ de la cabina y avisar de inmediato al médico de vuelo."
      );
    return m;
  }
};

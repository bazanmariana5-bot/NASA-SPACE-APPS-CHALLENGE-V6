/* js/core/store.js — Persistencia de registros (localStorage) y carga de los datos iniciales. */
"use strict";

const Store = {
  K: "orbital_logs_v4",
  SEED_FLAG: "orbital_seed_v4",
  ver: 0,
  _raw: null,
  _cache: {},

  /* Todos los registros: { tripulante: { día: { v: {zona.param: valor}, t, n, zn } } }. */
  all() {
    try {
      const raw = localStorage.getItem(this.K) || "{}";
      if (raw !== this._raw) {
        this._cache = JSON.parse(raw);
        this._raw = raw;
      }
      return this._cache;
    } catch (e) {
      return {};
    }
  },

  days(c) {
    return this.all()[c] || {};
  },

  get(c, d) {
    return this.days(c)[d];
  },

  /* Escribe el objeto completo y avisa a la interfaz (ver) de que hubo un cambio. */
  _save(all) {
    localStorage.setItem(this.K, JSON.stringify(all));
    this.ver++;
  },

  /* Devuelve (creándolo si falta) el registro de un día. */
  _slot(all, c, d) {
    const byDay = (all[c] = all[c] || {});
    return (byDay[d] = byDay[d] || { v: {}, t: {} });
  },

  put(c, d, patch) {
    try {
      const all = this.all(),
        rec = this._slot(all, c, d);
      Object.assign(rec.v, cleanV(patch.v));
      Object.assign(rec.t, patch.t || {});
      if (patch.n != null) rec.n = patch.n;
      this._save(all);
    } catch (e) {
      /* almacenamiento lleno o bloqueado: la app sigue funcionando sin guardar */
    }
  },

  setZone(c, d, zid, v, n) {
    try {
      const all = this.all(),
        rec = this._slot(all, c, d),
        empty = o => !Object.keys(o || {}).length;
      Object.keys(rec.v).forEach(k => {
        if (k.indexOf(zid + ".") === 0) delete rec.v[k];
      });
      Object.assign(rec.v, cleanV(v));
      rec.zn = rec.zn || {};
      if (n) rec.zn[zid] = n;
      else delete rec.zn[zid];
      if (empty(rec.v) && empty(rec.t) && empty(rec.zn) && !rec.n) delete all[c][d];
      this._save(all);
    } catch (e) {
      /* ver put() */
    }
  },

  del(c, d) {
    try {
      const all = this.all();
      if (all[c]) delete all[c][d];
      this._save(all);
    } catch (e) {
      /* ver put() */
    }
  },

  /* Carga los datos iniciales (SEED, días 0 a 30). Sin `force` se hace una sola vez y
     solo rellena lo que falta; con `force` restaura los valores originales de esos días
     (los registros que la persona agregó en otros días no se tocan). */
  seed(force = false) {
    try {
      if (typeof SEED === "undefined") return 0;
      if (!force && localStorage.getItem(this.SEED_FLAG)) return 0;
      /* Si el navegador tenía la versión anterior de los datos, se reemplaza por la nueva. */
      if (localStorage.getItem("orbital_seed_v1") || localStorage.getItem("orbital_seed_v2") || localStorage.getItem("orbital_seed_v3")) force = true;
      const all = this.all();
      let n = 0;
      Object.entries(SEED).forEach(([c, params]) => {
        Object.entries(params).forEach(([key, series]) => {
          series.forEach((value, d) => {
            const rec = this._slot(all, c, d);
            if (force || rec.v[key] == null) {
              rec.v[key] = value;
              n++;
            }
          });
        });
      });
      this._save(all);
      localStorage.setItem(this.SEED_FLAG, "1");
      localStorage.removeItem("orbital_seed_v1");
      localStorage.removeItem("orbital_seed_v2");
      localStorage.removeItem("orbital_seed_v3");
      return n;
    } catch (e) {
      return 0;
    }
  }
};

Store.seed();

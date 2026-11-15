/* js/core/store.js — Persistencia de registros (localStorage). */
"use strict";

/* ---------- StorageManager ---------- */
const Store = {
  K: "orbital_logs_v4",
  ver: 0,
  _r: null,
  _o: {},
  all() {
    try {
      const r = localStorage.getItem(this.K) || "{}";
      if (r !== this._r) { this._o = JSON.parse(r); this._r = r; }
      return this._o;
    } catch (e) { return {}; }
  },
  days(c) { return this.all()[c] || {}; },
  get(c, d) { return this.days(c)[d]; },
  put(c, d, patch) {
    try {
      const a = this.all(),
            r = (a[c] = a[c] || {})[d] = a[c][d] || { v: {}, t: {} };
      Object.assign(r.v, cleanV(patch.v));
      Object.assign(r.t, patch.t || {});
      if (patch.n != null) r.n = patch.n;
      (localStorage.setItem(this.K, JSON.stringify(a)), Store.ver++);
    } catch (e) {}
  },
  setZone(c, d, zid, v, n) {
    try {
      const a = this.all(),
            r = (a[c] = a[c] || {})[d] = a[c][d] || { v: {}, t: {} };
      Object.keys(r.v).forEach(k => { if (k.indexOf(zid + ".") === 0) delete r.v[k]; });
      Object.assign(r.v, cleanV(v));
      r.zn = r.zn || {};
      if (n) r.zn[zid] = n; else delete r.zn[zid];
      if (!Object.keys(r.v).length && !Object.keys(r.t || {}).length && !Object.keys(r.zn).length && !r.n) delete a[c][d];
      (localStorage.setItem(this.K, JSON.stringify(a)), Store.ver++);
    } catch (e) {}
  },
  del(c, d) {
    try {
      const a = this.all();
      if (a[c]) delete a[c][d];
      (localStorage.setItem(this.K, JSON.stringify(a)), Store.ver++);
    } catch (e) {}
  }
};

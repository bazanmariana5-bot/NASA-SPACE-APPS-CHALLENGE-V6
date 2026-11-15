/* nav.js — enrutador por hash, ciclo de vida de vistas (v-if), menú jerárquico y drawer. Se carga después de apps.js. */
"use strict";

/* Vistas: solo la activa existe en el DOM; al cambiar de pestaña la anterior se desmonta. */
const VIEWS = {
  panel: viewPanel,
  registro: viewRegistro,
  mente: viewTests,
  riesgos: viewRisks,
  plan: viewPlan,
  huesos: () => viewBody("huesos"),
  musculos: () => viewBody("musculos"),
  organos: () => viewBody("organos"),
  betta: viewBetta,
  hud: viewHud
};

/* Árbol del menú. Hoja: n=texto, z=zona, p=parámetro, a=ancla, x=estado extra. Las zonas no listadas se agregan solas. */
const MENU = [
  {
    id: "panel",
    n: "Panel y comparativas",
    tab: "panel",
    k: [
      { n: "Panel general de la tripulación", x: { cmp: 0, cat: "all" } },
      { n: "Comparativas entre tripulantes", x: { cmp: 1 } }
    ]
  },
  {
    id: "huesos",
    n: "Capa de Huesos",
    tab: "huesos",
    k: [
      { n: "Cráneo", z: "craneo" },
      { n: "Columna cervical", z: "cervical" },
      { n: "Columna torácica", z: "toracica" },
      { n: "Columna lumbar", z: "lumbar", p: "dhp" },
      { n: "Pelvis", z: "pelvis" },
      { n: "Fémur", z: "femur" },
      { n: "Tibia", z: "tibia" },
      { n: "Calcáneo (QUS)", z: "pie", p: "si" }
    ]
  },
  {
    id: "musculos",
    n: "Capa de Músculos",
    tab: "musculos",
    k: [
      { n: "Esternocleidomastoideo", z: "ecm" },
      { n: "Trapecio superior", z: "trapecio" },
      { n: "Esplenio del cuello", z: "esplenio" },
      { n: "Largo del cuello y de la cabeza", z: "largocuello" },
      { n: "Multífidos cervicales", z: "multifidos" },
      { n: "Cuádriceps", z: "muslo", p: "quad" },
      { n: "Pantorrilla", z: "pantorrilla", p: "sur" },
      { n: "Core", z: "core" },
      { n: "Brazos", z: "brazos" },
      { n: "Composición corporal (BIA)", z: "bia", p: "ffm" }
    ]
  },
  {
    id: "organos",
    n: "Órganos y sistemas",
    tab: "organos",
    k: [
      { n: "Cardiovascular", z: "corazon", p: "lvef" },
      { n: "Cuello: yugular y carótida", z: "vasos" },
      { n: "Pulmonar", z: "pulmones", p: "fvc" },
      { n: "Sistema nervioso central", z: "cerebro", p: "fsc" },
      { n: "Renal", z: "rinones", p: "cal" },
      { n: "Metabólico", z: "higado", p: "glu" }
    ]
  },
  {
    id: "mente",
    n: "Evaluaciones y pruebas",
    tab: "mente",
    k: [
      { n: "Sueño", z: "sueno" },
      { n: "Memoria de 10 colores", z: "cognicion" },
      { n: "PVT de reacción", z: "reaccion" },
      { n: "Ánimo", z: "animo" },
      { n: "Prueba de esfuerzo (CEVIS)", z: "esfuerzo" }
    ]
  },
  {
    id: "registro",
    n: "Registro diario",
    tab: "registro",
    k: [
      { n: "Registro de huesos", x: { rl: "huesos" } },
      { n: "Registro de músculos", x: { rl: "musculos" } },
      { n: "Registro de órganos", x: { rl: "organos" } }
    ]
  },
  {
    id: "riesgos",
    n: "Peligros NASA y guía clínica",
    tab: "riesgos",
    k: [
      { n: "Peligros NASA", a: "hz" },
      { n: "Guía clínica de indicadores", a: "guia" },
      { n: "Recursos oficiales", a: "rec" }
    ]
  },
  {
    id: "plan",
    n: "Plan de ejercicio",
    tab: "plan",
    k: [
      { n: "Receta del día", a: "pl-hoy" },
      { n: "Casco lastrado cervical", a: "pl-casco" },
      { n: "Estabilización para el regreso", a: "pl-regreso" },
      { n: "Todas las rutinas", a: "pl-rut" }
    ]
  },
  { id: "betta", n: "Traje INTI", tab: "betta", k: [] },
  { id: "hud", n: "Casco HUD", tab: "hud", k: [] }
];

const AUTO = ["huesos", "musculos", "organos"];
const RLS = ["huesos", "musculos", "organos"];
const ANCH = ["hz", "guia", "rec", "pl-hoy", "pl-casco", "pl-regreso", "pl-rut"];

const RM = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const Nav = {
  tree: [],
  leaves: [],
  ex: new Set(["panel"]),
  exFor: "",
  cs: "",
  mh: "",
  cur: null,
  sig: "",
  ca: "",
  q: 0,

  build() {
    return MENU.map(g => {
      const ks = g.k.map(l => ({ ...l, t: g.tab }));
      if (AUTO.includes(g.tab)) {
        const u = new Set(g.k.map(l => l.z));
        ZONES
          .filter(z => z.tab === g.tab && !u.has(z.id))
          .forEach(z => ks.push({ n: z.n.split(" (")[0], z: z.id, t: g.tab }));
      }
      return { ...g, ks };
    });
  },

  /* ---- render: coalescido por frame; cada parte se redibuja solo si cambió su firma ---- */
  render() {
    if (this.q) return;
    this.q = requestAnimationFrame(() => {
      this.q = 0;
      this.flush();
    });
  },

  flush() {
    const k = cfg();
    const cs = [S.crew, S.day, S.today, S.env, k.adh, k.vas, Store.ver, S.tab].join("|");

    if (cs !== this.cs) {
      renderChrome();
      this.cs = cs;
    }
    if (this.isOpen) {
      this.menu();
    }
    this.mount(S.tab);

    if (typeof checkAndTriggerAlerts === "function") {
      checkAndTriggerAlerts();
    }
  },

  sigNow() {
    const k = cfg();
    return [
      S.crew,
      S.day,
      S.today,
      S.env,
      k.adh,
      k.vas,
      Store.ver,
      S.cmp,
      S.cat,
      S.rl,
      JSON.stringify(S.sel),
      JSON.stringify(S.par),
      Plan.ver
    ].join("|");
  },

  mount(id) {
    const sg = this.sigNow();
    const st = $("stage");
    if (this.cur === id && this.sig === sg) return;

    const sw = this.cur !== id;
    if (sw) clr(); /* desmontar: la vista anterior desaparece del DOM */

    st.innerHTML = `<section class="view" data-view="${id}">${VIEWS[id]()}</section>`;
    this.cur = id;
    this.sig = sg;

    if (sw) {
      st.classList.remove("anim");
      void st.offsetWidth;
      st.classList.add("anim");
    }
  },

  /* ---- navegación ---- */
  go(r) {
    const z = r.z && ZONES.find(q => q.id === r.z);
    S.tab = r.tab || S.tab;
    if (r.cmp != null) S.cmp = r.cmp;
    if (r.cat) S.cat = r.cat;
    if (r.rl) S.rl = r.rl;

    if (z) {
      const L = S.tab === "registro" ? (S.rl = r.rl || z.tab) : z.tab;
      S.sel[L] = z.id;
      const i = typeof r.p === "number" ? r.p : z.p.findIndex(q => q.id === r.p);
      if (i >= 0) S.par[z.id] = i;
    }

    this.ca = r.a || "";
    this.flush();
    this.setHash(1);
    if (!r.quiet) this.scroll(r.a);
  },

  scroll(a) {
    const el = (a && $(a)) || $("insp") || $("regform") || $("stage");
    el && el.scrollIntoView({ behavior: RM() ? "auto" : "smooth", block: "start" });
  },

  /* selección dentro de la vista activa: parche local, sin remontar la vista */
  pick(id) {
    if (!ZONES.some(z => z.id === id)) return;
    S.sel[layer()] = id;
    this.setHash();
    this.after();
  },

  par(i) {
    S.par[S.sel[layer()]] = i;
    this.setHash();
    this.after();
  },

  after() {
    if (S.tab === "registro") {
      this.sig = "";
      return this.mount("registro");
    }
    const z = ZONES.find(q => q.id === S.sel[S.tab]);
    $("insp").innerHTML = insp(z);
    document.querySelectorAll("#stage svg .z").forEach(g => g.classList.toggle("sel", g.dataset.z === z.id));
    document.querySelectorAll("#stage .card").forEach(c => c.classList.toggle("sel", c.dataset.z === z.id));
    this.sig = this.sigNow();
  },

  /* ---- hash: #/huesos/pie/si · #/registro/musculos/muslo · #/riesgos/guia ---- */
  hash() {
    const t = S.tab;
    if (t === "registro") return `/registro/${S.rl}/${S.sel[S.rl] || ""}`;
    const z = S.sel[t];
    const zz = ZONES.find(q => q.id === z);
    if (!zz || !AUTO.concat("mente").includes(t)) return "/" + t + (this.ca ? "/" + this.ca : "");
    const p = zz.p[S.par[z] || 0];
    return `/${t}/${z}${p ? "/" + p.id : ""}`;
  },

  setHash(push) {
    const h = "#" + this.hash();
    if (location.hash === h) return;
    try {
      push ? (location.hash = h) : history.replaceState(null, "", h);
    } catch (e) {}
  },

  fromHash() {
    const s = location.hash.replace(/^#\/?/, "").split("/");
    const t = TABS.find(x => x.id === s[0]);
    if (!t) return false;

    if (t.id === "registro") {
      this.go({ tab: t.id, rl: RLS.includes(s[1]) ? s[1] : undefined, z: s[2] || undefined });
    } else {
      this.go({
        tab: t.id,
        z: ZONES.some(q => q.id === s[1] && q.tab === t.id) ? s[1] : undefined,
        p: s[2],
        a: ANCH.includes(s[1]) ? s[1] : undefined
      });
    }
    return true;
  },

  /* ---- menú jerárquico ---- */
  on(l) {
    if (l.t !== S.tab) return false;
    if (l.z) return l.z === S.sel[layer()];
    if (l.x && "cmp" in l.x) return !!S.cmp === !!l.x.cmp;
    if (l.x && l.x.rl) return S.rl === l.x.rl;
    return !!l.a && l.a === this.ca;
  },

  menu() {
    const cur = MENU.find(g => g.tab === S.tab);
    if (cur && this.exFor !== S.tab) {
      this.ex.add(cur.id);
      this.exFor = S.tab;
    }

    this.leaves = [];
    const h = this.tree
      .map(g => {
        let w = -1;
        const items = g.ks
          .map(l => {
            const i = this.leaves.push(l) - 1;
            const z = l.z && ZONES.find(q => q.id === l.z);
            const s = z ? Engine.ev(z).st : -1;
            const on = this.on(l);
            if (s >= 0 && s < 3) w = Math.max(w, s);
            return `<li><button class="nl ${on ? "on" : ""}" data-nav="${i}"${
              on ? ' aria-current="page"' : ""
            }><span>${l.n}</span>${s >= 0 ? `<i class="dot t${s}" title="${SN[s]}"></i>` : ""}</button></li>`;
          })
          .join("");
        const o = this.ex.has(g.id);
        return `<section class="ng ${o ? "open" : ""} ${g.tab === S.tab ? "cur" : ""}"><button class="ngh" data-ng="${
          g.id
        }" aria-expanded="${o}">${g.ic ? `<span>${g.ic}</span>` : ""}<b>${g.n}</b>${
          w >= 0 ? `<i class="dot t${w}"></i>` : ""
        }<em>›</em></button><ul>${items}</ul></section>`;
      })
      .join("");

    if (h !== this.mh) {
      $("nav").innerHTML = h;
      this.mh = h;
    }
  },

  /* ---- drawer ---- */
  get isOpen() {
    return $("drawer").classList.contains("open");
  },

  open() {
    const d = $("drawer");
    this.menu();
    d.removeAttribute("inert");
    d.classList.add("open");
    $("scrim").classList.add("on");
    $("hb").setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("lock");

    this.rf = document.activeElement;
    const on = d.querySelector(".nl.on"),
      f = on || d.querySelector("button");
    f && f.focus({ preventScroll: true });
    on && on.scrollIntoView({ block: "center" });
  },

  close() {
    if (!this.isOpen) return;
    const d = $("drawer");
    d.classList.remove("open");
    d.setAttribute("inert", "");
    $("scrim").classList.remove("on");
    $("hb").setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("lock");
    (this.rf || $("hb")).focus({ preventScroll: true });
  },

  start() {
    this.tree = this.build();
    $("drawer").setAttribute("inert", "");

    $("drawer").addEventListener("click", e => {
      const g = e.target.closest("[data-ng]"),
        n = e.target.closest("[data-nav]");
      if (g) {
        const s = g.parentElement,
          o = !s.classList.contains("open");
        s.classList.toggle("open", o);
        g.setAttribute("aria-expanded", o);
        o ? this.ex.add(g.dataset.ng) : this.ex.delete(g.dataset.ng);
      } else if (n) {
        const l = this.leaves[+n.dataset.nav];
        this.close();
        this.go({ tab: l.t, z: l.z, p: l.p, a: l.a, ...l.x });
      }
    });

    $("dx").onclick = () => this.close();

    addEventListener("keydown", e => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });

    let x0 = null;
    addEventListener(
      "touchstart",
      e => {
        x0 = e.touches[0].clientX;
      },
      { passive: true }
    );

    addEventListener(
      "touchend",
      e => {
        if (x0 != null && this.isOpen && e.changedTouches[0].clientX - x0 < -70) this.close();
        x0 = null;
      },
      { passive: true }
    );

    addEventListener("hashchange", () => {
      if (location.hash !== "#" + this.hash()) this.fromHash();
    });

    if (!this.fromHash()) this.flush();
  }
};

Nav.start();

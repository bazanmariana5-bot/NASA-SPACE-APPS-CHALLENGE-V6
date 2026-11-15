/* js/ui/events.js — Eventos globales, tooltip y controles del encabezado. */
"use strict";

/* ---------- Eventos ---------- */
const tip = $("tip");
document.addEventListener("click", e => {
  const t = e.target.closest("[data-t],[data-open],[data-z],[data-c],[data-r],[data-p],[data-go],[data-gz],[data-cat],[data-cmp],[data-rl],[data-reg],[data-day],#zsv,#zdel");
  if (!t) return;
  const d = t.dataset;
  if (t.id === "zsv") return saveZone();
  if (t.id === "zdel") return delZone();
  if (d.open) return openTest(d.open);
  if (d.t) Nav.go({ tab: d.t, quiet: 1 });
  else if (d.go) Nav.go({ tab: d.go });
  else if (d.gz) {
    const [zi, ix] = d.gz.split(":"),
          z = ZONES.find(q => q.id === zi);
    Nav.go({ tab: z.tab, z: zi, p: +ix });
  } else if (d.cat) State({ cat: d.cat });
  else if (d.cmp) State({ cmp: S.cmp ? 0 : 1 });
  else if (d.rl) { Nav.go({ tab: "registro", rl: d.rl, quiet: 1 }); }
  else if (d.reg) {
    const z = ZONES.find(q => q.id === d.reg);
    Nav.go({ tab: "registro", rl: z.tab, z: z.id });
  } else if (d.day != null) State({ day: +d.day });
  else if (d.z) Nav.pick(d.z);
  else if (d.p != null) Nav.par(+d.p);
  else if (d.c) { State({ crew: d.c }); closeDrawer(); }
  else if (d.r) {
    const r = $(d.r),
          c = r.firstElementChild;
    r.scrollBy({ left: d.d * (c ? c.offsetWidth + 10 : 260), behavior: "smooth" });
  }
});

document.addEventListener("keydown", e => {
  const el = e.target;
  if ((e.key === "Enter" || e.key === " ") && el.dataset && (el.dataset.z || el.dataset.gz) && !/INPUT|TEXTAREA|SELECT/.test(el.tagName)) {
    e.preventDefault();
    el.click();
  }
});

document.addEventListener("pointermove", e => {
  const z = e.target.closest && e.target.closest("svg .z");
  if (!z) { tip.style.display = "none"; return; }
  const zz = ZONES.find(q => q.id === z.dataset.z && q.tab === layer());
  if (!zz) return;
  const x = Engine.ev(zz),
        f = x.rows[0];
  tip.innerHTML = `${zz.n}${f ? `: <b>${fmt(f.p, f.v)} ${f.p.u}</b>` : ""} · ${SN[x.st]}`;
  tip.style.display = "block";
  tip.style.left = Math.min(e.clientX + 12, innerWidth - 260) + "px";
  tip.style.top = e.clientY + 14 + "px";
});

document.addEventListener("input", e => {
  const i = e.target;
  if (!i.dataset || !i.dataset.f) return;
  const [zid, pid] = i.dataset.f.split("."),
        z = ZONES.find(q => q.id === zid),
        p = z.p.find(q => q.id === pid),
        el = $("rs-" + pid);
  if (!el) return;
  const v = parseFloat(i.value),
        x = isNaN(v) ? p.v(C()) : v,
        s = stat(p, x);
  el.innerHTML = s >= 0 ? bd(s) : "";
});

document.addEventListener("change", e => {
  if (e.target.id === "fday") State({ day: clamp(Math.round(+e.target.value || 0), 0, S.today) });
});

function saveZone() {
  const z = ZONES.find(q => q.id === S.sel[S.rl]);
  const d = clamp(Math.round(+$("fday").value || 0), 0, S.today);
  const v = {};

  document.querySelectorAll("[data-f]").forEach(i => {
    if (i.value !== "" && !isNaN(parseFloat(i.value))) {
      v[i.dataset.f] = parseFloat(i.value);
    }
  });

  const n = $("zn").value.trim();
  if (Object.keys(v).some(k => v[k] < 0 && !NEGOK.has(k))) {
    return toast("No se permiten valores negativos");
  }
  if (!Object.keys(v).length && !n) {
    return toast("Ingresa al menos un valor");
  }

  S.day = d;
  Store.setZone(S.crew, d, z.id, v, n);
  render();
  toast("Registro de " + z.n.split(" (")[0] + " guardado");
  checkAndTriggerAlerts(true);
}

function delZone() {
  const z = ZONES.find(q => q.id === S.sel[S.rl]),
        d = clamp(Math.round(+$("fday").value || 0), 0, S.today);
  Store.setZone(S.crew, d, z.id, {}, "");
  render();
  toast("Registro de la zona borrado");
}

const openDrawer = () => Nav.open(),
      closeDrawer = () => Nav.close();

$("hb").onclick = openDrawer;
$("scrim").onclick = closeDrawer;
$("day").oninput = e => State({ day: +e.target.value });

for (const i of ["env", "env2"]) {
  $(i).innerHTML = Object.entries(ENVS).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join("");
  $(i).onchange = e => State({ env: e.target.value });
}
$("log").onclick = () => Nav.go({ tab: "registro" });
$("dys").onclick = () => openDays();
$("upl").onclick = () => openUpload();

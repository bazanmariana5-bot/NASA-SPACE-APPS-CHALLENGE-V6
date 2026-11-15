/* js/ui/crewadd.js — Alta y baja de tripulantes. Los agregados se guardan en el equipo (localStorage "ks-crew-extra"). */
"use strict";

const CREW_BASE = 3,
      CREW_COLS = ["#ff8a3d", "#2ee6a6", "#ff4fd8", "#27d8ee", "#b6f23a", "#9b6bff", "#ff6b6b", "#4dd0a0"];

function saveExtraCrew() {
  try { localStorage.setItem("ks-crew-extra", JSON.stringify(CREW.slice(CREW_BASE))); } catch (e) {}
}

function crewForm(msg) {
  const extra = CREW.slice(CREW_BASE);
  return `<h3 class="dlg-title">Agregar tripulante</h3><p class="dlg-sub">Completa los datos del nuevo tripulante. Los valores se calculan con el mismo modelo que el resto de la tripulación; después puedes cargar sus datos reales.</p>
<div class="ncf" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
  <label>Nombre y apellido<input type="text" id="ncn" maxlength="40" autocomplete="off"></label>
  <label>Rol<input type="text" id="ncr" maxlength="40" placeholder="Ej.: Ingeniero de vuelo"></label>
  <label>Edad (años)<input type="number" id="nca" min="18" max="80" value="35" inputmode="numeric"></label>
  <label>Estatura (cm)<input type="number" id="nch" min="140" max="210" value="170" inputmode="numeric"></label>
  <label>Peso (kg)<input type="number" id="ncw" min="40" max="150" value="70" inputmode="numeric"></label>
</div>
<div id="ncm" role="alert">${msg || ""}</div>
${extra.length ? `<p class="u-fs-13 u-m-6-0"><b>Tripulantes agregados</b></p><div class="row u-fw-wrap u-gap-10">${extra.map(c => `<span class="chip">${esc(c.name)} <button type="button" class="btn o sm" data-delcrew="${c.id}" aria-label="Quitar a ${esc(c.name)}">Quitar</button></span>`).join("")}</div>` : ""}
<div class="row dlg-foot"><button class="btn o" data-dlg-close>Cerrar</button><button class="btn" id="ncs">Agregar tripulante</button></div>`;
}

function openCrewForm(msg) {
  openDlg(crewForm(msg));
  $("ncn").focus();
}

function addCrew() {
  const name = $("ncn").value.trim().replace(/\s+/g, " "),
        role = $("ncr").value.trim() || "Tripulante",
        age = +$("nca").value, h = +$("nch").value, w = +$("ncw").value,
        bad = m => `<div class="alert t2">${m}</div>`;
  if (name.length < 3) return $("ncm").innerHTML = bad("Escribe el nombre del tripulante.");
  if (CREW.some(c => c.name.toLowerCase() === name.toLowerCase())) return $("ncm").innerHTML = bad("Ya existe un tripulante con ese nombre.");
  if (!(age >= 18 && age <= 80)) return $("ncm").innerHTML = bad("La edad debe estar entre 18 y 80 años.");
  if (!(h >= 140 && h <= 210)) return $("ncm").innerHTML = bad("La estatura debe estar entre 140 y 210 cm.");
  if (!(w >= 40 && w <= 150)) return $("ncm").innerHTML = bad("El peso debe estar entre 40 y 150 kg.");
  const n = Math.max(...CREW.map(c => parseInt(c.id.slice(1), 10) || 0)) + 1,
        c = {
          id: "c" + n, name, role,
          bio: `${role} · ${age} años · ${(h / 100).toFixed(2).replace(".", ",")} m · ${w} kg`,
          age, h, sens: 1, col: CREW_COLS[(CREW.length - CREW_BASE) % CREW_COLS.length]
        };
  CREW.push(c);
  S.cc[c.id] = { adh: 40, vas: 3 };
  saveExtraCrew();
  dlg.close();
  State({ crew: c.id });
  toast("Tripulante agregado: " + name);
}

function delCrew(id) {
  const i = CREW.findIndex(c => c.id === id);
  if (i < CREW_BASE) return;
  const nm = CREW[i].name;
  CREW.splice(i, 1);
  delete S.cc[id];
  saveExtraCrew();
  if (S.crew === id) State({ crew: CREW[0].id }); else renderChrome();
  openCrewForm(`<div class="alert t0">Se quitó a ${esc(nm)}.</div>`);
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-addcrew],[data-delcrew],#ncs");
  if (!t) return;
  if (t.id === "ncs") addCrew();
  else if (t.dataset.delcrew) delCrew(t.dataset.delcrew);
  else openCrewForm();
});
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target && /^nc[nrahw]$/.test(e.target.id || "")) addCrew();
});

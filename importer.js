/* importer.js — lector CSV que respeta comillas y validación de filas importadas (CSV o SVG). Funciones puras, sin DOM. */
"use strict";

const norm = s => String(s == null ? "" : s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* CSV: no divide a ciegas por comas. Una coma, un punto y coma o un salto de línea dentro de comillas pertenece al campo;
   "" dentro de un campo entrecomillado es una comilla literal. Detecta "," o ";" mirando solo la primera línea fuera de comillas. */
function csvParse(text) {
  text = String(text).replace(/^\uFEFF/, "");
  let q = false, nc = 0, ns = 0;
  
  for (const ch of text) {
    if (ch === '"') {
      q = !q;
    } else if (!q) {
      if (ch === "\n" || ch === "\r") break;
      if (ch === ",") nc++;
      else if (ch === ";") ns++;
    }
  }

  const D = ns > nc ? ";" : ",";
  const rows = [];
  let row = [], f = "", inQ = false;

  const end = () => {
    row.push(f);
    f = "";
    if (row.some(x => x.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          f += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        f += ch;
      }
    } else if (ch === '"' && f === "") {
      inQ = true;
    } else if (ch === D) {
      row.push(f);
      f = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      end();
    } else {
      f += ch;
    }
  }

  if (inQ) throw new Error("Comillas sin cerrar en el CSV");
  if (f !== "" || row.length) end();
  
  return rows;
}

/* número: acepta "58.2" y "58,2" (coma decimal); cualquier otra cosa es NaN */
function parseNum(x) {
  let t = String(x == null ? "" : x).trim().replace(/\s/g, "");
  if (t === "") return NaN;
  if (/^[-+]?\d+,\d+$/.test(t)) t = t.replace(",", ".");
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? +t : NaN;
}

/* tabla -> filas {c,d,k,v}. Formato largo: dia,tripulante,parametro,valor. Formato ancho: dia,[tripulante],zona.param,zona.param… */
function tableToRows(t) {
  if (t.length < 2) return { rows: [], err: "El CSV no tiene filas de datos." };

  const h = t[0].map(norm),
        at = n => h.findIndex(x => n.includes(x)),
        iD = at(["dia", "day"]);

  if (iD < 0) return { rows: [], err: 'Falta la columna "dia".' };

  const iC = at(["tripulante", "crew", "persona"]),
        iK = at(["parametro", "clave", "key"]),
        iV = at(["valor", "value"]),
        skip = ["nota", "notas", "observacion", "observaciones"],
        rows = [];

  t.slice(1).forEach(r => {
    const c = iC >= 0 ? (r[iC] || "").trim() : "",
          d = parseNum(r[iD]);

    if (iK >= 0 && iV >= 0) {
      rows.push({ c, d, k: (r[iK] || "").trim(), v: parseNum(r[iV]) });
    } else {
      t[0].forEach((name, j) => {
        if (j === iD || j === iC || skip.includes(h[j]) || !(r[j] || "").trim()) return;
        rows.push({ c, d, k: name.trim(), v: parseNum(r[j]) });
      });
    }
  });

  return { rows };
}

/* validación: o = {today, known:Set, crew:fn(texto)->id|null, negOk:fn(clave)->bool} */
function validateRows(rows, o) {
  const good = [],
        rej = { crew: 0, unk: 0, bad: 0, neg: 0, rng: 0 };

  rows.forEach(r => {
    const c = o.crew(r.c);
    if (c == null) {
      rej.crew++;
      return;
    }
    if (!o.known.has(r.k)) {
      rej.unk++;
      return;
    }
    if (!Number.isFinite(r.v)) {
      rej.bad++;
      return;
    }
    if (r.v < 0 && !o.negOk(r.k)) {
      rej.neg++;
      return;
    }
    if (!Number.isInteger(r.d) || r.d < 0 || r.d >= o.today) {
      rej.rng++;
      return;
    }
    good.push({ c, d: r.d, k: r.k, v: r.v });
  });

  return { good, rej };
}

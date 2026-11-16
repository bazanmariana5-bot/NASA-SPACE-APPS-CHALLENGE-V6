/* js/app/translate.js — Traductor ES -> EN sin conexión.
   Busca cada texto en los diccionarios (EN_DICT, EN_GLOS, ...) cargados antes que este archivo.
   Reglas:
   - La clave es el texto "normalizado": números -> "#", nombres de la tripulación -> "@".
   - Se ignora la puntuación final (. : ; ,) al buscar y se vuelve a poner al traducir.
   - Si el texto completo no está, se parte por " · ", oraciones, ";", ":" y paréntesis y se traduce cada parte.
   - Los números se copian en orden a los "#" de la traducción y la coma decimal pasa a punto.
   Un texto que no está en el diccionario se deja en español: nunca hay errores ni peticiones de red. */
"use strict";

const KSTranslate = (() => {
  const dict = Object.create(null);
  const exact = Object.create(null); /* texto en español tal cual -> traducción literal (sin "#") */
  const NUM = /-?\d+(?:[.,]\d+)?/g;
  const WORD = /[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}/;
  /* Unidades y siglas que se escriben igual en inglés. */
  const UNITS = new Set(
    (
      "mm mmHg cm² ml mL mg dL MHz nmol resp µSv kg g min lpm ms mg/dL mg/día kgf kg L/día L rpm Hz fps kbps µSv/h µmol nmol/L W/kg W resp/min " +
      "dB/MHz dB ratio rep O₂ O m s h °C m/s G BLE ESP# PPG EEG EMG FPS LPM LAT NASA CSA"
    ).split(" ")
  );
  /* Prefijos que se traducen y dejan el resto para traducir aparte. */
  const PREFIXES = [
    ["Abrir ", "Open "],
    ["Día #: ", "Day #: "],
    ["- ", "- "],
    ["Detecto ", "I detect "],
    ["presenta ", "has "]
  ];
  const isUnit = key => {
    const toks = key
      .replace(/(?:mg|L|mL)\/día/g, " ")
      .replace(/#/g, " ")
      .split(/[\s\-–·.,()/]+/)
      .filter(Boolean);
    return toks.length > 0 && toks.every(t => UNITS.has(t) || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(t));
  };

  /* Registra un diccionario { "texto normalizado": "translation" }. */
  function add(map) {
    Object.keys(map).forEach(k => {
      dict[k] = map[k];
    });
  }

  /* Registra una traducción literal de un texto completo (para textos largos con cifras propias). */
  function addExact(es, en) {
    exact[stripTail(es.trim())] = stripTail(en);
  }

  const stripTail = t => t.replace(/[.:;,!?]+$/, "");

  const crewNames = () => (typeof CREW !== "undefined" ? CREW.map(c => c.name) : []);
  const LETTER = "A-Za-zÁÉÍÓÚáéíóúñÑ";
  /* Nombres completos y nombres de pila, del más largo al más corto, como una sola expresión. */
  let nameCache = { sig: "", re: null };
  function nameRegex() {
    const sig = crewNames().join("|");
    if (nameCache.sig === sig) return nameCache.re;
    const alts = [];
    crewNames().forEach(n => alts.push(n, n.split(" ")[0]));
    alts.sort((a, b) => b.length - a.length);
    const esc = alts.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    nameCache = { sig, re: new RegExp(`(?<![${LETTER}])(${esc.join("|")})(?![${LETTER}])`, "g") };
    return nameCache.re;
  }
  const namesIn = text => (crewNames().length ? text.match(nameRegex()) || [] : []);

  /* Devuelve { key, nums }: nombres -> "@" y números -> "#" (guardados en orden). */
  function normalize(s) {
    if (crewNames().length) s = s.replace(nameRegex(), "@");
    const nums = [];
    const key = s.replace(NUM, m => {
      nums.push(m);
      return "#";
    });
    return { key, nums };
  }

  const pad = (s, core) => {
    const i = s.indexOf(core);
    return [s.slice(0, i), s.slice(i + core.length)];
  };

  function fill(en, nums, who) {
    let i = 0,
      j = 0;
    return en.replace(/#|@/g, ch => {
      if (ch === "#") return i < nums.length ? nums[i++].replace(",", ".") : "#";
      return j < who.length ? who[j++] : "@";
    });
  }

  /* Traduce un fragmento corto; devuelve null si no lo conoce. */
  function lookup(raw) {
    const t = raw.replace(/\u200b/g, "").trim();
    if (!t) return raw;
    const m = t.match(/^(.*?)([.:;,!?]*)$/s);
    const core = m[1],
      tail = m[2];
    if (!core) return raw;
    if (exact[core] !== undefined) {
      const [lead0, trail0] = pad(raw, t);
      return lead0 + exact[core] + tail + trail0;
    }
    const who = namesIn(core);
    const { key, nums } = normalize(core);
    const en = dict[key];
    if (en === undefined) {
      /* sin letras (números, unidades, símbolos): no hay nada que traducir */
      if (!WORD.test(key.replace(/@/g, "")) || isUnit(key)) return raw;
      /* nombre propio del tripulante o solo nombre de pila */
      if (namesIn(core).join(" ") === core) return raw;
      return null;
    }
    const [lead, trail] = pad(raw, t);
    return lead + fill(en, nums, who) + tail + trail;
  }

  /* La coma de "máx. o RER" no es fin de oración: solo se corta antes de mayúscula, número o signo de apertura. */
  const SPLITS = [/(\n+)/, /( · )/, /(;\s+)/, /^([^:]+?)(:\s+)([\s\S]+)$/, /(\s+—\s+)/, /(\s?\()|(\)\s?)/];

  /* Parte en oraciones y traduce las más largas posibles (un texto de varias oraciones puede estar entero en el
     diccionario) antes de caer a oración por oración. */
  const SENT = /(?<=[.!?])(\s+)(?=[A-ZÁÉÍÓÚ¿¡"“\d])/;
  function sentences(raw, depth) {
    const parts = raw.split(SENT);
    if (parts.length < 3) return null;
    const out = [];
    let i = 0;
    while (i < parts.length) {
      let hit = null,
        end = i;
      for (let j = parts.length - 1; j >= i; j -= 2) {
        const cand = parts.slice(i, j + 1).join("");
        const r = j === i ? translate(cand, depth + 1) : lookup(cand);
        if (r !== null) {
          hit = r;
          end = j;
          break;
        }
      }
      if (hit === null) return null;
      out.push(hit);
      if (end + 1 < parts.length) out.push(parts[end + 1]);
      i = end + 2;
    }
    return out.join("");
  }

  function translate(raw, depth = 0) {
    const hit = lookup(raw);
    if (hit !== null) return hit;
    if (depth > 4) return null;

    /* "Evolución de <parámetro> de <tripulante>" */
    const ev = raw.trim().match(/^Evolución de (.+) de (.+?)([.:;,]?)$/);
    if (ev) {
      const p = translate(ev[1], depth + 1);
      if (p !== null) return "Evolution of " + p + " for " + ev[2] + ev[3];
    }

    for (const [es, en] of PREFIXES) {
      const t = raw.trim();
      if (t.startsWith(es)) {
        const rest = translate(t.slice(es.length), depth + 1);
        if (rest !== null) return raw.match(/^\s*/)[0] + en + rest + raw.match(/\s*$/)[0];
      }
    }

    /* "<texto> (<unidad>)": se traduce el texto y la unidad se deja igual */
    const withUnit = raw.trim().match(/^(.*\S) \(([^()]*)\)([.:;,]?)$/);
    if (withUnit && isUnit(withUnit[2])) {
      const base = translate(withUnit[1], depth + 1);
      if (base !== null) return base + " (" + withUnit[2] + ")" + withUnit[3];
    }

    /* "<texto> <unidad>": se traduce el texto y la unidad final se deja igual */
    const tailUnit = raw.trim().match(/^(.*\S)\s+(\S+)([.:;,]?)$/);
    if (tailUnit && isUnit(tailUnit[2]) && WORD.test(tailUnit[1])) {
      const base = translate(tailUnit[1], depth + 1);
      if (base !== null) return base + " " + tailUnit[2] + tailUnit[3];
    }

    /* "<zona> de <tripulante>" */
    const of = raw.trim().match(/^(.+) de (@|[^:]+?)([.:;,]?)$/);
    if (of && namesIn(of[2]).join(" ") === of[2]) {
      const zone = translate(of[1], depth + 1);
      if (zone !== null) return zone + " of " + of[2] + of[3];
    }

    const bySentence = sentences(raw, depth);
    if (bySentence !== null) return bySentence;

    /* Lista separada por comas ("zona, parámetro en minúscula" o "sensor, sensor, sensor"): cada elemento se
       traduce por separado y los que no son la primera palabra de la frase se devuelven en minúscula. */
    const items = raw.split(", ");
    if (items.length > 1 && items.length < 12) {
      const lower = t => {
        const word = t.split(/\s/)[0];
        const keep = /[A-Z].*[A-Z]|\d/.test(word) || word === "I";
        return keep ? t : t.charAt(0).toLowerCase() + t.slice(1);
      };
      const out = items.map((it, k) => {
        if (k === 0) return translate(it, depth + 1);
        const t = translate(it.charAt(0).toUpperCase() + it.slice(1), depth + 1);
        return t === null ? null : lower(t);
      });
      if (out.every(x => x !== null)) return out.join(", ");
    }

    for (const sp of SPLITS) {
      const parts = raw.split(sp).filter(x => x !== undefined && x !== "");
      if (parts.length < 3) continue;
      let all = true;
      const out = parts.map(p => {
        if (sp.test(p) && !WORD.test(p)) return p;
        if (!WORD.test(p)) return p;
        const r = translate(p, depth + 1);
        if (r === null) {
          all = false;
          return p;
        }
        return r;
      });
      if (all) return out.join("");
    }
    return null;
  }

  /* Texto completo; ok = true si todo se pudo traducir. */
  function tr(text) {
    const r = translate(String(text));
    return r === null ? { text: String(text), ok: false } : { text: r, ok: true };
  }

  return { add, addExact, tr, size: () => Object.keys(dict).length, entries: () => Object.assign({}, dict) };
})();

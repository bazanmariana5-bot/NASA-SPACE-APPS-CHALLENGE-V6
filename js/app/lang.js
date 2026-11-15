/* js/app/lang.js — Selector de idioma ES | EN.
   Los botones propios mandan sobre el widget de Google Translate (oculto):
   así el control hereda el diseño y los colores de la app en ambos temas. */
(function () {
  "use strict";
  var box = document.getElementById("lang-container");
  if (!box) return;
  var btns = box.querySelectorAll("button[data-lang]");

  function current() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([a-z-]+)/i);
    return m && m[1] === "en" ? "en" : "es";
  }

  function paint(lang) {
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
  }

  function setCookie(lang) {
    var v = lang === "es" ? "" : "/es/" + lang;
    var host = location.hostname;
    var exp = lang === "es" ? "; expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
    document.cookie = "googtrans=" + v + "; path=/" + exp;
    if (host && host.indexOf(".") > -1) document.cookie = "googtrans=" + v + "; path=/; domain=" + host + exp;
  }

  function apply(lang, tries) {
    var combo = document.querySelector("select.goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
      return;
    }
    /* El widget aún no cargó (o no hay red): reintenta; si no aparece, usa la cookie y recarga. */
    if ((tries || 0) < 15) return void setTimeout(function () { apply(lang, (tries || 0) + 1); }, 200);
    setCookie(lang);
    location.reload();
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-lang]");
    if (!b || b.getAttribute("aria-pressed") === "true") return;
    paint(b.dataset.lang);
    setCookie(b.dataset.lang);
    apply(b.dataset.lang);
  });

  paint(current());

  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      { pageLanguage: "es", includedLanguages: "es,en", autoDisplay: false },
      "google_translate_element"
    );
  };
})();

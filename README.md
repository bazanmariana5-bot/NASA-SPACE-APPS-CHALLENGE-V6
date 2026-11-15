# Kinesoft: Asistente Médico de Tripulación

Panel de monitoreo de salud para tripulantes en misión espacial (NASA Space Apps Challenge).
JavaScript y CSS sin dependencias de ejecución: se abre `index.html` o el archivo único de `dist/`.

## Datos iniciales (días 0 a 30)

Los valores de los 30 primeros días de los tres tripulantes base (124 parámetros cada uno) están
incrustados en `js/config/seeddata.js`. Al abrir la app por primera vez se guardan en el
navegador (`Store.seed()` en `js/core/store.js`); no hace falta subir ningún CSV.

- Solo se rellena lo que falta: nunca se pisan registros que la persona haya guardado.
- El botón "Cargar archivo" > "Restaurar datos iniciales" vuelve a poner los valores originales de los días 0 a 30.
- Para días posteriores o correcciones se puede importar un CSV (`dia,tripulante,parametro,valor`) o un SVG.

## Idioma inglés (sin internet)

El botón ES | EN traduce con un diccionario incluido en el código; no llama a ningún servicio externo, así que
funciona igual sin conexión y no puede fallar por la red.

- `js/app/translate.js`: motor. Busca cada texto en el diccionario (con "#" en lugar de los números y "@" en lugar de
  los nombres de la tripulación) y, si el texto completo no está, lo parte por oraciones, ":" , ";" , comas y
  paréntesis y traduce cada parte. Un texto desconocido se queda en español.
- `js/app/dict-en-*.js`: diccionarios (interfaz, parámetros, zonas y plan, tests y avisos, glosario y respuestas de INTI).
- `js/app/lang.js`: aplica la traducción a la página y la vuelve a español al cambiar de idioma.
- La voz de INTI usa el mismo motor; si un texto no se puede traducir entero, se dice en español.
- Para agregar un texto nuevo: añadir su entrada en el `dict-en-*.js` que corresponda. `node tools/smoke-test.js`
  comprueba que cada traducción conserve los "#" y "@" de su clave.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `js/config/` | Tripulantes, zonas, parámetros y umbrales (`clinicalconfig.js`) y datos iniciales (`seeddata.js`) |
| `js/core/` | Estado (`state.js`), persistencia (`store.js`) y motor de alertas (`engine.js`) |
| `js/ui/` | Vistas, registro, plan de ejercicio, INTI y traje, fondo espacial |
| `js/tests/` | Pruebas jugables: sueño, memoria de colores, reacción, ánimo, estrés, esfuerzo |
| `js/features/` | Voz, alertas, glosario, importación y respaldo |
| `js/lib/` | Siluetas anatómicas e importador de CSV |
| `js/app/` | Navegación, tema, traducción ES/EN (motor y diccionarios) y pantalla de carga |
| `css/` | Hojas de estilo por área |
| `tools/` | Compilación y verificaciones |

Los scripts comparten el ámbito global y se cargan en el orden de `index.html`, que es la única
fuente de verdad de ese orden.

## Comandos

Requieren Node.js 22 y Python 3. Prettier y ESLint solo se usan para desarrollo.

| Comando | Qué hace |
| --- | --- |
| `python3 tools/build.py` | Genera `dist/control_salud_orbital_bundle.html` (un solo archivo) |
| `node tools/smoke-test.js` | Carga todos los scripts en un DOM falso y valida los datos iniciales |
| `node tools/check.js` | Formato (Prettier), lint (ESLint) y prueba de humo |
| `prettier --write js css tools/*.js` | Aplica el formato (config en `.prettierrc.json`) |

## Convenciones

- Sangría de 2 espacios, comillas dobles, punto y coma, líneas de hasta 120 caracteres.
- `const` por defecto, `let` solo si se reasigna, sin `var`.
- Las funciones de almacenamiento nunca lanzan excepciones: si el navegador bloquea `localStorage`, la app sigue funcionando sin guardar.
- Fotos reales opcionales para el fondo: ver `img/LEEME.txt`.

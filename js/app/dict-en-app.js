/* js/app/dict-en-app.js — Diccionario ES -> EN: tests, registro, plan de reentrada, alertas, importación y avisos.
   Mismas reglas que dict-en-ui.js. */
"use strict";

KSTranslate.add({
  /* ---- parámetros y estados (configuración clínica) ---- */
  "La temperatura corporal sí se vigila como indicador básico de infección o estrés térmico":
    "Body temperature is monitored as a basic indicator of infection or heat stress",
  "Sin umbral definido": "No threshold defined",
  "bradicardia extrema": "extreme bradycardia",
  "taquicardia extrema con posible arritmia grave": "extreme tachycardia with possible severe arrhythmia",
  "falla cardíaca severa": "severe heart failure",
  "hipotensión grave con posible shock": "severe hypotension with possible shock",
  "crisis hipertensiva": "hypertensive crisis",
  "hipoxia severa (saturación de oxígeno críticamente baja)": "severe hypoxia (critically low oxygen saturation)",
  "hipercapnia severa (exceso de CO₂)": "severe hypercapnia (excess CO₂)",
  "hipertermia severa": "severe hyperthermia",
  "hipotermia severa": "severe hypothermia",
  "hipoglucemia grave": "severe hypoglycemia",
  "hiperglucemia grave": "severe hyperglycemia",
  "Emergencia vital": "Vital emergency",
  "Descartar": "Dismiss",
  "Descartar emergencia": "Dismiss emergency",
  "Infarto en curso": "Heart attack in progress",
  "un infarto agudo de miocardio": "an acute myocardial infarction",
  "Emergencia vital. El astronauta": "Vital emergency. The astronaut",
  "Se solicita asistencia inmediata. Mantengan la calma y sigan los protocolos de emergencia":
    "Immediate assistance requested. Stay calm and follow the emergency protocols",
  "Con máxima energía, muy motivado y disfrutando la misión":
    "Full of energy, highly motivated and enjoying the mission",
  "Muy bien": "Very good",
  "Optimista, activo y con muy buen ánimo frente a las tareas":
    "Optimistic, active and in a very good mood for the tasks",
  "Tranquilo, enfocado y conforme con el trabajo del día": "Calm, focused and content with the day's work",
  "Día equilibrado y normal, sin desgaste emocional": "A balanced, normal day with no emotional strain",
  "Día repetitivo o en “piloto automático”, sin grandes emociones":
    "A repetitive day or on “autopilot”, without strong emotions",
  "Plano / Aburrido": "Flat / Bored",
  "Sensación de monotonía, tedio o encierro leve": "A feeling of monotony, tedium or mild confinement",
  "Tenso / Nostálgico": "Tense / Nostalgic",
  "Algo impaciente, sensible al entorno o extrañando casa":
    "Somewhat impatient, sensitive to the surroundings or missing home",
  "Frustrado / Irritable": "Frustrated / Irritable",
  "Estresado, con poca paciencia o ganas de aislarse": "Stressed, with little patience or wanting to withdraw",
  "Sobrepasado por el cansancio mental o la carga de trabajo": "Overwhelmed by mental fatigue or workload",
  "Muy mal": "Very bad",
  "Angustia profunda, bloqueo emocional o malestar severo": "Deep distress, emotional blockage or severe discomfort",
  "Alerta cortical máxima y respuesta ultrarrápida": "Maximum cortical alertness and ultra-fast response",
  "Óptimo alto": "High optimum",
  "Excelente; apto para maniobras de alta precisión": "Excellent; fit for high-precision maneuvers",
  "Rendimiento normal de un astronauta descansado": "Normal performance of a rested astronaut",
  "Dentro del rango basal en órbita; sin fatiga": "Within the baseline range in orbit; no fatigue",
  "Leve enlentecimiento, funcional para la rutina": "Slight slowing, functional for routine",
  "Fatiga leve": "Mild fatigue",
  "Atención reducida; vigilar sueño y CO₂": "Reduced attention; monitor sleep and CO₂",
  "Alerta amarilla": "Yellow alert",
  "Enlentecimiento moderado; evitar tareas críticas sin supervisión":
    "Moderate slowing; avoid critical tasks without supervision",
  "Fatiga marcada": "Marked fatigue",
  "Requiere descanso antes de operar": "Needs rest before operating",
  "Alerta roja": "Red alert",
  "Riesgo alto de error operativo": "High risk of operational error",
  Crítico: "Critical",
  "Crítica (privación)": "Critical (deprivation)",
  "Óptima (reparadora)": "Optimal (restorative)",
  "Bloqueo preventivo de actividades críticas o EVA": "Preventive block of critical activities or EVA",
  "Memoria de trabajo perfecta. Habilitado sin restricciones para operaciones críticas y EVA":
    "Perfect working memory. Cleared without restrictions for critical operations and EVA",
  "Muy bueno": "Very good",
  "Memoria y velocidad muy buenas. Mantener rutina y repetir en # h":
    "Very good memory and speed. Keep the routine and repeat in # h",
  "Memoria dentro de lo esperado. Mantener rutina y repetir en # h":
    "Memory within expectations. Keep the routine and repeat in # h",
  "Fatiga ejecutiva posible. Reasignar tareas de precisión; revisar sueño y ventilación":
    "Possible executive fatigue. Reassign precision tasks; review sleep and ventilation",
  "Deficiente / crítico": "Poor / critical",
  "Déficit significativo. Bloqueo preventivo de tareas críticas y EVA; protocolo médico con Tierra":
    "Significant deficit. Preventive block of critical tasks and EVA; medical protocol with Earth",
  "Desaturación de oxígeno (SpO₂ menor a # % o caída de más del # % del basal)":
    "Oxygen desaturation (SpO₂ below # % or a drop of more than # % from baseline)",
  "PtcCO₂ mayor a # mmHg: reinhalación de CO₂ alrededor del tripulante":
    "PtcCO₂ above # mmHg: CO₂ rebreathing around the crew member",
  "Respuesta hipertensiva o hipotensiva": "Hypertensive or hypotensive response",
  "Arritmia, depresión del ST o síntoma clínico (mareo, dolor torácico, calambres)":
    "Arrhythmia, ST depression or clinical symptom (dizziness, chest pain, cramps)",
  "Deterioro cognitivo por déficit de sueño: siesta estratégica de # min y luz azul enriquecida antes de reevaluar":
    "Cognitive impairment from sleep deficit: a strategic # min nap and blue-enriched light before reassessing",
  "Fatiga neuroconductual: reevaluar o descansar # min antes de autorizar tareas de precisión; EVA sin habilitar si el puntaje es # o menos":
    "Neurobehavioral fatigue: reassess or rest # min before authorizing precision tasks; EVA not cleared if the score is # or less",

  /* ---- importación y errores ---- */
  "Comillas sin cerrar en el CSV": "Unclosed quotes in the CSV",
  "El CSV no tiene filas de datos": "The CSV has no data rows",
  'Falta la columna "dia"': 'The "dia" column is missing',
  "con valor negativo (no permitido)": "with a negative value (not allowed)",
  "con día fuera de # a #": "with a day outside # to #",
  "con día fuera de 0 a": "with a day outside 0 to",
  "con parámetro desconocido": "with an unknown parameter",
  "con valor no numérico": "with a non-numeric value",
  "sin tripulante o desconocido (con “Los # juntos” cada fila debe indicar su tripulante)":
    "with no crew member or an unknown one (with “All # together” every row must name its crew member)",
  "de otro tripulante o desconocido (solo se cargan las filas de":
    "from another crew member or unknown (only rows from",
  "o sin tripulante)": "or with no crew member are loaded)",
  "Se cargaron": "Loaded",
  "día #": "day #",
  "Ergoespirometría en cicloergómetro: modo submáximo en órbita cada # a # días (se detiene al # % de FC máx":
    "Cardiopulmonary exercise test on a cycle ergometer: submaximal mode in orbit every # to # days (stops at # % of max HR",
  "Composición corporal": "Body composition",
  "Masa libre de grasa": "Fat-free mass",
  "Historial de @": "History of @",
  "# días · # valores reales": "# days · # real values",
  "Pasar al día #": "Go to day #",
  "Los días # a # ya vienen cargados; usa un archivo SVG o CSV solo para agregar o corregir días (# a #)":
    "Days # to # come preloaded; use an SVG or CSV file only to add or fix days (# to #)",
  "Tiempo total de sueño": "Total sleep time",
  "Sistólica en la etapa previa": "Systolic in the previous stage",
  "Eficiencia aeróbica": "Aerobic efficiency",
  "Potencia en VT#": "Power at VT#",
  "Posición #": "Position #",
  "Ej.: molestia al agacharse, medición repetida…": "E.g.: discomfort when bending, repeated measurement…",
  "Carga del desfibrilador": "Defibrillator charge",
  "valores en": "values in",
  día: "day",
  días: "days",
  "valores reales": "real values",
  "Sin registros reales todavía": "No real records yet",
  "Cargar días anteriores": "Load previous days",
  "Cargar para": "Load for",
  "Los # juntos": "All # together",
  "Elegir archivo (.svg o .csv)": "Choose file (.svg or .csv)",
  "Plantilla CSV": "CSV template",
  "Plantilla SVG": "SVG template",
  "Restaurar datos iniciales": "Restore initial data",
  "o arrastra aquí el archivo": "or drag the file here",
  "Formato aceptado": "Accepted format",
  "con JSON": "with JSON",
  "Se restauraron los": "Restored the",
  "valores iniciales de los días # a #": "initial values for days # to #",
  "No se pudieron restaurar los datos iniciales": "The initial data could not be restored",
  "no se pudo leer el archivo": "the file could not be read",
  "El archivo no es un SVG válido. Si es una tabla, usa .csv":
    "The file is not a valid SVG. If it is a table, use .csv",
  "El archivo no trae datos que leer": "The file contains no data to read",
  "No se pudo leer el archivo": "The file could not be read",
  "Los días # a # ya vienen cargados; usa un archivo SVG o CSV solo para agregar o corregir días (# a":
    "Days # to # come preloaded; use an SVG or CSV file only to add or fix days (# to",
  "Días de misión": "Mission days",
  "La barra y los gráficos llegan hasta el día actual": "The bar and the charts go up to the current day",
  "Día actual de la misión": "Current mission day",
  "Pasar al día": "Go to day",
  "o elegir día": "or choose a day",
  Ir: "Go",
  "Solo se puede avanzar. Los días anteriores se completan a mano o con “Cargar archivo”":
    "You can only move forward. Earlier days are filled in by hand or with “Load file”",
  "Elige un día posterior a": "Choose a day after",
  "No se permiten valores negativos": "Negative values are not allowed",
  "Ingresa al menos un valor": "Enter at least one value",
  "Registro de la zona borrado": "Zone log cleared",
  "Dato real guardado": "Real data saved",
  "Prueba guardada": "Test saved",
  "Rutina completada": "Routine completed",

  /* ---- agregar tripulante ---- */
  "Completa los datos del nuevo tripulante. Los valores se calculan con el mismo modelo que el resto de la tripulación; después puedes cargar sus datos reales":
    "Fill in the new crew member's details. Values are calculated with the same model as the rest of the crew; you can load their real data afterwards",
  "Nombre y apellido": "First and last name",
  "Edad (años)": "Age (years)",
  "Estatura (cm)": "Height (cm)",
  "Peso (kg)": "Weight (kg)",
  "Escribe el nombre del tripulante": "Enter the crew member's name",
  "Ya existe un tripulante con ese nombre": "A crew member with that name already exists",
  "La edad debe estar entre # y # años": "Age must be between # and # years",
  "La estatura debe estar entre # y # cm": "Height must be between # and # cm",
  "El peso debe estar entre # y # kg": "Weight must be between # and # kg",
  "Tripulante agregado": "Crew member added",
  "Se quitó a": "Removed",
  "Panel y comparativas": "Dashboard and comparisons",
  "Ver plan de ejercicio": "View exercise plan",
  "vista lateral del cuello": "lateral view of the neck",

  /* ---- alertas de paro cardíaco ---- */
  "Paro cardiorrespiratorio confirmado": "Cardiorespiratory arrest confirmed",
  "El tripulante": "The crew member",
  "está sufriendo un paro cardiorrespiratorio": "is suffering a cardiorespiratory arrest",
  "Despejen la zona": "Clear the area",
  "El desfibrilador está a punto de activarse. Nadie debe tocar al paciente":
    "The defibrillator is about to activate. Nobody should touch the patient",
  "Desfibrilador cargado. Aléjense del paciente": "Defibrillator charged. Stand clear of the patient",
  "Emergencia vital. El tripulante": "Vital emergency. The crew member",
  "requiere asistencia inmediata": "requires immediate assistance",
  "Activar voz": "Turn voice on",
  "Silenciar voz": "Mute voice",

  /* ---- registro por zona ---- */
  "Ver plan": "View plan",

  /* ---- test de sueño ---- */
  "Registro de sueño": "Sleep log",
  "Telemetría del anillo biométrico más autorreporte matutino de # segundos":
    "Biometric ring telemetry plus a # second morning self-report",
  "¿Qué tan descansado te sientes? (# agotado, # renovado)": "How rested do you feel? (# exhausted, # renewed)",
  "Continuidad del sueño (# fragmentado, # continuo)": "Sleep continuity (# fragmented, # continuous)",
  "Claridad mental al despertar (# somnolencia, # alerta máxima)": "Mental clarity on waking (# drowsy, # fully alert)",
  "Calcular y guardar": "Calculate and save",
  "Calidad objetiva": "Objective quality",
  "· subjetiva": "· subjective",
  "· global": "· overall",
  "Discordancia objetivo-subjetiva: se prioriza el dato fisiológico y se restringen tareas de alto riesgo cognitivo":
    "Objective-subjective mismatch: the physiological data takes priority and high cognitive-risk tasks are restricted",
  "Calidad # o menor: reducir #–# % el volumen de ARED pesado si se repite dos noches seguidas":
    "Quality # or lower: reduce heavy ARED volume by #–# % if it repeats two nights in a row",

  /* ---- test de colores ---- */
  "Test de memoria de # colores": "# color memory test",
  "Observa los # colores y colócalos en el mismo orden. Cada acierto suma # punto (escala de # a #)":
    "Watch the # colors and place them in the same order. Each hit adds # point (scale from # to #)",
  Posición: "Position",
  "Coloca los colores en el mismo orden": "Place the colors in the same order",
  "/ # colocados": "/ # placed",
  "de # colores en la posición correcta": "of # colors in the correct position",
  "de # colores en la posición correcta (#)": "of # colors in the correct position (#)",
  "Orden mostrado": "Order shown",
  "ms · intervalo medio": "ms · mean interval",
  "ms · lapsos": "ms · lapses",
  "Memoria y velocidad": "Memory and speed",

  /* ---- test de reacción ---- */
  "Test de reacción": "Reaction test",
  "Toca en cuanto el botón cambie de rojo a verde. # intentos válidos":
    "Tap as soon as the button turns from red to green. # valid attempts",
  "# a # s · Muy bueno": "# to # s · Very good",
  "# a # s · Precaución": "# to # s · Caution",
  "más de # s · Crítico": "more than # s · Critical",
  "¡Muy pronto! Espera al verde": "Too soon! Wait for green",
  "Habilitación para EVA": "EVA clearance",
  "(se requiere # o más)": "(# or more required)",
  "ms · promedio": "ms · average",
  "ms · salidas en falso": "ms · false starts",
  "· lapsos": "· lapses",
  Intentos: "Attempts",
  "Espera...": "Wait...",
  "¡Ahora!": "Now!",
  Toca: "Tap",

  /* ---- test de ánimo ---- */
  "Menos de # segundos antes de dormir": "Less than # seconds before sleep",
  "Toca un número para ver su significado": "Tap a number to see its meaning",
  "Resume tu día en dos líneas (lo mejor y lo más difícil)":
    "Sum up your day in two lines (the best and the hardest part)",
  "Elige un número": "Choose a number",
  "Alerta roja: se sugiere descanso y se avisa de forma confidencial al equipo médico en Tierra":
    "Red alert: rest is suggested and the medical team on Earth is notified confidentially",
  "Alerta amarilla por monotonía: # días seguidos en # o #. Agenda una videollamada con tu familia o varía tus tareas":
    "Yellow alert for monotony: # days in a row at # or #. Schedule a video call with your family or vary your tasks",
  "Registro guardado. ¡Buen trabajo!": "Log saved. Good work!",

  /* ---- test de estrés ---- */
  "En las últimas # horas, ¿con qué frecuencia te sentiste nervioso o estresado":
    "In the last # hours, how often did you feel nervous or stressed",
  "¿Con qué frecuencia sentiste que no podías controlar las cosas importantes de tu trabajo":
    "How often did you feel unable to control the important things in your work",
  "¿Con qué frecuencia te sentiste seguro de poder manejar tus problemas":
    "How often did you feel confident you could handle your problems",
  "¿Con qué frecuencia sentiste que las cosas iban como querías":
    "How often did you feel that things were going your way",
  Nunca: "Never",
  "Casi nunca": "Almost never",
  "A veces": "Sometimes",
  "Con frecuencia": "Often",
  "Muy seguido": "Very often",
  "Test de estrés": "Stress test",
  "Cuatro preguntas, menos de # segundos. Responde pensando en las últimas # horas":
    "Four questions, under # seconds. Answer thinking about the last # hours",
  "Responde las # preguntas": "Answer the # questions",
  "Sin señales de estrés relevante. Mantén tus rutinas de sueño y ejercicio":
    "No signs of relevant stress. Keep your sleep and exercise routines",
  "Estrés moderado. Haz # minutos de respiración lenta (inspira # s, espira # s), una pausa de movimiento y un contacto breve con tus compañeros":
    "Moderate stress. Do # minutes of slow breathing (inhale # s, exhale # s), a movement break and a brief chat with your crewmates",
  "Estrés alto. Detén tareas críticas si puedes, respira lento # a # minutos, descansa y avisa a la médica de vuelo; programa una llamada de apoyo con Tierra":
    "High stress. Stop critical tasks if you can, breathe slowly for # to # minutes, rest and tell the flight surgeon; schedule a support call with Earth",

  /* ---- prueba de esfuerzo ---- */
  "Control de seguridad cada segundo y resultados del rendimiento": "Safety check every second and performance results",
  "Síntoma o arritmia": "Symptom or arrhythmia",
  "Sí (mareo, dolor torácico, calambres, ST)": "Yes (dizziness, chest pain, cramps, ST)",
  "Verificar y guardar": "Verify and save",
  "DETENER AHORA": "STOP NOW",
  "pasar a la Fase # (recuperación activa a # W)": "move to Phase # (active recovery at # W)",
  "Sin criterios de detención. Continuar el protocolo": "No stopping criteria. Continue the protocol",

  /* ---- plan de reentrada (Valsalva y fases) ---- */
  "Nivel verde": "Green level",
  "Apto estándar": "Standard fit",
  "Nivel amarillo": "Yellow level",
  "Riesgo moderado: alerta de precarga": "Moderate risk: preload alert",
  "Nivel rojo": "Red level",
  "Riesgo crítico de síncope": "Critical syncope risk",
  "Índice de Valsalva": "Valsalva index",
  "(menor a #)": "(below #)",
  "(entre # y #)": "(between # and #)",
  "Fase II tardía: la presión sigue cayendo sin recuperarse (falla vasoconstrictora)":
    "Late Phase II: pressure keeps falling without recovering (vasoconstrictor failure)",
  "Fase IV: ausencia total de rebote de la presión arterial": "Phase IV: total absence of blood pressure rebound",
  "Fase IV: rebote atenuado": "Phase IV: blunted rebound",
  "# bloques de # ciclos, # veces al día, vigilando que la frecuencia cardíaca suba de forma controlada y sin mareos":
    "# blocks of # cycles, # times a day, making sure the heart rate rises in a controlled way and without dizziness",
  "# bloques de # ciclos (# s de tensión y # s de respiro), # veces al día":
    "# blocks of # cycles (# s of tension and # s of rest), # times a day",
  "Revisa las frecuencias cardíacas: el cociente": "Check the heart rates: the ratio",
  "es poco plausible (la FC máxima de la Fase II debería ser mayor que la mínima de la Fase IV)":
    "is implausible (the maximum HR of Phase II should be higher than the minimum of Phase IV)",
  "Compensación de fuerza G alterada": "G-force compensation impaired",
  "Pérdida de visión periférica (grey-out) o blackout: repetir el entrenamiento de la maniobra M-#/L-# en centrífuga":
    "Loss of peripheral vision (grey-out) or blackout: repeat the M-#/L-# maneuver training in the centrifuge",
  "El PDF no asigna este parámetro al nivel automático; se muestra como indicador aparte":
    "The PDF does not assign this parameter to the automatic level; it is shown as a separate indicator",
  "Compensación de fuerza G conservada": "G-force compensation preserved",
  "Mantiene perfusión cerebral y visión periférica entre # G y # G":
    "Maintains cerebral perfusion and peripheral vision between # G and # G",
  "Dosis de la Fase # para este nivel": "Phase # dose for this level",
  "Sin dato": "No data",
  "FC máxima en Fase II (lpm)": "Maximum HR in Phase II (bpm)",
  "FC mínima en Fase IV (lpm)": "Minimum HR in Phase IV (bpm)",
  "Curva de presión arterial · Fase II tardía (antes de los # s)": "Blood pressure curve · Late Phase II (before # s)",
  "Curva de presión arterial · Fase IV (rebote u overshoot)": "Blood pressure curve · Phase IV (rebound or overshoot)",
  "Evaluación de compensación de fuerza G (maniobra M-#/L-#, # G a # G)":
    "G-force compensation assessment (M-#/L-# maneuver, # G to # G)",
  "Índice de Valsalva = FC máxima de la Fase II ÷ FC mínima de la Fase IV. Normal: mayor a # (óptimo # a #). Valor calculado":
    "Valsalva index = maximum HR of Phase II ÷ minimum HR of Phase IV. Normal: above # (optimal # to #). Calculated value",
  "Plan en # fases": "Plan in # phases",
  "Fase # · Acondicionamiento pre-reentrada (últimas # a # horas en órbita)":
    "Phase # · Pre-reentry conditioning (last # to # hours in orbit)",
  "Reactivar el tono vasoconstrictor simpático, estimular la retención de volumen plasmático y entrenar la bomba muscular periférica":
    "Reactivate sympathetic vasoconstrictor tone, stimulate plasma volume retention and train the peripheral muscle pump",
  "Fase # · Estabilización activa durante la reentrada (# G a # G)":
    "Phase # · Active stabilization during reentry (# G to # G)",
  "Evitar el secuestro de sangre en miembros inferiores y prevenir el blackout":
    "Avoid blood pooling in the lower limbs and prevent blackout",
  "Fase # · Reacondicionamiento ortostático posaterrizaje (primeras # horas en # G)":
    "Phase # · Post-landing orthostatic reconditioning (first # hours at # G)",
  "Estabilizar la presión arterial y evitar el síncope al pasar de decúbito a sedestación y bipedestación":
    "Stabilize blood pressure and avoid syncope when moving from lying to sitting and standing",
  "Reglas de seguridad": "Safety rules",
  "Alerta prodrómica: ante visión en túnel, sudoración fría o náuseas, suspender la bipedestación y pasar a posición horizontal con las piernas elevadas a #°":
    "Prodromal alert: with tunnel vision, cold sweating or nausea, stop standing and lie flat with the legs raised to #°",
  "Test de Valsalva y plan en # fases": "Valsalva test and plan in # phases",
  "Parámetros del PDF de la NASA": "Parameters from NASA's PDF",
  "Asistente M-#/L-# en tiempo real: al superar # G, metrónomo visual y táctil con ciclos de # s de tensión muscular con pujo corto y # s de intercambio respiratorio":
    "Real-time M-#/L-# assistant: above # G, a visual and tactile metronome with cycles of # s of muscle tension with a short strain and # s of breathing exchange",
  "Nivel rojo: mantener la contracción isométrica de miembros inferiores durante todo el pico de desaceleración, con inflado automático del traje o pantalón anti-G":
    "Red level: hold the isometric contraction of the lower limbs throughout the deceleration peak, with automatic inflation of the anti-G suit or trousers",
  "Maniobra anti-G (M-#/L-#) con biofeedback: contracción isométrica máxima de pantorrillas, cuádriceps, glúteos y faja abdominal combinada con pujos cortos de # a # s contra glotis semicerrada (M-#) o cerrada con intercambio de aire menor a # s (L-#)":
    "Anti-G maneuver (M-#/L-#) with biofeedback: maximal isometric contraction of the calves, quadriceps, glutes and abdominal girdle combined with short strains of # to # s against a half-closed glottis (M-#) or a closed one with air exchange under # s (L-#)",
  "Carga resistiva del tren inferior (ARED o bandas de alta tensión): sentadillas y elevaciones de talones, # series de # a # repeticiones al # % de intensidad, exhalando en el esfuerzo":
    "Resistive loading of the lower body (ARED or high-tension bands): squats and heel raises, # sets of # to # repetitions at # % intensity, exhaling on effort",
  "Sin Valsalva sostenido de # s en microgravedad para no elevar la presión intracraneal":
    "No sustained # s Valsalva in microgravity so as not to raise intracranial pressure",
  "Minutos # a #, acostado o en asiento reclinado: bombeo tibio-peroneo con flexo-extensión máxima de tobillos (# repeticiones cada # min) y contracción alterna de glúteos y cuádriceps (# s de contracción y # s de relajación)":
    "Minutes # to #, lying down or in a reclined seat: tibioperoneal pumping with maximal ankle flexion-extension (# repetitions every # min) and alternating gluteal and quadriceps contraction (# s of contraction and # s of relaxation)",
  "Minutos # a #, sedestación asistida: cruce de piernas con contracción de muslos y glúteos durante # s al incorporarse, y prensión manual isométrica (# a # % de la fuerza máxima) durante # min":
    "Minutes # to #, assisted sitting: leg crossing with thigh and glute contraction for # s when sitting up, and isometric hand grip (# to # % of maximum strength) for # min",
  "Minutos # a #, bipedestación progresiva: prohibido quedarse quieto de pie; elevar los talones cada # s hasta confirmar que la presión sistólica no cae más de # mmHg respecto del basal acostado":
    "Minutes # to #, progressive standing: standing still is forbidden; raise the heels every # s until confirming that systolic pressure does not fall more than # mmHg from the lying baseline",
  "Bloqueo de Valsalva puro en Tierra: si el tripulante contiene la respiración más de # s sin contracción muscular periférica al levantarse, avisar de inmediato: “¡Suelta el aire y contrae las piernas!”":
    "Pure Valsalva block on Earth: if the crew member holds their breath for more than # s without peripheral muscle contraction when standing up, warn immediately: “Let the air out and contract your legs!”"
});

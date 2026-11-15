/* js/app/dict-en-glos.js — Traducción al inglés del glosario de INTI (js/features/glosario.js).
   GLOS_EN[clave] = [qué mide, por qué cambia en el espacio, qué hacer], en el mismo orden que GLOS[clave].
   Al final, cada texto se registra en el traductor como traducción literal. */
"use strict";

const GLOS_EN = {
  dens: [
    "How much bone you keep compared with your pre-flight value (100 % is the same as on Earth).",
    "With no weight to carry, bone is resorbed. The zones that carry the most on Earth (pelvis, femur, tibia, heel) lose up to 1 % to 2 % per month without countermeasures.",
    "Do the resistive exercise (ARED: squat and deadlift), watch your vitamin D and calcium, and do not skip sessions. The flight surgeon decides whether treatment is needed."
  ],
  dhp: [
    "How much your height has increased compared with your Earth measurement.",
    "Without gravity the discs between the vertebrae absorb fluid and expand, so the spine lengthens by a few centimeters.",
    "Measure your height regularly, wear the axial compression suit for 1 to 2 hours and do lumbar mobility work. It returns to normal within weeks after coming back to Earth."
  ],
  disc: [
    "Height of the disc between vertebrae L4 and L5, measured by imaging.",
    "With no compression from body weight the disc swells. A very expanded disc raises the risk of a herniation when gravity returns.",
    "Axial compression, core stabilization exercises and imaging follow-up."
  ],
  lord: [
    "Angle of the natural curve of the lower back.",
    "Without gravity the spine loses part of its curvature and tends to flatten.",
    "Strengthen the core and mind your posture; report any pain or sudden changes."
  ],
  cif: [
    "Angle of the curve of the upper back (thoracic area).",
    "The floating posture and the lower load change this curve.",
    "Thoracic mobility and strengthening of the erector spinae."
  ],
  lcerv: [
    "Angle of the curve of the neck.",
    "Without the weight of the head the neck loses its normal curvature.",
    "Neck strengthening (the plan's pulley harness) and posture control."
  ],
  vas: [
    "Your low back pain on a scale from 0 (none) to 10 (the worst possible).",
    "It is common in orbit because of disc expansion and the change in posture.",
    "Log it every day. Do the lumbar mobility protocol and use local heat. If it goes above 7 or you feel tingling in your legs, tell the flight surgeon."
  ],
  load: [
    "How much of the planned daily mechanical load you completed (100 % is the target).",
    "In microgravity the only load on the bones comes from resistive exercise; if your compliance drops, the bone notices.",
    "Complete the plan's routines. Exercise compliance is adjusted in the crew menu."
  ],
  si: [
    "Heel bone stiffness index by ultrasound; it combines the speed of sound and the attenuation.",
    "It drops when spongy bone loses density.",
    "Same countermeasures as bone density: resistive exercise, vitamin D and calcium."
  ],
  sos: [
    "Speed at which ultrasound crosses the heel: more bone, faster.",
    "It decreases when bone mass is lost.",
    "Resistive exercise and good bone nutrition."
  ],
  bua: [
    "How much the ultrasound weakens as it crosses the heel (broadband attenuation).",
    "It falls when the bone loses its inner trabeculae.",
    "Resistive exercise and good bone nutrition."
  ],
  t: [
    "Estimated T-score: how many standard deviations you are from a healthy young adult.",
    "It becomes more negative with bone loss. On Earth, as a reference, below −1 is osteopenia and below −2.5 is osteoporosis.",
    "Resistive exercise, vitamin D and calcium; follow-up with the flight surgeon."
  ],
  z: [
    "Estimated Z-score: your density compared with people of your age and sex.",
    "It drops if you lose bone faster than expected for your age.",
    "Same countermeasures as bone density."
  ],
  fi: [
    "Fragility index from 0 to 100 that summarizes fracture risk.",
    "It rises as bone density falls.",
    "Reduce bone loss with resistive exercise and avoid unnecessary impacts."
  ],
  esp: [
    "Muscle thickness measured by ultrasound, in millimeters.",
    "Muscles that carry almost no weight in orbit atrophy: their thickness decreases.",
    "Resistive exercise and enough protein in the diet."
  ],
  rig: [
    "Muscle stiffness (tone) with a myotonometer, in N/m.",
    "It drops when the muscle loses tone from disuse.",
    "Strength training and gentle stretching."
  ],
  rigb: ["Biceps stiffness with a myotonometer.", "It drops with the loss of muscle tone.", "Arm strength work."],
  rigq: [
    "Quadriceps stiffness with a myotonometer.",
    "The quadriceps is an antigravity muscle and loses tone quickly.",
    "Squats and leg press on the ARED."
  ],
  rigi: [
    "Hamstring stiffness with a myotonometer.",
    "They lose tone because of leg inactivity.",
    "Deadlift and knee flexion on the ARED."
  ],
  rigg: ["Gastrocnemius stiffness with a myotonometer.", "They atrophy quickly in microgravity.", "Heel raises."],
  rigs: [
    "Soleus stiffness with a myotonometer.",
    "The soleus holds the body upright and is one of the first to atrophy.",
    "Weighted heel raises."
  ],
  "ecm.fle": [
    "Force with which you flex the neck, measured with a dynamometer (kgf).",
    "The neck muscles lose strength without the weight of the head.",
    "Exercises with the head harness and pulleys from the plan."
  ],
  "antebrazom.fle": [
    "Thickness of the forearm flexor muscles.",
    "They change little, but wearing the suit gloves fatigues them.",
    "Grip exercises and stretching."
  ],
  ext: [
    "Neck extension strength, with a dynamometer (kgf).",
    "It loses strength because of the lack of neck load.",
    "Neck extensions with adjustable resistance."
  ],
  ccft: [
    "Craniocervical flexion test: the pressure (mmHg) you can hold with the deep neck muscles.",
    "It drops when the deep flexors weaken.",
    "Deep neck control exercises."
  ],
  area: [
    "Cross-sectional area of the cervical multifidus by ultrasound.",
    "They atrophy when the neck works little.",
    "Neck stabilization and the pulley harness."
  ],
  delt: [
    "Deltoid thickness.",
    "It holds up better because it is used in exercise and manual tasks.",
    "Presses and raises."
  ],
  pec: ["Pectoralis major thickness.", "It loses some mass because of the lower pushing demand.", "Pushing exercises."],
  bic: ["Biceps thickness.", "It changes little because it is used to move around.", "Elbow flexions."],
  tri: ["Triceps thickness.", "It is preserved with pushing exercise.", "Elbow extensions and pushes."],
  grip: [
    "Grip strength with a dynamometer, in kgf.",
    "It is compared with your pre-flight value; the suit adds fatigue.",
    "Exercises with a ball or spring and periodic measurement."
  ],
  rec: ["Rectus abdominis thickness.", "Without gravity the trunk works less and loses tone.", "Core exercises."],
  ere: [
    "Thickness of the erector spinae, which keep the spine upright.",
    "They work less without gravity and lose tone.",
    "Back extensions and core work."
  ],
  "cadera.glu": [
    "Gluteus maximus thickness.",
    "It is among the muscles that work the most when walking on Earth and among those that lose the most in orbit.",
    "Squats, bridges and deadlifts."
  ],
  quad: [
    "Quadriceps area measured by ultrasound (cm²).",
    "A great antigravity muscle: if the area drops a lot in a few months, the software calculates the percentage and warns.",
    "Squats and leg press on the ARED."
  ],
  isq: ["Hamstring area by ultrasound.", "They atrophy because of leg inactivity.", "Deadlift and leg curl."],
  ared: [
    "Squat repetitions with 80 kgf on the ARED device.",
    "It reflects the functional strength of the legs; it drops with atrophy.",
    "Keep up the ARED sessions and log the load."
  ],
  sur: [
    "Thickness of the triceps surae (gastrocnemius and soleus).",
    "It is what atrophies fastest in microgravity.",
    "Heel raises."
  ],
  tal: [
    "How many heel raises you manage in a row.",
    "It drops when the calf muscles weaken.",
    "Calf training and logging repetitions."
  ],
  ffm: [
    "Fat-free mass (muscle, bone and water) by bioelectrical impedance.",
    "It drops with muscle loss.",
    "Enough protein and resistive exercise."
  ],
  tbw: [
    "Total body water, in liters.",
    "Fluids shift toward the upper body and the total volume falls.",
    "Regular hydration and sodium control."
  ],
  ijv: [
    "Grade (1 to 4) of stasis, that is, stagnation, of blood in the jugular vein.",
    "Without gravity the blood in the neck does not drain downward and can stagnate; in rare cases a clot forms.",
    "Report any pain, swelling or redness in the neck. It is monitored with Doppler ultrasound."
  ],
  stif: [
    "Carotid artery stiffness (pulse wave velocity, m/s).",
    "Changes in pressure and fluids can harden the arteries.",
    "Aerobic exercise, and salt and pressure control."
  ],
  fvc: [
    "Forced vital capacity: how much air you can blow out in a forced exhalation.",
    "It changes slightly because the diaphragm rises and the chest redistributes.",
    "Breathing exercises and periodic spirometry."
  ],
  fev1: [
    "Volume of air you blow out in the first second of a forced exhalation.",
    "It is monitored together with vital capacity to detect problems from dust or irritants in the cabin.",
    "Avoid dust and report any cough or wheezing."
  ],
  frc: [
    "Functional residual capacity: the air left in the lungs after a normal exhalation.",
    "It drops in microgravity because the diaphragm rises.",
    "Breathing exercises and aerobic activity."
  ],
  spo2: [
    "Oxygen saturation: the percentage of the blood loaded with oxygen.",
    "It should stay high; it drops if the cabin air fails or there is a lung or heart problem.",
    "If it drops below 92 % check the cabin air and use supplemental oxygen. Below 85 % is a vital emergency."
  ],
  pi: [
    "Perfusion index: how much blood reaches the skin where oxygen is measured.",
    "It drops with cold, stress or poor circulation and helps you trust the SpO₂ reading.",
    "Warm your hands and measure again."
  ],
  lvef: [
    "Left ventricular ejection fraction: what percentage of the blood the heart pumps out with each beat.",
    "The heart works less in microgravity and can shrink a little.",
    "Regular aerobic exercise and echocardiography monitoring. Below 30 % is a vital emergency."
  ],
  lvm: [
    "Left ventricular mass index: how much muscle the heart has per body surface area.",
    "It drops because the heart makes less effort without gravity.",
    "Aerobic exercise to keep it fit."
  ],
  sv: [
    "Stroke volume: how much blood the heart pumps with each beat (mL).",
    "It drops because of the lower circulating blood volume.",
    "Adequate hydration and aerobic exercise."
  ],
  hr: [
    "Resting heart rate: how many times the heart beats per minute.",
    "It can rise with stress, dehydration or lack of conditioning. A very low or very high rate is dangerous.",
    "Rest for 5 minutes and measure again. Below 30 bpm a cardiorespiratory arrest is confirmed and the vital emergency is triggered."
  ],
  hrv: [
    "Heart rate variability (RMSSD): how much the time between beats varies; it is an indicator of recovery and stress.",
    "It drops with stress, poor sleep and fatigue.",
    "Sleep well, breathe slowly and reduce the workload."
  ],
  ort: [
    "Orthostatic tolerance index (0 to 100): how well your body tolerates standing up after floating.",
    "In microgravity the system that regulates pressure becomes untrained, and dizziness appears on returning to gravity.",
    "Negative pressure trousers (LBNP), good hydration and controlled salt before the return."
  ],
  sbp: [
    "Systolic blood pressure (the high number): the pressure when the heart beats.",
    "It can drop from fluid loss or rise from stress and too much salt.",
    "Measure at rest, hydrate and moderate salt. Below 70 or above 180 mmHg is a vital emergency."
  ],
  dbp: [
    "Diastolic blood pressure (the low number): the pressure between beats.",
    "It stays stable but is monitored together with the systolic.",
    "Measure at rest and consult if it stays high."
  ],
  "higado.glu": [
    "Blood glucose, in mg/dL.",
    "Stress, diet and lower activity can alter it.",
    "Eat at regular times. Below 50 or above 400 mg/dL is a vital emergency."
  ],
  cal: [
    "Calcium you eliminate in urine, in mg per day.",
    "Lost bone releases calcium that the kidneys eliminate; the risk of kidney stones rises.",
    "Drink enough water and report any pain in the side."
  ],
  diu: [
    "Urine output: liters of urine per day.",
    "It drops if you drink little and at the start of the flight it rises because of the fluid shift.",
    "Regular hydration."
  ],
  temp: [
    "Body temperature, in °C.",
    "It rises with infection or heat stress and drops with poor suit insulation.",
    "Adjust the suit cooling and drink fluids. Above 40 °C or below 34 °C is a vital emergency."
  ],
  tst: [
    "Total sleep time per night, in hours.",
    "Light, noise and the station's 16 sunrises a day disturb sleep.",
    "Fixed schedules, warm light before bed and avoiding screens."
  ],
  eff: [
    "Sleep efficiency: the percentage of the time in bed that you actually slept.",
    "It drops with night awakenings and an unsuitable environment.",
    "A dark, quiet environment and a regular routine."
  ],
  nhrv: [
    "Heart rate variability during the night.",
    "It shows how well you recover while you sleep.",
    "Sleep enough and lower stress."
  ],
  sq: [
    "Overall sleep quality that you score from 1 to 5.",
    "It reflects how you felt on waking.",
    "Log your sleep every morning."
  ],
  cog: [
    "Memory score from 1 to 10 in the 10 colors test: 1 point per color in its correct position.",
    "Insufficient sleep and stress reduce it.",
    "Rest, take a strategic 25 minute nap and repeat the test."
  ],
  acc: [
    "Position hits in the test (out of 10).",
    "It drops with fatigue and lack of attention.",
    "Rest and take the test again."
  ],
  span: [
    "Longest streak of steps without an error.",
    "It measures working memory and drops with tiredness.",
    "Rest and reduce distractions."
  ],
  lat: [
    "Onset latency: how long you take to start responding (ms).",
    "It rises with fatigue or excess CO₂ in the cabin.",
    "Check the CO₂ scrubbers and rest."
  ],
  itv: [
    "Interval between taps: the speed at which you respond in the test.",
    "It slows down with fatigue.",
    "Rest and repeat."
  ],
  lap: [
    "Attention lapses: times you lost attention.",
    "They increase with sleep deprivation and high CO₂.",
    "Rest and check the cabin air quality."
  ],
  rt: [
    "Mean reaction time in the red-to-green test (milliseconds).",
    "Insufficient sleep and fatigue lengthen it.",
    "Reassess or rest 20 minutes before precision tasks."
  ],
  fast: [
    "Your best reaction attempt (ms).",
    "It shows your best possible performance.",
    "Compare it with your average."
  ],
  rs: [
    "Reaction score from 1 to 10 that clears spacewalks with 6 or more.",
    "It drops with fatigue.",
    "If it is 4 or less, the EVA is not authorized until you are reassessed."
  ],
  fs: [
    "False starts: times you responded too early.",
    "They increase with anxiety or fatigue-driven impulsiveness.",
    "Breathe and repeat calmly."
  ],
  rl: ["Attempts with a reaction time over 500 ms.", "They indicate attention lapses.", "Rest and assess again."],
  mood: [
    "Your mood score from 1 to 10.",
    "Isolation, sleep and workload change it.",
    "Talk with your crewmates, schedule calls with Earth and tell the flight surgeon if you feel very low."
  ],
  vo2: [
    "Estimated VO₂max: how much oxygen your body can use at maximum effort; it is your aerobic capacity.",
    "It drops because of cardiovascular deconditioning in microgravity.",
    "Regular aerobic exercise on the cycle ergometer."
  ],
  awe: [
    "Aerobic work efficiency: oxygen used for each watt of effort.",
    "It improves with training and worsens with deconditioning.",
    "Aerobic training."
  ],
  pw: [
    "Power at the ventilatory threshold: the effort (W/kg) up to which you breathe comfortably.",
    "It drops when you lose fitness.",
    "Controlled aerobic intervals."
  ],
  hrr: [
    "Heart rate recovery in the first minute after exertion.",
    "A slow recovery indicates lower fitness.",
    "Regular aerobic exercise."
  ],
  borg: [
    "Perceived exertion on the Borg scale (6 to 20).",
    "If an effort feels harder than before, you may be deconditioned.",
    "Adjust the intensity and log how you feel."
  ],
  fsc: [
    "Cerebral blood flow: how much blood the brain receives per minute (about 50 ml per 100 g of tissue). It is close to 15 % of cardiac output.",
    "In microgravity fluids shift toward the head and flow regulation changes; low CO₂ or low pressure also lower it.",
    "If it drops, check blood pressure, hydration and cabin CO₂, and notify the flight surgeon."
  ],
  fscg: [
    "Blood flow in the gray matter (the neurons), normally 75 to 80 ml per 100 g per minute.",
    "Gray matter uses a lot of energy and is the first to notice a drop in flow.",
    "If it drops, rest, hydrate and notify the flight surgeon."
  ],
  fscb: [
    "Blood flow in the white matter (the connections), normally 20 to 30 ml per 100 g per minute.",
    "It is lower than in the gray matter because it uses less energy.",
    "If it stays low, it is assessed with the flight surgeon."
  ],
  pic: [
    "Intracranial pressure: the pressure inside the skull. The normal range at rest is 5 to 15 mmHg; sustained above 20 mmHg is intracranial hypertension.",
    "In microgravity blood and fluids rise to the head and the pressure can increase; it is related to the neuro-ocular syndrome.",
    "If it rises, avoid straining maneuvers, reduce salt, keep up the countermeasure routine and notify the flight surgeon."
  ],
  pam: [
    "Mean arterial pressure: the average pressure pushing blood through the body. The brain keeps a steady flow while it is between 60 and 160 mmHg.",
    "It changes with blood volume, effort and hydration.",
    "If it goes outside 60 to 160 mmHg, sit or lie down and notify the flight surgeon."
  ],
  ppc: [
    "Cerebral perfusion pressure: the pressure that actually pushes blood into the brain. It is calculated as MAP minus ICP. The normal range is 50 to 150 mmHg.",
    "It drops if intracranial pressure rises or blood pressure falls.",
    "Below 50 to 60 mmHg there is a risk of oxygen starvation in the tissue: notify the flight surgeon urgently."
  ],
  cmro2: [
    "Cerebral oxygen consumption: about 3.5 ml of oxygen per 100 g of tissue per minute. The brain weighs 2 % of the body but uses about 20 % of the oxygen.",
    "It drops with sedation, deep fatigue or lack of flow; it rises with intense mental activity.",
    "If it drops a lot, it is a sign that the brain is not receiving or using oxygen well: notify the flight surgeon."
  ],
  cmrg: [
    "Cerebral glucose metabolism: how much glucose the brain uses. It has almost no reserves, so it depends on a constant supply.",
    "It drops with hypoglycemia, insufficient sleep or poor perfusion.",
    "Eat regularly, monitor blood glucose and notify the flight surgeon if it stays low."
  ],
  beta: [
    "Electroencephalogram beta waves (13 to 30 Hz): fast and low in amplitude. They predominate when you are alert and focused.",
    "They drop with tiredness, lack of sleep or sedation.",
    "If they drop, rest and repeat the recording."
  ],
  alfa: [
    "Electroencephalogram alpha waves (8 to 13 Hz): they appear in relaxed wakefulness with the eyes closed.",
    "They drop with tension or cortical disturbances.",
    "If they stay low, it is reviewed with the flight surgeon."
  ],
  theta: [
    "Electroencephalogram theta waves (4 to 8 Hz): slow, typical of drowsiness and sleep onset.",
    "If they increase while awake, they indicate tiredness, lack of sleep or hypercapnia.",
    "Rest, take a short nap and check the cabin CO₂."
  ],
  delta: [
    "Electroencephalogram delta waves (1 to 4 Hz): very slow and high in amplitude; they belong to deep sleep.",
    "If they appear while awake, they may indicate a diffuse disturbance of the central nervous system.",
    "If they rise while awake, notify the flight surgeon."
  ],
  gcs: [
    "Glasgow Coma Scale: measures the level of consciousness through the eye, verbal and motor response. It goes from 3 to 15; 15 is normal.",
    "It drops with head blows, hypoxia, hypercapnia or intoxication.",
    "Below 15 is an alert: notify the flight surgeon immediately."
  ],
  ashw: [
    "Muscle tone measured with the Modified Ashworth scale (0 to 4). 0 is normal; higher means spasticity or rigidity.",
    "Disturbances of central motor control, the spinal cord or the corticospinal pathways raise it.",
    "If it rises to 1 or more, it is assessed with the flight surgeon and the physiotherapist."
  ],
  refl: [
    "Deep tendon reflexes on a scale from 0 to 4. 2 is normal; below 1 is hyporeflexia and 3 or more is hyperreflexia.",
    "They reflect how the central motor pathways and the spinal cord are working.",
    "If they go outside the normal range, notify the flight surgeon."
  ],
  pess: [
    "Somatosensory evoked potential latency (N20 wave): the time a signal takes to travel from the nerve to the cerebral cortex, passing through the spinal cord. The normal range is around 19 to 21 ms.",
    "It lengthens if there is compression or distress of the spinal cord or the sensory pathways.",
    "If it lengthens, notify the flight surgeon and avoid strong axial loads on the spine."
  ],
  mep: [
    "Motor evoked potential latency: the time the motor command takes to go from the cortex to the muscle through the spinal cord. The normal range is around 20 to 22 ms to the hand.",
    "It lengthens if the motor pathways of the spinal cord are damaged or compressed.",
    "If it lengthens, notify the flight surgeon."
  ],
  vcm: [
    "Motor nerve conduction velocity, in meters per second. The normal range in arms and legs is about 50 to 65 m/s.",
    "It drops with nerve compression, cold or inflammation.",
    "If it drops, notify the flight surgeon and review posture and ergonomics."
  ],
  hm: [
    "Ratio between the H reflex and the M response: it measures how excitable the motor neurons of the spinal cord are.",
    "It rises when there is spasticity or spinal hyperexcitability.",
    "If it rises, it is assessed with the flight surgeon and the physiotherapist."
  ],
  mrc: [
    "Muscle strength measured with the MRC scale from 0 to 5. 5 is normal strength; 4 is movement against reduced resistance; 3 is only overcoming gravity.",
    "It drops with atrophy from microgravity or with a spinal cord or nerve injury.",
    "If it drops below 5, reinforce resistive exercise and notify the flight surgeon."
  ],
  pss: [
    "Stress score from 1 to 10 that comes from the stress test. Higher is better: 8 to 10 is good, 6 to 7 is caution and 1 to 5 is critical.",
    "It drops with isolation, workload, insufficient sleep and the uncertainty of the mission.",
    "Slow breathing for 5 minutes, a fixed routine, contact with family or Earth, and tell the flight surgeon if it persists."
  ],
  cort: [
    "Morning salivary cortisol, in nmol/L: the stress hormone. The normal range is around 3 to 20 nmol/L.",
    "It rises with sustained stress and lack of sleep; if it stays high, it affects bones, muscles and defenses.",
    "Rest, routine and stress management; if it stays high, it is assessed with the flight surgeon."
  ],
  lfhf: [
    "LF/HF ratio of heart rate variability: it compares the activation of the sympathetic nervous system (alert) with that of the parasympathetic (calm).",
    "It rises when tension predominates and drops when there is recovery.",
    "Slow breathing and rest. If it stays high, stress and sleep are reviewed."
  ],
  eda: [
    "Skin conductance (electrodermal activity): how much the skin conducts, which increases with emotional sweat.",
    "It rises with stress, anxiety and exertion.",
    "Slow breathing and pauses; also check the cabin temperature."
  ],
  resp: [
    "Resting respiratory rate: how many times you breathe per minute. The normal range is around 12 to 16.",
    "It rises with stress, anxiety and high cabin CO₂.",
    "Slow diaphragmatic breathing; check the cabin CO₂ if it stays high."
  ],
  co2: [
    "Carbon dioxide measured on the skin (PtcCO₂), in mmHg.",
    "It rises if the cabin air accumulates CO₂ or if you breathe too little.",
    "Check the CO₂ scrubbers; above 70 mmHg is a vital emergency."
  ]
};

/* Cada texto del glosario se registra como traducción literal. */
if (typeof GLOS !== "undefined") {
  Object.keys(GLOS_EN).forEach(k => {
    const es = GLOS[k];
    if (!Array.isArray(es)) return;
    GLOS_EN[k].forEach((en, i) => {
      if (es[i]) KSTranslate.addExact(es[i], en);
    });
  });
}

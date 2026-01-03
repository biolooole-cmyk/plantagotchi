/* =====================================================
   PLANTAGOTCHI — GAME.JS
   MODEL C++ FINAL (STABLE & EXPLAINABLE)
   ===================================================== */

/* ===================== АУДІО ===================== */
let audioEnabled = false;

const sounds = {
  start: new Audio("audio/ui_start.mp3"),
  good: new Audio("audio/action_good.mp3"),
  stage: new Audio("audio/stage_up.mp3"),
  stress: new Audio("audio/stress.mp3"),
  dead: new Audio("audio/dead.mp3")
};

function enableAudio() {
  if (!audioEnabled) audioEnabled = true;
}

function playSound(name) {
  if (!audioEnabled || !sounds[name]) return;
  const s = sounds[name].cloneNode();
  s.volume = 0.8;
  s.play().catch(() => {});
}

/* ===================== ГЛОБАЛЬНІ ===================== */
let currentPlant = null;
let day = 0;
const maxDays = 35;
let timer = null;

/* ===================== ЕКОСИСТЕМА ===================== */
let waterLevel = 65;
let lightLevel = 70;
let temperature = 22;
let airHumidity = 50;
let airFlow = 30;
let soilAeration = 70;

let immunity = 70;
let stressLoad = 0;
let ecosystemPressure = 0;

/* ===================== ПРОБЛЕМИ ===================== */
let activeProblem = null;
let problemPhase = "none"; // none | symptom | active | treatment | recovery
let symptomTimer = 0;
let treatmentTimer = 0;
let recoveryTimer = 0;

let fungicideLeft = 2;
let insecticideLeft = 2;

/* ===================== СТАН ===================== */
let plantState = "normal";
let health = 100;

/* ===================== РІСТ ===================== */
let stageIndex = 0;
let growthPoints = 0;
let growthStreak = 0;

/* ===================== ІСТОРІЯ ===================== */
let history = [];
let lastTemperature = temperature;

/* ===================== DOM ===================== */
const img = document.getElementById("plantImage");
const ctx = document.getElementById("chart")?.getContext("2d");

const waterBar = document.getElementById("waterBar");
const lightBar = document.getElementById("lightBar");
const tempBar = document.getElementById("tempBar");
const healthBar = document.getElementById("healthBar");

const dayLabel = document.getElementById("dayLabel");
const stateReason = document.getElementById("stateReason");
const hint = document.getElementById("hint");

const fungicideBtn = document.getElementById("fungicideBtn");
const insecticideBtn = document.getElementById("insecticideBtn");

/* ===================== УТИЛІТИ ===================== */
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

/* ===================== СТАРТ ===================== */
document.getElementById("plantSelect")?.addEventListener("change", e => {
  enableAudio();
  currentPlant = plants[e.target.value];
  resetGame();
  img.style.display = "block";
  playSound("start");
  startTimer();
});

/* ===================== ТАЙМЕР ===================== */
function startTimer() {
  clearInterval(timer);
  timer = setInterval(nextDay, 4000);
}

/* ===================== ДІЇ ===================== */
function water() {
  enableAudio();
  waterLevel = clamp(waterLevel + 15);
  airHumidity = clamp(airHumidity + 6);
  soilAeration = clamp(soilAeration - 5);
  ecosystemPressure = Math.max(0, ecosystemPressure - 1);
  playSound("good");
}

function changeLight() {
  enableAudio();
  lightLevel = lightLevel > 60 ? 45 : 80;
  ecosystemPressure = Math.max(0, ecosystemPressure - 0.5);
  playSound("good");
}

function warm() {
  enableAudio();
  temperature = clamp(temperature + 3, 10, 40);
  airHumidity = clamp(airHumidity - 4);
  playSound("good");
}

/* ===================== ЛІКУВАННЯ ===================== */
function startTreatment(type) {
  if (!activeProblem || problemPhase !== "active") return;

  if (activeProblem.treatment !== type) {
    wrongTreatment();
    return;
  }

  if (type === "fungicide" && fungicideLeft <= 0) return;
  if (type === "insecticide" && insecticideLeft <= 0) return;

  if (type === "fungicide") fungicideLeft--;
  if (type === "insecticide") insecticideLeft--;

  problemPhase = "treatment";
  treatmentTimer = 2;
  playSound("good");
}

function wrongTreatment() {
  health = clamp(health - 5);
  immunity = clamp(immunity - 6);
  stressLoad += 2;
  ecosystemPressure += 1;
  playSound("stress");
}

/* ===================== RESET ===================== */
function resetGame() {
  day = 0;
  health = 100;
  immunity = 70;
  stressLoad = 0;
  ecosystemPressure = 0;

  stageIndex = 0;
  growthPoints = 0;
  growthStreak = 0;

  activeProblem = null;
  problemPhase = "none";
  symptomTimer = 0;
  treatmentTimer = 0;
  recoveryTimer = 0;

  fungicideLeft = 2;
  insecticideLeft = 2;

  waterLevel = 65;
  lightLevel = 70;
  temperature = 22;
  lastTemperature = temperature;

  airHumidity = 50;
  airFlow = 30;
  soilAeration = 70;

  plantState = "normal";
  history = [100];

  updateUI();
  drawChart();
}

/* ===================== ДЕННИЙ ЦИКЛ ===================== */
function nextDay() {
  if (plantState === "dead" || day >= maxDays) return;
  day++;

  lastTemperature = temperature;

  waterLevel = clamp(waterLevel - 3);
  airHumidity = clamp(airHumidity - 2);
  soilAeration = clamp(soilAeration - (waterLevel > 80 ? 1 : 0));
  temperature += Math.random() < 0.5 ? -1 : 1;

  evaluateEcosystem();
  processProblems();
  applyHealth();
  updateGrowth();

  updateUI();
  drawChart();
}

/* ===================== ЕКОСИСТЕМА ===================== */
function evaluateEcosystem() {
  const o = currentPlant.optimal;

  if (waterLevel < o.water[0] || waterLevel > o.water[1]) ecosystemPressure++;
  if (temperature < o.temp[0] || temperature > o.temp[1]) ecosystemPressure++;
  if (soilAeration < 40) ecosystemPressure++;

  ecosystemPressure = clamp(ecosystemPressure, 0, 10);

  immunity += ecosystemPressure >= 6 ? -2 : 1;
  immunity = clamp(immunity);

  stressLoad = immunity < 30 ? stressLoad + 1 : Math.max(0, stressLoad - 1);

  plantState =
    health <= 0 ? "dead" :
    stressLoad >= 6 ? "stress" :
    ecosystemPressure >= 7 ? "dry" :
    "normal";
}

/* ===================== ПРОБЛЕМИ ===================== */
function processProblems() {
  if (problemPhase === "none" && ecosystemPressure >= 6) {
    problemPhase = "symptom";
    symptomTimer = 2;
    playSound("stress");
  }

  if (problemPhase === "symptom") {
    symptomTimer--;
    if (symptomTimer <= 0) {
      activeProblem = plantProblems[currentPlant.id]
        .find(p => p.trigger({ waterLevel, airHumidity, soilAeration, temperature, immunity, growthStreak }));
      problemPhase = activeProblem ? "active" : "none";
    }
  }

  if (problemPhase === "treatment") {
    treatmentTimer--;
    if (treatmentTimer <= 0) {
      problemPhase = "recovery";
      recoveryTimer = 3;
    }
  }

  if (problemPhase === "recovery") {
    recoveryTimer--;
    immunity = clamp(immunity + 2);
    ecosystemPressure = Math.max(0, ecosystemPressure - 1);
    if (recoveryTimer <= 0) {
      activeProblem = null;
      problemPhase = "none";
    }
  }
}

/* ===================== ЗДОРОВʼЯ ===================== */
function applyHealth() {
  let delta =
    plantState === "normal" ? 2 :
    plantState === "stress" ? -3 :
    plantState === "dry" ? -2 : 0;

  if (activeProblem && problemPhase === "active") {
    delta -= 2;
    activeProblem.effect({ health, immunity, growthPoints, stressLoad });
  }

  health = clamp(health + delta);
  history.push(health);
}

/* ===================== РІСТ ===================== */
function updateGrowth() {
  if (plantState === "normal" && !activeProblem) {
    growthPoints++;
    growthStreak++;
  } else {
    growthPoints = Math.max(0, growthPoints - 0.5);
    growthStreak = 0;
  }

  if (growthPoints >= 4 && stageIndex < currentPlant.stages.length - 1) {
    stageIndex++;
    growthPoints = 0;
    playSound("stage");
  }
}

/* ===================== UI ===================== */
function updateUI() {
  waterBar.value = waterLevel;
  lightBar.value = lightLevel;
  tempBar.value = (temperature - 10) * 3.3;
  healthBar.value = health;

  dayLabel.textContent = `День: ${day} / ${maxDays}`;

  stateReason.textContent = activeProblem
    ? activeProblem.symptom
    : stateReasons[plantState];

  hint.textContent =
    problemPhase === "symptom"
      ? "🔍 Діагностика: умови нестабільні. Проаналізуйте екосистему."
      : problemPhase === "recovery"
      ? "🌱 Відновлення: підтримуйте стабільні умови."
      : compensationHints[plantState];

  fungicideBtn.disabled =
    !activeProblem || activeProblem.treatment !== "fungicide" || problemPhase !== "active";

  insecticideBtn.disabled =
    !activeProblem || activeProblem.treatment !== "insecticide" || problemPhase !== "active";

  updateVisual();
}

/* ===================== ВІЗУАЛ ===================== */
function updateVisual() {
  const id = currentPlant.id;
  img.src =
    plantState === "dead"
      ? `images/${id}/dead.png`
      : plantState === "stress"
      ? `images/${id}/stress.png`
      : plantState === "dry"
      ? `images/${id}/dry.png`
      : `images/${id}/${currentPlant.stages[stageIndex]}.png`;
}

/* ===================== ГРАФІК ===================== */
function drawChart() {
  if (!ctx || history.length < 2) return;
  ctx.clearRect(0, 0, 320, 150);
  ctx.beginPath();
  history.slice(-30).forEach((h, i, arr) => {
    const x = (i / (arr.length - 1)) * 320;
    const y = 150 - (h / 100) * 150;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#2e7d32";
  ctx.stroke();
}

/* ===================== EXPORT ===================== */
window.water = water;
window.changeLight = changeLight;
window.warm = warm;
window.useFungicide = () => startTreatment("fungicide");
window.useInsecticide = () => startTreatment("insecticide");

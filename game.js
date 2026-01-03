/* =====================================================
   PLANTAGOTCHI — GAME.JS
   MODEL C++ FINAL
   Екосистемний тиск → симптоми → проблеми → лікування
   УСІ ТЕКСТИ — УКРАЇНСЬКОЮ
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
  if (!audioEnabled) {
    Object.values(sounds).forEach(a => {
      a.volume = 0.8;
      a.play().then(() => a.pause()).catch(() => {});
      a.currentTime = 0;
    });
    audioEnabled = true;
  }
}

function playSound(name) {
  if (audioEnabled && sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {});
  }
}

/* ===================== ГЛОБАЛЬНІ ЗМІННІ ===================== */
let currentPlant = null;
let day = 0;
const maxDays = 35;
let gameTimer = null;
let isPaused = false;

/* ===================== ЕКОСИСТЕМА ===================== */
let waterLevel = 65;
let lightLevel = 70;
let temperature = 22;

let airHumidity = 50;
let airFlow = 30;
let soilAeration = 70;

let immunity = 70;
let stressLoad = 0;

/* КЛЮЧОВА МЕХАНІКА */
let ecosystemPressure = 0;

/* ===================== ПРОБЛЕМИ ===================== */
let activeProblem = null;
let problemPhase = "none"; // none | symptom | active | treatment
let symptomTimer = 0;
let treatmentTimer = 0;

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
const canvas = document.getElementById("chart");
const ctx = canvas ? canvas.getContext("2d") : null;

const waterBar = document.getElementById("waterBar");
const lightBar = document.getElementById("lightBar");
const tempBar = document.getElementById("tempBar");
const healthBar = document.getElementById("healthBar");

const dayLabel = document.getElementById("dayLabel");
const stateReason = document.getElementById("stateReason");
const hint = document.getElementById("hint");

const fungicideBtn = document.getElementById("fungicideBtn");
const insecticideBtn = document.getElementById("insecticideBtn");

/* ===================== ДОПОМІЖНІ ===================== */
const clamp = (v, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

function collectEnvironment() {
  return {
    waterLevel,
    lightLevel,
    temperature,
    airHumidity,
    airFlow,
    soilAeration,
    immunity,
    growthStreak,
    tempFluctuation: Math.abs(temperature - lastTemperature),
    ecosystemPressure
  };
}

/* ===================== ВИБІР РОСЛИНИ ===================== */
document.getElementById("plantSelect")?.addEventListener("change", e => {
  enableAudio();
  currentPlant = plants[e.target.value];
  resetGame();
  if (img) img.style.display = "block";
  playSound("start");
  startTimer();
});

/* ===================== ТАЙМЕР ===================== */
function startTimer() {
  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (!isPaused && plantState !== "dead" && day < maxDays) {
      nextDay();
    }
  }, 4000);
}

/* ===================== ДІЇ ГРАВЦЯ ===================== */
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
  health = clamp(health - 8);
  immunity = clamp(immunity - 8);
  stressLoad += 3;
  ecosystemPressure += 2;
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
  day++;
  lastTemperature = temperature;

  waterLevel = clamp(waterLevel - (4 + airFlow * 0.05));
  airHumidity = clamp(airHumidity - airFlow * 0.08);
  soilAeration = clamp(soilAeration - (waterLevel > 80 ? 2 : 0));

  temperature += Math.random() < 0.5 ? -1 : 1;
  temperature = clamp(temperature, 10, 40);

  evaluateEcosystem();
  processProblems();
  applyHealth();
  updateGrowth();

  updateUI();
  drawChart();
}

/* ===================== ОЦІНКА ЕКОСИСТЕМИ ===================== */
function evaluateEcosystem() {
  const o = currentPlant.optimal;

  if (waterLevel < o.water[0] || waterLevel > o.water[1]) ecosystemPressure++;
  if (temperature < o.temp[0] || temperature > o.temp[1]) ecosystemPressure++;
  if (soilAeration < 40) ecosystemPressure++;

  ecosystemPressure = clamp(ecosystemPressure, 0, 10);

  immunity += ecosystemPressure > 4 ? -3 : 2;
  immunity = clamp(immunity);

  stressLoad = immunity < 30 ? stressLoad + 2 : Math.max(0, stressLoad - 1);

  plantState =
    health <= 0 ? "dead" :
    stressLoad >= 6 ? "stress" :
    ecosystemPressure >= 5 ? "dry" :
    "normal";
}

/* ===================== ПРОБЛЕМИ ===================== */
function processProblems() {
  if (problemPhase === "none" && ecosystemPressure >= 5) {
    problemPhase = "symptom";
    symptomTimer = 2;
    playSound("stress");
  }

  if (problemPhase === "symptom") {
    symptomTimer--;
    if (symptomTimer <= 0) {
      const pool = plantProblems[currentPlant.id];
      activeProblem = pool[Math.floor(Math.random() * pool.length)];
      problemPhase = "active";
    }
  }

  if (problemPhase === "treatment") {
    treatmentTimer--;
    if (treatmentTimer <= 0) {
      activeProblem = null;
      problemPhase = "none";
      immunity = clamp(immunity + 10);
      ecosystemPressure = Math.max(0, ecosystemPressure - 3);
    }
  }
}

/* ===================== ЗДОРОВʼЯ ===================== */
function applyHealth() {
  let delta =
    plantState === "normal" ? 2 :
    plantState === "stress" ? -5 :
    plantState === "dry" ? -4 : 0;

  if (activeProblem && problemPhase === "active") {
    delta -= 3;
    activeProblem.effect({
      health,
      immunity,
      growthPoints,
      stressLoad
    });
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
  if (waterBar) waterBar.value = clamp(waterLevel);
  if (lightBar) lightBar.value = clamp(lightLevel);
  if (tempBar) tempBar.value = clamp((temperature - 10) * (100 / 30));
  if (healthBar) healthBar.value = health;

  if (dayLabel) {
    dayLabel.textContent = `День: ${day} / ${maxDays}`;
  }

  if (stateReason) {
    stateReason.textContent = activeProblem
      ? activeProblem.symptom
      : stateReasons?.[plantState] || "";
  }

  if (hint) {
    hint.textContent = activeProblem
      ? "🧠 Симптом не завжди означає причину. Проаналізуйте умови."
      : compensationHints?.[plantState] || "";
  }

  if (fungicideBtn) {
    fungicideBtn.disabled =
      !activeProblem || activeProblem.treatment !== "fungicide" || problemPhase !== "active";
    fungicideBtn.textContent = `🦠 Проти грибка (${fungicideLeft})`;
  }

  if (insecticideBtn) {
    insecticideBtn.disabled =
      !activeProblem || activeProblem.treatment !== "insecticide" || problemPhase !== "active";
    insecticideBtn.textContent = `🐞 Проти шкідників (${insecticideLeft})`;
  }

  updateVisual();
}

/* ===================== ВІЗУАЛ ===================== */
function updateVisual() {
  if (!currentPlant || !img) return;
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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  history.slice(-30).forEach((h, i, arr) => {
    const x = (i / (arr.length - 1)) * canvas.width;
    const y = canvas.height - (h / 100) * canvas.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#2e7d32";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/* ===================== EXPORT ===================== */
window.water = water;
window.changeLight = changeLight;
window.warm = warm;
window.useFungicide = () => startTreatment("fungicide");
window.useInsecticide = () => startTreatment("insecticide");

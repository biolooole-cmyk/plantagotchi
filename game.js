/* =====================================================
   PLANTAGOTCHI — GAME.JS
   Модель C: екосистема + проблеми + лікування
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

/* ===================== ГЛОБАЛЬНІ СТАНИ ===================== */

let currentPlant = null;
let day = 0;
const maxDays = 35;
let isPaused = false;
let gameTimer = null;

/* ===================== ЕКОСИСТЕМА ===================== */

let waterLevel = 65;
let lightLevel = 70;
let temperature = 22;

let airHumidity = 50;
let airFlow = 30;
let soilAeration = 70;
let immunity = 70;
let stressLoad = 0;

/* ===================== ПРОБЛЕМИ ===================== */

let activeProblem = null;
let problemDaysLeft = 0;

/* ===================== СТАН ===================== */

let plantState = "normal";
let health = 100;

/* ===================== РІСТ ===================== */

let stageIndex = 0;
let growthPoints = 0;
let growthStreak = 0;

/* ===================== НАКОПИЧЕННЯ ===================== */

let dryDays = 0;
let coldDays = 0;

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

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/* ===================== ЗБІР СЕРЕДОВИЩА ===================== */

function collectEnvironment() {
  return {
    waterLevel,
    lightLevel,
    temperature,
    airHumidity,
    airFlow,
    soilAeration,
    immunity,
    tempFluctuation: Math.abs(temperature - lastTemperature),
    growthStreak
  };
}

/* ===================== ВИБІР РОСЛИНИ ===================== */

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
  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (!isPaused && plantState !== "dead" && day < maxDays) {
      nextDay();
    }
  }, 6000);
}

/* ===================== ДІЇ ГРАВЦЯ ===================== */

function water() {
  enableAudio();
  waterLevel = clamp(waterLevel + 15);
  airHumidity = clamp(airHumidity + 6);
  soilAeration = clamp(soilAeration - 5);
  playSound("good");
  updateUI();
}

function changeLight() {
  enableAudio();
  lightLevel = lightLevel > 60 ? 45 : 80;
  playSound("good");
  updateUI();
}

function warm() {
  enableAudio();
  temperature = clamp(temperature + 3, 10, 40);
  airHumidity = clamp(airHumidity - 4);
  playSound("good");
  updateUI();
}

/* ===================== ЛІКУВАННЯ ===================== */

function useFungicide() {
  if (activeProblem?.treatment === "fungicide") {
    activeProblem = null;
    immunity = clamp(immunity + 6);
    playSound("good");
  } else wrongTreatment();
}

function useInsecticide() {
  if (activeProblem?.treatment === "insecticide") {
    activeProblem = null;
    immunity = clamp(immunity + 5);
    playSound("good");
  } else wrongTreatment();
}

function wrongTreatment() {
  health = clamp(health - 4);
  immunity = clamp(immunity - 6);
  stressLoad += 2;
  playSound("stress");
}

/* ===================== RESET ===================== */

function resetGame() {
  day = 0;
  stageIndex = 0;
  growthPoints = 0;
  growthStreak = 0;
  health = 100;
  immunity = 70;
  stressLoad = 0;
  activeProblem = null;

  waterLevel = 65;
  lightLevel = 70;
  temperature = 22;
  lastTemperature = temperature;

  airHumidity = 50;
  airFlow = 30;
  soilAeration = 70;

  dryDays = 0;
  coldDays = 0;
  plantState = "normal";

  history = [100];
  updateUI();
  drawChart();
}

/* ===================== ДЕНЬ ===================== */

function nextDay() {
  day++;
  lastTemperature = temperature;

  waterLevel = clamp(waterLevel - (4 + airFlow * 0.05));
  airHumidity = clamp(airHumidity - airFlow * 0.08);
  soilAeration = clamp(soilAeration - (waterLevel > 80 ? 2 : 0));

  temperature += Math.random() < 0.5 ? -1 : 1;
  temperature = clamp(temperature, 10, 40);

  evaluateEcosystem();
  rollProblems();
  applyHealth();
  updateGrowth();
  updateUI();
  drawChart();
}

/* ===================== ПРОБЛЕМИ ===================== */

function rollProblems() {
  if (activeProblem || !plantProblems[currentPlant.id]) return;

  const env = collectEnvironment();
  const pool = plantProblems[currentPlant.id];

  for (const p of pool) {
    if (p.trigger(env) && Math.random() < 0.25) {
      activeProblem = p;
      problemDaysLeft = 3;
      break;
    }
  }
}

/* ===================== ЕКОСИСТЕМА ===================== */

function evaluateEcosystem() {
  const o = currentPlant.optimal;

  waterLevel < o.water[0] ? dryDays++ : dryDays = Math.max(0, dryDays - 1);
  temperature < o.temp[0] - 3 ? coldDays++ : coldDays = Math.max(0, coldDays - 1);

  if (dryDays || coldDays || soilAeration < 40) immunity -= 3;
  else immunity += 2;

  immunity = clamp(immunity);

  stressLoad = immunity < 30 ? stressLoad + 2 : Math.max(0, stressLoad - 1);

  plantState =
    health <= 0 ? "dead" :
    stressLoad >= 6 ? "stress" :
    dryDays >= 2 ? "dry" :
    coldDays >= 2 ? "cold" :
    "normal";
}

/* ===================== ЗДОРОВʼЯ ===================== */

function applyHealth() {
  let delta = plantState === "normal" ? (immunity > 60 ? 3 : 2) :
              plantState === "dry" ? -4 :
              plantState === "cold" ? -3 :
              plantState === "stress" ? -5 : 0;

  if (activeProblem) {
    activeProblem.effect({
      health,
      immunity,
      waterLevel,
      growthPoints
    });
    problemDaysLeft--;
    if (problemDaysLeft <= 0) activeProblem = null;
  }

  health = clamp(health + delta);
  history.push(health);
}

/* ===================== РІСТ ===================== */

function updateGrowth() {
  if (plantState === "normal") {
    growthPoints += 1;
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
  waterBar.value = clamp(waterLevel);
  lightBar.value = clamp(lightLevel);
  tempBar.value = clamp((temperature - 10) * (100 / 30));
  healthBar.value = health;

  dayLabel.textContent = `День: ${day} / ${maxDays}`;

  stateReason.textContent = activeProblem
    ? activeProblem.hint
    : stateReasons?.[plantState] || "";

  hint.textContent = activeProblem
    ? "⚠️ Потрібне відповідне лікування."
    : compensationHints?.[plantState] || "";

  fungicideBtn && (fungicideBtn.disabled =
    !activeProblem || activeProblem.treatment !== "fungicide");

  insecticideBtn && (insecticideBtn.disabled =
    !activeProblem || activeProblem.treatment !== "insecticide");

  updateVisual();
}

/* ===================== ВІЗУАЛ ===================== */

function updateVisual() {
  if (!currentPlant || !img) return;
  const id = currentPlant.id;

  img.src =
    plantState === "dead" ? `images/${id}/dead.png` :
    plantState === "dry" ? `images/${id}/dry.png` :
    plantState === "cold" ? `images/${id}/cold.png` :
    plantState === "stress" ? `images/${id}/stress.png` :
    `images/${id}/${currentPlant.stages[stageIndex]}.png`;
}

/* ===================== ГРАФІК ===================== */

function drawChart() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  history.forEach((h, i) => {
    const x = i * (canvas.width / (history.length - 1));
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
window.useFungicide = useFungicide;
window.useInsecticide = useInsecticide;

/* =====================================================
   PLANTAGOTCHI — GAME.JS
   MODEL C — BALANCED ECOSYSTEM + PROBLEMS + TREATMENT
   ===================================================== */

/* ===================== AUDIO ===================== */
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

/* ===================== GLOBAL ===================== */
let currentPlant = null;
let day = 0;
const maxDays = 35;
let gameTimer = null;
let isPaused = false;

/* ===================== ECOSYSTEM ===================== */
let waterLevel = 65;
let lightLevel = 70;
let temperature = 22;

let airHumidity = 50;
let airFlow = 30;
let soilAeration = 70;
let immunity = 70;
let stressLoad = 0;

/* Відкладений ризик */
let latentRisk = 0;

/* ===================== PROBLEMS ===================== */
let activeProblem = null;
let problemDaysLeft = 0;
let treatmentInProgress = false;

let fungicideLeft = 2;
let insecticideLeft = 2;

/* ===================== STATE ===================== */
let plantState = "normal";
let health = 100;

/* ===================== GROWTH ===================== */
let stageIndex = 0;
let growthPoints = 0;
let growthStreak = 0;

/* ===================== ACCUMULATION ===================== */
let dryDays = 0;
let coldDays = 0;

/* ===================== HISTORY ===================== */
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

/* ===================== HELPERS ===================== */
const clamp = (v, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

/* ===================== PLANT SELECT ===================== */
document.getElementById("plantSelect")?.addEventListener("change", e => {
  enableAudio();
  currentPlant = plants[e.target.value];
  resetGame();
  if (img) img.style.display = "block";
  playSound("start");
  startTimer();
});

/* ===================== TIMER ===================== */
function startTimer() {
  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (!isPaused && plantState !== "dead" && day < maxDays) {
      nextDay();
    }
  }, 4000);
}

/* ===================== ACTIONS ===================== */
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

/* ===================== TREATMENT ===================== */
function useFungicide() {
  if (!activeProblem || fungicideLeft <= 0) return;

  if (activeProblem.treatment === "fungicide") {
    fungicideLeft--;
    treatmentInProgress = true;
    problemDaysLeft = 2;
    playSound("good");
  } else {
    wrongTreatment();
  }
  updateUI();
}

function useInsecticide() {
  if (!activeProblem || insecticideLeft <= 0) return;

  if (activeProblem.treatment === "insecticide") {
    insecticideLeft--;
    treatmentInProgress = true;
    problemDaysLeft = 2;
    playSound("good");
  } else {
    wrongTreatment();
  }
  updateUI();
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
  latentRisk = 0;

  activeProblem = null;
  treatmentInProgress = false;

  fungicideLeft = 2;
  insecticideLeft = 2;

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

/* ===================== DAY ===================== */
function nextDay() {
  day++;
  lastTemperature = temperature;

  waterLevel = clamp(waterLevel - (4 + airFlow * 0.05));
  airHumidity = clamp(airHumidity - airFlow * 0.08);
  soilAeration = clamp(soilAeration - (waterLevel > 80 ? 2 : 0));

  temperature += Math.random() < 0.5 ? -1 : 1;
  temperature = clamp(temperature, 10, 40);

  /* Відкладений ризик */
  if (waterLevel > 80 && airFlow < 30) latentRisk++;
  else if (temperature < currentPlant.optimal.temp[0] - 3) latentRisk++;
  else latentRisk = Math.max(0, latentRisk - 1);

  evaluateEcosystem();
  rollProblems();
  applyHealth();
  updateGrowth();
  updateUI();
  drawChart();
}

/* ===================== PROBLEMS ===================== */
function rollProblems() {
  if (activeProblem || treatmentInProgress || latentRisk < 3) return;

  const pool = plantProblems[currentPlant.id];
  for (const p of pool) {
    if (p.trigger(collectEnvironment()) && Math.random() < 0.35) {
      activeProblem = p;
      problemDaysLeft = 3;
      latentRisk = 0;
      break;
    }
  }
}

/* ===================== ECOSYSTEM ===================== */
function evaluateEcosystem() {
  const o = currentPlant.optimal;

  waterLevel < o.water[0] ? dryDays++ : dryDays = Math.max(0, dryDays - 1);
  temperature < o.temp[0] - 3 ? coldDays++ : coldDays = Math.max(0, coldDays - 1);

  immunity += (dryDays || coldDays || soilAeration < 40) ? -3 : 2;
  immunity = clamp(immunity);

  stressLoad = immunity < 30 ? stressLoad + 2 : Math.max(0, stressLoad - 1);

  plantState =
    health <= 0 ? "dead" :
    stressLoad >= 6 ? "stress" :
    dryDays >= 2 ? "dry" :
    coldDays >= 2 ? "cold" :
    "normal";
}

/* ===================== HEALTH ===================== */
function applyHealth() {
  let delta =
    plantState === "normal" ? (immunity > 60 ? 3 : 2) :
    plantState === "dry" ? -4 :
    plantState === "cold" ? -3 :
    plantState === "stress" ? -5 : 0;

  if (activeProblem) {
    if (treatmentInProgress) {
      problemDaysLeft--;
      if (problemDaysLeft <= 0) {
        activeProblem = null;
        treatmentInProgress = false;
        immunity = clamp(immunity + 6);
      }
    } else {
      delta -= 2;
    }
  }

  health = clamp(health + delta);
  history.push(health);
}

/* ===================== GROWTH ===================== */
function updateGrowth() {
  if (plantState === "normal") {
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

  if (dayLabel) dayLabel.textContent = `День: ${day} / ${maxDays}`;

  if (stateReason) {
    stateReason.textContent = activeProblem
      ? activeProblem.hint
      : stateReasons?.[plantState] || "";
  }

  if (hint) {
    hint.textContent = activeProblem
      ? "⚠️ Потрібно підібрати правильне лікування."
      : compensationHints?.[plantState] || "";
  }

  if (fungicideBtn) {
    fungicideBtn.disabled = !activeProblem || activeProblem.treatment !== "fungicide";
    fungicideBtn.textContent = `🦠 Проти грибка (${fungicideLeft})`;
  }

  if (insecticideBtn) {
    insecticideBtn.disabled = !activeProblem || activeProblem.treatment !== "insecticide";
    insecticideBtn.textContent = `🐞 Проти шкідників (${insecticideLeft})`;
  }

  updateVisual();
}

/* ===================== VISUAL ===================== */
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

/* ===================== CHART ===================== */
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

/* =====================================================
   PLANTAGOTCHI — GAME.JS
   Модель B: екосистема кімнатної рослини
   (без зміни станів, стадій, звуків і UI)
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

/* Видимі параметри */
let waterLevel = 65;     // вологість ґрунту
let lightLevel = 70;     // освітлення
let temperature = 22;   // температура кімнати

/* Приховані екосистемні параметри */
let airHumidity = 50;    // вологість повітря
let airFlow = 30;        // рух повітря
let soilAeration = 70;   // аерація ґрунту
let immunity = 70;       // імунітет рослини
let stressLoad = 0;      // накопичений стрес

/* Стан рослини */
let plantState = "normal";
let health = 100;

/* Ріст */
let stageIndex = 0;
let growthPoints = 0;

/* Накопичення */
let dryDays = 0;
let coldDays = 0;
let stressDays = 0;

/* Історія */
let history = [];

/* ===================== DOM ===================== */

const img = document.getElementById("plantImage");
const canvas = document.getElementById("chart");
const ctx = canvas ? canvas.getContext("2d") : null;
const pauseBtn = document.getElementById("pauseBtn");

const waterBar = document.getElementById("waterBar");
const lightBar = document.getElementById("lightBar");
const tempBar = document.getElementById("tempBar");

const healthBar = document.getElementById("healthBar");
const dayLabel = document.getElementById("dayLabel");
const stateReason = document.getElementById("stateReason");
const hint = document.getElementById("hint");

/* ===================== ДОПОМІЖНІ ===================== */

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/* ===================== ВИБІР РОСЛИНИ ===================== */

const plantSelect = document.getElementById("plantSelect");
if (plantSelect) {
  plantSelect.addEventListener("change", e => {
    enableAudio();
    const id = e.target.value;
    if (plants[id]) {
      currentPlant = plants[id];
      resetGame();
      img.style.display = "block";
      playSound("start");
      startTimer();
    }
  });
}

/* ===================== ПАУЗА ===================== */

if (pauseBtn) {
  pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶ Продовжити" : "⏸ Пауза";
    playSound("good");
  });
}

/* ===================== ТАЙМЕР ===================== */

function startTimer() {
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (!isPaused && currentPlant && plantState !== "dead" && day < maxDays) {
      nextDay();
    }
  }, 6000);
}

/* ===================== ДІЇ КОРИСТУВАЧА ===================== */

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

/* Кнопки NPK → ЕКОСИСТЕМНІ ДІЇ */
function fertilize(type) {
  enableAudio();
  if (type === "N") {
    airFlow = clamp(airFlow + 10); // провітрювання
  }
  if (type === "P") {
    airHumidity = clamp(airHumidity - 8); // осушення повітря
  }
  if (type === "K") {
    soilAeration = clamp(soilAeration + 10); // розпушування ґрунту
  }
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

/* ===================== RESET ===================== */

function resetGame() {
  day = 0;
  stageIndex = 0;
  growthPoints = 0;
  health = 100;

  waterLevel = 65;
  lightLevel = 70;
  temperature = 22;

  airHumidity = 50;
  airFlow = 30;
  soilAeration = 70;
  immunity = 70;
  stressLoad = 0;

  dryDays = 0;
  coldDays = 0;
  stressDays = 0;

  plantState = "normal";
  history = [100];

  updateUI();
  drawChart();
}

/* ===================== ДЕНЬ ===================== */

function nextDay() {
  day++;

  waterLevel = clamp(waterLevel - (4 + airFlow * 0.05));
  airHumidity = clamp(airHumidity - (airFlow * 0.08));
  soilAeration = clamp(soilAeration - (waterLevel > 80 ? 2 : 0));

  temperature += Math.random() < 0.5 ? -1 : 1;
  temperature = clamp(temperature, 10, 40);

  evaluateEcosystem();
  applyHealth();
  updateGrowth();
  updateUI();
  drawChart();
}

/* ===================== ОЦІНКА ЕКОСИСТЕМИ ===================== */

function evaluateEcosystem() {
  const o = currentPlant.optimal;

  /* Dry */
  if (waterLevel < o.water[0] || airHumidity < 35 || airFlow > 70) {
    dryDays++;
  } else {
    dryDays = Math.max(0, dryDays - 1);
  }

  /* Cold */
  if (temperature < o.temp[0] - 3 || (airFlow > 60 && temperature < o.temp[0])) {
    coldDays++;
  } else {
    coldDays = Math.max(0, coldDays - 1);
  }

  /* Імунітет */
  if (dryDays > 0 || coldDays > 0 || soilAeration < 40) {
    immunity = clamp(immunity - 3);
  } else {
    immunity = clamp(immunity + 2);
  }

  /* Стрес */
  if (immunity < 30 || dryDays >= 2 || coldDays >= 2) {
    stressLoad += 2;
    stressDays++;
  } else {
    stressLoad = Math.max(0, stressLoad - 1);
    stressDays = Math.max(0, stressDays - 1);
  }

  /* Визначення стану */
  let prev = plantState;

  if (health <= 0) plantState = "dead";
  else if (stressLoad >= 6) plantState = "stress";
  else if (dryDays >= 2) plantState = "dry";
  else if (coldDays >= 2) plantState = "cold";
  else plantState = "normal";

  if (plantState !== prev) {
    if (plantState === "dead") {
      playSound("dead");
      clearInterval(gameTimer);
    } else if (["stress", "dry", "cold"].includes(plantState)) {
      playSound("stress");
    }
  }
}

/* ===================== ЗДОРОВʼЯ ===================== */

function applyHealth() {
  let delta = 0;

  if (plantState === "normal") delta = immunity > 60 ? 3 : 2;
  if (plantState === "dry") delta = -4;
  if (plantState === "cold") delta = -3;
  if (plantState === "stress") delta = -5;
  if (plantState === "dead") health = 0;

  health = clamp(health + delta);
  history.push(health);
}

/* ===================== РІСТ ===================== */

function updateGrowth() {
  if (plantState === "normal") growthPoints += 1;
  else if (plantState === "stress") growthPoints -= 0.5;

  if (growthPoints >= 4 && stageIndex < currentPlant.stages.length - 1) {
    stageIndex++;
    growthPoints = 0;
    playSound("stage");
  }
}

/* ===================== ВІЗУАЛ ===================== */

function updateVisual() {
  if (!currentPlant || !img) return;

  if (plantState === "dead") img.src = `images/${currentPlant.id}/dead.png`;
  else if (plantState === "dry") img.src = `images/${currentPlant.id}/dry.png`;
  else if (plantState === "cold") img.src = `images/${currentPlant.id}/cold.png`;
  else if (plantState === "stress") img.src = `images/${currentPlant.id}/stress.png`;
  else img.src = `images/${currentPlant.id}/${currentPlant.stages[stageIndex]}.png`;
}

/* ===================== UI ===================== */

function updateUI() {
  waterBar.value = clamp(waterLevel);
  lightBar.value = clamp(lightLevel);
  tempBar.value = clamp((temperature - 10) * (100 / 30));
  healthBar.value = health;
  dayLabel.textContent = `День: ${day} / ${maxDays}`;

  stateReason.textContent =
    stateReasons?.[plantState] || `Стан: ${plantState}`;

  hint.textContent =
    compensationHints?.[plantState] || "";

  updateVisual();
}

/* ===================== ГРАФІК ===================== */

function drawChart() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  history.forEach((h, i) => {
    const x = (i / (history.length - 1)) * canvas.width;
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
window.fertilize = fertilize;
window.warm = warm;

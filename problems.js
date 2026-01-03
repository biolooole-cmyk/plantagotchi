/* =====================================================
   PLANTAGOTCHI — PROBLEMS.JS
   КРОК 2: симптоми ≠ причина
   Біологічно коректні проблеми з ризиком лікування
   ===================================================== */

const plantProblems = {

  /* =========================
     КВАСОЛЯ
     ========================= */
  bean: [

    {
      id: "bean_root_fungus",
      symptom: "🍂 Листя в’яне і темніє",
      possibleCauses: ["fungus", "overwatering"],
      realCause: "fungus",

      trigger: (env) =>
        env.waterLevel > 80 && env.soilAeration < 50,

      effect: (state) => {
        state.health -= 3;
        state.growthPoints -= 0.5;
        state.immunity -= 1;
      },

      treatment: "fungicide"
    },

    {
      id: "bean_temp_shock",
      symptom: "🌡 Листя втрачає тургор",
      possibleCauses: ["cold", "temperature_fluctuation"],
      realCause: "temperature_fluctuation",

      trigger: (env) =>
        env.tempFluctuation > 4,

      effect: (state) => {
        state.immunity -= 4;
        state.stressLoad += 1;
      },

      treatment: null
    },

    {
      id: "bean_aphids",
      symptom: "🐞 Дрібні пошкодження на листі",
      possibleCauses: ["pests"],
      realCause: "pests",

      trigger: (env) =>
        env.airHumidity < 35 && env.immunity < 50,

      effect: (state) => {
        state.waterLevel -= 4;
        state.immunity -= 2;
      },

      treatment: "insecticide"
    }
  ],

  /* =========================
     ТРОЯНДА
     ========================= */
  rose: [

    {
      id: "rose_powdery_mildew",
      symptom: "🌫 Білий наліт на листі",
      possibleCauses: ["fungus", "stagnant_air"],
      realCause: "fungus",

      trigger: (env) =>
        env.airHumidity > 75 && env.airFlow < 30,

      effect: (state) => {
        state.health -= 4;
        state.immunity -= 2;
      },

      treatment: "fungicide"
    },

    {
      id: "rose_bud_failure",
      symptom: "🌸 Бутони не розкриваються",
      possibleCauses: ["low_light", "cold"],
      realCause: "low_light",

      trigger: (env) =>
        env.lightLevel < 60,

      effect: (state) => {
        state.growthBlocked = true;
        state.growthPoints -= 1;
      },

      treatment: null
    },

    {
      id: "rose_root_rot",
      symptom: "⚠️ Рослина різко в’яне",
      possibleCauses: ["fungus", "overwatering"],
      realCause: "fungus",

      trigger: (env) =>
        env.waterLevel > 85 && env.soilAeration < 45,

      effect: (state) => {
        state.health -= 6;
        state.immunity -= 3;
      },

      treatment: "fungicide"
    }
  ],

  /* =========================
     М’ЯТА
     ========================= */
  mint: [

    {
      id: "mint_overgrowth",
      symptom: "🌿 Листя дрібнішає, ріст нестабільний",
      possibleCauses: ["overgrowth", "resource_depletion"],
      realCause: "overgrowth",

      trigger: (env) =>
        env.growthStreak > 6,

      effect: (state) => {
        state.immunity -= 3;
        state.stressLoad += 1;
      },

      treatment: null
    },

    {
      id: "mint_spider_mite",
      symptom: "🕸 На листі з’являється павутинка",
      possibleCauses: ["pests", "dry_air"],
      realCause: "pests",

      trigger: (env) =>
        env.airHumidity < 30 && env.temperature > 26,

      effect: (state) => {
        state.waterLevel -= 3;
        state.immunity -= 2;
      },

      treatment: "insecticide"
    },

    {
      id: "mint_leaf_rot",
      symptom: "⚠️ Нижні листки втрачають тургор",
      possibleCauses: ["fungus", "poor_aeration"],
      realCause: "fungus",

      trigger: (env) =>
        env.soilAeration < 40,

      effect: (state) => {
        state.health -= 2;
        state.immunity -= 1;
      },

      treatment: "fungicide"
    }
  ]
};

/* =====================================================
   ЕКСПОРТ (опційно)
   ===================================================== */
if (typeof module !== "undefined") {
  module.exports = { plantProblems };
}

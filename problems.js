/* =====================================================
   PLANTAGOTCHI — PROBLEMS.JS
   КРОК 2: симптоми ≠ причина
   Оптимізована версія
   ===================================================== */

const plantProblems = {

  /* =========================
     КВАСОЛЯ
     ========================= */
  bean: [

    {
      id: "bean_root_fungus",
      symptom: "🍂 Листя в’яне і темніє",
      realCause: "fungus",
      treatment: "fungicide",

      trigger: env =>
        env.waterLevel > 80 && env.soilAeration < 50,

      effect: state => {
        state.health -= 3;
        state.growthPoints -= 0.5;
        state.immunity -= 1;
      }
    },

    {
      id: "bean_temp_shock",
      symptom: "🌡 Листя втрачає тургор",
      realCause: "temperature_fluctuation",
      treatment: null,

      trigger: env =>
        env.tempFluctuation > 4,

      effect: state => {
        state.immunity -= 4;
        state.stressLoad += 1;
      }
    },

    {
      id: "bean_aphids",
      symptom: "🐞 Дрібні пошкодження на листі",
      realCause: "pests",
      treatment: "insecticide",

      trigger: env =>
        env.airHumidity < 35 && env.immunity < 50,

      effect: state => {
        state.waterLevel -= 4;
        state.immunity -= 2;
      }
    }
  ],

  /* =========================
     ТРОЯНДА
     ========================= */
  rose: [

    {
      id: "rose_powdery_mildew",
      symptom: "🌫 Білий наліт на листі",
      realCause: "fungus",
      treatment: "fungicide",

      trigger: env =>
        env.airHumidity > 75 && env.airFlow < 30,

      effect: state => {
        state.health -= 4;
        state.immunity -= 2;
      }
    },

    {
      id: "rose_bud_failure",
      symptom: "🌸 Бутони не розкриваються",
      realCause: "low_light",
      treatment: null,

      trigger: env =>
        env.lightLevel < 60,

      effect: state => {
        state.growthPoints -= 1;
      }
    },

    {
      id: "rose_root_rot",
      symptom: "⚠️ Рослина різко в’яне",
      realCause: "fungus",
      treatment: "fungicide",

      trigger: env =>
        env.waterLevel > 85 && env.soilAeration < 45,

      effect: state => {
        state.health -= 6;
        state.immunity -= 3;
      }
    }
  ],

  /* =========================
     М’ЯТА
     ========================= */
  mint: [

    {
      id: "mint_overgrowth",
      symptom: "🌿 Листя дрібнішає, ріст нестабільний",
      realCause: "overgrowth",
      treatment: null,

      trigger: env =>
        env.growthStreak > 6,

      effect: state => {
        state.immunity -= 3;
        state.stressLoad += 1;
      }
    },

    {
      id: "mint_spider_mite",
      symptom: "🕸 На листі з’являється павутинка",
      realCause: "pests",
      treatment: "insecticide",

      trigger: env =>
        env.airHumidity < 30 && env.temperature > 26,

      effect: state => {
        state.waterLevel -= 3;
        state.immunity -= 2;
      }
    },

    {
      id: "mint_leaf_rot",
      symptom: "⚠️ Нижні листки втрачають тургор",
      realCause: "fungus",
      treatment: "fungicide",

      trigger: env =>
        env.soilAeration < 40,

      effect: state => {
        state.health -= 2;
        state.immunity -= 1;
      }
    }
  ]
};

/* =========================
   EXPORT
   ========================= */
if (typeof module !== "undefined") {
  module.exports = { plantProblems };
}

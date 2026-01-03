/* =====================================================
   PLANTAGOTCHI — PROBLEMS.JS
   КРОК 2: СИМПТОМИ ≠ ПРИЧИНА
   Біологічно коректні проблеми кімнатних рослин
   ===================================================== */

/*
  СТРУКТУРА ПРОБЛЕМИ:
  - id              унікальний ідентифікатор
  - symptom         те, що бачить гравець
  - realCause       реальна біологічна причина
  - severity        рівень небезпеки (1–3)
  - treatment       правильне лікування або null
  - trigger(env)    умови появи
  - effect(state)   поступовий негативний вплив
*/

const plantProblems = {

  /* =====================================================
     КВАСОЛЯ (Phaseolus vulgaris)
     ===================================================== */
  bean: [

    {
      id: "bean_root_fungus",
      symptom: "🍂 Листя в’яне і темніє",
      realCause: "fungus",
      severity: 3,
      treatment: "fungicide",

      trigger: env =>
        env.waterLevel > 80 &&
        env.soilAeration < 50,

      effect: state => {
        state.health -= 3;
        state.immunity -= 2;
        state.growthPoints -= 0.5;
        state.stressLoad += 1;
      }
    },

    {
      id: "bean_temp_shock",
      symptom: "🌡 Листя втрачає тургор",
      realCause: "temperature_fluctuation",
      severity: 2,
      treatment: null,

      trigger: env =>
        env.tempFluctuation > 4,

      effect: state => {
        state.immunity -= 3;
        state.stressLoad += 1;
      }
    },

    {
      id: "bean_aphids",
      symptom: "🐞 Дрібні пошкодження на листі",
      realCause: "pests",
      severity: 2,
      treatment: "insecticide",

      trigger: env =>
        env.airHumidity < 35 &&
        env.immunity < 50,

      effect: state => {
        state.waterLevel -= 3;
        state.immunity -= 2;
        state.stressLoad += 1;
      }
    }
  ],

  /* =====================================================
     ТРОЯНДА (Rosa)
     ===================================================== */
  rose: [

    {
      id: "rose_powdery_mildew",
      symptom: "🌫 Білий наліт на листі",
      realCause: "fungus",
      severity: 3,
      treatment: "fungicide",

      trigger: env =>
        env.airHumidity > 75 &&
        env.airFlow < 30,

      effect: state => {
        state.health -= 4;
        state.immunity -= 2;
        state.stressLoad += 1;
      }
    },

    {
      id: "rose_bud_failure",
      symptom: "🌸 Бутони не розкриваються",
      realCause: "low_light",
      severity: 1,
      treatment: null,

      trigger: env =>
        env.lightLevel < 60,

      effect: state => {
        state.growthPoints -= 1;
        state.immunity -= 1;
      }
    },

    {
      id: "rose_root_rot",
      symptom: "⚠️ Рослина різко в’яне",
      realCause: "fungus",
      severity: 3,
      treatment: "fungicide",

      trigger: env =>
        env.waterLevel > 85 &&
        env.soilAeration < 45,

      effect: state => {
        state.health -= 6;
        state.immunity -= 3;
        state.stressLoad += 2;
      }
    }
  ],

  /* =====================================================
     М’ЯТА (Mentha)
     ===================================================== */
  mint: [

    {
      id: "mint_overgrowth",
      symptom: "🌿 Листя дрібнішає, ріст нестабільний",
      realCause: "overgrowth",
      severity: 1,
      treatment: null,

      trigger: env =>
        env.growthStreak > 6,

      effect: state => {
        state.immunity -= 2;
        state.stressLoad += 1;
      }
    },

    {
      id: "mint_spider_mite",
      symptom: "🕸 На листі з’являється павутинка",
      realCause: "pests",
      severity: 2,
      treatment: "insecticide",

      trigger: env =>
        env.airHumidity < 30 &&
        env.temperature > 26,

      effect: state => {
        state.waterLevel -= 3;
        state.immunity -= 2;
        state.stressLoad += 1;
      }
    },

    {
      id: "mint_leaf_rot",
      symptom: "⚠️ Нижні листки втрачають тургор",
      realCause: "fungus",
      severity: 2,
      treatment: "fungicide",

      trigger: env =>
        env.soilAeration < 40,

      effect: state => {
        state.health -= 2;
        state.immunity -= 1;
        state.stressLoad += 1;
      }
    }
  ]
};

/* =====================================================
   ЕКСПОРТ (опційно для модулів)
   ===================================================== */
if (typeof module !== "undefined") {
  module.exports = { plantProblems };
}

const plantProblems = {

  bean: [
    {
      id: "bean_root_fungus",
      type: "fungus",
      title: "Грибкове ураження коренів",
      trigger: (env) =>
        env.waterLevel > 80 && env.soilAeration < 50,

      effect: (state) => {
        state.health -= 3;
        state.growthPoints -= 0.5;
      },

      treatment: "fungicide",
      hint: "🦠 Коренева система уражена через надлишок вологи."
    },

    {
      id: "bean_temp_shock",
      type: "physiology",
      title: "Температурний шок",
      trigger: (env) =>
        env.tempFluctuation > 4,

      effect: (state) => {
        state.immunity -= 4;
      },

      treatment: null,
      hint: "🌡 Різкі перепади температури порушують обмін речовин."
    },

    {
      id: "bean_aphids",
      type: "pest",
      title: "Попелиця",
      trigger: (env) =>
        env.airHumidity < 35 && env.immunity < 50,

      effect: (state) => {
        state.waterLevel -= 4;
        state.immunity -= 2;
      },

      treatment: "insecticide",
      hint: "🐛 Листя пошкоджене шкідниками."
    }
  ],

  rose: [
    {
      id: "rose_powdery_mildew",
      type: "fungus",
      title: "Борошниста роса",
      trigger: (env) =>
        env.airHumidity > 75 && env.airFlow < 30,

      effect: (state) => {
        state.health -= 4;
      },

      treatment: "fungicide",
      hint: "🦠 Ознаки грибкового нальоту на листі."
    },

    {
      id: "rose_bud_failure",
      type: "physiology",
      title: "Бутони не розкриваються",
      trigger: (env) =>
        env.lightLevel < 60,

      effect: (state) => {
        state.growthBlocked = true;
      },

      treatment: null,
      hint: "🌸 Недостатнє світло для цвітіння."
    },

    {
      id: "rose_root_rot",
      type: "fungus",
      title: "Коренева гниль",
      trigger: (env) =>
        env.waterLevel > 85,

      effect: (state) => {
        state.health -= 6;
      },

      treatment: "fungicide",
      hint: "⚠️ Коріння уражене через застій води."
    }
  ],

  mint: [
    {
      id: "mint_overgrowth",
      type: "system",
      title: "Переріст і виснаження",
      trigger: (env) =>
        env.growthStreak > 6,

      effect: (state) => {
        state.immunity -= 3;
      },

      treatment: null,
      hint: "🌿 Надто інтенсивний ріст виснажує рослину."
    },

    {
      id: "mint_spider_mite",
      type: "pest",
      title: "Павутинний кліщ",
      trigger: (env) =>
        env.airHumidity < 30 && env.temperature > 26,

      effect: (state) => {
        state.waterLevel -= 3;
      },

      treatment: "insecticide",
      hint: "🐛 На листі з’являється павутинка."
    },

    {
      id: "mint_leaf_rot",
      type: "fungus",
      title: "Загнивання нижніх листків",
      trigger: (env) =>
        env.soilAeration < 40,

      effect: (state) => {
        state.health -= 2;
      },

      treatment: "fungicide",
      hint: "⚠️ Нижні листки втрачають тургор."
    }
  ]
};

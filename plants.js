/* =====================================================
   PLANTAGOTCHI — PLANTS.JS
   Дані про рослини: стадії росту та екосистемні потреби
   Модель B: кімнатна екосистема
   ===================================================== */

/* =====================================================
   СТРУКТУРА ДАНИХ

   Кожна рослина має:
   - id: унікальний ідентифікатор
   - name: назва українською
   - description: короткий біологічний опис
   - stages: масив стадій росту (назви файлів зображень)
   - optimal: оптимальні діапазони параметрів
     - water: [мін, макс] — вологість ґрунту (0–100)
     - light: [мін, макс] — рівень освітлення (0–100)
     - temp: [мін, макс] — температура (°C)
   - ecosystem: екосистемна чутливість (0–1)
     - airSensitivity — чутливість до сухого повітря
     - airflowSensitivity — чутливість до протягів
     - soilSensitivity — чутливість до перезволоження ґрунту
   ===================================================== */

const plants = {

  /* ===========================
     КВАСОЛЯ (Phaseolus vulgaris)
     =========================== */
  bean: {
    id: "bean",
    name: "Квасоля",
    description:
      "Швидкорослина однорічна бобова культура. Добре реагує на стабільні умови, але чутлива до холоду, протягів і різких змін мікроклімату.",

    stages: ["seed", "sprout", "plant", "flower", "fruit"],

    optimal: {
      water: [60, 80],
      light: [65, 85],
      temp: [18, 26]
    },

    ecosystem: {
      airSensitivity: 0.6,
      airflowSensitivity: 0.7,
      soilSensitivity: 0.5
    },

    tips: {
      watering:
        "Регулярний полив без пересихання ґрунту. Надмірна сухість повітря швидко призводить до в’янення.",
      temperature:
        "Погано переносить холод і протяги. Потребує стабільного тепла.",
      light:
        "Потребує яскравого світла для швидкого росту та формування плодів.",
      ecosystem:
        "Чутлива до різких змін умов. Стабільність важливіша за ідеальні значення."
    }
  },

  /* ===========================
     ТРОЯНДА (Rosa)
     =========================== */
  rose: {
    id: "rose",
    name: "Троянда",
    description:
      "Багаторічна декоративна рослина з високими вимогами до мікроклімату. Погано переносить перезволоження ґрунту та застій повітря.",

    stages: ["seed", "sprout", "plant", "flower", "fruit"],

    optimal: {
      water: [50, 70],
      light: [70, 90],
      temp: [15, 24]
    },

    ecosystem: {
      airSensitivity: 0.8,
      airflowSensitivity: 0.5,
      soilSensitivity: 0.8
    },

    tips: {
      watering:
        "Рівномірний полив без застою води. Перелив значно підвищує ризик стресу.",
      temperature:
        "Добре почувається в прохолоднішому, але стабільному мікрокліматі.",
      light:
        "Потребує багато світла для формування бутонів.",
      ecosystem:
        "Особливо чутлива до порушення балансу між вологою ґрунту та повітря."
    }
  },

  /* ===========================
     М'ЯТА (Mentha)
     =========================== */
  mint: {
    id: "mint",
    name: "М'ята",
    description:
      "Невибаглива багаторічна ароматична рослина, добре адаптується до змін умов і має високий рівень екосистемної стійкості.",

    stages: ["seed", "sprout", "plant", "flower", "fruit"],

    optimal: {
      water: [65, 85],
      light: [50, 75],
      temp: [16, 25]
    },

    ecosystem: {
      airSensitivity: 0.3,
      airflowSensitivity: 0.3,
      soilSensitivity: 0.4
    },

    tips: {
      watering:
        "Любить вологий ґрунт і добре переносить рясний полив.",
      temperature:
        "Стійка до коливань температури в межах кімнатного діапазону.",
      light:
        "Може рости в напівтіні, але краще розвивається при розсіяному світлі.",
      ecosystem:
        "Добре компенсує короткочасні порушення умов."
    }
  }
};

/* =====================================================
   ДОДАТКОВА ІНФОРМАЦІЯ ПРО СТАДІЇ РОСТУ
   ===================================================== */

const growthStages = {
  seed: {
    name: "Насіння",
    description:
      "Початкова стадія розвитку. Насіння перебуває в стані спокою, проте вже реагує на умови середовища.",
    duration: "1–3 дні"
  },
  sprout: {
    name: "Паросток",
    description:
      "Період проростання. Рослина особливо чутлива до нестачі води та холоду.",
    duration: "3–7 днів"
  },
  plant: {
    name: "Рослина",
    description:
      "Активний вегетативний ріст. Формується основна маса листя та стебел.",
    duration: "7–14 днів"
  },
  flower: {
    name: "Цвітіння",
    description:
      "Формування бутонів і квітів. Рослина потребує стабільного мікроклімату.",
    duration: "7–10 днів"
  },
  fruit: {
    name: "Плодоношення",
    description:
      "Завершальна стадія розвитку. Утворюються плоди або насіння.",
    duration: "7–14 днів"
  }
};

/* =====================================================
   ІНФОРМАЦІЯ ПРО ПОЖИВНІ РЕЧОВИНИ
   (залишено як навчальний довідник)
   ===================================================== */

const nutrientInfo = {
  N: {
    name: "Азот (N)",
    role: "Ріст листя та стебел",
    deficiency: "Жовтіння листя, повільний ріст",
    excess: "Надмірний вегетативний ріст"
  },
  P: {
    name: "Фосфор (P)",
    role: "Коренева система, цвітіння",
    deficiency: "Слабке коріння",
    excess: "Порушення балансу елементів"
  },
  K: {
    name: "Калій (K)",
    role: "Стійкість і імунітет",
    deficiency: "Зниження опірності",
    excess: "Блокування інших елементів"
  }
};

/* =====================================================
   ДОПОМІЖНІ ФУНКЦІЇ
   ===================================================== */

function getPlant(id) {
  return plants[id] || null;
}

function getAllPlants() {
  return Object.values(plants);
}

function getStageName(key) {
  return growthStages[key]?.name || key;
}

function getNutrientInfo(nutrient) {
  return nutrientInfo[nutrient] || null;
}

/* =====================================================
   ВАЛІДАЦІЯ ДАНИХ
   ===================================================== */

function validatePlants() {
  const errors = [];

  Object.entries(plants).forEach(([key, plant]) => {
    if (plant.id !== key) {
      errors.push(`Plant ${key}: ID mismatch`);
    }

    if (!plant.stages || plant.stages.length === 0) {
      errors.push(`Plant ${key}: No stages defined`);
    }

    if (!plant.optimal) {
      errors.push(`Plant ${key}: No optimal conditions`);
    }
  });

  if (errors.length) {
    console.error("Plant data validation errors:", errors);
    return false;
  }

  console.log("✅ Plant ecosystem data validated successfully");
  return true;
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", validatePlants);
}

/* =====================================================
   ЕКСПОРТ
   ===================================================== */

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    plants,
    growthStages,
    nutrientInfo,
    getPlant,
    getAllPlants,
    getStageName,
    getNutrientInfo,
    validatePlants
  };
}

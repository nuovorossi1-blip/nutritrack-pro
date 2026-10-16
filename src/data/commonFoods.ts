import type { Food } from '../types';

// Sottoinsieme USDA ufficiale. Le forme di pasta condividono il riferimento generico
// della stessa ricetta (semola o integrale); la cottura e una voce distinta, non una resa universale.
export const COMMON_FOODS: Food[] = [
  {
    "id": "common_carrots_raw",
    "name": "Carote crude",
    "aliases": [
      "carota",
      "carote",
      "carota cruda"
    ],
    "preparation": "raw",
    "counterpartId": "common_carrots_cooked",
    "category": "verdure",
    "kcal": 41,
    "pro": 0.93,
    "carbs": 9.58,
    "fats": 0.24,
    "source": "usda",
    "usda": {
      "fdcId": 170393,
      "description": "Carrots, raw",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/170393/nutrients"
    }
  },
  {
    "id": "common_carrots_cooked",
    "name": "Carote bollite",
    "aliases": [
      "carota cotta",
      "carote cotte",
      "carota bollita",
      "carote bollite"
    ],
    "preparation": "cooked",
    "counterpartId": "common_carrots_raw",
    "category": "verdure",
    "kcal": 35,
    "pro": 0.76,
    "carbs": 8.22,
    "fats": 0.18,
    "source": "usda",
    "usda": {
      "fdcId": 170394,
      "description": "Carrots, cooked, boiled, drained, without salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/170394/nutrients"
    }
  },
  {
    "id": "common_potatoes_raw",
    "name": "Patate crude",
    "aliases": [
      "patata",
      "patate",
      "patata cruda"
    ],
    "preparation": "raw",
    "counterpartId": "common_potatoes_cooked",
    "category": "verdure",
    "kcal": 77,
    "pro": 2.05,
    "carbs": 17.5,
    "fats": 0.09,
    "source": "usda",
    "usda": {
      "fdcId": 170026,
      "description": "Potatoes, flesh and skin, raw",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/170026/nutrients"
    }
  },
  {
    "id": "common_potatoes_cooked",
    "name": "Patate bollite",
    "aliases": [
      "patata cotta",
      "patate cotte",
      "patata bollita",
      "patate bollite"
    ],
    "preparation": "cooked",
    "counterpartId": "common_potatoes_raw",
    "category": "verdure",
    "kcal": 87,
    "pro": 1.87,
    "carbs": 20.1,
    "fats": 0.1,
    "source": "usda",
    "usda": {
      "fdcId": 170438,
      "description": "Potatoes, boiled, cooked in skin, flesh, without salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/170438/nutrients"
    }
  },
  {
    "id": "common_pasta_raw",
    "name": "Pasta di semola (cruda/secca)",
    "aliases": [
      "pasta normale",
      "pasta normale cruda",
      "pasta secca"
    ],
    "preparation": "raw",
    "counterpartId": "common_pasta_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_pasta_cooked",
    "name": "Pasta di semola cotta",
    "aliases": [
      "pasta cotta",
      "pasta bollita",
      "pasta normale cotta"
    ],
    "preparation": "cooked",
    "counterpartId": "common_pasta_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_penne_raw",
    "name": "Penne di semola (crude/secche)",
    "aliases": [
      "penne",
      "penne crude",
      "penne secche",
      "pasta penne"
    ],
    "preparation": "raw",
    "counterpartId": "common_penne_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_penne_cooked",
    "name": "Penne di semola cotte",
    "aliases": [
      "penne cotte",
      "penne bollite"
    ],
    "preparation": "cooked",
    "counterpartId": "common_penne_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_spaghetti_raw",
    "name": "Spaghetti di semola (crudi/secchi)",
    "aliases": [
      "spaghetti",
      "spaghetti crudi",
      "spaghetti secchi"
    ],
    "preparation": "raw",
    "counterpartId": "common_spaghetti_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_spaghetti_cooked",
    "name": "Spaghetti di semola cotti",
    "aliases": [
      "spaghetti cotti",
      "spaghetti bolliti"
    ],
    "preparation": "cooked",
    "counterpartId": "common_spaghetti_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_fusilli_raw",
    "name": "Fusilli di semola (crudi)",
    "aliases": [
      "fusilli",
      "fusilli crudi"
    ],
    "preparation": "raw",
    "counterpartId": "common_fusilli_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_fusilli_cooked",
    "name": "Fusilli di semola cotti",
    "aliases": [
      "fusilli cotti"
    ],
    "preparation": "cooked",
    "counterpartId": "common_fusilli_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_rigatoni_raw",
    "name": "Rigatoni di semola (crudi)",
    "aliases": [
      "rigatoni",
      "rigatoni crudi"
    ],
    "preparation": "raw",
    "counterpartId": "common_rigatoni_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_rigatoni_cooked",
    "name": "Rigatoni di semola cotti",
    "aliases": [
      "rigatoni cotti"
    ],
    "preparation": "cooked",
    "counterpartId": "common_rigatoni_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_farfalle_raw",
    "name": "Farfalle di semola (crude)",
    "aliases": [
      "farfalle",
      "farfalle crude"
    ],
    "preparation": "raw",
    "counterpartId": "common_farfalle_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_farfalle_cooked",
    "name": "Farfalle di semola cotte",
    "aliases": [
      "farfalle cotte"
    ],
    "preparation": "cooked",
    "counterpartId": "common_farfalle_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_tortiglioni_raw",
    "name": "Tortiglioni di semola (crudi)",
    "aliases": [
      "tortiglioni",
      "tortiglioni crudi"
    ],
    "preparation": "raw",
    "counterpartId": "common_tortiglioni_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_tortiglioni_cooked",
    "name": "Tortiglioni di semola cotti",
    "aliases": [
      "tortiglioni cotti"
    ],
    "preparation": "cooked",
    "counterpartId": "common_tortiglioni_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_linguine_raw",
    "name": "Linguine di semola (crude)",
    "aliases": [
      "linguine",
      "linguine crude"
    ],
    "preparation": "raw",
    "counterpartId": "common_linguine_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_linguine_cooked",
    "name": "Linguine di semola cotte",
    "aliases": [
      "linguine cotte"
    ],
    "preparation": "cooked",
    "counterpartId": "common_linguine_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_maccheroni_raw",
    "name": "Maccheroni di semola (crudi)",
    "aliases": [
      "maccheroni",
      "maccheroni crudi"
    ],
    "preparation": "raw",
    "counterpartId": "common_maccheroni_cooked",
    "category": "pasta",
    "kcal": 371,
    "pro": 13,
    "carbs": 74.7,
    "fats": 1.51,
    "source": "usda",
    "usda": {
      "fdcId": 169736,
      "description": "Pasta, dry, enriched",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169736/nutrients"
    }
  },
  {
    "id": "common_maccheroni_cooked",
    "name": "Maccheroni di semola cotti",
    "aliases": [
      "maccheroni cotti"
    ],
    "preparation": "cooked",
    "counterpartId": "common_maccheroni_raw",
    "category": "pasta",
    "kcal": 158,
    "pro": 5.8,
    "carbs": 30.9,
    "fats": 0.93,
    "source": "usda",
    "usda": {
      "fdcId": 169737,
      "description": "Pasta, cooked, enriched, without added salt",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169737/nutrients"
    }
  },
  {
    "id": "common_whole_pasta_raw",
    "name": "Pasta integrale (cruda/secca)",
    "aliases": [
      "pasta integrale",
      "pasta integrale cruda",
      "pasta integrale secca",
      "fusilli integrali",
      "rigatoni integrali",
      "farfalle integrali",
      "tortiglioni integrali",
      "linguine integrali"
    ],
    "preparation": "raw",
    "counterpartId": "common_whole_pasta_cooked",
    "category": "pasta",
    "kcal": 352,
    "pro": 13.9,
    "carbs": 73.4,
    "fats": 2.93,
    "source": "usda",
    "usda": {
      "fdcId": 169738,
      "description": "Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program)",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169738/nutrients"
    }
  },
  {
    "id": "common_whole_pasta_cooked",
    "name": "Pasta integrale cotta",
    "aliases": [
      "pasta integrale cotta",
      "pasta integrale bollita",
      "fusilli integrali cotti",
      "rigatoni integrali cotti",
      "farfalle integrali cotte",
      "tortiglioni integrali cotti",
      "linguine integrali cotte"
    ],
    "preparation": "cooked",
    "counterpartId": "common_whole_pasta_raw",
    "category": "pasta",
    "kcal": 149,
    "pro": 5.99,
    "carbs": 30.1,
    "fats": 1.71,
    "source": "usda",
    "usda": {
      "fdcId": 168910,
      "description": "Pasta, whole-wheat, cooked (Includes foods for USDA's Food Distribution Program)",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/168910/nutrients"
    }
  },
  {
    "id": "common_whole_penne_raw",
    "name": "Penne integrali (crude/secche)",
    "aliases": [
      "penne integrali",
      "penne integrali crude"
    ],
    "preparation": "raw",
    "counterpartId": "common_whole_penne_cooked",
    "category": "pasta",
    "kcal": 352,
    "pro": 13.9,
    "carbs": 73.4,
    "fats": 2.93,
    "source": "usda",
    "usda": {
      "fdcId": 169738,
      "description": "Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program)",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169738/nutrients"
    }
  },
  {
    "id": "common_whole_penne_cooked",
    "name": "Penne integrali cotte",
    "aliases": [
      "penne integrali cotte"
    ],
    "preparation": "cooked",
    "counterpartId": "common_whole_penne_raw",
    "category": "pasta",
    "kcal": 149,
    "pro": 5.99,
    "carbs": 30.1,
    "fats": 1.71,
    "source": "usda",
    "usda": {
      "fdcId": 168910,
      "description": "Pasta, whole-wheat, cooked (Includes foods for USDA's Food Distribution Program)",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/168910/nutrients"
    }
  },
  {
    "id": "common_whole_spaghetti_raw",
    "name": "Spaghetti integrali (crudi/secchi)",
    "aliases": [
      "spaghetti integrali",
      "spaghetti integrali crudi"
    ],
    "preparation": "raw",
    "counterpartId": "common_whole_spaghetti_cooked",
    "category": "pasta",
    "kcal": 352,
    "pro": 13.9,
    "carbs": 73.4,
    "fats": 2.93,
    "source": "usda",
    "usda": {
      "fdcId": 169738,
      "description": "Pasta, whole-wheat, dry (Includes foods for USDA's Food Distribution Program)",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169738/nutrients"
    }
  },
  {
    "id": "common_whole_spaghetti_cooked",
    "name": "Spaghetti integrali cotti",
    "aliases": [
      "spaghetti integrali cotti"
    ],
    "preparation": "cooked",
    "counterpartId": "common_whole_spaghetti_raw",
    "category": "pasta",
    "kcal": 149,
    "pro": 5.99,
    "carbs": 30.1,
    "fats": 1.71,
    "source": "usda",
    "usda": {
      "fdcId": 168910,
      "description": "Pasta, whole-wheat, cooked (Includes foods for USDA's Food Distribution Program)",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/168910/nutrients"
    }
  },
  {
    "id": "common_toast_white",
    "name": "Pane bianco tostato (in cassetta)",
    "aliases": [
      "pane tostato",
      "pane bianco tostato",
      "toast bianco"
    ],
    "category": "pane",
    "kcal": 290,
    "pro": 9,
    "carbs": 54.5,
    "fats": 4,
    "source": "usda",
    "usda": {
      "fdcId": 174925,
      "description": "Bread, white, commercially prepared, toasted",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/174925/nutrients"
    }
  },
  {
    "id": "common_toast_whole",
    "name": "Pane integrale tostato (in cassetta)",
    "aliases": [
      "pane integrale tostato",
      "toast integrale"
    ],
    "category": "pane",
    "kcal": 306,
    "pro": 16.3,
    "carbs": 51.2,
    "fats": 4.07,
    "source": "usda",
    "usda": {
      "fdcId": 172689,
      "description": "Bread, whole-wheat, commercially prepared, toasted",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/172689/nutrients"
    }
  },
  {
    "id": "common_orange",
    "name": "Arancia",
    "aliases": [
      "arance",
      "arancia fresca"
    ],
    "category": "frutta",
    "kcal": 47,
    "pro": 0.94,
    "carbs": 11.8,
    "fats": 0.12,
    "source": "usda",
    "usda": {
      "fdcId": 169097,
      "description": "Oranges, raw, all commercial varieties",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169097/nutrients"
    }
  },
  {
    "id": "common_pear",
    "name": "Pera",
    "aliases": [
      "pere"
    ],
    "category": "frutta",
    "kcal": 57,
    "pro": 0.36,
    "carbs": 15.2,
    "fats": 0.14,
    "source": "usda",
    "usda": {
      "fdcId": 169118,
      "description": "Pears, raw",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169118/nutrients"
    }
  },
  {
    "id": "common_kiwi",
    "name": "Kiwi",
    "aliases": [
      "kiwifruit"
    ],
    "category": "frutta",
    "kcal": 61,
    "pro": 1.14,
    "carbs": 14.7,
    "fats": 0.52,
    "source": "usda",
    "usda": {
      "fdcId": 168153,
      "description": "Kiwifruit, green, raw",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/168153/nutrients"
    }
  },
  {
    "id": "common_strawberry",
    "name": "Fragole",
    "aliases": [
      "fragola"
    ],
    "category": "frutta",
    "kcal": 32,
    "pro": 0.67,
    "carbs": 7.68,
    "fats": 0.3,
    "source": "usda",
    "usda": {
      "fdcId": 167762,
      "description": "Strawberries, raw",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/167762/nutrients"
    }
  },
  {
    "id": "common_peach",
    "name": "Pesca",
    "aliases": [
      "pesche"
    ],
    "category": "frutta",
    "kcal": 39,
    "pro": 0.91,
    "carbs": 9.54,
    "fats": 0.25,
    "source": "usda",
    "usda": {
      "fdcId": 169928,
      "description": "Peaches, yellow, raw",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/169928/nutrients"
    }
  },
  {
    "id": "common_croissant_butter",
    "name": "Cornetto del bar / croissant al burro (generico)",
    "aliases": [
      "cornetto del bar",
      "cornetto al bar",
      "croissant",
      "brioche vuota"
    ],
    "category": "dolci",
    "nutritionReference": {
      "label": "USDA - Croissant al burro, riferimento generico: la ricetta del bar puo variare",
      "url": "https://fdc.nal.usda.gov/food-details/174987/nutrients",
      "approximate": true
    },
    "kcal": 406,
    "pro": 8.2,
    "carbs": 45.8,
    "fats": 21,
    "source": "usda",
    "usda": {
      "fdcId": 174987,
      "description": "Croissants, butter",
      "dataType": "SR Legacy",
      "url": "https://fdc.nal.usda.gov/food-details/174987/nutrients"
    }
  }
];

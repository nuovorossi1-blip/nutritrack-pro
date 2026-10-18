import type { Food } from '../types';
import { BASE_FOODS } from './baseFoods';

export type PlanGroup = 'pro' | 'carbs' | 'fats' | 'veg';
export interface CleanFood { food: Food; group: PlanGroup; /** Grammi massimi realistici per un pasto. */ max: number }

// Valori per 100 g da USDA FoodData Central (SR Legacy, CC0), alimenti crudi o secchi.
const usda = (id: string, name: string, fdcId: number, description: string, kcal: number, pro: number, carbs: number, fats: number): Food => ({
  id, name, kcal, pro, carbs, fats, preparation: 'raw', source: 'usda',
  usda: { fdcId, description, dataType: 'SR Legacy', url: `https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients` },
});

const NEW_FOODS: Food[] = [
  usda('clean_egg_white', 'Albume d\'uovo', 172183, 'Egg, white, raw, fresh', 52, 10.9, 0.7, 0.2),
  usda('clean_cottage', 'Fiocchi di latte magri', 172182, 'Cheese, cottage, lowfat, 2% milkfat', 81, 10.4, 4.8, 2.3),
  usda('clean_oats', 'Fiocchi d\'avena', 173904, 'Cereals, oats, regular and quick, not fortified, dry', 379, 13.2, 67.7, 6.5),
  usda('clean_couscous', 'Cous cous (secco)', 169699, 'Couscous, dry', 376, 12.8, 77.4, 0.6),
  usda('clean_spelt', 'Farro (crudo)', 169745, 'Spelt, uncooked', 338, 14.6, 70.2, 2.4),
  usda('clean_lentils', 'Lenticchie secche', 172420, 'Lentils, raw', 352, 24.6, 63.4, 1.1),
  usda('clean_borlotti', 'Fagioli borlotti secchi', 175189, 'Beans, cranberry (roman), mature seeds, raw', 335, 23, 60, 1.2),
  usda('clean_cannellini', 'Fagioli cannellini secchi', 175202, 'Beans, white, mature seeds, raw', 333, 23.4, 60.3, 0.9),
  usda('clean_chickpeas', 'Ceci secchi', 173756, 'Chickpeas (garbanzo beans, bengal gram), mature seeds, raw', 378, 20.5, 63, 6),
  usda('clean_banana', 'Banana', 173944, 'Bananas, raw', 89, 1.1, 22.8, 0.3),
  usda('clean_apple', 'Mela', 171688, 'Apples, raw, with skin', 52, 0.3, 13.8, 0.2),
  usda('clean_olive_oil', 'Olio extravergine d\'oliva', 171413, 'Oil, olive, salad or cooking', 884, 0, 0, 100),
  usda('clean_avocado', 'Avocado', 171705, 'Avocados, raw, all commercial varieties', 160, 2, 8.5, 14.7),
  usda('clean_almonds', 'Mandorle', 170567, 'Nuts, almonds', 579, 21.2, 21.6, 49.9),
  usda('clean_walnuts', 'Noci', 170187, 'Nuts, walnuts, english', 654, 15.2, 13.7, 65.2),
  usda('clean_peanut_butter', 'Burro di arachidi (100%)', 172470, 'Peanut butter, smooth style, without salt', 598, 22.2, 22.3, 51.4),
  usda('clean_parmesan', 'Parmigiano', 170848, 'Cheese, parmesan, hard', 392, 35.8, 3.2, 25),
  usda('clean_zucchini', 'Zucchine', 169291, 'Squash, summer, zucchini, includes skin, raw', 17, 1.2, 3.1, 0.3),
  usda('clean_broccoli', 'Broccoli', 170379, 'Broccoli, raw', 34, 2.8, 6.6, 0.4),
  usda('clean_green_beans', 'Fagiolini', 169961, 'Beans, snap, green, raw', 31, 1.8, 7, 0.2),
  usda('clean_spinach', 'Spinaci', 168462, 'Spinach, raw', 23, 2.9, 3.6, 0.4),
  usda('clean_tomatoes', 'Pomodori', 170457, 'Tomatoes, red, ripe, raw, year round average', 18, 0.9, 3.9, 0.2),
  usda('clean_peppers', 'Peperoni', 170108, 'Peppers, sweet, red, raw', 26, 1, 6, 0.3),
  usda('clean_eggplant', 'Melanzane', 169228, 'Eggplant, raw', 25, 1, 5.9, 0.2),
  usda('clean_lettuce', 'Insalata verde', 169249, 'Lettuce, green leaf, raw', 15, 1.4, 2.9, 0.2),
];

const pick: [string, PlanGroup, number][] = [
  ['f3', 'pro', 400], ['f4', 'pro', 400], ['f5', 'pro', 350], ['f7', 'pro', 450], ['f6', 'pro', 300], ['f8', 'pro', 240],
  ['clean_egg_white', 'pro', 400], ['f_egg', 'pro', 240], ['f26', 'pro', 500], ['clean_cottage', 'pro', 400],
  ['common_pasta_raw', 'carbs', 200], ['common_whole_pasta_raw', 'carbs', 200], ['f11', 'carbs', 200], ['bread_white', 'carbs', 250],
  ['bread_wholemeal', 'carbs', 250], ['common_potatoes_raw', 'carbs', 600], ['clean_oats', 'carbs', 150], ['clean_couscous', 'carbs', 200],
  ['clean_spelt', 'carbs', 200], ['clean_lentils', 'carbs', 150], ['clean_borlotti', 'carbs', 150], ['clean_cannellini', 'carbs', 150],
  ['clean_chickpeas', 'carbs', 150], ['clean_banana', 'carbs', 300], ['clean_apple', 'carbs', 400],
  ['clean_olive_oil', 'fats', 30], ['clean_avocado', 'fats', 200], ['clean_almonds', 'fats', 50], ['clean_walnuts', 'fats', 50],
  ['clean_peanut_butter', 'fats', 40], ['clean_parmesan', 'fats', 60],
  ['clean_zucchini', 'veg', 400], ['clean_broccoli', 'veg', 400], ['clean_green_beans', 'veg', 400], ['clean_spinach', 'veg', 400],
  ['clean_tomatoes', 'veg', 400], ['clean_peppers', 'veg', 400], ['clean_eggplant', 'veg', 400], ['clean_lettuce', 'veg', 200],
];

const all = [...BASE_FOODS, ...NEW_FOODS];
export const CLEAN_FOODS: CleanFood[] = pick.flatMap(([id, group, max]) => {
  const food = all.find((f) => f.id === id);
  return food ? [{ food, group, max }] : [];
});
/** Alimenti dell'elenco che non esistono fra quelli base: vanno salvati quando si aggiungono a un pasto. */
export const CLEAN_NEW_IDS = new Set(NEW_FOODS.map((f) => f.id));

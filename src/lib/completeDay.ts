import type { Food, Macros } from '../types';
import type { PlanGroup } from '../data/cleanFoods';
import { macrosFor, sumMacros } from './nutrition';

export interface PlanItem { food: Food; group: PlanGroup; max: number; /** Grammi scelti dall'utente: non si ricalcolano. */ fixed?: number }
export interface PlanResult { grams: number[]; total: Macros; /** Macro senza un alimento scelto che possa chiuderli. */ uncovered: ('pro' | 'carbs' | 'fats')[] }

const VEG_GRAMS = 200;
const MACROS = ['pro', 'carbs', 'fats'] as const;

/** Gruppo di un alimento qualsiasi: macro che da' piu' calorie, verdura se quasi senza calorie. */
export function groupOf(food: Food): PlanGroup {
  if (food.kcal < 45 && food.fats < 2) return 'veg';
  // Carne e pesce grassi (cosce, salmone): restano proteine anche se i grassi danno piu' calorie.
  if (food.pro >= 15) return 'pro';
  const kcal = { pro: food.pro * 4, carbs: food.carbs * 4, fats: food.fats * 9 };
  return MACROS.reduce((best, m) => (kcal[m] > kcal[best] ? m : best), 'pro' as (typeof MACROS)[number]);
}

/** Quanto manca all'obiettivo (mai negativo). */
export function remaining(goals: Macros, eaten: Macros): Macros {
  const left = (k: keyof Macros) => Math.max(0, Math.round((goals[k] - eaten[k]) * 10) / 10);
  return { kcal: left('kcal'), pro: left('pro'), carbs: left('carbs'), fats: left('fats') };
}

const step = (max: number) => (max <= 60 ? 1 : 5);

/**
 * Grammi per chiudere i macro mancanti con priorita' proteine, poi carboidrati, poi grassi:
 * ogni gruppo di alimenti copre il "suo" macro tenendo conto di quanto portano gli altri
 * (iterazioni alla Gauss-Seidel), con limiti realistici e arrotondamento a 5 g (1 g per olio e frutta secca).
 * Le verdure hanno una porzione fissa e non servono a chiudere i macro.
 */
export function planGrams(need: Macros, items: PlanItem[]): PlanResult {
  const grams = items.map((it) => it.fixed ?? (it.group === 'veg' ? VEG_GRAMS : 0));
  const free = (i: number) => items[i].fixed === undefined && items[i].group !== 'veg';
  const order: ('pro' | 'carbs' | 'fats')[] = ['pro', 'carbs', 'fats'];
  for (let round = 0; round < 40; round++) {
    for (const macro of order) {
      const mine = items.map((_, i) => i).filter((i) => free(i) && items[i].group === macro && items[i].food[macro] > 0);
      if (!mine.length) continue;
      const others = items.reduce((sum, it, i) => sum + (mine.includes(i) ? 0 : (it.food[macro] * grams[i]) / 100), 0);
      let target = Math.max(0, need[macro] - others);
      // Parti uguali del macro fra gli alimenti del gruppo; chi tocca il limite lascia il resto agli altri.
      let open = [...mine];
      while (open.length) {
        const share = target / open.length;
        const capped = open.filter((i) => (share * 100) / items[i].food[macro] > items[i].max);
        if (!capped.length) { open.forEach((i) => { grams[i] = (share * 100) / items[i].food[macro]; }); break; }
        capped.forEach((i) => { grams[i] = items[i].max; target -= (items[i].food[macro] * items[i].max) / 100; });
        target = Math.max(0, target);
        open = open.filter((i) => !capped.includes(i));
      }
    }
  }
  const rounded = grams.map((g, i) => (free(i) ? Math.round(g / step(items[i].max)) * step(items[i].max) : g));
  const total = sumMacros(items.map((it, i) => macrosFor(it.food, rounded[i])));
  const uncovered = order.filter((m) => need[m] - total[m] > 5 && !items.some((it, i) => free(i) && it.group === m));
  return { grams: rounded, total, uncovered };
}

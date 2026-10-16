import type { AppData, Food } from '../types';
import { BASE_FOODS } from '../data/baseFoods';
import { normalize } from './parser';

function proteinPowder(food: Food): boolean {
  const name = normalize(`${food.name} ${food.brand || ''}`);
  if (/\b(bar|bars|barretta|barrette|liquid|liquido|liquida|bevanda|drink|yogurt|pudding|budino|pancake|pancakes)\b/.test(name)) return false;
  return /\b(whey|casein|caseina|caseine)\b/.test(name)
    || (/\b(protein|proteins|proteina|proteine)\b/.test(name) && (/\b(powder|polvere)\b/.test(name) || food.pro >= 35))
    || /\balbume (?:in )?polvere\b/.test(name)
    || (/\begg\s*white\b/.test(name) && /\b(prozis|powder|polvere)\b/.test(name) && food.pro >= 35);
}

/** Alias locali per prodotti realmente salvati: ID e macro non vengono ricreati.
 * A parità di nome generico prevale l'ultimo usato, poi l'ordine di salvataggio.
 */
export function recognitionFoods(data: AppData): Food[] {
  const lastUse = new Map<string, number>();
  for (const log of Object.values(data.days)) {
    for (const items of Object.values(log)) {
      for (const item of items) {
        const time = Date.parse(item.addedAt);
        if (Number.isFinite(time)) lastUse.set(item.foodId, Math.max(lastUse.get(item.foodId) || 0, time));
      }
    }
  }
  const saved = data.foods.map((food, index) => ({ food, index }))
    .sort((a, b) => (lastUse.get(b.food.id) || 0) - (lastUse.get(a.food.id) || 0) || a.index - b.index)
    .map(({ food }) => {
      if (!proteinPowder(food)) return food;
      const name = normalize(`${food.name} ${food.brand || ''}`);
      const aliases = ['proteine in polvere', 'proteina in polvere', 'proteine', 'protein powder'];
      if (/\bwhey\b/.test(name)) aliases.push('whey', 'proteine whey', 'proteine del siero');
      if (/\begg\s*white\b|\balbume\b/.test(name)) aliases.push('egg white', 'eggwhite', 'proteine egg white', 'proteine eggwhite', 'proteine in polvere egg white', 'proteine in polvere eggwhite', 'proteine dell albume');
      const brands = (food.brand || (/\bprozis\b/.test(name) ? 'Prozis' : '')).split(/[,;]/).map((brand) => normalize(brand).trim()).filter(Boolean);
      const genericAliases = [...aliases];
      for (const brand of brands) {
        for (const phrase of genericAliases) aliases.push(`${phrase} ${brand}`, `${phrase} della ${brand}`, `${phrase} di ${brand}`);
      }
      return { ...food, aliases: [...new Set([...(food.aliases || []), ...aliases])] };
    });
  return [...saved, ...BASE_FOODS];
}

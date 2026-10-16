import type { Food, Macros, MealItem, QtyMode } from '../types';

const r1 = (n: number) => Math.round(n * 10) / 10;

export function macrosFor(food: Food, grams: number): Macros {
  const f = grams / 100;
  return { kcal: Math.round(food.kcal * f), pro: r1(food.pro * f), carbs: r1(food.carbs * f), fats: r1(food.fats * f) };
}

export function sumMacros(items: Macros[]): Macros {
  const t = items.reduce(
    (a, i) => ({ kcal: a.kcal + i.kcal, pro: a.pro + i.pro, carbs: a.carbs + i.carbs, fats: a.fats + i.fats }),
    { kcal: 0, pro: 0, carbs: 0, fats: 0 },
  );
  return { kcal: Math.round(t.kcal), pro: r1(t.pro), carbs: r1(t.carbs), fats: r1(t.fats) };
}

export function unitWord(food: Food, count: number): string {
  if (!food.unitName) return count === 1 ? 'pezzo' : 'pezzi';
  return count === 1 ? food.unitName : food.unitPlural || food.unitName;
}

export interface Portion {
  mode: QtyMode;
  qty: number;
  cooked: boolean;
}

export function withServing(food: Food, grams: number | undefined, units: number | undefined): Food {
  const valid = !!grams && grams > 0 && !!units && units > 0;
  const slice = /fett[ae]|biscottat/i.test(food.name);
  return { ...food, servingGrams: grams, servingUnits: units,
    pieceWeight: valid ? grams / units : undefined, pieceWeightEstimated: false,
    unitName: slice ? 'fetta' : food.unitName && food.unitName !== 'porzione' ? food.unitName : 'pezzo',
    unitPlural: slice ? 'fette' : food.unitPlural && food.unitPlural !== 'porzioni' ? food.unitPlural : 'pezzi' };
}

/** Grammi a crudo (o del prodotto) corrispondenti alla quantita' inserita. */
export function rawGrams(food: Food, p: Portion): number {
  const base = p.mode === 'pieces' ? p.qty * (food.pieceWeight || 0) : p.qty;
  const g = p.cooked && food.cookedFactor ? base / food.cookedFactor : base;
  return Math.max(0, p.cooked && food.cookedFactor ? Math.round(g) : Math.round(g * 100) / 100);
}

export function portionLabel(food: Food, p: Portion): string {
  const g = rawGrams(food, p);
  const qty = Math.round(p.qty * 100) / 100;
  if (p.mode === 'pieces') {
    if (!food.pieceWeight) return 'Peso del pezzo da definire';
    const pieceG = Math.round(qty * (food.pieceWeight || 100));
    if (p.cooked && food.cookedFactor) return `${qty} ${unitWord(food, qty)} cotto (${pieceG}g = ${g}g crudo)`;
    return `${qty} ${unitWord(food, qty)} (${food.pieceWeightEstimated ? 'circa ' : ''}${g}g)`;
  }
  if (p.cooked && food.cookedFactor) return `${qty}g cotto (= ${g}g crudo)`;
  return food.cookedFactor ? `${g}g a crudo` : `${g}g`;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function buildItem(food: Food, p: Portion, id?: string): MealItem {
  const grams = rawGrams(food, p);
  return {
    id: id || newId('it'),
    foodId: food.id,
    name: food.brand ? `${food.name} (${food.brand})` : food.name,
    grams,
    mode: p.mode,
    qty: p.qty,
    cooked: !!(p.cooked && food.cookedFactor),
    label: portionLabel(food, p),
    addedAt: new Date().toISOString(),
    ...macrosFor(food, grams),
  };
}

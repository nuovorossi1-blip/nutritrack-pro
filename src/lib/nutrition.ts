import type { CookingYield, Food, Macros, MealItem, QtyMode } from '../types';

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
  cookingYield?: CookingYield;
}

export function foodPreparation(food: Food): Food['preparation'] {
  if (food.preparation) return food.preparation;
  if (food.usda) {
    if (/\braw\b/i.test(food.usda.description)) return 'raw';
    if (/\b(cooked|roasted|broiled|boiled|fried|baked)\b/i.test(food.usda.description)) return 'cooked';
  }
  if (/\b(cott[oaie]|bollit[oaie]|grigliat[oaie]|less[oaie])\b/i.test(food.name)) return 'cooked';
  if (food.cookedFactor || /\bcrud[oaie]\b/i.test(food.name)) return 'raw';
  return undefined;
}

export function cookingFactor(food: Food, p: Portion): number | undefined {
  if (foodPreparation(food) === 'cooked' || !p.cooked) return undefined;
  const measured = p.cookingYield;
  if (measured) return measured.raw > 0 && measured.cooked > 0 && Number.isFinite(measured.raw + measured.cooked)
    ? measured.cooked / measured.raw : undefined;
  return food.cookedFactor && food.cookedFactor > 0 && Number.isFinite(food.cookedFactor) ? food.cookedFactor : undefined;
}

export function withServing(food: Food, grams: number | undefined, units: number | undefined): Food {
  const valid = !!grams && grams > 0 && !!units && units > 0;
  const slice = /fett[ae]|biscottat/i.test(food.name);
  return { ...food, servingGrams: grams, servingUnits: units,
    pieceWeight: valid ? grams / units : undefined, pieceWeightEstimated: false,
    unitName: food.unitName && food.unitName !== 'porzione' ? food.unitName : slice ? 'fetta' : 'pezzo',
    unitPlural: food.unitPlural && food.unitPlural !== 'porzioni' ? food.unitPlural : slice ? 'fette' : 'pezzi' };
}

/** Grammi a crudo (o del prodotto) corrispondenti alla quantita' inserita. */
export function rawGrams(food: Food, p: Portion): number {
  const base = p.mode === 'pieces' ? p.qty * (food.pieceWeight || 0) : p.qty;
  const factor = cookingFactor(food, p);
  if (p.cooked && foodPreparation(food) !== 'cooked' && !factor) return 0;
  const g = factor ? base / factor : base;
  return Number.isFinite(g) ? Math.max(0, Math.round(g * 100) / 100) : 0;
}

export function portionLabel(food: Food, p: Portion): string {
  const g = rawGrams(food, p);
  const qty = Math.round(p.qty * 100) / 100;
  const factor = cookingFactor(food, p);
  const state = foodPreparation(food);
  const suffix = state === 'cooked' ? ' da cotto' : state === 'raw' ? ' a crudo' : '';
  const equivalent = p.cookingYield ? 'resa misurata' : 'stima';
  if (p.mode === 'pieces') {
    if (!food.pieceWeight) return 'Peso del pezzo da definire';
    const pieceG = Math.round(qty * (food.pieceWeight || 100));
    if (factor) return `${qty} ${unitWord(food, qty)} (${pieceG}g cotti ≈ ${g}g crudi; ${equivalent})`;
    return `${qty} ${unitWord(food, qty)} (${food.pieceWeightEstimated ? 'circa ' : ''}${g}g${suffix})`;
  }
  if (factor) return `${qty}g cotti ≈ ${g}g crudi (${equivalent})`;
  return `${g}g${suffix}`;
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
    cooked: foodPreparation(food) === 'cooked' || !!cookingFactor(food, p),
    ...(p.cookingYield && cookingFactor(food, p) ? { cookingYield: p.cookingYield } : {}),
    label: portionLabel(food, p),
    addedAt: new Date().toISOString(),
    ...macrosFor(food, grams),
  };
}

// Resa tipica (peso cotto / peso crudo) per stimare il crudo quando manca la voce gemella: solo indicativa.
const TYPICAL_YIELD: [RegExp, number][] = [
  [/\b(riso|risotto|basmati|farro|orzo|quinoa|cous ?cous)\b/i, 2.6],
  [/\b(ravioli|tortellini|agnolotti|gnocchi|pasta fresca)\b/i, 1.3],
  [/\b(pasta|spaghetti|penne|fusilli|rigatoni|maccheroni|farfalle|linguine|tagliatelle|lasagn)/i, 2.1],
  [/\b(fagioli|ceci|lenticchie|piselli secchi|legumi)\b/i, 2.4],
  [/\b(pollo|tacchino|manzo|vitello|maiale|scottona|bistecca|carne|cosce|coscia|petto|fettina|hamburger|agnello)\b/i, 0.75],
  [/\b(salmone|merluzzo|nasello|tonno|orata|branzino|pesce|spigola|trota)\b/i, 0.8],
  [/\b(patat|carot|zucchin|broccol|spinac|verdur|melanzan|peperon|cavol|fagiolin)/i, 0.9],
];

/** Grammi a crudo stimati per un alimento gia' cotto: gemella cruda (stesse calorie) o resa tipica. */
export function rawFromCooked(food: Food, cookedGrams: number, alternatives: Food[] = []): number | null {
  if (foodPreparation(food) !== 'cooked' || cookedGrams <= 0) return null;
  const twin = food.counterpartId ? alternatives.find((f) => f.id === food.counterpartId) : undefined;
  if (twin && twin.kcal > 0 && food.kcal > 0) return Math.round((cookedGrams * food.kcal) / twin.kcal);
  const typical = TYPICAL_YIELD.find(([re]) => re.test(food.name));
  return typical ? Math.round(cookedGrams / typical[1]) : null;
}

/** Grammi da cotto stimati per un alimento pesato crudo (gemella cotta o resa tipica). */
export function cookedFromRaw(food: Food, rawG: number, alternatives: Food[] = []): number | null {
  if (foodPreparation(food) !== 'raw' || rawG <= 0) return null;
  const twin = food.counterpartId ? alternatives.find((f) => f.id === food.counterpartId) : undefined;
  if (twin && twin.kcal > 0 && food.kcal > 0) return Math.round((rawG * food.kcal) / twin.kcal);
  if (food.cookedFactor) return Math.round(rawG * food.cookedFactor);
  const typical = TYPICAL_YIELD.find(([re]) => re.test(food.name));
  return typical ? Math.round(rawG * typical[1]) : null;
}

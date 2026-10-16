import { describe, expect, it } from 'vitest';
import { BASE_FOODS } from '../src/data/baseFoods';
import { addDays, dayStrip, msToMidnight, shortLabel } from '../src/lib/dates';
import { buildItem, rawGrams, sumMacros } from '../src/lib/nutrition';
import { mealFromText, parseFoodText } from '../src/lib/parser';
import { mapProduct, rankResults } from '../src/lib/off';
import { frequentFor, withDay } from '../src/lib/store';
import type { AppData } from '../src/types';

const food = (id: string) => BASE_FOODS.find((f) => f.id === id)!;

describe('giorni', () => {
  it('cambio mese e anno', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });
  it('la barra non va oltre oggi', () => {
    expect(dayStrip('2026-10-16', '2026-10-16')).toEqual(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16']);
    expect(dayStrip('2026-10-01', '2026-10-16')).toEqual(['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03']);
  });
  it('etichette e mezzanotte', () => {
    expect(shortLabel('2026-10-16', '2026-10-16')).toBe('OGGI');
    expect(shortLabel('2026-10-15', '2026-10-16')).toBe('IERI');
    expect(msToMidnight(new Date(2026, 9, 16, 23, 59, 0))).toBe(60000);
  });
});

describe('crudo e cotto', () => {
  it('200g di pasta cotta = 95g crudi', () => {
    expect(rawGrams(food('f12'), { mode: 'grams', qty: 200, cooked: true })).toBe(95);
  });
  it('2 uova = 120g, 172 kcal', () => {
    const it = buildItem(food('f_egg'), { mode: 'pieces', qty: 2, cooked: false });
    expect(it.grams).toBe(120);
    expect(it.kcal).toBe(172);
  });
  it('somma', () => {
    expect(sumMacros([{ kcal: 10, pro: 1.1, carbs: 2.2, fats: 0.1 }, { kcal: 5, pro: 0.2, carbs: 0, fats: 0.2 }])).toEqual({ kcal: 15, pro: 1.3, carbs: 2.2, fats: 0.3 });
  });
});

describe('inserimento a parole', () => {
  it('frase con crudo/cotto e pasto', () => {
    const t = '200g di pasta cotta e 150g di pollo cotto a pranzo';
    const r = parseFoodText(t, BASE_FOODS);
    expect(r.map((e) => e.food.id)).toEqual(['f12', 'f3']);
    expect(r.map((e) => rawGrams(e.food, e.portion))).toEqual([95, 203]);
    expect(mealFromText(t)).toBe('pranzo');
  });
  it('numeri a parole e pezzi', () => {
    const r = parseFoodText('due uova e una fetta di pane a colazione', BASE_FOODS);
    expect(r.map((e) => [e.food.id, e.portion.mode, e.portion.qty])).toEqual([
      ['f_egg', 'pieces', 2],
      ['f16', 'pieces', 1],
    ]);
  });
  it("senza quantità né pasto: non inventa niente", () => {
    const r = parseFoodText('petto di pollo', BASE_FOODS);
    expect(r.map((e) => [e.food.id, e.portion.qty, e.qtyGiven])).toEqual([['f3', 0, false]]);
    expect(mealFromText('petto di pollo')).toBeNull();
  });
  it('niente falsi riconoscimenti', () => {
    expect(parseFoodText('panna e melanzane con olive', BASE_FOODS)).toEqual([]);
  });
});

describe('Open Food Facts', () => {
  it('mappa un prodotto e trova la porzione', () => {
    const r = mapProduct({ code: '5201054017418', product_name: 'Fage Total 0%', brands: 'Fage', serving_quantity: '150', countries_tags: ['en:italy'], nutriments: { 'energy-kcal_100g': 54, proteins_100g: 10.3, carbohydrates_100g: 3, fat_100g: 0 } })!;
    expect(r.food).toMatchObject({ id: 'off_5201054017418', kcal: 54, pro: 10.3, pieceWeight: 150, brand: 'Fage' });
    expect(r.missing).toEqual([]);
  });
  it('segnala i valori mancanti e mette prima i completi italiani', () => {
    const a = mapProduct({ code: '1', product_name: 'A', nutriments: { 'energy-kcal_100g': 50 } })!;
    const b = mapProduct({ code: '2', product_name: 'B', countries_tags: ['en:italy'], nutriments: { 'energy-kcal_100g': 50, proteins_100g: 1, carbohydrates_100g: 1, fat_100g: 1 } })!;
    expect(a.missing).toEqual(['proteine', 'carboidrati', 'grassi']);
    expect(rankResults([a, b]).map((x) => x.food.id)).toEqual(['off_2', 'off_1']);
  });
});

describe('storico', () => {
  it('giorno vuoto non salvato, frequenti dallo storico', () => {
    let d: AppData = { version: 1, goals: { kcal: 2000, carbs: 200, pro: 150, fats: 60 }, days: {}, foods: [], dark: false };
    const it = buildItem(food('f26'), { mode: 'pieces', qty: 1, cooked: false });
    d = withDay(d, '2026-10-15', { colazione: [it], pranzo: [], cena: [], spuntini: [] });
    d = withDay(d, '2026-10-16', { colazione: [it], pranzo: [], cena: [], spuntini: [] });
    expect(frequentFor(d, 'colazione')[0]).toMatchObject({ count: 2 });
    d = withDay(d, '2026-10-16', { colazione: [], pranzo: [], cena: [], spuntini: [] });
    expect(Object.keys(d.days)).toEqual(['2026-10-15']);
  });
});

describe('metabolismo e macro', () => {
  const me = { name: 'Prova', sex: 'M' as const, age: 35, weight: 80, height: 180, activity: 'leggero' as const };
  it('data di nascita: compleanno, cambio anno e date non valide', async () => {
    const { ageFromBirthDate } = await import('../src/lib/metabolism');
    expect(ageFromBirthDate('1991-10-16', new Date(2026, 9, 15))).toBe(34);
    expect(ageFromBirthDate('1991-10-16', new Date(2026, 9, 16))).toBe(35);
    expect(ageFromBirthDate('1991-12-31', new Date(2027, 0, 1))).toBe(35);
    for (const invalid of ['', '2026-02-30', '2026-13-01', '2099-01-01', '1800-01-01']) {
      expect(ageFromBirthDate(invalid, new Date(2026, 9, 16))).toBeNull();
    }
    expect(ageFromBirthDate('2000-02-29', new Date(2026, 9, 16))).toBe(26);
  });
  it('primo accesso: profilo incompleto richiede setup, vecchi profili completi restano validi', async () => {
    const { needsProfileSetup } = await import('../src/lib/metabolism');
    const goals = { kcal: 2410, pro: 144, carbs: 308, fats: 67, plan: 'mantenimento' as const };
    expect(needsProfileSetup(undefined, goals)).toBe(true);
    expect(needsProfileSetup({ ...me, name: ' ' }, goals)).toBe(true);
    expect(needsProfileSetup({ ...me, height: 0 }, goals)).toBe(true);
    expect(needsProfileSetup({ ...me, weight: NaN }, goals)).toBe(true);
    expect(needsProfileSetup(me, { ...goals, plan: undefined })).toBe(true);
    expect(needsProfileSetup(me, goals)).toBe(false);
    expect(needsProfileSetup({ ...me, birthDate: '2099-01-01' }, goals)).toBe(true);
    expect(needsProfileSetup({ ...me, activity: 'altro', customTdee: 0 }, goals)).toBe(true);
  });
  it('il metabolismo usa la data di nascita anche se la vecchia eta salvata e diversa', async () => {
    const { bmr, profileAge } = await import('../src/lib/metabolism');
    const p = { ...me, birthDate: '1991-01-01', age: 99 };
    expect(bmr(p)).toBe(Math.round(10 * 80 + 6.25 * 180 - 5 * profileAge(p) + 5));
    expect(profileAge(p)).not.toBe(99);
  });
  it('uomo 35 anni, 80 kg, 180 cm, 1-3 allenamenti: basale 1755, mantenimento circa 2410', async () => {
    const { bmr, tdee } = await import('../src/lib/metabolism');
    expect(bmr(me)).toBe(1755);
    expect(tdee(me)).toBe(2410);
    expect(tdee({ ...me, activity: 'altro', customTdee: 2450 })).toBe(2450);
    expect(tdee({ ...me, weight: 0 })).toBeNull();
  });
  it('dieta 2000 kcal con 200 P e 200 C: grassi 44 g (400 kcal / 9)', async () => {
    const { withAutoMacro, macroGap } = await import('../src/lib/metabolism');
    const g = withAutoMacro({ kcal: 2000, pro: 200, carbs: 200, fats: 0, auto: 'fats' });
    expect(g.fats).toBe(44);
    expect(Math.abs(macroGap(g))).toBeLessThan(5);
  });
  it('obiettivo: dieta -20%, massa +10%, macro che tornano con le kcal', async () => {
    const { planKcal, suggestedGoals, macroGap } = await import('../src/lib/metabolism');
    expect(planKcal(2410, 'dieta')).toBe(1930);
    expect(planKcal(2410, 'massa')).toBe(2650);
    const g = suggestedGoals(1930, 'dieta', 80);
    expect(g).toMatchObject({ pro: 176, fats: 54, plan: 'dieta' });
    expect(Math.abs(macroGap(g))).toBeLessThan(5);
  });
});

describe('frasi con piu alimenti', () => {
  const show = (t: string) => parseFoodText(t, BASE_FOODS).map((e) => `${e.food.id}:${rawGrams(e.food, e.portion)}${e.qtyGiven ? '' : '?'}`);
  it('frase dell utente', () => {
    const t = 'ho mangiato a colazione 2 uova 100 g di albume e uno yogurt 0';
    expect(show(t)).toEqual(['f_egg:120', 'f_white:100', 'f26:150']);
    expect(mealFromText(t)).toBe('colazione');
  });
  it('quantita dopo, cotto, 0% e kg', () => {
    expect(show('pasta 80g e pollo 150 g cotto')).toEqual(['f12:80', 'f3:203']);
    expect(show('yogurt greco 0% e una banana')).toEqual(['f26:0?', 'f29:150']);
    expect(show('mezzo kg di patate')).toEqual(['f17:500']);
    expect(show('1 kg di patate')).toEqual(['f17:1000']);
  });
  it('alimento salvato con nome di piu parole', () => {
    const fage = { id: 'off_1', name: 'Fage Total 0', kcal: 54, pro: 10.3, carbs: 3, fats: 0, pieceWeight: 170, unitName: 'porzione', source: 'off' as const };
    const r = parseFoodText('un fage total 0 a merenda', [fage, ...BASE_FOODS]);
    expect(r.map((e) => [e.food.id, rawGrams(e.food, e.portion)])).toEqual([['off_1', 170]]);
  });
});

describe('parole sconosciute e risposta AI', () => {
  it('manda all AI solo se resta qualcosa che non conosco', async () => {
    const { unknownWords } = await import('../src/lib/parser');
    expect(unknownWords('ho mangiato a colazione 2 uova 100 g di albume e uno yogurt greco 0', BASE_FOODS)).toEqual([]);
    expect(unknownWords('a pranzo petto di pollo e riso basmati', BASE_FOODS)).toEqual([]);
    expect(unknownWords('a cena lasagne e un cornetto', BASE_FOODS)).toEqual(['lasagne', 'cornetto']);
  });
  it('ripulisce la risposta del modello e la trasforma in voci', async () => {
    // @ts-expect-error modulo JS del server
    const { cleanResult } = await import('../server/aiParse.mjs');
    const { aiEntries } = await import('../src/lib/ai');
    const r = cleanResult({ pasto: 'cena', alimenti: [
      { nome: 'lasagne', grammi: '300', pezzi: null, kcal_100g: 160, proteine_100g: 8, carboidrati_100g: 15, grassi_100g: 7.5 },
      { nome: 'cornetto', grammi: null, pezzi: 1, peso_pezzo_g: 60, kcal_100g: 410, proteine_100g: 7, carboidrati_100g: 48, grassi_100g: 21 },
      { nome: 'mela', grammi: null, pezzi: null, kcal_100g: 52 },
      { nome: 'errore', kcal_100g: 'abc' },
    ] });
    expect(r.pasto).toBe('cena');
    const e = aiEntries(r, BASE_FOODS);
    expect(e.map((x) => [x.food.id, rawGrams(x.food, x.portion), x.qtyGiven])).toEqual([
      ['ai_lasagne', 300, true],
      ['ai_cornetto', 60, true],
      ['f28', 0, false],
    ]);
  });
});

describe('valori fuori norma', () => {
  it('segnala il tonno a 403 kcal e i valori impossibili, non quelli giusti', async () => {
    const { plausibilityWarnings: w } = await import('../src/lib/plausibility');
    expect(w({ name: 'tonno rio mare', kcal: 403, pro: 17, carbs: 0, fats: 37 }).join(' ')).toMatch(/tonno/);
    expect(w({ name: 'Tonno al naturale', kcal: 103, pro: 24, carbs: 0, fats: 1 })).toEqual([]);
    expect(w({ name: 'Fage Total 0%', kcal: 54, pro: 10.3, carbs: 3, fats: 0 })).toEqual([]);
    expect(w({ name: 'Spaghetti n.5', kcal: 359, pro: 13, carbs: 71, fats: 2 })).toEqual([]);
    expect(w({ name: 'Yogurt greco 0%', kcal: 100, pro: 9, carbs: 4, fats: 5.5 }).join(' ')).toMatch(/0%/);
    expect(w({ name: 'Biscotti', kcal: 120, pro: 7, carbs: 70, fats: 20 }).join(' ')).toMatch(/non tornano/);
    expect(w({ name: 'Strano', kcal: 300, pro: 60, carbs: 50, fats: 10 }).join(' ')).toMatch(/impossibile/);
    for (const f of BASE_FOODS) expect([f.name, w(f)]).toEqual([f.name, []]);
  });
});

describe('ripeti l ultimo pasto', () => {
  it('prende il piu recente prima del giorno mostrato', async () => {
    const { lastMealBefore } = await import('../src/lib/store');
    const riso = buildItem(food('f11'), { mode: 'grams', qty: 60, cooked: false });
    const pollo = buildItem(food('f3'), { mode: 'grams', qty: 200, cooked: false });
    let d: AppData = { version: 1, goals: { kcal: 2000, carbs: 200, pro: 150, fats: 60 }, days: {}, foods: [], dark: true };
    d = withDay(d, '2026-10-14', { colazione: [], pranzo: [pollo], cena: [], spuntini: [] });
    d = withDay(d, '2026-10-15', { colazione: [], pranzo: [riso, pollo], cena: [], spuntini: [] });
    expect(lastMealBefore(d, 'pranzo', '2026-10-16')).toMatchObject({ day: '2026-10-15' });
    expect(lastMealBefore(d, 'pranzo', '2026-10-16')!.items.map((i) => i.grams)).toEqual([60, 200]);
    expect(lastMealBefore(d, 'pranzo', '2026-10-15')).toMatchObject({ day: '2026-10-14' });
    expect(lastMealBefore(d, 'cena', '2026-10-16')).toBeNull();
  });
});

describe('piatti salvati con "e" nel nome', () => {
  it('pizza tonno e cipolle resta una pizza, il tonno da solo resta tonno', async () => {
    const { unknownWords } = await import('../src/lib/parser');
    const pizza = { id: 'ai_pizza-tonno-e-cipolle', name: 'Pizza tonno e cipolle', kcal: 250, pro: 10, carbs: 30, fats: 10, pieceWeight: 330, unitName: 'porzione', source: 'ai' as const };
    const cornetto = { id: 'ai_cornetto-bar', name: 'Cornetto (bar)', kcal: 400, pro: 7, carbs: 50, fats: 20, pieceWeight: 60, unitName: 'porzione', source: 'ai' as const };
    const foods = [pizza, cornetto, ...BASE_FOODS];
    const r = parseFoodText('a cena una pizza tonno e cipolle e 80 g di tonno', foods);
    expect(r.map((e) => [e.food.id, rawGrams(e.food, e.portion)])).toEqual([['ai_pizza-tonno-e-cipolle', 330], ['f8', 80]]);
    expect(unknownWords('a cena una pizza tonno e cipolle', foods)).toEqual([]);
    expect(parseFoodText('a colazione un cornetto bar', foods).map((e) => e.food.id)).toEqual(['ai_cornetto-bar']);
  });
});

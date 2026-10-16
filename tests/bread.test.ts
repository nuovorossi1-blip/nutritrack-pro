import { describe, expect, it } from 'vitest';
import { BASE_FOODS } from '../src/data/baseFoods';
import { parseFoodText, unknownWords, normalize } from '../src/lib/parser';
import { buildItem } from '../src/lib/nutrition';

describe('pane: tipi distinti e fette', () => {
  it('riconosce il tipo completo prima della vecchia regola pane generica', () => {
    for (const [text, id, kcal] of [
      ['2 fette di pane bianco a colazione', 'bread_white', 161],
      ['due fette di pane integrale a colazione', 'bread_wholemeal', 134],
      ['2 fette di pane casereccio a pranzo', 'bread_rustic', 161],
      ['2 fette di pane casareccio a cena', 'bread_rustic', 161],
    ] as const) {
      const entries = parseFoodText(text, BASE_FOODS);
      expect(entries).toHaveLength(1);
      expect(entries[0].food.id).toBe(id);
      expect(unknownWords(text, BASE_FOODS)).toEqual([]);
      const item = buildItem(entries[0].food, entries[0].portion);
      expect(item.grams).toBe(60);
      expect(item.kcal).toBe(kcal);
      expect(item.label).toContain('circa 60g');
    }
  });
  it('i grammi espliciti prevalgono sulle fette; non inventa quantita mancanti', () => {
    const entry = parseFoodText('pane integrale 100g a pranzo', BASE_FOODS)[0];
    const item = buildItem(entry.food, entry.portion);
    expect(item.grams).toBe(100);
    expect(item.kcal).toBe(224);
    expect(item.label).toBe('100g');
    expect(parseFoodText('pane casereccio a cena', BASE_FOODS)[0].qtyGiven).toBe(false);
  });
  it('trova tutti e tre i tipi cercando fette di pane e conserva i dati legacy', () => {
    const parts = 'fette di pane'.split(' ');
    const matches = BASE_FOODS.filter((f) => parts.every((p) => normalize(`${f.name} ${(f.aliases || []).join(' ')}`).includes(p)));
    expect(matches.map((f) => f.id)).toEqual(['bread_white', 'bread_rustic', 'bread_wholemeal']);
    expect(BASE_FOODS.find((f) => f.id === 'f16')?.kcal).toBe(235);
    expect(matches.find((f) => f.id === 'bread_rustic')?.nutritionReference?.approximate).toBe(true);
  });
});

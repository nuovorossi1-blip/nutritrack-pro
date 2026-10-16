import { describe, expect, it } from 'vitest';
import type { AppData, Food } from '../src/types';
import { recognitionFoods } from '../src/lib/savedFoodRecognition';
import { parseFoodText, unknownWords } from '../src/lib/parser';
import { aiEntries } from '../src/lib/ai';
import { buildItem } from '../src/lib/nutrition';

// Fixture arbitraria: verifica il riuso, non i valori commerciali di PROZIS.
const egg: Food = { id: 'my-egg', name: '100% Egg White', brand: 'PROZIS', kcal: 371, pro: 79, carbs: 4, fats: 1, source: 'personale' };
const whey: Food = { id: 'my-whey', name: 'Whey protein', brand: 'Altra marca', kcal: 402, pro: 77, carbs: 7, fats: 5, source: 'off' };
const data = (foods: Food[]): AppData => ({ version: 1, foods, days: {}, goals: { kcal: 2000, pro: 100, carbs: 250, fats: 70 }, dark: true });

describe('riuso dei prodotti salvati prima delle stime AI', () => {
  it('proteine in polvere richiama Egg White salvate senza cambiare macro o creare voci', () => {
    const saved = data([egg]);
    const foods = recognitionFoods(saved);
    for (const text of ['30g di proteine in polvere a colazione', '30g di proteine in polvere della PROZIS a colazione', '30g di proteine eggwhite a colazione', '30g di 100% Egg White PROZIS a colazione']) {
      expect(unknownWords(text, foods)).toEqual([]);
      const entries = parseFoodText(text, foods);
      expect(entries).toHaveLength(1);
      expect(entries[0].food.id).toBe(egg.id);
      expect(buildItem(entries[0].food, entries[0].portion)).toMatchObject({ foodId: egg.id, grams: 30, kcal: 111, pro: 23.7, carbs: 1.2, fats: 0.3 });
    }
    expect(saved.foods).toEqual([egg]);
    expect(egg.aliases).toBeUndefined();
    expect(parseFoodText('proteine in polvere', foods)[0].qtyGiven).toBe(false);
    expect(parseFoodText('1 misurino di proteine in polvere', foods)[0].qtyGiven).toBe(false);
    expect(unknownWords('1 misurino di proteine in polvere', foods)).toEqual([]);
  });
  it('sceglie ultimo uso per il generico ma rispetta marca e sottotipo espliciti', () => {
    const saved = data([whey, egg]);
    saved.days['2026-10-16'] = { colazione: [buildItem(egg, {mode:'grams',qty:30,cooked:false})], pranzo: [], cena: [], spuntini: [] };
    const foods = recognitionFoods(saved);
    expect(parseFoodText('30g proteine in polvere', foods)[0].food.id).toBe(egg.id);
    expect(parseFoodText('30g proteine whey', foods)[0].food.id).toBe(whey.id);
    expect(parseFoodText('30g proteine in polvere della altra marca', foods)[0].food.id).toBe(whey.id);
    expect(parseFoodText('30g proteine in polvere', recognitionFoods(data([whey, egg])))[0].food.id).toBe(whey.id);
  });
  it('non scambia barrette, yogurt o albume liquido per polvere e non inventa un prodotto assente', () => {
    const foods = recognitionFoods(data([
      {...whey, id:'bar',name:'Whey protein bar'},
      {...whey, id:'yogurt',name:'Protein yogurt'},
      {...egg,id:'liquid',name:'Egg White liquid'},
      {...egg,id:'ordinary-white',pro:10},
    ]));
    expect(parseFoodText('30g proteine in polvere', foods)).toEqual([]);
    expect(unknownWords('proteine in polvere', foods)).toContain('proteine');
  });
  it('anche il riuso da risposta AI usa i macro salvati, ignorando quelli inventati dal modello', () => {
    const entries = aiEntries({pasto:'colazione',alimenti:[{nome:'Proteine in polvere',grammi:30,pezzi:null,peso_pezzo_g:null,cotto:false,kcal_100g:999,proteine_100g:1,carboidrati_100g:1,grassi_100g:1}]}, recognitionFoods(data([egg])));
    expect(entries[0].food).toMatchObject({id:egg.id,kcal:egg.kcal,pro:egg.pro,carbs:egg.carbs,fats:egg.fats});
  });
});

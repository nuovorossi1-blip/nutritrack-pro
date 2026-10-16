import { describe, expect, it } from 'vitest';
import { BASE_FOODS } from '../src/data/baseFoods';
import { buildItem, portionLabel, rawGrams } from '../src/lib/nutrition';
const food = (id: string) => BASE_FOODS.find(f => f.id === id)!;

describe('weights before and after cooking', () => {
  it('allocates the same batch nutrients for water gain and loss', () => {
    for (const [id, raw, cooked] of [['f12',100,250],['f11',100,300],['f3',200,150],['f6',200,160]] as const) {
      const f=food(id);
      const original=buildItem(f,{mode:'grams',qty:raw,cooked:false});
      const all=buildItem(f,{mode:'grams',qty:cooked,cooked:true,cookingYield:{raw,cooked}});
      expect([all.kcal,all.pro,all.carbs,all.fats]).toEqual([original.kcal,original.pro,original.carbs,original.fats]);
      const half=buildItem(f,{mode:'grams',qty:cooked/2,cooked:true,cookingYield:{raw,cooked}});
      expect(half.grams).toBe(raw/2);
      expect(half.cookingYield).toEqual({raw,cooked});
      expect(buildItem(f,{mode:all.mode,qty:all.qty,cooked:all.cooked,cookingYield:all.cookingYield})).toMatchObject({grams:raw,kcal:all.kcal});
    }
  });
  it('100g dry pasta and100g cooked pasta have different values and no double conversion', () => {
    const raw=food('common_pasta_raw'), cooked={...food('common_pasta_cooked'),cookedFactor:2.1};
    expect(buildItem(raw,{mode:'grams',qty:100,cooked:false})).toMatchObject({kcal:371,cooked:false});
    expect(buildItem(cooked,{mode:'grams',qty:100,cooked:true,cookingYield:{raw:100,cooked:250}})).toMatchObject({kcal:158,grams:100,cooked:true});
    expect(portionLabel(cooked,{mode:'grams',qty:100,cooked:false})).toContain('da cotto');
  });
  it('invalid/missing yield cannot silently treat cooked grams as raw grams', () => {
    for(const cookingYield of [{raw:0,cooked:250},{raw:100,cooked:0},{raw:NaN,cooked:2}])
      expect(rawGrams(food('f12'),{mode:'grams',qty:100,cooked:true,cookingYield})).toBe(0);
    expect(rawGrams({...food('f12'),cookedFactor:undefined},{mode:'grams',qty:100,cooked:true})).toBe(0);
    expect(portionLabel(food('f12'),{mode:'grams',qty:100,cooked:true})).toContain('stima');
  });
});

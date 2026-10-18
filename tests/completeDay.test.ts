import { describe, expect, it } from 'vitest';
import { CLEAN_FOODS } from '../src/data/cleanFoods';
import { groupOf, planGrams, remaining, type PlanItem } from '../src/lib/completeDay';

const item=(id: string): PlanItem=>{const c=CLEAN_FOODS.find(x=>x.food.id===id)!;return {food:c.food,group:c.group,max:c.max};};
describe('completa la giornata',()=>{
  it('elenco pulito completo, con tutti i gruppi',()=>{
    expect(CLEAN_FOODS.length).toBeGreaterThan(35);
    for(const g of ['pro','carbs','fats','veg'])expect(CLEAN_FOODS.some(c=>c.group===g)).toBe(true);
  });
  it('chiude proteine, carboidrati e grassi con pollo, riso e olio (±100 kcal)',()=>{
    const need=remaining({kcal:2100,pro:160,carbs:230,fats:60},{kcal:1450,pro:115,carbs:160,fats:42});
    const r=planGrams(need,[item('f3'),item('f11'),item('clean_olive_oil'),item('clean_zucchini')]);
    expect(Math.abs(r.total.pro-need.pro)).toBeLessThanOrEqual(2);
    expect(Math.abs(r.total.carbs-need.carbs)).toBeLessThanOrEqual(3);
    expect(Math.abs(r.total.fats-need.fats)).toBeLessThanOrEqual(2);
    expect(Math.abs(r.total.kcal-need.kcal)).toBeLessThanOrEqual(100);
    expect(r.grams[3]).toBe(200);
    expect(r.uncovered).toEqual([]);
  });
  it('rispetta i limiti, i grammi bloccati e segnala i macro senza alimento',()=>{
    const r=planGrams({kcal:600,pro:150,carbs:40,fats:0},[item('f3'),{...item('common_pasta_raw'),fixed:50}]);
    expect(r.grams[0]).toBe(400);
    expect(r.grams[1]).toBe(50);
    const s=planGrams({kcal:400,pro:30,carbs:50,fats:10},[item('f3')]);
    expect(s.uncovered).toEqual(['carbs','fats']);
  });
  it('divide il macro fra due alimenti dello stesso gruppo e classifica gli alimenti salvati',()=>{
    const r=planGrams({kcal:300,pro:0,carbs:60,fats:0},[item('f11'),item('bread_white')]);
    expect(r.grams[0]).toBeGreaterThan(0);expect(r.grams[1]).toBeGreaterThan(0);
    expect(groupOf({id:'x',name:'Bresaola',kcal:151,pro:32,carbs:0,fats:2.6,source:'personale'})).toBe('pro');
    expect(groupOf({id:'z',name:'Cosce di pollo',kcal:239,pro:24,carbs:0,fats:15.5,source:'personale'})).toBe('pro');
    expect(groupOf({id:'y',name:'Cetrioli',kcal:12,pro:0.7,carbs:2,fats:0.1,source:'personale'})).toBe('veg');
  });
});

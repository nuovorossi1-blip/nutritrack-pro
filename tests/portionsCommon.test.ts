import { describe, expect, it } from 'vitest';
import { BASE_FOODS } from '../src/data/baseFoods';
import { COMMON_FOODS } from '../src/data/commonFoods';
import { buildItem, rawGrams, withServing } from '../src/lib/nutrition';
import { parseFoodText, unknownWords } from '../src/lib/parser';
import { mapProduct } from '../src/lib/off';
import { progressColor } from '../src/lib/macroStyle';
import type { Food } from '../src/types';
import catalog from '../server/data/usda.mjs';

const rusks: Food = {id:'rusk',name:'Fette biscottate',kcal:400,pro:10,carbs:75,fats:6,source:'personale'};

describe('porzioni indipendenti dai valori per100g', () => {
  it('14g per2fette significa7g ciascuna e mantiene macro originali', () => {
    const food = withServing(rusks,14,2);
    expect(food).toMatchObject({pieceWeight:7,servingGrams:14,servingUnits:2,kcal:400,pro:10,carbs:75,fats:6});
    expect(buildItem(food,{mode:'pieces',qty:1,cooked:false})).toMatchObject({grams:7,kcal:28,pro:0.7,carbs:5.3,fats:0.4});
    expect(buildItem(food,{mode:'pieces',qty:2,cooked:false})).toMatchObject({grams:14,kcal:56});
    expect(buildItem(food,{mode:'grams',qty:100,cooked:false})).toMatchObject({grams:100,kcal:400});
    expect(rawGrams(withServing(rusks,15,2),{mode:'pieces',qty:1,cooked:false})).toBe(7.5);
  });
  it('peso pezzo assente o invalido non diventa100g inventati', () => {
    expect(rawGrams(rusks,{mode:'pieces',qty:2,cooked:false})).toBe(0);
    expect(withServing(rusks,14,0).pieceWeight).toBeUndefined();
    expect(parseFoodText('1 porzione di fette biscottate a colazione',[rusks])[0].qtyGiven).toBe(false);
    expect(parseFoodText('2 carote a pranzo',BASE_FOODS)[0].qtyGiven).toBe(false);
    expect(parseFoodText('2g di carote a pranzo',BASE_FOODS)[0].portion.qty).toBe(2);
  });
  it('OFF riconosce2fette14g e non confonde la confezione con una porzione', () => {
    const product={code:'001',product_name:'Fette biscottate',nutriments:{'energy-kcal_100g':400,proteins_100g:10,carbohydrates_100g:75,fat_100g:6}};
    expect(mapProduct({...product,serving_quantity:14,serving_size:'2 fette (14 g)'})?.food).toMatchObject({pieceWeight:7,servingGrams:14,servingUnits:2});
    expect(mapProduct({...product,product_quantity:350})?.food.pieceWeight).toBeUndefined();
  });
});

describe('catalogo comune e preparazioni distinte', () => {
  it('ogni valore aggiunto coincide con la voce ufficiale USDA', () => {
    for(const food of COMMON_FOODS) {
      const row=catalog.find((row: (string|number)[])=>row[0]===food.usda?.fdcId);
      expect([food.kcal,food.pro,food.carbs,food.fats]).toEqual([row[2],row[3],row[4],row[5]]);
    }
  });
  it('100g crudi/cotti usano i propri macro senza fattori universali', () => {
    for(const [raw,cooked,rawKcal,cookedKcal] of [['carrots', 'carrots',41,35],['potatoes','potatoes',77,87],['pasta','pasta',371,158],['whole_pasta','whole_pasta',352,149]] as const) {
      const a=COMMON_FOODS.find(f=>f.id===`common_${raw}_raw`)!;
      const b=COMMON_FOODS.find(f=>f.id===`common_${cooked}_cooked`)!;
      expect(buildItem(a,{mode:'grams',qty:100,cooked:false}).kcal).toBe(rawKcal);
      expect(buildItem(b,{mode:'grams',qty:100,cooked:false}).kcal).toBe(cookedKcal);
      expect(a.counterpartId).toBe(b.id);
    }
    for(const text of ['banane','carote cotte','patata cruda','penne integrali cotte','spaghetti','fusilli','rigatoni integrali','pasta normale','pasta integrale']) {
      expect(unknownWords(`100g di ${text} a pranzo`,BASE_FOODS)).toEqual([]);
      expect(parseFoodText(`100g di ${text} a pranzo`,BASE_FOODS)).toHaveLength(1);
    }
    const entry=parseFoodText('200g di pasta cotta a pranzo',BASE_FOODS)[0];
    expect(buildItem(entry.food,entry.portion)).toMatchObject({grams:200,kcal:316});
  });
  it('colori coerenti,100% verde e oltre obiettivo rosso', () => {
    expect(progressColor('pro',50,100)).toBe('bg-orange-400');
    expect(progressColor('carbs',50,100)).toBe('bg-sky-400');
    expect(progressColor('fats',50,100)).toBe('bg-yellow-400');
    expect(progressColor('kcal',2000,2000)).toBe('bg-emerald-400');
    expect(progressColor('pro',100.1,100)).toBe('bg-red-500');
  });
});

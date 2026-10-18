import { describe, expect, it } from 'vitest';
import { foodRequests, matchingFoods } from '../src/lib/foodChoices';
import { BASE_FOODS } from '../src/data/baseFoods';
import type { Food } from '../src/types';
const ice: Food={id:'ice',name:'Cornetto panna e cioccolato',brand:'Algida',kcal:320,pro:4,carbs:35,fats:18,source:'off'};

describe('voice/text database choices',()=>{
  it('preserves ambiguity and does not assign the weight of one cornetto',()=>{
    expect(foodRequests('ho mangiato un cornetto',BASE_FOODS)).toEqual([{query:'cornetto'}]);
    const matches=matchingFoods('cornetto',[...BASE_FOODS,ice]);
    expect(matches.map(f=>f.id)).toEqual(['common_croissant_butter','ice']);
    expect(matchingFoods('cornetto algida',[...BASE_FOODS,ice]).map(f=>f.id)).toEqual(['ice']);
    expect(matchingFoods('cornetti',[...BASE_FOODS,ice])).toHaveLength(2);
  });
  it('keeps explicit weights and separate lines without estimating portions',()=>{
    expect(foodRequests('100g banana\n50g mela',BASE_FOODS)).toEqual([{query:'banana',grams:100},{query:'mela',grams:50}]);
    expect(foodRequests('ho mangiato un cornetto e una banana a cena',BASE_FOODS)).toEqual([{query:'cornetto'},{query:'banana'}]);
    expect(foodRequests('0,15kg salmone',BASE_FOODS)).toEqual([{query:'salmone',grams:150}]);
    expect(foodRequests('100g banana,50g mela',BASE_FOODS)).toHaveLength(2);
  });
  it('protects saved compound names and keeps original IDs and macros',()=>{
    const requests=foodRequests('100g Cornetto panna e cioccolato',[ice]);
    expect(requests).toEqual([{query:'Cornetto panna e cioccolato',grams:100}]);
    expect(matchingFoods('cornetto',[ice,ice])[0]).toBe(ice);
    expect(matchingFoods('cornetto',[ice,ice])).toHaveLength(1);
  });
  it('splits a dictated sentence without commas at every new quantity',()=>{
    expect(foodRequests('263 g di ravioli cotti 150 g di cosce di pollo cotte 200 g di patate cotte dieci castagne 50 g di strudel',BASE_FOODS)).toEqual([
      {query:'ravioli cotti',grams:263},{query:'cosce di pollo cotte',grams:150},{query:'patate cotte',grams:200},
      {query:'castagne',pieces:10},{query:'strudel',grams:50}]);
    expect(foodRequests('pasta 80 g e 2 uova',BASE_FOODS)).toEqual([{query:'pasta',grams:80},{query:'uova',pieces:2}]);
  });
  it('matches singular/plural and prefers the cooked entry without excluding the others',()=>{
    const matches=matchingFoods('patate cotte',BASE_FOODS);
    expect(matches.length).toBeGreaterThan(1);
    expect(matches[0].preparation).toBe('cooked');
    expect(matchingFoods('cosce di pollo',[{id:'c',name:'Coscia di pollo',kcal:1,pro:0,carbs:0,fats:0,source:'usda'}])).toHaveLength(1);
  });
});

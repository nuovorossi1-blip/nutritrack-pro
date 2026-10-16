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
});

import { describe, expect, it } from 'vitest';
import { rawFromCooked } from '../src/lib/nutrition';
import { BASE_FOODS } from '../src/data/baseFoods';
import type { Food } from '../src/types';

const food=(name: string, preparation?: Food['preparation']): Food=>({id:name,name,preparation,kcal:150,pro:0,carbs:0,fats:0,source:'ai'});
describe('stima del crudo per alimenti cotti',()=>{
  it('usa la voce gemella cruda del catalogo (stesse calorie)',()=>{
    const cooked=BASE_FOODS.find(f=>f.id==='common_potatoes_cooked'||(f.preparation==='cooked'&&f.counterpartId))!;
    const raw=BASE_FOODS.find(f=>f.id===cooked.counterpartId)!;
    expect(rawFromCooked(cooked,200,BASE_FOODS)).toBe(Math.round(200*cooked.kcal/raw.kcal));
  });
  it('usa una resa tipica se manca la gemella, mai per alimenti crudi o sconosciuti',()=>{
    expect(rawFromCooked(food('Ravioli cotti','cooked'),263)).toBe(202);
    expect(rawFromCooked(food('Cosce di pollo cotte','cooked'),150)).toBe(200);
    expect(rawFromCooked(food('Patate crude','raw'),200)).toBeNull();
    expect(rawFromCooked(food('Strudel','cooked'),50)).toBeNull();
  });
});

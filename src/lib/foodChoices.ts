import type { Food } from '../types';
import { normalize } from './parser';

export interface FoodRequest { query: string; grams?: number }
const stem = (word: string) => word.length > 4 ? word.replace(/[aeio]$/, '') : word;
const ignored = new Set(['di','del','della','al','alla','dal','da','con','il','lo','la','un','una','uno','dei','delle']);
const terms = (text: string) => (normalize(text).match(/[a-z0-9]+/g)||[]).filter(w=>!ignored.has(w)).map(stem);

export function matchingFoods(query: string, foods: Food[]): Food[] {
  const words=terms(query);
  if(!words.length) return [];
  const seen=new Set<string>();
  return foods.filter(food=>{
    if(seen.has(food.id))return false;
    const available=terms([food.name,food.brand,...(food.aliases||[])].join(' '));
    if(!words.every(word=>available.includes(word)))return false;
    seen.add(food.id);return true;
  }).slice(0,20);
}

/** Preserve the user's names: never decide that 'cornetto' means pastry or ice cream. */
export function foodRequests(text: string, foods: Food[]): FoodRequest[] {
  const protectedNames=new Map<string,string>();
  let input=text;
  foods.filter(f=>/\se\s/i.test(f.name)).sort((a,b)=>b.name.length-a.name.length).forEach((food,index)=>{
    const pattern=food.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const key=`zzfood${index}zz`;
    input=input.replace(new RegExp(pattern,'gi'),match=>{protectedNames.set(key,match);return key;});
  });
  return input.split(/\r?\n|;|(?<!\d),|,(?!\d)|\s+e\s+/i).map(part=>{
    for(const [key,name] of protectedNames)part=part.replace(key,name);
    const weight=part.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grammi|grammo)\b/i);
    const grams=weight?Number(weight[1].replace(',','.'))*(weight[2].toLowerCase()==='kg'?1000:1):undefined;
    const query=part.replace(/\b(?:ho|abbiamo|hai)\s+(?:mangiato|bevuto|preso)\b/gi,' ')
      .replace(/\b(?:oggi|ieri|stamattina|stasera)\b/gi,' ')
      .replace(/\b(?:a|per|come)\s+(?:colazione|pranzo|cena|spuntino)\b/gi,' ')
      .replace(/\d+(?:[.,]\d+)?\s*(?:kg|g|gr|grammi|grammo)\b/gi,' ')
      .replace(/^\s*(?:un|uno|una|due|tre|quattro|cinque|\d+)\s+/i,'')
      .replace(/\s+/g,' ').trim().replace(/[.!?]+$/,'');
    return {query,...(grams!==undefined?{grams}:{})};
  }).filter(request=>request.query.length>=2).slice(0,12);
}

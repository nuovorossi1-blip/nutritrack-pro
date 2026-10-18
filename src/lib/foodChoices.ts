import type { Food } from '../types';
import { normalize } from './parser';

export interface FoodRequest { query: string; grams?: number; pieces?: number }
// "cosce"/"coscia", "patate"/"patata", "cotti"/"cotte": stessa radice senza le vocali finali.
const stem = (word: string) => word.length > 4 ? word.replace(/[aeiou]+$/, '') : word;
const ignored = new Set(['di','del','della','al','alla','dal','da','con','il','lo','la','un','una','uno','dei','delle']);
const terms = (text: string) => (normalize(text).match(/[a-z0-9]+/g)||[]).filter(w=>!ignored.has(w)).map(stem);
const COOKING = /^(cott|crud|bollit|lessat|grigliat|arrost|fritt|forn)$/;

/** Le parole di cottura non escludono una voce: la mettono prima se coincidono. */
export function matchingFoods(query: string, foods: Food[]): Food[] {
  const all=terms(query), words=all.filter(w=>!COOKING.test(w)), cooking=all.filter(w=>COOKING.test(w));
  if(!words.length) return [];
  const seen=new Set<string>();
  const found=foods.filter(food=>{
    if(seen.has(food.id))return false;
    const available=terms([food.name,food.brand,...(food.aliases||[])].join(' '));
    if(!words.every(word=>available.includes(word)))return false;
    seen.add(food.id);return true;
  });
  const cookingHits=(food: Food)=>{const available=terms([food.name,...(food.aliases||[])].join(' '));return cooking.filter(w=>available.includes(w)).length;};
  return (cooking.length?[...found].sort((a,b)=>cookingHits(b)-cookingHits(a)):found).slice(0,20);
}

const NUMBERS: Record<string, number> = { un:1, uno:1, una:1, due:2, tre:3, quattro:4, cinque:5, sei:6, sette:7, otto:8, nove:9, dieci:10, undici:11, dodici:12, quindici:15, venti:20 };
const COUNT = Object.keys(NUMBERS).join('|');
// Una nuova quantita' dopo un alimento apre un nuovo alimento: la dettatura non mette virgole.
const QUANTITY_START = new RegExp(String.raw`\s+(?=(?:\d+(?:[.,]\d+)?\s*(?:kg|g|gr|grammi|grammo)\b|\d+\s+[a-z]|(?:${COUNT})\s+[a-z]))`, 'i');
const WEIGHT_ONLY = /^\s*\d+(?:[.,]\d+)?\s*(?:kg|g|gr|grammi|grammo)\s*$/i;

/** Preserve the user's names: never decide that 'cornetto' means pastry or ice cream. */
export function foodRequests(text: string, foods: Food[]): FoodRequest[] {
  const protectedNames=new Map<string,string>();
  let input=text;
  foods.filter(f=>/\se\s|\d/i.test(f.name)).sort((a,b)=>b.name.length-a.name.length).forEach((food,index)=>{
    const pattern=food.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const key=`zzfood${'abcdefghijklmnopqrstuvwxyz'[index%26]}${index}zz`.replace(/\d/g,d=>'abcdefghij'[+d]);
    input=input.replace(new RegExp(pattern,'gi'),match=>{protectedNames.set(key,match);return key;});
  });
  const parts=input.split(/\r?\n|;|(?<!\d),|,(?!\d)|\s+e\s+/i).flatMap(part=>part.split(QUANTITY_START))
    // "pasta 80 g": il peso dopo il nome resta a quell'alimento.
    .reduce<string[]>((list,part)=>{if(WEIGHT_ONLY.test(part)&&list.length)list[list.length-1]+=` ${part}`;else list.push(part);return list;},[]);
  return parts.map(part=>{
    for(const [key,name] of protectedNames)part=part.replace(key,name);
    const weight=part.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grammi|grammo)\b/i);
    const grams=weight?Number(weight[1].replace(',','.'))*(weight[2].toLowerCase()==='kg'?1000:1):undefined;
    const withoutWeight=part.replace(/\d+(?:[.,]\d+)?\s*(?:kg|g|gr|grammi|grammo)\b/gi,' ');
    const count=grams===undefined?withoutWeight.match(new RegExp(String.raw`^\s*(?:(\d+)|(${COUNT}))\s+`,'i')):null;
    const pieces=count?(count[1]?Number(count[1]):NUMBERS[count[2].toLowerCase()]):undefined;
    const query=withoutWeight.replace(/\b(?:ho|abbiamo|hai)\s+(?:mangiato|bevuto|preso)\b/gi,' ')
      .replace(/\b(?:oggi|ieri|stamattina|stasera)\b/gi,' ')
      .replace(/\b(?:a|per|come)\s+(?:colazione|pranzo|cena|spuntino)\b/gi,' ')
      .replace(new RegExp(String.raw`^\s*(?:\d+|${COUNT})\s+`,'i'),'')
      .replace(/^\s*(?:di|d'|del|della|dei|delle)\s+/i,'')
      .replace(/\s+/g,' ').trim().replace(/[.!?]+$/,'');
    return {query,...(grams!==undefined?{grams}:{}),...(pieces!==undefined&&pieces>1?{pieces}:{})};
  }).filter(request=>request.query.length>=2).slice(0,12);
}

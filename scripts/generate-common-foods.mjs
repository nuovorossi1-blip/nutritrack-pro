import catalog from '../server/data/usda.mjs';
import {writeFileSync} from 'node:fs';
const definitions=[];
const pair=(key,rawId,cookedId,rawName,cookedName,rawAliases,cookedAliases,category='verdure')=>{
 definitions.push({key:`${key}_raw`,id:rawId,name:rawName,aliases:rawAliases,preparation:'raw',counterpartId:`common_${key}_cooked`,category});
 definitions.push({key:`${key}_cooked`,id:cookedId,name:cookedName,aliases:cookedAliases,preparation:'cooked',counterpartId:`common_${key}_raw`,category});
};
pair('carrots',170393,170394,'Carote crude','Carote bollite',['carota','carote','carota cruda'],['carota cotta','carote cotte','carota bollita','carote bollite']);
pair('potatoes',170026,170438,'Patate crude','Patate bollite',['patata','patate','patata cruda'],['patata cotta','patate cotte','patata bollita','patate bollite']);
pair('pasta',169736,169737,'Pasta di semola (cruda/secca)','Pasta di semola cotta',['pasta normale','pasta normale cruda','pasta secca'],['pasta cotta','pasta bollita','pasta normale cotta'],'pasta');
pair('penne',169736,169737,'Penne di semola (crude/secche)','Penne di semola cotte',['penne','penne crude','penne secche','pasta penne'],['penne cotte','penne bollite'],'pasta');
pair('spaghetti',169736,169737,'Spaghetti di semola (crudi/secchi)','Spaghetti di semola cotti',['spaghetti','spaghetti crudi','spaghetti secchi'],['spaghetti cotti','spaghetti bolliti'],'pasta');
for(const [key,name,raw,cooked] of [['fusilli','Fusilli','crudi','cotti'],['rigatoni','Rigatoni','crudi','cotti'],['farfalle','Farfalle','crude','cotte'],['tortiglioni','Tortiglioni','crudi','cotti'],['linguine','Linguine','crude','cotte'],['maccheroni','Maccheroni','crudi','cotti']]) pair(key,169736,169737,`${name} di semola (${raw})`,`${name} di semola ${cooked}`,[name.toLowerCase(),`${name.toLowerCase()} ${raw}`],[`${name.toLowerCase()} ${cooked}`],'pasta');
pair('whole_pasta',169738,168910,'Pasta integrale (cruda/secca)','Pasta integrale cotta',['pasta integrale','pasta integrale cruda','pasta integrale secca','fusilli integrali','rigatoni integrali','farfalle integrali','tortiglioni integrali','linguine integrali'],['pasta integrale cotta','pasta integrale bollita','fusilli integrali cotti','rigatoni integrali cotti','farfalle integrali cotte','tortiglioni integrali cotti','linguine integrali cotte'],'pasta');
pair('whole_penne',169738,168910,'Penne integrali (crude/secche)','Penne integrali cotte',['penne integrali','penne integrali crude'],['penne integrali cotte'],'pasta');
pair('whole_spaghetti',169738,168910,'Spaghetti integrali (crudi/secchi)','Spaghetti integrali cotti',['spaghetti integrali','spaghetti integrali crudi'],['spaghetti integrali cotti'],'pasta');
// Il pane e gia cotto: questa coppia confronta pane in cassetta prima/dopo tostatura, non impasto crudo.
definitions.push({key:'toast_white',id:174925,name:'Pane bianco tostato (in cassetta)',aliases:['pane tostato','pane bianco tostato','toast bianco'],category:'pane'});
definitions.push({key:'toast_whole',id:172689,name:'Pane integrale tostato (in cassetta)',aliases:['pane integrale tostato','toast integrale'],category:'pane'});
for(const [key,id,name,aliases] of [
 ['orange',169097,'Arancia',['arance','arancia fresca']],['pear',169118,'Pera',['pere']],['kiwi',168153,'Kiwi',['kiwifruit']],['strawberry',167762,'Fragole',['fragola']],['peach',169928,'Pesca',['pesche']],
]) definitions.push({key,id,name,aliases,category:'frutta'});
const foods=definitions.map(({key,id,...metadata})=>{
 const row=catalog.find(row=>row[0]===id);if(!row)throw Error(`Missing USDA ${id}`);
 return {id:`common_${key}`,...metadata,kcal:row[2],pro:row[3],carbs:row[4],fats:row[5],source:'usda',usda:{fdcId:id,description:row[1],dataType:row[6],url:`https://fdc.nal.usda.gov/food-details/${id}/nutrients`}};
});
writeFileSync(new URL('../src/data/commonFoods.ts',import.meta.url),`import type { Food } from '../types';\n\n// Sottoinsieme USDA ufficiale. Le forme di pasta condividono il riferimento generico\n// della stessa ricetta (semola o integrale); la cottura e una voce distinta, non una resa universale.\nexport const COMMON_FOODS: Food[] = ${JSON.stringify(foods,null,2)};\n`);
console.log(`Generated ${foods.length} common foods from canonical USDA records`);

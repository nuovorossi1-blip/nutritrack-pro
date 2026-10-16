import { describe, expect, it } from 'vitest';
// @ts-expect-error server JS
import { cleanPhotoFoods, photoFoods, validFoodImage } from '../server/photoFoods.mjs';

const jpeg='data:image/jpeg;base64,'+Buffer.from([255,216,255,...new Array(64).fill(0)]).toString('base64');
describe('recognition of food photos',()=>{
  it('accepts bounded image data only, never arbitrary remote URLs or spoofed files',()=>{
    expect(validFoodImage(jpeg)).toBe(true);
    for(const data of ['https://localhost/private','data:image/jpeg;base64,'+Buffer.from('not a photo'.repeat(10)).toString('base64'),'data:text/html;base64,YWJj',jpeg+'x'.repeat(1800000)]) expect(validFoodImage(data)).toBe(false);
  });
  it('returns names only, removes duplicates, and never returns proposed weights or macros',async()=>{
    const result=await photoFoods(jpeg,{apiKey:'test-placeholder',ip:'test',fetcher:async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({foods:['Banana','Banana','100g riso',null],grammi:150,kcal:123})}}]})})});
    expect(result).toEqual({status:200,body:{foods:['Banana']}});
    expect(cleanPhotoFoods({foods:[]})).toEqual([]);
  });
  it('handles unavailable, malformed, and unconfigured providers without inventing food',async()=>{
    expect((await photoFoods(jpeg,{})).status).toBe(503);
    expect((await photoFoods('bad',{apiKey:'test-placeholder'})).status).toBe(400);
    expect((await photoFoods(jpeg,{apiKey:'test-placeholder',fetcher:async()=>({ok:false})})).status).toBe(502);
    expect((await photoFoods(jpeg,{apiKey:'test-placeholder',fetcher:async()=>{throw new Error('offline');}})).body.errore).toContain('non riconosciuta');
  });
});

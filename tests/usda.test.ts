import { describe, expect, it } from 'vitest';
// @ts-expect-error modulo JS server
import { findUsdaCandidates, usdaFoods, usdaSearch } from '../server/usdaSearch.mjs';

describe('catalogo ufficiale USDA', () => {
  it('distingue macinato crudo di pollo e vitello e trova avena/patate/tacchino', () => {
    for (const query of ['chicken ground raw', 'veal ground raw', 'oats', 'potatoes', 'turkey breast']) {
      const rows = findUsdaCandidates([query]);
      expect(rows.length, query).toBeGreaterThan(0);
      if (query.includes('raw')) expect(rows.every((r: unknown[]) => String(r[1]).includes('raw'))).toBe(true);
    }
    expect(findUsdaCandidates(['alimento impossibile zxxy'])).toEqual([]);
  });

  it('l AI puo tradurre nomi ma non cambiare macro o aggiungere ID estranei', () => {
    const rows = findUsdaCandidates(['chicken ground raw']);
    const row = rows.find((r: unknown[]) => r[0] === 171116)!;
    expect(row).toBeDefined();
    const foods = usdaFoods([{id: row[0],name:'Macinato di pollo, crudo',kcal:9999}, {id:99999999,name:'Falso'}],rows,'macinato di pollo');
    expect(foods).toHaveLength(1);
    expect(foods[0]).toMatchObject({id:'usda_171116',source:'usda',kcal:Math.round(row[2]),aliases:['macinato di pollo']});
    expect(foods[0].kcal).not.toBe(9999);
    expect(foods[0].usda.description).toBe(row[1]);
    expect(usdaFoods([{id:row[0],name:''}],rows,'pollo')).toEqual([]);
  });

  it('query italiana e nomi tradotti, valori solo dal catalogo e nota scottona esplicita', async () => {
    let calls = 0;
    const translate = async (_prompt: string, input: unknown) => {
      calls++;
      if (typeof input === 'string') return {queries:['beef ground raw']};
      return {foods:(input as {id:number}[]).slice(0,2).map(r=>({id:r.id,name:'Macinato di manzo, crudo'}))};
    };
    const result = await usdaSearch('macinato di scottona',{apiKey:'test-non-una-chiave',ip:'unit',translate});
    expect(result.status).toBe(200);
    expect(result.body.foods.length).toBeGreaterThan(0);
    expect(result.body.note).toMatch(/non distingue la scottona/);
    expect(calls).toBe(1);
    expect((await usdaSearch('x',{})).status).toBe(400);
    expect((await usdaSearch('patate senza traduzione',{})).status).toBe(503);
  });
});

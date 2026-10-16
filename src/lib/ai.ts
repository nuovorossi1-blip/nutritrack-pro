import { foodPreparation } from './nutrition';
import type { Food, MealKey } from '../types';
import type { ParsedEntry } from './parser';
import { normalize } from './parser';
import { accessToken } from './cloud';

// Client dell'AI: manda solo la frase a /api/ai-parse (la chiave sta sul server).

interface AiFood {
  nome: string;
  grammi: number | null;
  pezzi: number | null;
  peso_pezzo_g: number | null;
  cotto: boolean;
  kcal_100g: number;
  proteine_100g: number | null;
  carboidrati_100g: number | null;
  grassi_100g: number | null;
}

export interface AiResult {
  pasto: MealKey | null;
  alimenti: AiFood[];
}

export async function askAi(text: string): Promise<AiResult> {
  const token = await accessToken();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch('/api/ai-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.errore || `AI non disponibile (errore ${res.status})`);
    return body as AiResult;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error("L'AI non ha risposto in tempo");
    throw e;
  } finally {
    clearTimeout(t);
  }
}

const slug = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const r1 = (n: number | null) => Math.round((n ?? 0) * 10) / 10;
const cookingName = /\b(pollo|tacchino|vitello|manzo|scottona|carne|bistecca|fettina|coscia|cosce|pesce|salmone|merluzzo|riso|pasta|spaghetti|penne|fusilli|rigatoni|carota|carote|patata|patate)\b/i;
const baseName = (s: string) => slug(s.replace(/\b(crud[oaie]|cott[oaie])\b/gi, '').replace(/[(),]/g, ' '));
/** Trasforma la risposta dell'AI in voci da confermare; usa un alimento gia' noto se ha lo stesso nome. */
export function aiEntries(r: AiResult, foods: Food[]): ParsedEntry[] {
  return r.alimenti.map((a) => {
    const state: Food['preparation'] = a.cotto ? 'cooked' : cookingName.test(a.nome) ? 'raw' : undefined;
    const known = foods.find((f) => [f.name, `${f.name} ${f.brand || ''}`, ...(f.aliases || [])].some((name) => baseName(name) === baseName(a.nome))
      && (state ? foodPreparation(f) === state : !foodPreparation(f)));
    const name = state && !/\b(crud[oaie]|cott[oaie])\b/i.test(a.nome)
      ? `${a.nome} (${state === 'cooked' ? 'cotto' : 'crudo'})` : a.nome;
    const pw = a.peso_pezzo_g && a.peso_pezzo_g > 0 ? Math.round(a.peso_pezzo_g) : undefined;
    const food: Food = known || {
      id: `ai_${state ? baseName(a.nome) : slug(a.nome)}${state ? `_${state}` : ''}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      preparation: state,
      kcal: Math.round(a.kcal_100g),
      pro: r1(a.proteine_100g),
      carbs: r1(a.carboidrati_100g),
      fats: r1(a.grassi_100g),
      pieceWeight: pw,
      unitName: pw ? 'porzione' : undefined,
      unitPlural: pw ? 'porzioni' : undefined,
      source: 'ai',
    };
    if (a.grammi) return { food, portion: { mode: 'grams', qty: a.grammi, cooked: false }, qtyGiven: true };
    if (a.pezzi && food.pieceWeight) return { food, portion: { mode: 'pieces', qty: a.pezzi, cooked: false }, qtyGiven: true };
    return { food, portion: { mode: food.pieceWeight ? 'pieces' : 'grams', qty: 0, cooked: false }, qtyGiven: false };
  });
}

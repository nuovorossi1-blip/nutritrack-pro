import type { Food } from '../types';
import { accessToken } from './cloud';

export interface UsdaResult { foods: Food[]; note: string; dataset: string }

export async function searchUsda(text: string): Promise<UsdaResult> {
  const token = await accessToken();
  try {
    const res = await fetch('/api/usda-search', {
      method: 'POST', signal: AbortSignal.timeout(55000),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.errore || 'Ricerca USDA non disponibile');
    return body as UsdaResult;
  } catch (e) {
    if ((e as Error).name === 'TimeoutError') throw new Error('USDA non ha risposto in tempo: riprova');
    throw e;
  }
}

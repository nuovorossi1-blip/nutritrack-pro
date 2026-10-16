import type { Food } from '../types';

// Open Food Facts (dati ODbL): prodotti confezionati.
// - Codice a barre: world.openfoodfacts.org accetta richieste dal browser.
// - Ricerca per nome: search.openfoodfacts.org NON le accetta, si passa da
//   /off-search (inoltro di Vite in locale, rewrite in vercel.json online).
// Le risposte restano in cache sul dispositivo: la stessa ricerca non riparte.

const FIELDS = 'code,product_name,product_name_it,brands,nutriments,serving_quantity,product_quantity,countries_tags,completeness';
const CACHE_KEY = 'nutritrack:off-cache:v1';
const CACHE_DAYS = 7;
const CACHE_MAX = 80;

export interface OffResult {
  food: Food;
  /** Valori mancanti (da completare a mano prima di salvare). */
  missing: string[];
  italy: boolean;
  completeness: number;
}

interface OffProduct {
  code?: string;
  product_name?: string;
  product_name_it?: string;
  brands?: string | string[];
  nutriments?: Record<string, number | string | undefined>;
  serving_quantity?: number | string;
  product_quantity?: number | string;
  countries_tags?: string[];
  completeness?: number;
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function mapProduct(p: OffProduct): OffResult | null {
  const name = (p.product_name_it || p.product_name || '').trim();
  if (!p.code || !name) return null;
  const n = p.nutriments || {};
  const kj = num(n['energy_100g']);
  const kcal = num(n['energy-kcal_100g']) ?? (kj !== undefined ? kj / 4.184 : undefined);
  const pro = num(n['proteins_100g']);
  const carbs = num(n['carbohydrates_100g']);
  const fats = num(n['fat_100g']);
  const missing = [
    kcal === undefined && 'kcal',
    pro === undefined && 'proteine',
    carbs === undefined && 'carboidrati',
    fats === undefined && 'grassi',
  ].filter(Boolean) as string[];
  const serving = num(p.serving_quantity);
  const pack = num(p.product_quantity);
  const pieceWeight = serving && serving > 0 && serving <= 1000 ? Math.round(serving) : pack && pack > 0 && pack <= 500 ? Math.round(pack) : undefined;
  const brand = Array.isArray(p.brands) ? p.brands[0] : p.brands?.split(',')[0];
  return {
    food: {
      id: `off_${p.code}`,
      name,
      brand: brand?.trim() || undefined,
      kcal: Math.round(kcal ?? 0),
      pro: r1(pro ?? 0),
      carbs: r1(carbs ?? 0),
      fats: r1(fats ?? 0),
      pieceWeight,
      unitName: pieceWeight ? 'porzione' : undefined,
      unitPlural: pieceWeight ? 'porzioni' : undefined,
      source: 'off',
      barcode: p.code,
    },
    missing,
    italy: (p.countries_tags || []).includes('en:italy'),
    completeness: p.completeness ?? 0,
  };
}

/** Prima i prodotti completi e venduti in Italia; schede doppie (stessi valori) una volta sola. */
export function rankResults(list: OffResult[]): OffResult[] {
  const seen = new Set<string>();
  return [...list].sort(
    (a, b) => a.missing.length - b.missing.length || Number(b.italy) - Number(a.italy) || b.completeness - a.completeness,
  ).filter((r) => {
    const f = r.food;
    const key = [f.name.toLowerCase(), (f.brand || '').toLowerCase(), f.kcal, f.pro, f.carbs, f.fats, f.pieceWeight].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type Cache = Record<string, { at: number; data: OffResult[] }>;

function readCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function cached(key: string): OffResult[] | null {
  const hit = readCache()[key];
  if (!hit || Date.now() - hit.at > CACHE_DAYS * 86400000) return null;
  return hit.data;
}

function store(key: string, data: OffResult[]) {
  const c = readCache();
  c[key] = { at: Date.now(), data };
  const keys = Object.keys(c).sort((a, b) => c[b].at - c[a].at);
  for (const k of keys.slice(CACHE_MAX)) delete c[k];
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* spazio pieno: si lavora senza cache */
  }
}

async function getJson(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Open Food Facts non risponde (errore ${res.status})`);
    return await res.json();
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('Open Food Facts non risponde: riprova fra poco');
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export async function searchByName(query: string): Promise<OffResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const key = `q:${q}`;
  const hit = cached(key);
  if (hit) return hit;
  const data = (await getJson(`/off-search/search?q=${encodeURIComponent(q)}&langs=it,en&page_size=30&fields=${FIELDS}`)) as { hits?: OffProduct[] };
  const list = rankResults((data.hits || []).map(mapProduct).filter((x): x is OffResult => !!x));
  store(key, list);
  return list;
}

export async function findByBarcode(code: string): Promise<OffResult | null> {
  const c = code.replace(/\D/g, '');
  if (c.length < 6) throw new Error('Codice a barre non valido');
  const key = `b:${c}`;
  const hit = cached(key);
  if (hit) return hit[0] ?? null;
  const data = (await getJson(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=${FIELDS}`)) as { status?: number; product?: OffProduct };
  const res = data.status === 1 && data.product ? mapProduct({ ...data.product, code: c }) : null;
  store(key, res ? [res] : []);
  return res;
}

import type { Food, MealKey, QtyMode } from '../types';
import type { Portion } from './nutrition';

// Inserimento a parole: riconoscimento per parole chiave, nessuna AI.
// Ogni regola confronta le PAROLE intere (non pezzi di parola): cosi'
// "panna" non diventa pane e "melanzane" non diventa mela.

interface Rule {
  word: RegExp;
  id: string;
  /** Come si conta di solito (pezzi o grammi) quando la quantita' manca. */
  mode: QtyMode;
}

const RULES: Rule[] = [
  { word: /^album[ei]$/, id: 'f_white', mode: 'pieces' },
  { word: /^tuorl[oi]$/, id: 'f_yolk', mode: 'pieces' },
  { word: /^uov[oa]$/, id: 'f_egg', mode: 'pieces' },
  { word: /^poll[oi]$/, id: 'f3', mode: 'grams' },
  { word: /^tacchin[oi]$/, id: 'f4', mode: 'grams' },
  { word: /^(manzo|macinat[oa])$/, id: 'f5', mode: 'grams' },
  { word: /^salmone$/, id: 'f6', mode: 'grams' },
  { word: /^(merluzz[oi]|nasell[oi])$/, id: 'f7', mode: 'grams' },
  { word: /^tonno$/, id: 'f8', mode: 'grams' },
  { word: /^(riso|basmati)$/, id: 'f11', mode: 'grams' },
  { word: /^(pasta|spaghetti|rigatoni|penne|fusilli|maccheroni|farfalle|linguine)$/, id: 'f12', mode: 'grams' },
  { word: /^(avena|fiocchi)$/, id: 'f14', mode: 'grams' },
  { word: /^pane$/, id: 'f16', mode: 'pieces' },
  { word: /^patat[ae]$/, id: 'f17', mode: 'grams' },
  { word: /^olio$/, id: 'f21', mode: 'pieces' },
  { word: /^(arachidi|peanut)$/, id: 'f22', mode: 'pieces' },
  { word: /^(mandorl[ae]|noci)$/, id: 'f23', mode: 'grams' },
  { word: /^(yogurt|fage)$/, id: 'f26', mode: 'pieces' },
  { word: /^latte$/, id: 'f27', mode: 'grams' },
  { word: /^mel[ae]$/, id: 'f28', mode: 'pieces' },
  { word: /^banan[ae]$/, id: 'f29', mode: 'pieces' },
];

const NUMBER_WORDS: Record<string, number> = {
  un: 1, uno: 1, una: 1, mezzo: 0.5, mezza: 0.5, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10,
};

const COOKED = /^(cott[oaie]|bollit[oaie]|piastrat[oaie]|less[oaie]|grigliat[oaie]|al forno)$/;
const UNIT_WORDS = /^(fett[ae]|pezz[oi]|porzion[ei]|tranc[io]|filett[oi]|scatolett[ae]|vasett[oi]|cucchia(io|i|ino|ini)|tazz[ae]|manciat[ae])$/;

export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ');
}

export function mealFromText(text: string): MealKey | null {
  const w = normalize(text).split(/[^a-z]+/);
  if (w.some((x) => /^colazion[ei]$/.test(x))) return 'colazione';
  if (w.some((x) => /^pranz[oi]$/.test(x))) return 'pranzo';
  if (w.some((x) => /^cen[ae]$/.test(x))) return 'cena';
  if (w.some((x) => /^(spuntin[oi]|merend[ae]|snack|extra)$/.test(x))) return 'spuntini';
  return null;
}

export interface ParsedEntry {
  food: Food;
  portion: Portion;
  /** false se nella frase non c'e' nessuna quantita': va chiesta, non inventata. */
  qtyGiven: boolean;
}

const GRAM_UNITS: Record<string, number> = { g: 1, gr: 1, grammo: 1, grammi: 1, ml: 1, kg: 1000, chili: 1000 };

type Token =
  | { kind: 'food'; food: Food; rule?: Rule }
  | { kind: 'qty'; value: number; grams: boolean }
  | { kind: 'unit' }
  | { kind: 'cooked' }
  | { kind: 'word' };

/** Alimento che inizia alla parola i: prima quelli salvati dall'utente (nome intero), poi le regole. */
function foodAt(words: string[], i: number, foods: Food[]): { food: Food; rule?: Rule; len: number } | null {
  let best: { food: Food; len: number } | null = null;
  for (const f of foods) {
    if (f.source === 'base') continue;
    const name = normalize(f.name).split(/[^a-z0-9]+/).filter(Boolean);
    if (name.length && name.join(' ').length >= 3 && name.every((w, k) => words[i + k] === w) && (!best || name.length > best.len)) best = { food: f, len: name.length };
  }
  if (best) return best;
  for (const r of RULES) {
    if (r.word.test(words[i])) {
      const food = foods.find((f) => f.id === r.id);
      if (food) return { food, rule: r, len: 1 };
    }
  }
  return null;
}

function tokenize(chunk: string, foods: Food[]): Token[] {
  const words = chunk.match(/\d+(?:[.,]\d+)?|[a-z]+|%/g) || [];
  const out: Token[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^\d/.test(w)) {
      const value = parseFloat(w.replace(',', '.'));
      const next = words[i + 1];
      if (next === '%') {
        i++; // "yogurt 0%": e' una caratteristica, non una quantita'
        continue;
      }
      if (next && GRAM_UNITS[next]) {
        out.push({ kind: 'qty', value: value * GRAM_UNITS[next], grams: true });
        i++;
      } else out.push({ kind: 'qty', value, grams: false });
      continue;
    }
    if (NUMBER_WORDS[w] !== undefined) {
      const next = words[i + 1];
      if (next && GRAM_UNITS[next]) {
        out.push({ kind: 'qty', value: NUMBER_WORDS[w] * GRAM_UNITS[next], grams: true }); // "mezzo kg"
        i++;
      } else out.push({ kind: 'qty', value: NUMBER_WORDS[w], grams: false });
      continue;
    }
    const hit = foodAt(words, i, foods);
    if (hit) {
      out.push({ kind: 'food', food: hit.food, rule: hit.rule });
      i += hit.len - 1;
      continue;
    }
    out.push({ kind: UNIT_WORDS.test(w) ? 'unit' : COOKED.test(w) ? 'cooked' : 'word' });
  }
  return out;
}

/**
 * Ogni pezzo di frase puo' avere piu' alimenti ("2 uova 100 g di albume"):
 * quantita', unita' e "cotto" vanno all'alimento che segue; se dopo non c'e'
 * nessun alimento ("pasta 80g", "pasta cotta"), a quello prima.
 */
export function parseFoodText(text: string, foods: Food[]): ParsedEntry[] {
  const out: ParsedEntry[] = [];
  for (const chunk of normalize(text).split(/\s+e\s+|\s+con\s+|,|\+|;|\s+poi\s+/)) {
    const tokens = tokenize(chunk, foods);
    const foodIdx = tokens.map((t, i) => (t.kind === 'food' ? i : -1)).filter((i) => i >= 0);
    if (!foodIdx.length) continue;
    const owner = (i: number) => foodIdx.find((f) => f > i) ?? [...foodIdx].reverse().find((f) => f < i)!;
    for (const fi of foodIdx) {
      const t = tokens[fi] as Extract<Token, { kind: 'food' }>;
      const mine = tokens.filter((_, i) => i !== fi && tokens[i].kind !== 'food' && owner(i) === fi);
      const qty = mine.find((x): x is Extract<Token, { kind: 'qty' }> => x.kind === 'qty' && x.value > 0);
      const unit = mine.some((x) => x.kind === 'unit');
      const cooked = mine.some((x) => x.kind === 'cooked') && !!t.food.cookedFactor;
      const pw = t.food.pieceWeight;
      let portion: Portion;
      if (qty?.grams) portion = { mode: 'grams', qty: qty.value, cooked };
      else if (qty) portion = pw && (unit || t.rule?.mode === 'pieces' || qty.value <= 10) ? { mode: 'pieces', qty: qty.value, cooked } : { mode: 'grams', qty: qty.value, cooked };
      else portion = { mode: pw && (unit || t.rule?.mode === 'pieces') ? 'pieces' : 'grams', qty: 0, cooked };
      out.push({ food: t.food, portion, qtyGiven: !!qty });
    }
  }
  return out;
}

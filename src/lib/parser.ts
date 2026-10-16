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

function findFood(words: string[], foods: Food[], phrase: string): { food: Food; rule?: Rule } | null {
  for (const r of RULES) {
    if (words.some((w) => r.word.test(w))) {
      const food = foods.find((f) => f.id === r.id);
      if (food) return { food, rule: r };
    }
  }
  // Alimenti salvati dall'utente: nome intero contenuto nella frase.
  for (const f of foods) {
    if (f.source === 'base') continue;
    const name = normalize(f.name).trim();
    if (name.length >= 3 && phrase.includes(name)) return { food: f };
  }
  return null;
}

export function parseFoodText(text: string, foods: Food[]): ParsedEntry[] {
  const out: ParsedEntry[] = [];
  const phrases = normalize(text).split(/\s+e\s+|\s+con\s+|,|\+|;/);
  for (const raw of phrases) {
    const phrase = raw.trim();
    if (!phrase) continue;
    const words = phrase.split(/[^a-z0-9.,]+/).filter(Boolean);
    const hit = findFood(words, foods, phrase);
    if (!hit) continue;
    const { food, rule } = hit;
    const cooked = words.some((w) => COOKED.test(w)) && !!food.cookedFactor;
    const gramMatch = phrase.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|grammi|ml)\b/);
    const numMatch = phrase.match(/(\d+(?:[.,]\d+)?)/);
    const wordNum = words.map((w) => NUMBER_WORDS[w]).find((n) => n !== undefined);
    const num = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : wordNum;
    const mentionsUnit = words.some((w) => UNIT_WORDS.test(w));

    let portion: Portion;
    if (gramMatch) {
      portion = { mode: 'grams', qty: parseFloat(gramMatch[1].replace(',', '.')), cooked };
    } else if (food.pieceWeight && (mentionsUnit || rule?.mode === 'pieces' || (num !== undefined && num <= 10))) {
      portion = { mode: 'pieces', qty: num ?? 0, cooked };
    } else {
      portion = { mode: 'grams', qty: num ?? 0, cooked };
    }
    out.push({ food, portion, qtyGiven: !!gramMatch || num !== undefined });
  }
  return out;
}

import type { Food } from '../types';
import { normalize } from './parser';

// Controlli di buon senso sui valori per 100 g (Open Food Facts, AI o inseriti a mano).
// Non bloccano niente: servono a far guardare l'etichetta prima di salvare.

interface Range {
  words: RegExp;
  /** Parole che cambiano categoria (es. "olio" nel tonno). */
  unless?: RegExp;
  min: number;
  max: number;
  label: string;
}

// Piatti pronti e misti: valori diversi dall'ingrediente semplice, niente intervallo.
const COMPOSTI = /insalat|mais|pisell|fagiol|bowl|riso|pasta|salsa|crema|pate|sugo|cous|verdur|olive|pomodor|sughett/;

// Intervalli tipici di kcal per 100 g (tabelle CREA/CIQUAL, arrotondati larghi).
const RANGES: Range[] = [
  { words: /\btonno\b.*\bnatural|\bnatural.*\btonno\b/, unless: COMPOSTI, min: 80, max: 160, label: 'tonno al naturale' },
  { words: /\btonno\b/, unless: COMPOSTI, min: 80, max: 330, label: 'tonno' },
  { words: /\b(yogurt|yoghurt)\b/, min: 35, max: 220, label: 'yogurt' },
  { words: /\blatte\b/, unless: /polvere|condensat|cioccolat/, min: 30, max: 80, label: 'latte' },
  { words: /\b(pasta|spaghetti|penne|fusilli|rigatoni)\b/, unless: /cott|ripien|tortell|ravio|gnocch|pronta/, min: 320, max: 390, label: 'pasta secca' },
  { words: /\briso\b/, unless: /cott|soffiat|gallett|latte/, min: 320, max: 380, label: 'riso crudo' },
  { words: /\bpane\b/, unless: /grattugiat|carasau|bauletto/, min: 200, max: 330, label: 'pane' },
  { words: /\b(petto di pollo|pollo)\b/, unless: /impanat|cotolett|crocchett|fritt/, min: 90, max: 220, label: 'pollo' },
  { words: /\buov[ao]\b/, unless: /pasta|cioccolat|albume|tuorlo/, min: 120, max: 170, label: 'uova' },
  { words: /\b(mela|banana|pera|arancia|kiwi|fragole)\b/, unless: /secc|disidrat|succo|composta|marmellat|chips/, min: 20, max: 110, label: 'frutta fresca' },
  { words: /\b(acqua|caffe|te)\b/, unless: /cocco|zucchero|latte/, min: 0, max: 15, label: 'bevanda senza zucchero' },
];

export function plausibilityWarnings(f: Pick<Food, 'name' | 'kcal' | 'pro' | 'carbs' | 'fats'>): string[] {
  const out: string[] = [];
  const grams = f.pro + f.carbs + f.fats;
  if (f.kcal > 900) out.push(`${f.kcal} kcal per 100 g è impossibile (il massimo, l'olio, è circa 900).`);
  if (grams > 101) out.push(`Proteine + carboidrati + grassi fanno ${Math.round(grams)} g su 100 g: impossibile.`);
  const fromMacros = Math.round(f.pro * 4 + f.carbs * 4 + f.fats * 9);
  if (f.kcal > 0 && Math.abs(f.kcal - fromMacros) > Math.max(40, f.kcal * 0.25)) {
    out.push(`Le calorie (${f.kcal}) non tornano con i macro, che danno circa ${fromMacros} kcal.`);
  }
  const name = normalize(f.name);
  // "0%"/"zero": quasi senza grassi; "magro"/"light": pochi (il macinato magro ha 5-10 g).
  if (/(^|\s)(0\s?%|zero)(\s|$)/.test(f.name.toLowerCase()) && f.fats > 3) out.push(`Prodotto «0%» ma con ${f.fats} g di grassi.`);
  else if (/\b(light|magr[oa])\b/.test(name) && f.fats > 12) out.push(`Prodotto «magro/light» ma con ${f.fats} g di grassi.`);
  const r = RANGES.find((x) => x.words.test(name) && !(x.unless && x.unless.test(name)));
  if (r && (f.kcal < r.min || f.kcal > r.max)) out.push(`Per ${r.label} di solito si va da ${r.min} a ${r.max} kcal per 100 g: qui ${f.kcal}.`);
  return out;
}

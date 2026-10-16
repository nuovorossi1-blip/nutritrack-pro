import { useAndroidBack } from '../native/navigation';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { MealKey } from '../types';
import { MEALS } from '../types';
import { macrosFor, portionLabel, rawGrams, sumMacros } from '../lib/nutrition';
import type { ParsedEntry } from '../lib/parser';
import { NumberInput } from './NumberInput';
import { plausibilityWarnings } from '../lib/plausibility';

interface Props {
  entries: ParsedEntry[];
  /** Pasto detto nella frase; se manca va scelto, non indovinato dall'ora. */
  meal: MealKey | null;
  /** Voci lette dall'AI: valori stimati, da controllare. */
  ai?: boolean;
  dayLabel: string;
  onConfirm: (entries: ParsedEntry[], meal: MealKey) => void;
  onClose: () => void;
}

// Riepilogo dell'inserimento a parole: niente viene aggiunto finche' pasto e
// quantita' non sono chiari.
export function QuickConfirm({ entries: initial, meal: initialMeal, ai, dayLabel, onConfirm, onClose }: Props) {
  useAndroidBack(onClose);
  const [entries, setEntries] = useState(initial);
  const [meal, setMeal] = useState<MealKey | null>(initialMeal);
  const set = (i: number, e: ParsedEntry) => setEntries(entries.map((x, j) => (j === i ? e : x)));
  const missingQty = entries.some((e) => rawGrams(e.food, e.portion) <= 0);
  const total = sumMacros(entries.map((e) => macrosFor(e.food, rawGrams(e.food, e.portion))));
  const chip = (active: boolean) => `py-2 rounded-xl text-xs font-bold transition ${active ? 'bg-blu text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`;

  return (
    <div className="safe-sheet-overlay fixed inset-0 z-50 bg-neutral-950/60 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ios-sheet safe-bottom-sheet bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-extrabold">Controlla prima di aggiungere</h3>
            <p className="text-xs text-neutral-400">{dayLabel}</p>
            {ai && <p className="text-[11px] text-blue-600 dark:text-gold-400 mt-1">Letto dall'AI: valori stimati per 100 g, controllali. Gli alimenti nuovi restano salvati per le prossime volte.</p>}
          </div>
          <button aria-label="Chiudi" onClick={onClose} className="text-neutral-400 p-1">
            <X size={20} />
          </button>
        </div>

        <div>
          <div className={`text-xs font-bold mb-1.5 ${meal ? 'text-neutral-500' : 'text-red-500'}`}>{meal ? 'Pasto' : 'In quale pasto?'}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {MEALS.map((m) => (
              <button key={m.key} onClick={() => setMeal(m.key)} className={chip(meal === m.key)}>
                {m.key === 'spuntini' ? 'Spuntino' : m.label}
              </button>
            ))}
          </div>
        </div>

        {entries.map((e, i) => {
          const g = rawGrams(e.food, e.portion);
          const m = macrosFor(e.food, g);
          const pieces = e.portion.mode === 'pieces';
          return (
            <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">
                  {e.food.name}
                  {e.food.source === 'ai' && <span className="ml-1.5 text-[10px] font-extrabold rounded-md px-1.5 py-0.5 bg-gold text-neutral-950 align-middle">AI</span>}
                  <span className="block text-[10px] font-semibold text-neutral-400">
                    per 100 g: {e.food.kcal} kcal · C {e.food.carbs} · P {e.food.pro} · G {e.food.fats}
                  </span>
                  {plausibilityWarnings(e.food).map((w) => (
                    <span key={w} className="block text-[10px] font-semibold text-gold-600 dark:text-gold-300">
                      ⚠ {w}
                    </span>
                  ))}
                </span>
                {entries.length > 1 && (
                  <button aria-label="Togli" onClick={() => setEntries(entries.filter((_, j) => j !== i))} className="text-neutral-400 p-1">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <NumberInput
                  value={e.portion.qty || undefined}
                  placeholder={pieces ? 'quanti?' : 'grammi?'}
                  onChange={(n) => set(i, { ...e, portion: { ...e.portion, qty: n ?? 0 }, qtyGiven: true })}
                  className={`w-24 text-center font-extrabold bg-neutral-50 dark:bg-neutral-800 rounded-xl py-2 border ${g <= 0 ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'}`}
                />
                {e.food.pieceWeight ? (
                  <select
                    value={e.portion.mode}
                    onChange={(ev) => set(i, { ...e, portion: { ...e.portion, mode: ev.target.value as 'grams' | 'pieces', qty: 0 } })}
                    className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-2 text-xs font-semibold"
                  >
                    <option value="pieces">{e.food.unitPlural || 'pezzi'} ({e.food.pieceWeight}g)</option>
                    <option value="grams">grammi</option>
                  </select>
                ) : (
                  <span className="text-xs font-bold text-neutral-400">grammi</span>
                )}
                {e.food.cookedFactor ? (
                  <select
                    value={e.portion.cooked ? 'cotto' : 'crudo'}
                    onChange={(ev) => set(i, { ...e, portion: { ...e.portion, cooked: ev.target.value === 'cotto' } })}
                    className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-2 text-xs font-semibold"
                  >
                    <option value="crudo">crudo</option>
                    <option value="cotto">cotto</option>
                  </select>
                ) : null}
              </div>
              <div className={`text-[11px] font-semibold ${g <= 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                {g <= 0 ? 'Quantità non indicata: scrivila qui sopra' : `${portionLabel(e.food, e.portion)} · ${m.kcal} kcal · C ${m.carbs} · P ${m.pro} · G ${m.fats}`}
              </div>
            </div>
          );
        })}

        <button
          disabled={!meal || missingQty || entries.length === 0}
          onClick={() => meal && onConfirm(entries, meal)}
          className="add-button w-full bg-blu hover:brightness-110 disabled:opacity-40 text-white font-bold rounded-2xl"
        >
          {!meal ? 'Scegli il pasto' : missingQty ? 'Indica le quantità' : `Aggiungi a ${MEALS.find((m) => m.key === meal)!.label.toLowerCase()} · ${total.kcal} kcal`}
        </button>
      </div>
    </div>
  );
}

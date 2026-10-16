import type { Food } from '../types';
import { macrosFor } from '../lib/nutrition';
import { NumberInput } from './NumberInput';

/** Plurale italiano semplice per il nome della porzione (fetta -> fette, biscotto -> biscotti). */
export function pluralIt(word: string): string {
  const w = word.trim();
  if (!w) return w;
  if (/[aà]$/i.test(w)) return w.replace(/a$/i, 'e');
  if (/[oe]$/i.test(w)) return w.replace(/[oe]$/i, 'i');
  return w;
}

/** Imposta il peso e il nome di una porzione dell'alimento (es. 1 fetta biscottata = 7 g). */
export function withPortion(food: Food, weight: number | undefined, name: string): Food {
  if (!weight || weight <= 0) return { ...food, pieceWeight: undefined, pieceWeightEstimated: false };
  const unit = name.trim() || 'porzione';
  return { ...food, pieceWeight: weight, pieceWeightEstimated: false, unitName: unit, unitPlural: pluralIt(unit) };
}

interface Props {
  food: Food;
  onChange: (food: Food) => void;
}

// La confezione da' i valori per 100 g, ma spesso si mangia "a porzioni" (1 fetta biscottata = 7 g,
// 1 vasetto = 125 g): qui si scrivono peso e nome della porzione e si vedono subito kcal e macro.
export function PortionSetup({ food, onChange }: Props) {
  const per = food.pieceWeight ? macrosFor(food, food.pieceWeight) : null;
  const field = 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm font-semibold';
  return (
    <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 space-y-2">
      <div className="text-[11px] font-bold text-neutral-500">Porzione (dalla confezione: «1 fetta = 7 g», «1 vasetto = 125 g»)</div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">1</span>
        <input
          aria-label="Nome della porzione"
          value={food.pieceWeight ? food.unitName || '' : food.unitName && food.unitName !== 'porzione' ? food.unitName : ''}
          placeholder="fetta"
          onChange={(e) => onChange({ ...withPortion(food, food.pieceWeight, e.target.value), unitName: e.target.value || undefined, unitPlural: pluralIt(e.target.value) || undefined })}
          className={`${field} flex-1 min-w-0`}
        />
        <span className="text-sm font-bold">=</span>
        <NumberInput
          value={food.pieceWeight}
          placeholder="g"
          onChange={(n) => onChange(withPortion(food, n, food.unitName || ''))}
          className={`${field} w-20 text-center`}
        />
        <span className="text-sm font-bold">g</span>
      </div>
      {per ? (
        <div className="text-xs text-neutral-600 dark:text-neutral-300">
          1 {food.unitName || 'porzione'} ({food.pieceWeight} g) = <b>{per.kcal} kcal</b> · C {per.carbs} g · P {per.pro} g · G {per.fats} g
        </div>
      ) : (
        <div className="text-[11px] text-neutral-400">Facoltativo: senza porzione l'alimento si inserisce a grammi.</div>
      )}
    </div>
  );
}

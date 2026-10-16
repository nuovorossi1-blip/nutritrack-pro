import type { Food } from '../types';
import { foodPreparation, type Portion } from '../lib/nutrition';
import { NumberInput } from './NumberInput';

export function CookingWeights({ food, portion, onChange }: { food: Food; portion: Portion; onChange: (p: Portion) => void }) {
  if (foodPreparation(food) !== 'raw') return null;
  const weights = portion.cookingYield;
  return <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs font-semibold">
      <input type="checkbox" checked={!!weights} onChange={(event) => onChange({ ...portion,
        mode: 'grams', qty: portion.mode === 'pieces' ? portion.qty * (food.pieceWeight || 0) : portion.qty,
        cooked: event.target.checked,
        cookingYield: event.target.checked ? {raw: 0, cooked: 0} : undefined,
      })} />Ho pesato prima e dopo la cottura
    </label>
    {weights && <fieldset className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 space-y-2">
      <p className="text-xs">Peso totale dello stesso alimento, senza condimenti. Sotto inserisci i grammi cotti da mangiare.</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs">Totale crudo (g)<NumberInput ariaLabel="Totale crudo (g)" value={weights.raw || undefined} onChange={(raw) => onChange({...portion, cooked: true, cookingYield: {...weights, raw: raw ?? 0}})} className="w-full mt-1 p-3 bg-white dark:bg-neutral-900" /></label>
        <label className="text-xs">Totale cotto (g)<NumberInput ariaLabel="Totale cotto (g)" value={weights.cooked || undefined} onChange={(cooked) => onChange({...portion, cooked: true, cookingYield: {...weights, cooked: cooked ?? 0}})} className="w-full mt-1 p-3 bg-white dark:bg-neutral-900" /></label>
      </div>
      <p className="text-[11px] text-neutral-500">Ripartizione dei valori a crudo in base al peso. Eventuali grassi o succhi persi non sono misurati; aggiungi olio e altri ingredienti separatamente.</p>
    </fieldset>}
  </div>;
}

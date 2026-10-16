import { Minus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Food, QtyMode } from '../types';
import { macrosFor, portionLabel, rawGrams, type Portion } from '../lib/nutrition';
import { NumberInput } from './NumberInput';

interface Props {
  food: Food;
  initial?: Portion;
  confirmLabel: string;
  onConfirm: (p: Portion) => void;
  onClose: () => void;
}

export function defaultPortion(food: Food): Portion {
  return food.pieceWeight ? { mode: 'pieces', qty: 1, cooked: false } : { mode: 'grams', qty: 100, cooked: false };
}

export function PortionEditor({ food, initial, confirmLabel, onConfirm, onClose }: Props) {
  const [p, setP] = useState<Portion>(initial || defaultPortion(food));
  const grams = rawGrams(food, p);
  const m = macrosFor(food, grams);
  const step = p.mode === 'pieces' ? (food.pieceWeight && food.pieceWeight >= 100 ? 0.5 : 1) : 10;

  const setMode = (mode: QtyMode) => {
    if (mode === p.mode) return;
    const pw = food.pieceWeight || 100;
    setP(mode === 'grams' ? { ...p, mode, qty: Math.round(p.qty * pw) } : { ...p, mode, qty: Math.max(1, Math.round(p.qty / pw)) });
  };

  const tab = (active: boolean) =>
    `flex-1 py-2 rounded-xl text-xs font-bold transition ${active ? 'bg-white dark:bg-neutral-700 shadow text-blue-600 dark:text-blue-300' : 'text-neutral-500'}`;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base">{food.name}</h3>
            <p className="text-xs text-neutral-400">
              {food.brand ? `${food.brand} · ` : ''}per 100g{food.cookedFactor ? ' a crudo' : ''}: {food.kcal} kcal · C {food.carbs} · P {food.pro} · G {food.fats}
            </p>
          </div>
          <button aria-label="Chiudi" onClick={onClose} className="text-neutral-400 p-1">
            <X size={20} />
          </button>
        </div>

        {food.pieceWeight ? (
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 gap-1">
            <button className={tab(p.mode === 'pieces')} onClick={() => setMode('pieces')}>
              A {food.unitPlural || 'pezzi'} ({food.pieceWeight}g)
            </button>
            <button className={tab(p.mode === 'grams')} onClick={() => setMode('grams')}>
              A grammi
            </button>
          </div>
        ) : null}

        {food.cookedFactor ? (
          <div>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 gap-1">
              <button className={tab(!p.cooked)} onClick={() => setP({ ...p, cooked: false })}>
                Pesato crudo
              </button>
              <button className={tab(p.cooked)} onClick={() => setP({ ...p, cooked: true })}>
                Pesato cotto
              </button>
            </div>
            {p.cooked && food.cookNote && <p className="text-[11px] text-yellow-700 dark:text-yellow-400 mt-1.5">{food.cookNote}.</p>}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button aria-label="Meno" onClick={() => setP({ ...p, qty: Math.max(0, Math.round((p.qty - step) * 10) / 10) })} className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Minus size={18} />
          </button>
          <div className="flex-1 relative">
            <NumberInput
              value={p.qty}
              onChange={(n) => setP({ ...p, qty: n ?? 0 })}
              className="w-full text-center text-2xl font-extrabold bg-neutral-50 dark:bg-neutral-800 rounded-2xl py-2 border border-neutral-200 dark:border-neutral-700"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">{p.mode === 'grams' ? 'g' : 'pz'}</span>
          </div>
          <button aria-label="Più" onClick={() => setP({ ...p, qty: Math.round((p.qty + step) * 10) / 10 })} className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Plus size={18} />
          </button>
        </div>

        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-3">
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">{portionLabel(food, p)}</div>
          <div className="text-sm font-extrabold mt-1">
            {m.kcal} kcal <span className="text-xs font-semibold text-neutral-500">· C {m.carbs}g · P {m.pro}g · G {m.fats}g</span>
          </div>
        </div>

        <button disabled={grams <= 0} onClick={() => onConfirm(p)} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-2xl py-3">
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

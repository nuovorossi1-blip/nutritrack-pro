import { useAndroidBack } from '../native/navigation';
import { Minus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Food, QtyMode } from '../types';
import { foodPreparation, macrosFor, portionLabel, rawFromCooked, rawGrams, withServing, type Portion } from '../lib/nutrition';
import { CookingWeights } from './CookingWeights';
import { NumberInput } from './NumberInput';
import { pluralIt } from './PortionSetup';
import { plausibilityWarnings } from '../lib/plausibility';

interface Props {
  food: Food;
  initial?: Portion;
  confirmLabel: string;
  onConfirm: (p: Portion, food: Food) => void;
  alternatives?: Food[];
  onClose: () => void;
  /** Apre la scheda per correggere i valori per 100 g dell'alimento. */
  onEditFood?: (food: Food, portion: Portion) => void;
}

export function defaultPortion(food: Food): Portion {
  return food.pieceWeight ? { mode: 'pieces', qty: 1, cooked: false } : { mode: 'grams', qty: 100, cooked: false };
}

export function PortionEditor({ food: originalFood, initial, confirmLabel, onConfirm, onClose, onEditFood, alternatives = [] }: Props) {
  useAndroidBack(onClose);
  const [food, setFood] = useState(originalFood);
  const [editingServing, setEditingServing] = useState(false);
  const [servingGrams, setServingGrams] = useState<number | undefined>(originalFood.servingGrams ?? originalFood.pieceWeight);
  const [servingUnits, setServingUnits] = useState<number | undefined>(originalFood.servingUnits ?? 1);
  const [p, setP] = useState<Portion>(initial || defaultPortion(food));
  const grams = rawGrams(food, p);
  const m = macrosFor(food, grams);
  const rawEstimate = rawFromCooked(food, grams, alternatives || []);
  const step = p.mode === 'pieces' ? (food.pieceWeight && food.pieceWeight >= 100 ? 0.5 : 1) : 10;

  const setMode = (mode: QtyMode) => {
    if (mode === p.mode) return;
    const pw = food.pieceWeight;
    if (!pw && mode === 'pieces') { setP({mode:'pieces',qty:1,cooked:false}); setEditingServing(true); return; }
    if (!pw) return;
    setP(mode === 'grams' ? { ...p, mode, qty: Math.round(p.qty * pw * 100) / 100 } : { ...p, mode, qty: Math.round(p.qty / pw * 100) / 100 });
  };

  const tab = (active: boolean) =>
    `flex-1 py-2 rounded-xl text-xs font-bold transition ${active ? 'bg-white dark:bg-neutral-700 shadow text-blue-600 dark:text-blue-300' : 'text-neutral-500'}`;

  return (
    <div className="safe-sheet-overlay fixed inset-0 z-50 bg-neutral-950/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ios-sheet safe-bottom-sheet bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base">{food.name}</h3>
            <p className="text-xs text-neutral-400">
              {food.brand ? `${food.brand} · ` : ''}per 100g{foodPreparation(food) === 'cooked' ? ' da cotto' : foodPreparation(food) === 'raw' ? ' a crudo' : ''}: {food.kcal} kcal · C {food.carbs} · P {food.pro} · G {food.fats}
            </p>
            {food.nutritionReference && <a href={food.nutritionReference.url} target="_blank" rel="noreferrer" className="text-[11px] underline text-blue-600 dark:text-gold-400">Fonte: {food.nutritionReference.label}</a>}
            {food.usda && <a href={food.usda.url} target="_blank" rel="noreferrer" className="text-[11px] underline text-blue-600 dark:text-gold-400">Fonte: USDA FoodData Central</a>}
            {onEditFood && (
              <button onClick={() => onEditFood(food,p)} className="text-[11px] font-bold text-blue-600 dark:text-gold-400 mt-0.5">
                {plausibilityWarnings(food).length ? '⚠ Valori da controllare: correggi' : 'Correggi i valori per 100 g'}
              </button>
            )}
          </div>
          <button aria-label="Chiudi" onClick={onClose} className="text-neutral-400 p-1">
            <X size={20} />
          </button>
        </div>

        {(
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 gap-1">
            <button className={tab(p.mode === 'pieces')} onClick={() => setMode('pieces')}>
              A {food.unitPlural || 'pezzi'}{food.pieceWeight ? ` (${food.pieceWeightEstimated ? 'circa ' : ''}${Number(food.pieceWeight.toFixed(2))}g)` : ''}
            </button>
            <button className={tab(p.mode === 'grams')} onClick={() => setMode('grams')}>
              A grammi
            </button>
          </div>
        )}
        {p.mode === 'pieces' && <div className="space-y-2">
          <button onClick={() => setEditingServing(!editingServing)} className="text-xs font-bold text-blue-500">{food.pieceWeight ? 'Modifica peso della porzione' : 'Definisci il peso della porzione'}</button>
          {(editingServing || !food.pieceWeight) && <div className="grid grid-cols-2 gap-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3">
            <label className="text-xs">Peso porzione (g)<NumberInput value={servingGrams} placeholder="Es. 7 o 14" onChange={(value) => { setServingGrams(value); setFood(withServing(food,value,servingUnits)); }} className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-neutral-900" /></label>
            <label className="text-xs">Pezzi nella porzione<NumberInput value={servingUnits} placeholder="Es. 1 o 2" onChange={(value) => { setServingUnits(value); setFood(withServing(food,servingGrams,value)); }} className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-neutral-900" /></label>
            <label className="col-span-2 text-xs">Nome della porzione<input aria-label="Nome della porzione" value={food.unitName || ''} placeholder="Es. fetta, biscotto, misurino" onChange={(event) => setFood({...food,unitName:event.target.value,unitPlural:pluralIt(event.target.value)})} className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-neutral-900" /></label>
          </div>}
        </div>}
        {food.counterpartId && !p.cookingYield && <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1 gap-1">
          {(['raw','cooked'] as const).map((state) => <button key={state} className={tab(food.preparation === state)} onClick={() => { const next=alternatives.find((candidate) => candidate.id === food.counterpartId); if(next && next.preparation === state) {setFood(next);setP({...p,cooked:false});} }}>{state === 'raw' ? 'Pesato crudo' : 'Pesato cotto'}</button>)}
        </div>}

        {food.cookedFactor && foodPreparation(food) !== 'cooked' && !p.cookingYield ? (
          <div>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 gap-1">
              <button className={tab(!p.cooked)} onClick={() => setP({ ...p, cooked: false })}>
                Pesato crudo
              </button>
              <button className={tab(p.cooked)} onClick={() => setP({ ...p, cooked: true })}>
                Pesato cotto
              </button>
            </div>
            {p.cooked && <p className="text-[11px] text-gold-700 dark:text-gold-400 mt-1.5">Conversione stimata: la resa cambia con alimento e cottura. Olio e condimenti vanno aggiunti separatamente.</p>}
          </div>
        ) : null}

        <CookingWeights food={food} portion={p} onChange={setP} />
        <div className="text-xs font-bold text-neutral-500">Quantità da mangiare{p.cooked || foodPreparation(food) === 'cooked' ? ' (peso cotto)' : foodPreparation(food) === 'raw' ? ' (peso crudo)' : ''}</div>
        <div className="flex items-center gap-3">
          <button aria-label="Meno" onClick={() => setP({ ...p, qty: Math.max(0, Math.round((p.qty - step) * 10) / 10) })} className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Minus size={18} />
          </button>
          <div className="flex-1 relative">
            <NumberInput
              value={p.qty}
              ariaLabel={p.mode === 'pieces' ? 'Pezzi da mangiare' : 'Grammi da mangiare'}
              onChange={(n) => setP({ ...p, qty: n ?? 0 })}
              className="w-full text-center text-2xl font-extrabold bg-neutral-50 dark:bg-neutral-800 rounded-2xl py-2 border border-neutral-200 dark:border-neutral-700"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">{p.mode === 'grams' ? 'g' : p.qty === 1 ? food.unitName || 'pz' : food.unitPlural || 'pz'}</span>
          </div>
          <button aria-label="Più" onClick={() => setP({ ...p, qty: Math.round((p.qty + step) * 10) / 10 })} className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Plus size={18} />
          </button>
        </div>

        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-3">
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">{portionLabel(food, p)}</div>
          {rawEstimate !== null && <div className="text-xs text-neutral-500 mt-0.5">≈ {rawEstimate} g a crudo (stima)</div>}
          <div className="text-sm font-extrabold mt-1">
            {p.mode === 'pieces' && !food.pieceWeight ? '?' : m.kcal} kcal <span className="text-xs font-semibold text-neutral-500">· C {m.carbs}g · P {m.pro}g · G {m.fats}g</span>
          </div>
        </div>

        <button disabled={grams <= 0 || (p.mode === 'pieces' && !food.pieceWeight)} onClick={() => onConfirm(p, food)} className="add-button w-full bg-blu hover:brightness-110 disabled:opacity-40 text-white font-bold rounded-2xl">
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { useState } from 'react';
import type { Food } from '../types';
import { NumberInput } from './NumberInput';

// Peso cotto / peso crudo, come negli alimenti di base. I valori della scheda restano quelli a crudo.
const COOKING = [
  { label: 'Pasta (raddoppia il peso)', factor: 2.1, note: 'La pasta assorbe acqua e raddoppia il peso' },
  { label: 'Riso (quasi triplica)', factor: 2.7, note: 'Il riso assorbe acqua e quasi triplica il peso' },
  { label: 'Carne (perde circa il 26%)', factor: 0.74, note: 'La carne perde circa il 26% di acqua in cottura' },
  { label: 'Pesce (perde circa il 22%)', factor: 0.78, note: 'Il pesce perde circa il 22% di peso in cottura' },
];

interface Props {
  food: Food;
  missing?: string[];
  title: string;
  onSave: (food: Food) => void;
  onClose: () => void;
}

// Prima di salvare un prodotto si vedono (e si correggono) i valori:
// i dati di Open Food Facts li inseriscono gli utenti e possono sbagliare.
export function FoodReview({ food, missing = [], title, onSave, onClose }: Props) {
  const [f, setF] = useState<Food>(food);
  const numField = (key: 'kcal' | 'pro' | 'carbs' | 'fats', label: string) => (
    <label className="block">
      <span className={`text-[11px] font-bold ${missing.includes(label.toLowerCase()) ? 'text-red-500' : 'text-neutral-500'}`}>{label}</span>
      <NumberInput
        value={f[key]}
        onChange={(n) => setF({ ...f, [key]: n ?? 0 })}
        className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm font-semibold"
      />
    </label>
  );
  const valid = f.name.trim().length > 1 && f.kcal >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="font-extrabold">{title}</h3>
          <button aria-label="Chiudi" onClick={onClose} className="text-neutral-400 p-1">
            <X size={20} />
          </button>
        </div>
        {f.source === 'off' && (
          <p className="text-[11px] text-neutral-500">
            Fonte: Open Food Facts{f.barcode ? ` · codice ${f.barcode}` : ''}. Controlla i valori con l'etichetta e correggili se serve.
          </p>
        )}
        {missing.length > 0 && <p className="text-xs font-semibold text-red-500">Valori mancanti nella scheda: {missing.join(', ')}. Inseriscili dall'etichetta.</p>}
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Nome</span>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm font-semibold" />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Marca (facoltativa)</span>
          <input value={f.brand || ''} onChange={(e) => setF({ ...f, brand: e.target.value || undefined })} className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm" />
        </label>
        <div className="text-xs font-bold text-neutral-400 pt-1">Valori per 100 g</div>
        <div className="grid grid-cols-2 gap-2">
          {numField('kcal', 'Kcal')}
          {numField('carbs', 'Carboidrati')}
          {numField('pro', 'Proteine')}
          {numField('fats', 'Grassi')}
        </div>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Peso di una porzione / confezione in g (facoltativo, es. vasetto 150)</span>
          <NumberInput
            value={f.pieceWeight}
            onChange={(v) => {
              setF(v && v > 0 ? { ...f, pieceWeight: v, unitName: f.unitName || 'porzione', unitPlural: f.unitPlural || 'porzioni' } : { ...f, pieceWeight: undefined });
            }}
            className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Si cuoce? (per pesarlo anche da cotto)</span>
          <select
            value={f.cookedFactor ?? ''}
            onChange={(e) => {
              const c = COOKING.find((x) => String(x.factor) === e.target.value);
              setF(c ? { ...f, cookedFactor: c.factor, cookNote: c.note } : { ...f, cookedFactor: undefined, cookNote: undefined });
            }}
            className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm"
          >
            <option value="">No, si mangia così</option>
            {COOKING.map((c) => (
              <option key={c.factor} value={c.factor}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button disabled={!valid} onClick={() => onSave({ ...f, name: f.name.trim() })} className="w-full bg-blu hover:brightness-110 disabled:opacity-40 text-white font-bold rounded-2xl py-3">
          Salva e scegli la quantità
        </button>
      </div>
    </div>
  );
}

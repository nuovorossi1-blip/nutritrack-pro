import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import type { Food } from '../types';
import { NumberInput } from './NumberInput';
import { kcalFromMacros, plausibilityWarnings } from '../lib/plausibility';
import { askAi } from '../lib/ai';

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
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const warnings = plausibilityWarnings(f);
  const macroKcal = kcalFromMacros(f);

  // Valori tipici dall'AI per questo prodotto: riempiono i campi, poi si controlla e si salva.
  const askTypical = async () => {
    setAiBusy(true);
    setAiNote('');
    try {
      const r = await askAi(`100 g di ${f.name}${f.brand ? ` ${f.brand}` : ''}`);
      const a = r.alimenti[0];
      if (!a) throw new Error("L'AI non ha riconosciuto il prodotto");
      setF({ ...f, nutritionReference: undefined, kcal: Math.round(a.kcal_100g), pro: a.proteine_100g ?? f.pro, carbs: a.carboidrati_100g ?? f.carbs, fats: a.grassi_100g ?? f.fats });
      setAiNote("Valori tipici stimati dall'AI: se hai la confezione, confrontali con l'etichetta.");
    } catch (e) {
      setAiNote((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };
  const numField = (key: 'kcal' | 'pro' | 'carbs' | 'fats', label: string) => (
    <label className="block">
      <span className={`text-[11px] font-bold ${missing.includes(label.toLowerCase()) ? 'text-red-500' : 'text-neutral-500'}`}>{label}</span>
      <NumberInput
        value={f[key]}
        onChange={(n) => setF({ ...f, nutritionReference: undefined, [key]: n ?? 0 })}
        className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm font-semibold"
      />
    </label>
  );
  const valid = f.name.trim().length > 1 && f.kcal >= 0;

  return (
    <div className="safe-sheet-overlay fixed inset-0 z-50 bg-neutral-950/60 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="safe-bottom-sheet bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3">
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
        {f.usda && (
          <div className="text-xs text-neutral-500 space-y-1">
            <a className="font-bold underline text-blue-600 dark:text-gold-400" href={`https://fdc.nal.usda.gov/food-details/${f.usda.fdcId}/nutrients`} target="_blank" rel="noreferrer">Fonte: USDA FoodData Central · {f.usda.dataType} · {f.usda.fdcId}</a>
            <p>Voce originale: {f.usda.description}</p>
            <p>Nome tradotto automaticamente. Calorie e macro provengono dalla voce USDA, per 100 g nella preparazione indicata. Controlla crudo/cotto e percentuale di grassi prima di salvare.</p>
          </div>
        )}
        {missing.length > 0 && <p className="text-xs font-semibold text-red-500">Valori mancanti nella scheda: {missing.join(', ')}. Inseriscili dall'etichetta.</p>}
        {warnings.length > 0 && (
          <div className="rounded-2xl border border-gold-400/60 bg-gold-400/10 p-3 text-xs text-gold-700 dark:text-gold-300 space-y-2">
            <div className="font-extrabold">⚠ Valori da controllare</div>
            {warnings.map((w) => (
              <div key={w}>• {w}</div>
            ))}
            <div className="font-semibold">Come correggerli:</div>
            <div>1. Hai la confezione? Scrivi qui sotto i valori «per 100 g» della tabella nutrizionale.</div>
            <div className="flex flex-wrap gap-2">
              {Math.abs(f.kcal - macroKcal) > Math.max(40, f.kcal * 0.25) && macroKcal > 0 && (
                <button onClick={() => setF({ ...f, nutritionReference: undefined, kcal: macroKcal })} className="rounded-xl px-3 py-1.5 font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                  Usa {macroKcal} kcal (dai macro)
                </button>
              )}
              <button onClick={askTypical} disabled={aiBusy} className="rounded-xl px-3 py-1.5 font-bold bg-blu text-white flex items-center gap-1 disabled:opacity-60">
                <Sparkles size={13} /> {aiBusy ? 'Chiedo…' : "2. Valori tipici dall'AI"}
              </button>
            </div>
            <div>3. Oppure chiudi e scegli un'altra scheda dello stesso prodotto.</div>
          </div>
        )}
        {aiNote && <p className="text-[11px] font-semibold text-blue-600 dark:text-gold-300">{aiNote}</p>}
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
              setF(v && v > 0 ? { ...f, pieceWeight: v, pieceWeightEstimated: false, unitName: f.unitName || 'porzione', unitPlural: f.unitPlural || 'porzioni' } : { ...f, pieceWeight: undefined, pieceWeightEstimated: false });
            }}
            className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Conversione del peso crudo/cotto (facoltativa)</span>
          <select
            disabled={!!f.usda && !/\braw\b/i.test(f.usda.description)}
            value={f.cookedFactor ?? ''}
            onChange={(e) => {
              const c = COOKING.find((x) => String(x.factor) === e.target.value);
              setF(c ? { ...f, cookedFactor: c.factor, cookNote: c.note } : { ...f, cookedFactor: undefined, cookNote: undefined });
            }}
            className="w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm"
          >
            <option value="">Usa il peso della scheda, senza conversione</option>
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

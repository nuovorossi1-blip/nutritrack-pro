import type { Goals, Macros } from '../types';
import { progressColor } from '../lib/macroStyle';

const format = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });
const fields: { key: keyof Macros; label: string; unit: string; color: string }[] = [
  { key: 'kcal', label: 'Calorie', unit: 'kcal', color: 'bg-gold' },
  { key: 'carbs', label: 'Carboidrati', unit: 'g', color: 'bg-sky-400' },
  { key: 'pro', label: 'Proteine', unit: 'g', color: 'bg-orange-400' },
  { key: 'fats', label: 'Grassi', unit: 'g', color: 'bg-yellow-400' },
];

export function MealSummary({ emoji, total }: { emoji: string; total: Macros }) {
  return (
    <div className="space-y-5">
      <div aria-hidden="true" className="h-36 sm:h-44 rounded-3xl flex items-center justify-center bg-gradient-to-br from-gold-400/20 via-blue-900/30 to-blue-950/70 border border-gold-400/20">
        <span className="text-7xl drop-shadow-lg select-none">{emoji}</span>
      </div>
      <dl aria-label="Riepilogo del pasto" className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-neutral-300 dark:border-neutral-700 bg-neutral-300 dark:bg-neutral-700">
        {fields.map((field) => (
          <div key={field.key} className="text-center bg-white dark:bg-neutral-900 px-3 py-4 flex flex-col-reverse gap-0.5">
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">{field.label}</dt>
            <dd className="text-xl font-extrabold">{format.format(total[field.key])} {field.unit}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function MealProgress({ total, goals }: { total: Macros; goals: Goals }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-extrabold">Valori nutrizionali</h3>
        <p className="text-xs text-neutral-500">Contributo di questo pasto al tuo obiettivo giornaliero</p>
      </div>
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-4">
        {fields.map((field) => {
          const value = total[field.key], goal = goals[field.key];
          const excess = goal > 0 && value > goal;
          return (
            <div key={field.key}>
              <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
                <span>{field.label}</span>
                <span className={`text-xs font-bold ${excess ? 'text-red-500' : ''}`}>{format.format(value)} / {format.format(goal)} {field.unit}</span>
              </div>
              <div role="progressbar" aria-label={`${field.label} del pasto rispetto all'obiettivo giornaliero`}
                aria-valuemin={0} aria-valuemax={Math.max(1, goal)} aria-valuenow={Math.min(Math.max(0, value), Math.max(1, goal))}
                className="h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${progressColor(field.key,value,goal)}`}
                  style={{ width: `${goal > 0 ? Math.min(100, Math.max(0, value / goal * 100)) : 0}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

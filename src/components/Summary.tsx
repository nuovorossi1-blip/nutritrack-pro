import type { Goals, Macros } from '../types';
import { progressColor } from '../lib/macroStyle';

const PLAN_LABEL = { dieta: 'Dieta', mantenimento: 'Mantenimento', massa: 'Massa' };
const fmt = (n: number) => Math.round(n).toLocaleString('it-IT');

function Macro({ label, value, goal, kind }: { label: string; value: number; goal: number; kind: keyof Macros }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const over = value > goal;
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <span className="text-xs text-neutral-500 dark:text-neutral-300">{label}</span>
      <div role="progressbar" aria-label={label} aria-valuenow={Math.min(value,goal)} aria-valuemin={0} aria-valuemax={goal} className="w-full h-1.5 rounded-full bg-[#38393d] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.max(0,pct)}%`, backgroundColor: kind === "carbs" ? "#38b6ff" : kind === "pro" ? "#ef4444" : "#f5b935" }} />
      </div>
      <span className={`text-[11px] sm:text-sm font-extrabold whitespace-nowrap ${over ? 'text-red-500' : ''}`}>
        {fmt(value)} / {fmt(goal)} g
      </span>
      {over && <span className="text-[11px] font-bold text-red-500 -mt-1">+{fmt(value - goal)} g</span>}
    </div>
  );
}

interface Props {
  total: Macros;
  goals: Goals;
  name?: string;
}

// Riepilogo stile "Mangiate · Rimanenti · Eccesso" con arco e barre dei macro.
// Oltre l'obiettivo: rimanenti 0, arco pieno rosso, eccesso in rosso.
export function Summary({ total, goals, name }: Props) {
  const left = Math.max(0, goals.kcal - total.kcal);
  const excess = Math.max(0, total.kcal - goals.kcal);
  const over = excess > 0;
  const pct = goals.kcal > 0 ? Math.min(1, total.kcal / goals.kcal) : 0;
  // Arco di 270 gradi, aperto in basso.
  const R = 52;
  const C = 2 * Math.PI * R;
  const ARC = C * 0.75;

  return (
    <section>
      <div className="flex items-end justify-between px-1 mb-2">
        <h2 className="text-2xl font-extrabold">Riepilogo</h2>
        <span className="text-[10px] sm:text-xs font-bold text-[#f5b935] uppercase tracking-tight text-right">
          {name ? `${name} · ` : ''}
          {goals.plan ? `${PLAN_LABEL[goals.plan]} · ` : ''}
          {fmt(goals.kcal)} kcal
        </span>
      </div>
      <div className={`bg-[#191a1c] text-white rounded-[26px] border shadow-sm p-3 sm:p-5 ${over ? 'border-red-500/70' : 'border-[#343538]'}`}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="text-center">
            <div className="text-2xl font-extrabold">{fmt(total.kcal)}</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-300">Mangiate</div>
          </div>
          <div className="relative w-[116px] h-[116px] sm:w-36 sm:h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full rotate-[135deg]">
              <defs>
                <linearGradient id="arco-oro" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFE29A" />
                  <stop offset="50%" stopColor="#FFC857" />
                  <stop offset="100%" stopColor="#E6A800" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-[#38393d]" strokeDasharray={`${ARC} ${C}`} />
              {total.kcal > 0 && (
                <circle data-calorie-progress cx="60" cy="60" r={R} fill="none" strokeWidth="9" strokeLinecap="round" stroke={over ? '#ef4444' : total.kcal === goals.kcal ? '#34d399' : 'url(#arco-oro)'} strokeDasharray={`${Math.max(ARC * pct, 0.1)} ${C}`} />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold">{fmt(left)}</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-300">Rimanenti</span>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-extrabold ${over ? 'text-red-500' : 'text-neutral-400'}`}>{over ? `+${fmt(excess)}` : '0'}</div>
            <div className={`text-sm ${over ? 'text-red-500 font-bold' : 'text-neutral-500 dark:text-neutral-300'}`}>Eccesso</div>
          </div>
        </div>
        {over && (
          <p className="mt-2 text-center text-xs font-semibold text-red-500">
            Hai superato l'obiettivo di {fmt(excess)} kcal ({Math.round((excess / goals.kcal) * 100)}%).
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Macro label="Carboidrati" value={total.carbs} goal={goals.carbs} kind="carbs" />
          <Macro label="Proteine" value={total.pro} goal={goals.pro} kind="pro" />
          <Macro label="Grassi" value={total.fats} goal={goals.fats} kind="fats" />
        </div>
      </div>
    </section>
  );
}

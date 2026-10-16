import type { Goals, Macros } from '../types';

function Bar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const left = Math.round((goal - value) * 10) / 10;
  return (
    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="mt-1 text-lg font-extrabold">
        {value}
        <span className="text-xs font-semibold text-neutral-400"> / {goal}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 mt-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`text-[11px] mt-1 font-semibold ${left < 0 ? 'text-red-500' : 'text-neutral-400'}`}>{left < 0 ? `+${-left}g oltre` : `${left}g rimasti`}</div>
    </div>
  );
}

const PLAN_LABEL = { dieta: 'Dieta', mantenimento: 'Mantenimento', massa: 'Massa' };

export function Summary({ total, goals, name }: { total: Macros; goals: Goals; name?: string }) {
  const pct = goals.kcal > 0 ? Math.min(100, (total.kcal / goals.kcal) * 100) : 0;
  const left = goals.kcal - total.kcal;
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-neutral-200 dark:stroke-neutral-700" />
            <defs>
              <linearGradient id="anello-oro" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE29A" />
                <stop offset="50%" stopColor="#FFC857" />
                <stop offset="100%" stopColor="#E6A800" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" strokeLinecap="round" stroke={left < 0 ? '#ef4444' : 'url(#anello-oro)'} strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold">{total.kcal}</span>
            <span className="text-[11px] text-neutral-400 font-semibold">/ {goals.kcal} kcal</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-neutral-400">{name ? `Ciao ${name} · ` : ''}{goals.plan ? PLAN_LABEL[goals.plan] : 'Calorie del giorno'}</div>
          <div className={`text-xl font-extrabold mt-1 ${left < 0 ? 'text-red-500' : 'text-blue-600 dark:text-gold-400'}`}>{left < 0 ? `${-left} kcal oltre` : `${left} kcal rimaste`}</div>
          <p className="text-xs text-neutral-400 mt-1">Ogni giorno riparte da 0 a mezzanotte.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Bar label="Carboidrati" value={total.carbs} goal={goals.carbs} color="bg-gold" />
        <Bar label="Proteine" value={total.pro} goal={goals.pro} color="bg-blu" />
        <Bar label="Grassi" value={total.fats} goal={goals.fats} color="bg-neutral-400 dark:bg-white" />
      </div>
    </section>
  );
}

import { useState } from 'react';
import type { Goals, MacroKey, Plan, Profile } from '../types';
import { ACTIVITIES, KCAL_PER_G, PLANS, ageFromBirthDate, bmr, macroGap, planKcal, profileComplete, suggestedGoals, tdee, withAutoMacro } from '../lib/metabolism';
import { todayISO } from '../lib/dates';
import { NumberInput } from './NumberInput';

interface Props {
  profile?: Profile;
  goals: Goals;
  onSave: (profile: Profile, goals: Goals) => void;
  onboarding?: boolean;
  saving?: boolean;
}

const EMPTY: Profile = { name: '', sex: 'M', age: 0, weight: 0, height: 0, activity: 'sedentario' };
const input = 'w-full mt-0.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm font-semibold';
const MACROS: { key: MacroKey; label: string; color: string }[] = [
  { key: 'pro', label: 'Proteine', color: 'bg-blu' },
  { key: 'carbs', label: 'Carboidrati', color: 'bg-gold' },
  { key: 'fats', label: 'Grassi', color: 'bg-neutral-400 dark:bg-white' },
];

export function ProfileGoals({ profile, goals, onSave, onboarding = false, saving = false }: Props) {
  const [p, setP] = useState<Profile>(profile || EMPTY);
  const [draftGoals, setG] = useState<Goals>(withAutoMacro({ ...goals, auto: goals.auto ?? 'fats' }));
  const [automatic, setAutomatic] = useState(onboarding);
  const [sexChosen, setSexChosen] = useState(!!profile);
  const [activityChosen, setActivityChosen] = useState(!!profile);
  const maintenance = tdee(p);
  const g = automatic && maintenance && draftGoals.plan
    ? suggestedGoals(planKcal(maintenance, draftGoals.plan), draftGoals.plan, p.weight)
    : draftGoals;
  const gap = macroGap(g);
  const auto = g.auto ?? 'fats';
  const validProfile = profileComplete(p) && !!p.name.trim() && sexChosen && activityChosen && !!maintenance
    && (!onboarding || ageFromBirthDate(p.birthDate || '') !== null);

  const choosePlan = (plan: Plan) => {
    setAutomatic(true);
    setG({ ...g, plan });
  };
  const changeGoals = (next: Goals) => { setAutomatic(false); setG(withAutoMacro(next)); };
  const setMacro = (k: MacroKey, n: number) => changeGoals({ ...g, [k]: n });
  const num = (key: 'weight' | 'height', label: string) => (
    <label className="block">
      <span className="text-[11px] font-bold text-neutral-500">{label}</span>
      <NumberInput value={p[key] || undefined} onChange={(n) => setP({ ...p, [key]: n ?? 0 })} className={input} />
    </label>
  );
  const chip = (active: boolean) => `flex-1 py-2 rounded-xl text-xs font-bold transition ${active ? 'bg-blu text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`;

  return (
    <fieldset disabled={saving} className="space-y-4 min-w-0">
      <section className="space-y-2">
        <h4 className="text-sm font-extrabold">Il tuo profilo</h4>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Nome</span>
          <input autoComplete="given-name" maxLength={80} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className={input} />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Data di nascita</span>
          <input type="date" autoComplete="bday" max={todayISO()} value={p.birthDate || ''}
            onChange={(e) => setP({ ...p, birthDate: e.target.value, age: ageFromBirthDate(e.target.value) ?? 0 })}
            className={`${input} min-w-0`} />
        </label>
        {!p.birthDate && profile?.age ? <p className="text-[11px] text-neutral-500">Età salvata: {profile.age} anni. Puoi aggiungere la data di nascita per aggiornarla automaticamente.</p> : null}
        {p.birthDate && ageFromBirthDate(p.birthDate) === null && <p role="alert" className="text-xs text-red-500">Inserisci una data di nascita valida.</p>}
        <div role="group" aria-label="Sesso" className="flex gap-1.5">
          <button aria-pressed={sexChosen && p.sex === 'M'} className={chip(sexChosen && p.sex === 'M')} onClick={() => { setP({ ...p, sex: 'M' }); setSexChosen(true); }}>
            Uomo
          </button>
          <button aria-pressed={sexChosen && p.sex === 'F'} className={chip(sexChosen && p.sex === 'F')} onClick={() => { setP({ ...p, sex: 'F' }); setSexChosen(true); }}>
            Donna
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {num('weight', 'Peso (kg)')}
          {num('height', 'Altezza (cm)')}
        </div>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Attività</span>
          <select value={activityChosen ? p.activity : ''} onChange={(e) => { setP({ ...p, activity: e.target.value as Profile['activity'] }); setActivityChosen(true); }} className={input}>
            <option value="" disabled>Scegli il livello di attività</option>
            {ACTIVITIES.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        {p.activity === 'altro' && (
          <label className="block">
            <span className="text-[11px] font-bold text-neutral-500">Il tuo mantenimento (kcal al giorno)</span>
            <NumberInput decimals={false} value={p.customTdee} onChange={(n) => setP({ ...p, customTdee: n })} className={input} />
          </label>
        )}
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-3 text-xs">
          {maintenance && sexChosen && activityChosen ? (
            <>
              {profileComplete(p) && (
                <div>
                  Metabolismo basale: <b>{bmr(p)} kcal</b>
                </div>
              )}
              <div>
                Mantenimento stimato (TDEE): <b className="text-blue-600 dark:text-gold-400">{maintenance} kcal</b>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Stima (formula Mifflin-St Jeor × attività): controlla il peso per qualche settimana e correggi.</div>
            </>
          ) : (
            <span className="text-neutral-500">Completa data di nascita, sesso, peso, altezza e attività per stimare il tuo fabbisogno.</span>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-extrabold">Obiettivo</h4>
        <div className="flex gap-1.5">
          {PLANS.map((pl) => (
            <button key={pl.key} aria-pressed={g.plan === pl.key} className={chip(g.plan === pl.key)} onClick={() => choosePlan(pl.key)}>
              {pl.label}
              {maintenance ? <span className="block text-[10px] font-semibold opacity-80">{planKcal(maintenance, pl.key)} kcal</span> : null}
            </button>
          ))}
        </div>
        {onboarding ? (
          <div className="rounded-2xl border border-gold-500/40 bg-gold-500/10 p-4">
            <p className="text-xs font-bold text-neutral-500">Il tuo obiettivo giornaliero</p>
            <p className="text-3xl font-extrabold text-gold-500">{validProfile && g.plan ? `${g.kcal} kcal` : 'Da calcolare'}</p>
            <p className="text-xs text-neutral-500 mt-2">Potrai modificare calorie, macro e dati personali da Profilo e obiettivi.</p>
          </div>
        ) : <>
        <label className="block">
          <span className="text-[11px] font-bold text-neutral-500">Calorie al giorno (puoi cambiarle: i macro si adeguano)</span>
          <NumberInput decimals={false} value={g.kcal || undefined} onChange={(n) => changeGoals({ ...g, kcal: n ?? 0 })} className={input} />
        </label>
        <p className="text-[11px] text-neutral-500">Scrivi due macro e scegli quale calcolare dalle calorie («auto»).</p>
        <div className="grid grid-cols-3 gap-2">
          {MACROS.map((m) => {
            const isAuto = auto === m.key;
            const pct = g.kcal > 0 ? Math.round(((g[m.key] * KCAL_PER_G[m.key]) / g.kcal) * 100) : 0;
            return (
              <div key={m.key} className={`rounded-2xl p-2 border ${isAuto ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-950/30' : 'border-neutral-200 dark:border-neutral-700'}`}>
                <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                  <span className={`w-2 h-2 rounded-full ${m.color}`} /> {m.label}
                </div>
                {isAuto ? (
                  <div className="text-lg font-extrabold py-1.5">{g[m.key]} g</div>
                ) : (
                  <NumberInput decimals={false} value={g[m.key]} onChange={(n) => setMacro(m.key, n ?? 0)} className={input} />
                )}
                <div className="text-[10px] text-neutral-400">
                  {pct}% · {Math.round(g[m.key] * KCAL_PER_G[m.key])} kcal
                </div>
                <button onClick={() => changeGoals({ ...g, auto: m.key })} className={`mt-1 w-full text-[10px] font-bold rounded-lg py-1 ${isAuto ? 'bg-blu text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                  {isAuto ? 'auto' : 'calcola questo'}
                </button>
              </div>
            );
          })}
        </div>
        {gap < -5 && <p className="text-xs font-semibold text-red-500">Gli altri due macro da soli superano le calorie di {-gap} kcal: abbassali o alza le calorie.</p>}
        {p.weight > 0 && <p className="text-[11px] text-neutral-500">Proteine: {(g.pro / p.weight).toFixed(1)} g per kg di peso.</p>}
        </>}
      </section>

      <button
        disabled={saving || !validProfile || !g.plan || g.kcal <= 0 || gap < -5}
        onClick={() => onSave({ ...p, name: p.name.trim() }, g)}
        className="w-full bg-blu hover:brightness-110 disabled:opacity-40 text-white font-bold rounded-2xl py-3"
      >
        {saving ? 'Salvataggio…' : onboarding ? 'Salva e inizia' : 'Salva profilo e obiettivi'}
      </button>
    </fieldset>
  );
}

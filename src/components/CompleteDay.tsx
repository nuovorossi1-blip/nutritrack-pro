import { useMemo, useState } from 'react';
import { Check, Star, Target, X } from 'lucide-react';
import type { AppData, DayLog, Goals, MealKey, Macros } from '../types';
import { MEALS } from '../types';
import { CLEAN_FOODS, type PlanGroup } from '../data/cleanFoods';
import { groupOf, planGrams, remaining, type PlanItem } from '../lib/completeDay';
import { cookedFromRaw, macrosFor } from '../lib/nutrition';
import { allFoods } from '../lib/store';
import type { ParsedEntry } from '../lib/parser';
import { NumberInput } from './NumberInput';

const GROUPS: { key: PlanGroup; label: string }[] = [
  { key: 'pro', label: 'Proteine' }, { key: 'carbs', label: 'Carboidrati' }, { key: 'fats', label: 'Grassi' }, { key: 'veg', label: 'Verdure' },
];
const MAX_BY_GROUP: Record<PlanGroup, number> = { pro: 400, carbs: 250, fats: 50, veg: 400 };

/** I tuoi alimenti piu' usati (a grammi, con valori completi), messi nel gruppo del loro macro principale. */
function savedChoices(data: AppData, limit = 8): (PlanItem & { mine: true })[] {
  const count = new Map<string, number>();
  for (const log of Object.values(data.days)) for (const items of Object.values(log)) for (const it of items) count.set(it.foodId, (count.get(it.foodId) || 0) + 1);
  const clean = new Set(CLEAN_FOODS.map((c) => c.food.id));
  return data.foods.filter((f) => !clean.has(f.id) && f.kcal > 0 && (count.get(f.id) || 0) > 0)
    .sort((a, b) => (count.get(b.id) || 0) - (count.get(a.id) || 0)).slice(0, limit)
    .map((food) => { const group = groupOf(food); return { food, group, max: MAX_BY_GROUP[group], mine: true }; });
}

const left = (need: number, got: number) => Math.round(got - need);

export function CompleteDay({ data, day, goals, eaten, onAdd }: {
  data: AppData; day: DayLog; goals: Goals; eaten: Macros; onAdd: (entries: ParsedEntry[], meal: MealKey) => void;
}) {
  const need = remaining(goals, eaten);
  const mine = useMemo(() => savedChoices(data), [data]);
  const choices = useMemo(() => [...mine, ...CLEAN_FOODS.map((c) => ({ ...c, mine: false }))], [mine]);
  const [group, setGroup] = useState<PlanGroup>(() => (need.pro >= 10 ? 'pro' : need.carbs >= 10 ? 'carbs' : 'fats'));
  const [picked, setPicked] = useState<string[]>([]);
  const [fixed, setFixed] = useState<Record<string, number>>({});
  const [meal, setMeal] = useState<MealKey>(() => (['cena', 'spuntini', 'pranzo', 'colazione'] as MealKey[]).find((k) => !day[k].length) || 'cena');
  const items: PlanItem[] = picked.map((id) => choices.find((c) => c.food.id === id)!).filter(Boolean)
    .map((c) => ({ food: c.food, group: c.group, max: c.max, fixed: fixed[c.food.id] }));
  const plan = planGrams(need, items);
  const foods = allFoods(data);
  const done = need.pro < 5 && need.carbs < 5 && need.fats < 3 && need.kcal < 50;
  const toggle = (id: string) => { setPicked((list) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id]); setFixed(({ [id]: _, ...rest }) => rest); };
  const kcalDiff = plan.total.kcal - need.kcal;
  const ready = items.length > 0 && plan.grams.some((g) => g > 0);
  const add = () => {
    const entries: ParsedEntry[] = items.map((it, i) => ({ food: it.food, portion: { mode: 'grams' as const, qty: plan.grams[i], cooked: false }, qtyGiven: true })).filter((e) => e.portion.qty > 0);
    onAdd(entries, meal);
    setPicked([]); setFixed({});
  };

  return (
    <section aria-label="Completa la giornata" className="rounded-[22px] p-4 bg-[#191a1c] text-white border border-[#343538] space-y-3">
      <div>
        <div className="flex items-center gap-2"><Target size={18} className="text-[#f5b935]" /><h3 className="font-bold">Completa la giornata</h3></div>
        <p className="text-[11px] text-neutral-400 mt-0.5">Solo un suggerimento: puoi mangiare anche altro.</p>
      </div>
      {done ? <p className="text-sm text-green-400 font-semibold">Obiettivo raggiunto: non manca niente per oggi.</p> : <>
        <div className="rounded-2xl bg-[#26272b] p-3 text-sm">
          <span className="text-neutral-400">Mancano </span><b className="text-[#f5b935]">{need.kcal} kcal</b>
          <span className="text-neutral-400"> · </span><b className="text-red-500">P</b> {need.pro} g
          <span className="text-neutral-400"> · </span><b className="text-sky-400">C</b> {need.carbs} g
          <span className="text-neutral-400"> · </span><b className="text-yellow-400">G</b> {need.fats} g
        </div>
        <div className="flex gap-1 rounded-2xl bg-[#26272b] p-1" role="tablist">
          {GROUPS.map((g) => <button key={g.key} role="tab" aria-selected={group === g.key} onClick={() => setGroup(g.key)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${group === g.key ? 'bg-[#3a3b40] text-white' : 'text-neutral-400'}`}>{g.label}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {choices.filter((c) => c.group === group).map((c) => {
            const on = picked.includes(c.food.id);
            return <button key={c.food.id} onClick={() => toggle(c.food.id)} aria-pressed={on}
              className={`rounded-full px-3 py-2 text-xs font-semibold border flex items-center gap-1 ${on ? 'bg-blu border-blue-400 text-white' : 'bg-[#26272b] border-[#343538] text-neutral-200'}`}>
              {c.mine && <Star size={12} className="text-[#f5b935]" />}{on && <Check size={12} />}{c.food.name}{c.food.brand ? ` · ${c.food.brand}` : ''}
            </button>;
          })}
        </div>
        {items.length > 0 && <div className="space-y-2">
          <p className="text-xs font-bold text-neutral-400">Grammi suggeriti (crudo/secco se non indicato)</p>
          {items.map((it, i) => {
            const m = macrosFor(it.food, plan.grams[i]);
            const cooked = it.group !== 'veg' ? cookedFromRaw(it.food, plan.grams[i], foods) : null;
            return <div key={it.food.id} className="flex items-center gap-2 rounded-2xl bg-[#26272b] p-2.5">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{it.food.name}</div>
                <div className="text-[11px] text-neutral-400">{m.kcal} kcal · P {m.pro} · C {m.carbs} · G {m.fats}{cooked ? ` · ≈ ${cooked} g da cotto` : ''}{it.fixed !== undefined ? ' · bloccato' : ''}</div>
              </div>
              <div className="relative w-24 shrink-0">
                <NumberInput value={plan.grams[i]} decimals={false} ariaLabel={`Grammi di ${it.food.name}`}
                  onChange={(n) => setFixed((f) => ({ ...f, [it.food.id]: n ?? 0 }))}
                  className="w-full rounded-xl bg-[#191a1c] border border-[#343538] py-2 pl-2 pr-6 text-right font-extrabold" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">g</span>
              </div>
              <button aria-label={`Togli ${it.food.name}`} onClick={() => toggle(it.food.id)} className="p-1.5 text-neutral-400"><X size={16} /></button>
            </div>;
          })}
          {Object.keys(fixed).length > 0 && <button onClick={() => setFixed({})} className="text-xs font-bold text-blue-400">Ricalcola tutti i grammi</button>}
          <div className="rounded-2xl bg-[#26272b] p-3 text-xs space-y-1">
            <div>Con questi: <b className="text-red-500">P</b> {plan.total.pro}/{need.pro} · <b className="text-sky-400">C</b> {plan.total.carbs}/{need.carbs} · <b className="text-yellow-400">G</b> {plan.total.fats}/{need.fats}</div>
            <div className={Math.abs(kcalDiff) <= 100 ? 'text-green-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {plan.total.kcal} kcal su {need.kcal} ({kcalDiff >= 0 ? '+' : ''}{kcalDiff}){Math.abs(kcalDiff) <= 100 ? ' · ok' : ''}
            </div>
            {plan.uncovered.map((m) => <div key={m} className="text-amber-400">
              Mancano ancora {Math.abs(left(need[m], plan.total[m]))} g di {m === 'pro' ? 'proteine' : m === 'carbs' ? 'carboidrati' : 'grassi'}: scegli un alimento di quel gruppo.
            </div>)}
          </div>
          <div className="flex gap-2">
            <select aria-label="Pasto" value={meal} onChange={(e) => setMeal(e.target.value as MealKey)} className="rounded-2xl bg-[#26272b] px-3 text-sm font-bold">
              {MEALS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
            <button disabled={!ready} onClick={add} className="add-button flex-1 rounded-2xl bg-blu text-white font-extrabold disabled:opacity-40">
              Aggiungi a {MEALS.find((m) => m.key === meal)!.label.toLowerCase()} · {plan.total.kcal} kcal
            </button>
          </div>
        </div>}
      </>}
    </section>
  );
}

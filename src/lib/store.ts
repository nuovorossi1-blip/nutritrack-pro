import { useCallback, useEffect, useState } from 'react';
import type { AppData, DayLog, Food, MealItem, MealKey } from '../types';
import { BASE_FOODS } from '../data/baseFoods';
import { msToMidnight, todayISO } from './dates';

// Per ora i dati restano nel browser (fase 1). Con il login (fase 3)
// lo stesso AppData verra' salvato su Supabase per ogni utente.
const KEY = 'nutritrack:data:v1';

export const DEFAULT_GOALS = { kcal: 2000, carbs: 200, pro: 150, fats: 60 };

export function emptyDay(): DayLog {
  return { colazione: [], pranzo: [], cena: [], spuntini: [] };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as AppData;
      if (d && d.version === 1) return { ...d, goals: d.goals || DEFAULT_GOALS, days: d.days || {}, foods: d.foods || [], dark: d.themeV2 ? d.dark : true, themeV2: true };
    }
  } catch {
    /* dati illeggibili: si riparte puliti */
  }
  return { version: 1, goals: DEFAULT_GOALS, days: {}, foods: [], dark: true, themeV2: true };
}

export function saveData(d: AppData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* spazio pieno */
  }
}

export function getDay(d: AppData, day: string): DayLog {
  return { ...emptyDay(), ...(d.days[day] || {}) };
}

export function withDay(d: AppData, day: string, log: DayLog): AppData {
  const days = { ...d.days };
  const empty = Object.values(log).every((l) => l.length === 0);
  if (empty) delete days[day];
  else days[day] = log;
  return { ...d, days };
}

export function allFoods(d: AppData): Food[] {
  return [...d.foods, ...BASE_FOODS];
}

export interface Frequent {
  food: Food;
  count: number;
  last: MealItem;
}

/** Alimenti piu' usati in quel pasto, calcolati dallo storico vero. */
export function frequentFor(d: AppData, meal: MealKey, limit = 8): Frequent[] {
  const foods = allFoods(d);
  const map = new Map<string, Frequent>();
  for (const day of Object.keys(d.days).sort()) {
    for (const it of d.days[day][meal] || []) {
      const food = foods.find((f) => f.id === it.foodId);
      if (!food) continue;
      const prev = map.get(food.id);
      map.set(food.id, { food, count: (prev?.count || 0) + 1, last: it });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);
  useEffect(() => saveData(data), [data]);
  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);
  return [data, update, setData] as const;
}

/** Giorno di oggi che cambia da solo a mezzanotte. */
export function useToday(): string {
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setToday(todayISO());
      t = setTimeout(tick, msToMidnight() + 500);
    };
    t = setTimeout(tick, msToMidnight() + 500);
    const onVisible = () => document.visibilityState === 'visible' && setToday(todayISO());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return today;
}

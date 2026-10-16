import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppData, DayLog, Food } from '../types';
import { DEFAULT_GOALS } from './store';

// Supabase (fase 3): login con conferma via email e dati per utente (RLS: ognuno vede solo i suoi).
// Senza le variabili VITE_SUPABASE_* l'app resta "solo su questo dispositivo" come in fase 1.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;

/** Versione dei testi di privacy e condizioni accettati alla registrazione. */
export const TERMS_VERSION = '2026-10-16';

const EMPTY_DAY: DayLog = { colazione: [], pranzo: [], cena: [], spuntini: [] };

export async function loadCloud(userId: string): Promise<AppData | null> {
  if (!supabase) return null;
  const [p, d, f] = await Promise.all([
    supabase.from('profiles').select('data').eq('user_id', userId).maybeSingle(),
    supabase.from('day_logs').select('day, meals').eq('user_id', userId),
    supabase.from('foods').select('food').eq('user_id', userId),
  ]);
  const err = p.error || d.error || f.error;
  if (err) throw new Error(`Dati non caricati dal cloud: ${err.message}`);
  const prof = (p.data?.data || {}) as Partial<AppData>;
  const days: Record<string, DayLog> = {};
  for (const row of d.data || []) days[row.day as string] = { ...EMPTY_DAY, ...(row.meals as DayLog) };
  const empty = !prof.goals && !(d.data || []).length && !(f.data || []).length;
  if (empty) return null;
  return {
    version: 1,
    goals: prof.goals || DEFAULT_GOALS,
    profile: prof.profile,
    dark: prof.dark ?? true,
    themeV2: true,
    days,
    foods: (f.data || []).map((r) => r.food as Food),
  };
}

function profilePart(d: AppData) {
  return { goals: d.goals, profile: d.profile, dark: d.dark };
}

/** Salva solo cio' che e' cambiato tra prev e next (giorni, alimenti, profilo). */
export async function saveDiff(userId: string, prev: AppData | null, next: AppData): Promise<void> {
  if (!supabase) return;
  const jobs: PromiseLike<{ error: { message: string } | null }>[] = [];
  const now = new Date().toISOString();

  if (!prev || JSON.stringify(profilePart(prev)) !== JSON.stringify(profilePart(next))) {
    jobs.push(supabase.from('profiles').update({ data: profilePart(next), updated_at: now }).eq('user_id', userId));
  }

  const dayKeys = new Set([...Object.keys(prev?.days || {}), ...Object.keys(next.days)]);
  const upDays: { user_id: string; day: string; meals: DayLog; updated_at: string }[] = [];
  const delDays: string[] = [];
  for (const k of dayKeys) {
    const a = prev?.days[k];
    const b = next.days[k];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    if (b) upDays.push({ user_id: userId, day: k, meals: b, updated_at: now });
    else delDays.push(k);
  }
  if (upDays.length) jobs.push(supabase.from('day_logs').upsert(upDays));
  if (delDays.length) jobs.push(supabase.from('day_logs').delete().eq('user_id', userId).in('day', delDays));

  const prevFoods = new Map((prev?.foods || []).map((f) => [f.id, JSON.stringify(f)]));
  const nextIds = new Set(next.foods.map((f) => f.id));
  const upFoods = next.foods.filter((f) => prevFoods.get(f.id) !== JSON.stringify(f)).map((f) => ({ user_id: userId, id: f.id, food: f, updated_at: now }));
  const delFoods = [...prevFoods.keys()].filter((id) => !nextIds.has(id));
  if (upFoods.length) jobs.push(supabase.from('foods').upsert(upFoods));
  if (delFoods.length) jobs.push(supabase.from('foods').delete().eq('user_id', userId).in('id', delFoods));

  const res = await Promise.all(jobs);
  const err = res.find((r) => r.error)?.error;
  if (err) throw new Error(err.message);
}

/** Cancella tutti i dati dell'utente (profilo azzerato, giorni e alimenti). */
export async function deleteMyData(userId: string): Promise<void> {
  if (!supabase) return;
  const res = await Promise.all([
    supabase.from('day_logs').delete().eq('user_id', userId),
    supabase.from('foods').delete().eq('user_id', userId),
    supabase.from('profiles').update({ data: {} }).eq('user_id', userId),
  ]);
  const err = res.find((r) => r.error)?.error;
  if (err) throw new Error(err.message);
}

export async function accessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

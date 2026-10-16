import type { ActivityKey, Goals, MacroKey, Plan, Profile } from '../types';

// Stime, non prescrizioni: metabolismo basale con la formula di Mifflin-St Jeor,
// mantenimento = basale x fattore di attivita' (scala classica 1,2 - 1,9).

export const ACTIVITIES: { key: ActivityKey; label: string; factor: number }[] = [
  { key: 'sedentario', label: 'Sedentario (lavoro d\'ufficio, niente sport)', factor: 1.2 },
  { key: 'leggero', label: '1-3 allenamenti a settimana', factor: 1.375 },
  { key: 'moderato', label: '3-5 allenamenti a settimana', factor: 1.55 },
  { key: 'intenso', label: '6-7 allenamenti o lavoro fisico', factor: 1.725 },
  { key: 'atleta', label: 'Atleta (2 allenamenti al giorno)', factor: 1.9 },
  { key: 'altro', label: 'Altro: scrivo io il mantenimento', factor: 0 },
];

export const PLANS: { key: Plan; label: string; factor: number }[] = [
  { key: 'dieta', label: 'Perdere peso', factor: 0.8 },
  { key: 'mantenimento', label: 'Mantenere', factor: 1 },
  { key: 'massa', label: 'Mettere massa', factor: 1.1 },
];

/** Grammi di proteine per kg di peso, per obiettivo. */
const PROTEIN_PER_KG: Record<Plan, number> = { dieta: 2.2, mantenimento: 1.8, massa: 2 };
/** Quota di kcal dai grassi. */
const FAT_SHARE = 0.25;

export const KCAL_PER_G: Record<MacroKey, number> = { pro: 4, carbs: 4, fats: 9 };

const round10 = (n: number) => Math.round(n / 10) * 10;

export function ageFromBirthDate(value: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;
  let age = today.getFullYear() - y;
  if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) age--;
  return age > 0 && age <= 120 ? age : null;
}

export function profileAge(p: Profile): number {
  return p.birthDate ? ageFromBirthDate(p.birthDate) ?? 0 : p.age;
}

export function profileComplete(p?: Profile): p is Profile {
  return !!p && Number.isFinite(profileAge(p)) && profileAge(p) > 0 && profileAge(p) <= 120
    && Number.isFinite(p.weight) && p.weight > 0 && Number.isFinite(p.height) && p.height > 0
    && (p.sex === 'M' || p.sex === 'F') && ACTIVITIES.some((a) => a.key === p.activity);
}

export function needsProfileSetup(p: Profile | undefined, goals: Goals): boolean {
  return !profileComplete(p) || !p.name?.trim() || !PLANS.some((pl) => pl.key === goals.plan) || !tdee(p);
}

export function bmr(p: Profile): number {
  const base = 10 * p.weight + 6.25 * p.height - 5 * profileAge(p);
  return Math.round(base + (p.sex === 'M' ? 5 : -161));
}

/** Calorie di mantenimento (null se manca qualcosa). */
export function tdee(p?: Profile): number | null {
  if (!p) return null;
  if (p.activity === 'altro') return p.customTdee && Number.isFinite(p.customTdee) && p.customTdee > 0 ? round10(p.customTdee) : null;
  if (!profileComplete(p)) return null;
  const f = ACTIVITIES.find((a) => a.key === p.activity)?.factor ?? 1.2;
  return round10(bmr(p) * f);
}

export function planKcal(maintenance: number, plan: Plan): number {
  return round10(maintenance * (PLANS.find((x) => x.key === plan)?.factor ?? 1));
}

/** Calcola il macro 'auto' con quello che resta delle kcal (mai sotto zero). */
export function withAutoMacro(g: Goals): Goals {
  const auto = g.auto ?? 'fats';
  const used = (Object.keys(KCAL_PER_G) as MacroKey[]).filter((k) => k !== auto).reduce((t, k) => t + g[k] * KCAL_PER_G[k], 0);
  return { ...g, auto, [auto]: Math.max(0, Math.round((g.kcal - used) / KCAL_PER_G[auto])) };
}

/** Kcal che i macro scelti non riescono a coprire (o che superano), per avvisare. */
export function macroGap(g: Goals): number {
  return Math.round(g.kcal - (g.pro * 4 + g.carbs * 4 + g.fats * 9));
}

/** Macro suggeriti: proteine per kg, grassi 25% delle kcal, carboidrati il resto. */
export function suggestedGoals(kcal: number, plan: Plan, weight?: number): Goals {
  const pro = weight && weight > 0 ? Math.round(weight * PROTEIN_PER_KG[plan]) : Math.round((kcal * 0.25) / 4);
  const fats = Math.round((kcal * FAT_SHARE) / 9);
  return withAutoMacro({ kcal, pro, fats, carbs: 0, plan, auto: 'carbs' });
}

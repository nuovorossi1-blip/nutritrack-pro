// Giorni sempre in ora locale (il giorno va da mezzanotte a mezzanotte del telefono/PC).

const DAY_SHORT = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
const DAY_FULL = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const MONTH_FULL = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(now: Date = new Date()): string {
  return toISO(now);
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Millisecondi che mancano alla prossima mezzanotte locale. */
export function msToMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function shortLabel(iso: string, today: string): string {
  if (iso === today) return 'OGGI';
  if (iso === addDays(today, -1)) return 'IERI';
  return DAY_SHORT[parseISO(iso).getDay()];
}

export function longLabel(iso: string): string {
  const d = parseISO(iso);
  return `${DAY_FULL[d.getDay()]} ${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/** 5 giorni attorno a quello scelto, mai oltre oggi. */
export function dayStrip(selected: string, today: string): string[] {
  let end = addDays(selected, 2);
  if (end > today) end = today;
  return [-4, -3, -2, -1, 0].map((n) => addDays(end, n));
}

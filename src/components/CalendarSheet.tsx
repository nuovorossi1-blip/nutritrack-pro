import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { parseISO, toISO } from '../lib/dates';

interface Props {
  selected: string;
  today: string;
  daysWithData: Set<string>;
  onSelect: (day: string) => void;
  onClose: () => void;
}

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const WEEK = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

/** Giorni del mese in una griglia che parte dal lunedi' (null = casella vuota). */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= count; d++) cells.push(toISO(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

// Calendario a foglio dal basso, stile iPhone: cerchi per i giorni, oggi con anello,
// giorno scelto pieno oro, pallino sui giorni con pasti, giorni futuri spenti.
export function CalendarSheet({ selected, today, daysWithData, onSelect, onClose }: Props) {
  const start = parseISO(selected);
  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const cells = monthGrid(ym.y, ym.m);
  const t = parseISO(today);
  const atCurrentMonth = ym.y === t.getFullYear() && ym.m === t.getMonth();
  const move = (n: number) => setYm(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));
  const pick = (d: string) => {
    onSelect(d);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ios-sheet w-full sm:max-w-sm bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-t-[2rem] sm:rounded-[2rem] px-5 pt-3 pb-6 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <div className="flex items-center justify-between mb-3">
          <button aria-label="Mese precedente" onClick={() => move(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-gold-400 bg-neutral-100 dark:bg-neutral-800">
            <ChevronLeft size={20} />
          </button>
          <div className="text-lg font-extrabold">
            {MONTHS[ym.m]} {ym.y}
          </div>
          <button
            aria-label="Mese successivo"
            disabled={atCurrentMonth}
            onClick={() => move(1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-gold-400 bg-neutral-100 dark:bg-neutral-800 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-neutral-400 mb-1">
          {WEEK.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 justify-items-center">
          {cells.map((d, i) => {
            if (!d) return <span key={i} className="w-11 h-11" />;
            const future = d > today;
            const isSel = d === selected;
            const isToday = d === today;
            return (
              <button
                key={d}
                disabled={future}
                onClick={() => pick(d)}
                aria-label={d}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-semibold transition active:scale-90 disabled:opacity-25 ${
                  isSel ? 'bg-gold text-neutral-950 shadow-md shadow-gold-500/40' : isToday ? 'ring-2 ring-gold-400 text-gold-500 dark:text-gold-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {parseISO(d).getDate()}
                {daysWithData.has(d) && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSel ? 'bg-neutral-950' : 'bg-gold-400'}`} />}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => pick(today)} className="flex-1 rounded-full py-3 text-sm font-bold bg-blu text-white active:scale-[0.97] transition">
            Oggi
          </button>
          <button onClick={onClose} className="flex-1 rounded-full py-3 text-sm font-bold bg-neutral-100 dark:bg-neutral-800 active:scale-[0.97] transition">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

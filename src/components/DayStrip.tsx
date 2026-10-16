import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, dayStrip, longLabel, parseISO, shortLabel } from '../lib/dates';

interface Props {
  selected: string;
  today: string;
  daysWithData: Set<string>;
  onSelect: (day: string) => void;
}

export function DayStrip({ selected, today, daysWithData, onSelect }: Props) {
  const days = dayStrip(selected, today);
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm p-3">
      <div className="flex items-center gap-1">
        <button aria-label="Giorno precedente" onClick={() => onSelect(addDays(selected, -1))} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 grid grid-cols-5 gap-1.5">
          {days.map((d) => {
            const active = d === selected;
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                className={`rounded-2xl py-2 flex flex-col items-center transition ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-indigo-100' : 'text-slate-400'}`}>{shortLabel(d, today)}</span>
                <span className="text-lg font-extrabold leading-tight">{parseISO(d).getDate()}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${daysWithData.has(d) ? (active ? 'bg-white' : 'bg-emerald-500') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <button
          aria-label="Giorno successivo"
          disabled={selected >= today}
          onClick={() => onSelect(addDays(selected, 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{longLabel(selected)}</span>
        <div className="flex items-center gap-2">
          {selected !== today && (
            <button onClick={() => onSelect(today)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Torna a oggi
            </button>
          )}
          <label className="relative text-xs font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1 cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5">
            <CalendarDays size={14} /> Calendario
            <input
              type="date"
              aria-label="Scegli un giorno"
              max={today}
              value={selected}
              onChange={(e) => e.target.value && onSelect(e.target.value > today ? today : e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

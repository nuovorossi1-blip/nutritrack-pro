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
    <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-3">
      <div className="flex items-center gap-1">
        <button aria-label="Giorno precedente" onClick={() => onSelect(addDays(selected, -1))} className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 grid grid-cols-5 gap-1.5">
          {days.map((d) => {
            const active = d === selected;
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                className={`rounded-2xl py-2 flex flex-col items-center transition ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-blue-100' : 'text-neutral-400'}`}>{shortLabel(d, today)}</span>
                <span className="text-lg font-extrabold leading-tight">{parseISO(d).getDate()}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${daysWithData.has(d) ? (active ? 'bg-white' : 'bg-green-500') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <button
          aria-label="Giorno successivo"
          disabled={selected >= today}
          onClick={() => onSelect(addDays(selected, 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{longLabel(selected)}</span>
        <div className="flex items-center gap-2">
          {selected !== today && (
            <button onClick={() => onSelect(today)} className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Torna a oggi
            </button>
          )}
          <label className="relative text-xs font-bold text-neutral-500 dark:text-neutral-300 flex items-center gap-1 cursor-pointer bg-neutral-100 dark:bg-neutral-800 rounded-xl px-2.5 py-1.5">
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

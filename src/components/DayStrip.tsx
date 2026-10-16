import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { addDays, dayStrip, longLabel, parseISO, shortLabel } from '../lib/dates';
import { CalendarSheet } from './CalendarSheet';

interface Props {
  selected: string;
  today: string;
  daysWithData: Set<string>;
  onSelect: (day: string) => void;
}

export function DayStrip({ selected, today, daysWithData, onSelect }: Props) {
  const days = dayStrip(selected, today);
  const [calendar, setCalendar] = useState(false);
  return (
    <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-3">
      <div className="flex items-center gap-1">
        <button aria-label="Giorno precedente" onClick={() => onSelect(addDays(selected, -1))} className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-90 transition">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 grid grid-cols-5 gap-1.5">
          {days.map((d) => {
            const active = d === selected;
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                className={`rounded-[1.4rem] py-2 flex flex-col items-center transition active:scale-95 ${active ? 'bg-gold text-neutral-950 shadow-md shadow-gold-500/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-neutral-800' : 'text-neutral-400'}`}>{shortLabel(d, today)}</span>
                <span className="text-lg font-extrabold leading-tight">{parseISO(d).getDate()}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${daysWithData.has(d) ? (active ? 'bg-neutral-950' : 'bg-gold-400') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <button
          aria-label="Giorno successivo"
          disabled={selected >= today}
          onClick={() => onSelect(addDays(selected, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 active:scale-90 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{longLabel(selected)}</span>
        <div className="flex items-center gap-2">
          {selected !== today && (
            <button onClick={() => onSelect(today)} className="text-xs font-bold text-blue-600 dark:text-gold-400">
              Torna a oggi
            </button>
          )}
          <button
            onClick={() => setCalendar(true)}
            className="text-xs font-bold text-neutral-500 dark:text-neutral-300 flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-3 py-1.5 active:scale-95 transition"
          >
            <CalendarDays size={14} /> Calendario
          </button>
        </div>
      </div>
      {calendar && <CalendarSheet selected={selected} today={today} daysWithData={daysWithData} onSelect={onSelect} onClose={() => setCalendar(false)} />}
    </section>
  );
}

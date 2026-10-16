import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, dayStrip, longLabel, parseISO, shortLabel } from '../lib/dates';
import { useState } from 'react';
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
    <section className="bg-[#191a1c] text-white rounded-[26px] border border-[#343538] shadow-sm p-3">
      <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
        <button aria-label="Giorno precedente" onClick={() => onSelect(addDays(selected, -1))} className="w-7 h-9 sm:w-9 shrink-0 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0 grid grid-cols-5 gap-0.5 sm:gap-1">
          {days.map((d) => {
            const active = d === selected;
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                className={`min-w-0 rounded-[18px] py-2 flex flex-col items-center transition ${active ? 'bg-gold text-neutral-950 shadow-md shadow-gold-500/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
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
          className="w-7 h-9 sm:w-9 shrink-0 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{longLabel(selected)}</span>
        <div className="flex items-center gap-2 flex-wrap">
          {selected !== today && (
            <button onClick={() => onSelect(today)} className="text-xs font-bold text-blue-600 dark:text-gold-400">
              Torna a oggi
            </button>
          )}
          <button onClick={() => setCalendar(true)} className="text-xs font-bold text-white flex items-center gap-1 bg-[#292a2d] rounded-full px-3 py-2">
            <CalendarDays size={14} /> Calendario
          </button>
        </div>
      </div>
      {calendar && <CalendarSheet selected={selected} today={today} daysWithData={daysWithData} onSelect={onSelect} onClose={() => setCalendar(false)} />}
    </section>
  );
}

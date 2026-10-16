import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, dayStrip, longLabel, parseISO, shortLabel } from '../lib/dates';
import { useState } from 'react';
import { CalendarSheet } from './CalendarSheet';

interface Props {
  selected: string;
  today: string;
  daysWithData: Set<string>;
  onSelect: (day: string) => void;
  compact?: boolean;
}

export function DayStrip({ selected, today, daysWithData, onSelect, compact = false }: Props) {
  const days = dayStrip(selected, today);
  const [calendar, setCalendar] = useState(false);
  if (compact) {
    const visible = [addDays(selected, -1), selected, addDays(selected, 1)];
    return (
      <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5" aria-label="Selezione giorno">
        {visible.map((d, i) => {
          const active = i === 1;
          return (
            <button key={d} type="button"
              aria-label={active ? `Apri calendario, ${longLabel(d)}` : `Vai a ${longLabel(d)}`}
              aria-current={active ? 'date' : undefined}
              onClick={() => active ? setCalendar(true) : onSelect(d)}
              className={`relative min-w-0 flex-1 max-w-11 rounded-lg py-1 flex flex-col items-center justify-center leading-none ${active ? 'bg-[#f5b935] text-neutral-950' : 'text-neutral-300'}`}
            >
              <span className="text-[8px] font-semibold truncate w-full text-center">{shortLabel(d, today)}</span>
              <span className="text-sm font-extrabold mt-0.5">{parseISO(d).getDate()}</span>
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${daysWithData.has(d) ? (active ? 'bg-neutral-950' : 'bg-[#f5b935]') : 'bg-transparent'}`} />
            </button>
          );
        })}
        {calendar && <CalendarSheet selected={selected} today={today} daysWithData={daysWithData} onSelect={onSelect} onClose={() => setCalendar(false)} />}
      </div>
    );
  }
  return (
    <section className="bg-[#191a1c] text-white rounded-[22px] border border-[#343538] shadow-sm px-2.5 py-2">
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
                className={`min-w-0 rounded-[14px] py-1 flex flex-col items-center transition ${active ? 'bg-gold text-neutral-950 shadow-md shadow-gold-500/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-neutral-800' : 'text-neutral-400'}`}>{shortLabel(d, today)}</span>
                <span className="text-base font-extrabold leading-tight">{parseISO(d).getDate()}</span>
                <span className={`w-1 h-1 rounded-full mt-0.5 ${daysWithData.has(d) ? (active ? 'bg-neutral-950' : 'bg-gold-400') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <button
          aria-label="Giorno successivo"
                    onClick={() => onSelect(addDays(selected, 1))}
          className="w-7 h-9 sm:w-9 shrink-0 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 mt-1 px-1">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{longLabel(selected)}</span>
        <div className="flex items-center gap-2 flex-wrap">
          {selected !== today && (
            <button onClick={() => onSelect(today)} className="text-xs font-bold text-blue-600 dark:text-gold-400">
              Torna a oggi
            </button>
          )}
          <button onClick={() => setCalendar(true)} className="text-[11px] font-bold text-white flex items-center gap-1 bg-[#292a2d] rounded-full px-2.5 py-1.5">
            <CalendarDays size={14} /> Calendario
          </button>
        </div>
      </div>
      {calendar && <CalendarSheet selected={selected} today={today} daysWithData={daysWithData} onSelect={onSelect} onClose={() => setCalendar(false)} />}
    </section>
  );
}

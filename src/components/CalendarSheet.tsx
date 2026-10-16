import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { parseISO, toISO } from '../lib/dates';

const months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year,month,1);
  const cells: (string | null)[] = Array((first.getDay()+6)%7).fill(null);
  for(let day=1;day<=new Date(year,month+1,0).getDate();day++) cells.push(toISO(new Date(year,month,day)));
  while(cells.length%7) cells.push(null);
  return cells;
}

export function CalendarSheet({ selected, today, daysWithData, onSelect, onClose }: {
  selected: string; today: string; daysWithData: Set<string>; onSelect: (day: string) => void; onClose: () => void;
}) {
  const initial = parseISO(selected);
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const panel = useRef<HTMLDivElement>(null);
  const latest = parseISO(today);
  const year = month.getFullYear(), monthIndex = month.getMonth();
  const cells = monthGrid(year,monthIndex);
  const select = (day: string) => { onSelect(day); onClose(); };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div className="safe-sheet-overlay fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={(event) => { if(event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Calendario" tabIndex={-1}
        onKeyDown={(event) => {
          if(event.key === 'Escape') onClose();
          if(event.key !== 'Tab') return;
          const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select');
          if(!items?.length) return;
          const first=items[0],last=items[items.length-1];
          if(event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {event.preventDefault();last.focus();}
          else if(!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
        }}
        className="ios-sheet safe-bottom-sheet w-full max-w-sm rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl p-5 space-y-4 outline-none">
        <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Calendario</h2><button aria-label="Chiudi calendario" onClick={onClose} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><X size={19}/></button></div>
        <div className="flex gap-2 items-center">
          <button aria-label="Mese precedente" onClick={() => setMonth(new Date(year,monthIndex-1,1))} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><ChevronLeft size={20}/></button>
          <label className="sr-only" htmlFor="calendar-month">Mese</label><select id="calendar-month" value={monthIndex} onChange={(event) => setMonth(new Date(year,Number(event.target.value),1))} className="min-w-0 flex-1 bg-transparent font-bold rounded-full p-2">{months.map((name,index)=><option key={name} value={index} disabled={year===latest.getFullYear() && index>latest.getMonth()}>{name}</option>)}</select>
          <label className="sr-only" htmlFor="calendar-year">Anno</label><select id="calendar-year" value={year} onChange={(event) => {const next=Number(event.target.value);setMonth(new Date(next,next===latest.getFullYear()?Math.min(monthIndex,latest.getMonth()):monthIndex,1));}} className="bg-transparent font-bold rounded-full p-2">{Array.from({length:101},(_,index)=>latest.getFullYear()-index).map((value)=><option key={value}>{value}</option>)}</select>
          <button aria-label="Mese successivo" disabled={year===latest.getFullYear()&&monthIndex===latest.getMonth()} onClick={() => setMonth(new Date(year,monthIndex+1,1))} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 disabled:opacity-30 flex items-center justify-center"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['L','M','M','G','V','S','D'].map((name,index)=><span key={index} className="text-xs text-neutral-400 pb-2 font-bold">{name}</span>)}
          {cells.map((day,index)=>{
            if(!day) return <span key={`blank${index}`}/>;
            const active=day===selected;
            return <button key={day} aria-label={new Intl.DateTimeFormat('it-IT',{dateStyle:'full'}).format(parseISO(day))} aria-pressed={active} disabled={day>today} onClick={()=>select(day)} className={`relative aspect-square rounded-full flex items-center justify-center font-bold disabled:opacity-20 ${active?'bg-blu text-white shadow-lg shadow-blue-500/30':day===today?'ring-2 ring-gold-400':'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>{parseISO(day).getDate()}{daysWithData.has(day)&&<span className={`absolute bottom-1 w-1 h-1 rounded-full ${active?'bg-white':'bg-blue-400'}`}/>}</button>;
          })}
        </div>
        <button onClick={()=>select(today)} className="w-full py-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-blue-500 font-bold">Oggi</button>
      </div>
    </div>
  );
}

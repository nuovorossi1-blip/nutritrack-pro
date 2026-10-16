import { Flame, Mic, Moon, Plus, RotateCcw, Sun, Target, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Food, MealItem, MealKey } from './types';
import { MEALS } from './types';
import { buildItem, sumMacros, type Portion } from './lib/nutrition';
import { allFoods, getDay, useAppData, useToday, withDay } from './lib/store';
import { longLabel } from './lib/dates';
import { mealFromText, parseFoodText, unknownWords, type ParsedEntry } from './lib/parser';
import { aiEntries, askAi } from './lib/ai';
import { DENIED_HELP } from './lib/permissions';
import { DayStrip } from './components/DayStrip';
import { Summary } from './components/Summary';
import { MealSheet } from './components/MealSheet';
import { SettingsModal } from './components/SettingsModal';
import { QuickConfirm } from './components/QuickConfirm';

interface Toast {
  id: number;
  msg: string;
  error: boolean;
  action?: { label: string; run: () => void };
}

type SpeechCtor = new () => {
  lang: string;
  onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
  onend: () => void;
  onerror: (e: { error: string }) => void;
  start: () => void;
};

export default function App() {
  const [data, update] = useAppData();
  const today = useToday();
  const [selected, setSelected] = useState(today);
  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
  const [settings, setSettings] = useState(false);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // A mezzanotte, se si stava guardando "oggi", si passa al nuovo giorno (che parte da 0).
  const prevToday = useRef(today);
  useEffect(() => {
    const prev = prevToday.current;
    if (prev !== today) {
      // prev copiato prima: l'aggiornamento di setSelected gira dopo, quando il ref e' gia' cambiato.
      setSelected((s) => (s === prev ? today : s));
      prevToday.current = today;
    }
  }, [today]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', data.dark);
  }, [data.dark]);

  const toast = (msg: string, error = false, action?: Toast['action']) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, error, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 7000 : msg.length > 80 ? 8000 : 3200);
  };

  const day = getDay(data, selected);
  const total = sumMacros(Object.values(day).flat());
  const daysWithData = useMemo(() => new Set(Object.keys(data.days)), [data.days]);

  const setMeal = (meal: MealKey, fn: (items: MealItem[]) => MealItem[]) =>
    update((d) => {
      const log = getDay(d, selected);
      return withDay(d, selected, { ...log, [meal]: fn(log[meal]) });
    });

  const [quick, setQuick] = useState<{ entries: ParsedEntry[]; meal: MealKey | null; ai?: boolean } | null>(null);

  // Mai aggiungere alla cieca: pasto e quantita' si confermano nel riquadro.
  const [thinking, setThinking] = useState(false);

  const addQuick = async () => {
    if (!text.trim() || thinking) return;
    const foods = allFoods(data);
    const entries = parseFoodText(text, foods);
    const meal = mealFromText(text);
    // Parole che l'elenco non conosce ("lasagne", "cornetto"): legge l'AI, e si conferma sempre.
    if (unknownWords(text, foods).length) {
      setThinking(true);
      try {
        const r = await askAi(text);
        const aiList = aiEntries(r, foods);
        if (aiList.length) return setQuick({ entries: aiList, meal: r.pasto || meal, ai: true });
      } catch (e) {
        toast(`${(e as Error).message}. Uso solo gli alimenti che conosco.`, true);
      } finally {
        setThinking(false);
      }
    }
    if (!entries.length) return toast('Alimento non riconosciuto. Prova: "200g di pasta cotta a pranzo"', true);
    // Frase completa (pasto e tutte le quantita'): si aggiunge subito, con "Annulla".
    if (meal && entries.every((e) => e.qtyGiven)) confirmQuick(entries, meal, true);
    else setQuick({ entries, meal });
  };

  function confirmQuick(entries: ParsedEntry[], meal: MealKey, undoable = false) {
    // Alimenti nuovi letti dall'AI: salvati, cosi' la prossima volta si riconoscono senza AI.
    const fresh = entries.map((e) => e.food).filter((f) => f.source === 'ai');
    if (fresh.length) update((d) => ({ ...d, foods: [...fresh, ...d.foods.filter((x) => !fresh.some((f) => f.id === x.id))] }));
    const items = entries.map((e) => buildItem(e.food, e.portion));
    const day = selected;
    setMeal(meal, (l) => [...l, ...items]);
    setQuick(null);
    setText('');
    const ids = new Set(items.map((i) => i.id));
    const undo = () =>
      update((d) => {
        const log = getDay(d, day);
        return withDay(d, day, { ...log, [meal]: log[meal].filter((i) => !ids.has(i.id)) });
      });
    toast(
      `Aggiunto a ${MEALS.find((m) => m.key === meal)!.label}: ${items.map((i) => `${i.name.split(' (')[0]} ${i.label}`).join(' + ')}`,
      false,
      undoable ? { label: 'Annulla', run: undo } : undefined,
    );
  }

  const dictate = () => {
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return toast('Dettatura non disponibile in questo browser', true);
    const rec = new Ctor();
    rec.lang = 'it-IT';
    rec.onresult = (e) => setText(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setListening(false);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast(DENIED_HELP, true);
      else if (e.error === 'no-speech') toast('Non ho sentito niente: riprova', true);
      else if (e.error !== 'aborted') toast('Microfono non disponibile', true);
    };
    setListening(true);
    rec.start();
  };

  const resetDay = () => {
    if (!Object.values(day).some((l) => l.length)) return;
    if (!window.confirm(`Cancellare tutti gli alimenti di ${longLabel(selected)}?`)) return;
    update((d) => withDay(d, selected, { colazione: [], pranzo: [], cena: [], spuntini: [] }));
    toast('Giorno azzerato');
  };

  const saveFood = (f: Food) => update((d) => ({ ...d, foods: [f, ...d.foods.filter((x) => x.id !== f.id)] }));

  return (
    <div className="min-h-screen pb-16">
      <header className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur sticky top-0 z-30 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold flex items-center justify-center text-neutral-950 shadow-md shadow-gold-500/30">
              <Flame size={20} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight whitespace-nowrap text-neutral-900 dark:text-white">NutriTrack PRO</h1>
              <p className="hidden sm:block text-[11px] text-neutral-400 font-medium">Pasti, macro, crudo/cotto</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Profilo e obiettivi" onClick={() => setSettings(true)} className="h-10 px-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold flex items-center gap-1.5">
              <Target size={16} /> <span className="hidden sm:inline">Obiettivi</span>
            </button>
            <button aria-label="Azzera giorno" title="Azzera il giorno scelto" onClick={resetDay} className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <RotateCcw size={16} />
            </button>
            <button aria-label="Tema" onClick={() => update((d) => ({ ...d, dark: !d.dark }))} className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {data.dark ? <Sun size={16} className="text-gold-400" /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <DayStrip selected={selected} today={today} daysWithData={daysWithData} onSelect={setSelected} />
        {!data.profile && (
          <button onClick={() => setSettings(true)} className="w-full text-left rounded-3xl p-4 bg-blu text-white shadow-md">
            <div className="font-extrabold">Completa il tuo profilo</div>
            <div className="text-xs text-blue-100 mt-0.5">Età, peso, altezza e attività: l'app stima il tuo mantenimento e calcola calorie e macro per il tuo obiettivo.</div>
          </button>
        )}
        <Summary total={total} goals={data.goals} name={data.profile?.name} />

        <section className="rounded-3xl p-4 sm:p-5 text-white bg-gradient-to-br from-blue-900 via-blue-950 to-neutral-950 shadow-xl">
          <div className="flex items-center gap-2">
            <Wand2 size={18} className="text-blue-300" />
            <h3 className="font-bold">Inserimento rapido a parole</h3>
          </div>
          <p className="text-xs text-blue-200/80 mt-1">Es. «200g di pasta cotta e 150g di pollo cotto a pranzo» oppure «2 uova e 1 fetta di pane a colazione». Se scrivi «cotto», l'app ricalcola i grammi a crudo.</p>
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void addQuick()}
                placeholder="Cosa hai mangiato?"
                className="w-full bg-neutral-900/80 placeholder-neutral-400 text-sm rounded-2xl px-4 py-3 pr-11 border border-blue-700/50 focus:border-blue-400 outline-none"
              />
              <button aria-label="Dettatura" onClick={dictate} className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center ${listening ? 'text-red-400 animate-pulse' : 'text-neutral-400'}`}>
                <Mic size={16} />
              </button>
            </div>
            <button onClick={addQuick} disabled={thinking} className="bg-blu hover:brightness-110 disabled:opacity-60 rounded-2xl px-4 text-sm font-bold">
              {thinking ? 'Leggo…' : 'Inserisci'}
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2 px-1">Pasti del giorno</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {MEALS.map((m) => {
              const items = day[m.key];
              const t = sumMacros(items);
              return (
                <button key={m.key} onClick={() => setOpenMeal(m.key)} className="text-left bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-4 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg">{m.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold">{m.label}</div>
                      <div className="text-[11px] text-neutral-400">{items.length} {items.length === 1 ? 'alimento' : 'alimenti'}</div>
                    </div>
                    <Plus size={18} className="text-neutral-400" />
                  </div>
                  {items.length > 0 && <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2">{items.map((i) => `${i.name} (${i.label})`).join(' • ')}</p>}
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-lg font-extrabold text-blue-600 dark:text-gold-400">{t.kcal} kcal</span>
                    <span className="text-[11px] text-neutral-400">
                      C {t.carbs} · P {t.pro} · G {t.fats}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {openMeal && (
        <MealSheet
          meal={openMeal}
          dayLabel={longLabel(selected)}
          items={day[openMeal]}
          data={data}
          toast={toast}
          onClose={() => setOpenMeal(null)}
          onSaveFood={saveFood}
          onAdd={(food: Food, p: Portion) => {
            setMeal(openMeal, (l) => [...l, buildItem(food, p)]);
            toast(`Aggiunto: ${food.name}`);
          }}
          onUpdate={(itemId, food, p) => setMeal(openMeal, (l) => l.map((i) => (i.id === itemId ? buildItem(food, p, itemId) : i)))}
          onRemove={(itemId) => setMeal(openMeal, (l) => l.filter((i) => i.id !== itemId))}
        />
      )}
      {quick && <QuickConfirm entries={quick.entries} meal={quick.meal} ai={quick.ai} dayLabel={longLabel(selected)} onClose={() => setQuick(null)} onConfirm={confirmQuick} />}
      {settings && <SettingsModal data={data} toast={toast} onClose={() => setSettings(false)} onSaveProfile={(profile, goals) => update((d) => ({ ...d, profile, goals }))} onImport={(d) => update(() => d)} />}

      <div className="fixed bottom-4 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl ${t.error ? 'bg-red-600' : 'bg-neutral-900 border border-neutral-700'}`}>
            <span>{t.msg}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.run();
                  setToasts((all) => all.filter((x) => x.id !== t.id));
                }}
                className="shrink-0 text-gold-400 font-extrabold"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

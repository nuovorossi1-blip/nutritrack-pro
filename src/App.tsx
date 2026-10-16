import { Flame, Moon, Plus, RotateCcw, Sun, Settings, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppData, Food, Goals, MealItem, MealKey, Profile } from './types';
import { needsProfileSetup } from './lib/metabolism';
import { saveDiff } from './lib/cloud';
import { MEALS } from './types';
import { buildItem, newId, sumMacros, type Portion } from './lib/nutrition';
import { getDay, useAppData, useToday, withDay } from './lib/store';
import { longLabel } from './lib/dates';
import { mealFromText, normalize, parseFoodText, unknownWords, type ParsedEntry } from './lib/parser';
import { aiEntries, askAi } from './lib/ai';
import { DayStrip } from './components/DayStrip';
import { Summary } from './components/Summary';
import { MealSheet } from './components/MealSheet';
import { SettingsModal } from './components/SettingsModal';
import { QuickConfirm } from './components/QuickConfirm';
import { ProfileGoals } from './components/ProfileGoals';
import { plausibilityWarnings } from './lib/plausibility';
import { VoiceInput } from './components/VoiceInput';
import { AndroidDownloadBanner } from './components/AndroidTools';
import { recognitionFoods } from './lib/savedFoodRecognition';

interface Toast {
  id: number;
  msg: string;
  error: boolean;
  action?: { label: string; run: () => void };
}

interface AppProps {
  initial?: AppData;
  storageKey?: string;
  userId?: string;
  email?: string;
  onLogout?: () => void;
}

export default function App({ initial, storageKey, userId, email, onLogout }: AppProps) {
  const [data, update] = useAppData(initial, storageKey);
  // Salvataggio nel cloud: solo le differenze, 1,5 s dopo l'ultima modifica.
  const [sync, setSync] = useState<'ok' | 'salvo' | 'errore'>('ok');
  const saved = useRef<AppData | null>(initial || null);
  useEffect(() => {
    if (!userId || data === saved.current) return;
    setSync('salvo');
    const t = setTimeout(() => {
      const snapshot = data;
      saveDiff(userId, saved.current, snapshot)
        .then(() => {
          saved.current = snapshot;
          setSync('ok');
        })
        .catch(() => setSync('errore'));
    }, 1500);
    return () => clearTimeout(t);
  }, [data, userId]);
  const today = useToday();
  const [selected, setSelected] = useState(today);
  const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
  const [settings, setSettings] = useState(false);
  const [text, setText] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

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

  const toast = (msg: string, error = false, action?: Toast['action'], duration = error ? 6000 : action ? 7000 : 2000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, error, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
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
    const foods = recognitionFoods(data);
    const entries = parseFoodText(text, foods);
    const meal = mealFromText(text);
    if (entries.some((entry) => entry.food.id === 'f16') && !/\bsegale\b/.test(normalize(text))) {
      return toast('Quale pane? Specifica bianco, casereccio o integrale.', true);
    }
    // Frase completa: anche l'AI puo' inserire direttamente, con Annulla.
    if (unknownWords(text, foods).length) {
      setThinking(true);
      try {
        const r = await askAi(text);
        const aiList = aiEntries(r, foods);
        if (!aiList.length) return toast('Alimento non riconosciuto: nessuna voce aggiunta.', true);
        const complete = meal && aiList.every((e) => e.qtyGiven && e.portion.qty > 0 && !plausibilityWarnings(e.food).length)
          && r.alimenti.every((a) => a.proteine_100g !== null && a.carboidrati_100g !== null && a.grassi_100g !== null);
        if (complete) return confirmQuick(aiList, meal, true);
        return setQuick({ entries: aiList, meal: meal || r.pasto, ai: true });
      } catch (e) {
        return toast(`${(e as Error).message}. Nessun alimento aggiunto: riprova.`, true);
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
      `Aggiunto a ${MEALS.find((m) => m.key === meal)!.label}: ${items.map((i) => `${i.name} ${i.label}`).join(' + ')}${entries.some((e) => e.food.source === 'ai') ? ' · stima AI' : ''}`,
      false,
      undoable ? { label: 'Annulla', run: undo } : undefined,
      2000,
    );
  }

  const resetDay = () => {
    if (!Object.values(day).some((l) => l.length)) return;
    if (!window.confirm(`Cancellare tutti gli alimenti di ${longLabel(selected)}?`)) return;
    update((d) => withDay(d, selected, { colazione: [], pranzo: [], cena: [], spuntini: [] }));
    toast('Giorno azzerato');
  };

  const saveFood = (f: Food) => update((d) => ({ ...d, foods: [f, ...d.foods.filter((x) => x.id !== f.id)] }));

  const finishSetup = async (profile: Profile, goals: Goals) => {
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileError('');
    const next = { ...data, profile, goals };
    try {
      // Il diario si apre solo quando il profilo e' stato salvato anche sull'account.
      if (userId) await saveDiff(userId, saved.current, next);
      saved.current = next;
      update(() => next);
    } catch {
      setProfileError('Profilo non salvato. Controlla la connessione e riprova: i campi restano compilati.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (needsProfileSetup(data.profile, data.goals)) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-md mx-auto space-y-5">
          <header>
            <div className="text-sm font-extrabold text-gold-500">NutriTrack PRO</div>
            <h1 className="text-2xl font-extrabold mt-2">Creiamo il tuo profilo</h1>
            <p className="text-sm text-neutral-500 mt-2">Raccontaci qualcosa di te: calcoliamo il tuo fabbisogno e le calorie per il tuo obiettivo.</p>
          </header>
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5">
            <ProfileGoals profile={data.profile} goals={data.goals} onboarding saving={savingProfile} onSave={finishSetup} />
            {profileError && <p role="alert" className="text-sm text-red-500 mt-3">{profileError}</p>}
          </div>
          {onLogout && <button disabled={savingProfile} onClick={onLogout} className="w-full text-sm font-semibold text-neutral-500 py-2">Esci dall'account</button>}
        </div>
      </main>
    );
  }

  return (
    <div className="app-screen app-home min-h-screen">
      <header className="bg-[#17181b]/95 dark:bg-[#17181b]/95 backdrop-blur sticky top-0 z-30 border-b border-[#23252c] text-white">
        <div className="home-container h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#f5b935] flex items-center justify-center text-neutral-950 shadow-md shadow-amber-400/30">
              <Flame size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight whitespace-nowrap text-white">NutriTrack PRO</h1>
              {userId && (
                <p className={`text-[10px] font-semibold ${sync === 'errore' ? 'text-red-500' : 'text-neutral-400'}`}>
                  {sync === 'ok' ? '☁ Salvato' : sync === 'salvo' ? '☁ Salvataggio…' : '⚠ Non salvato: controlla la rete'}
                </p>
              )}
              <p className="hidden sm:block text-[11px] text-neutral-400 font-medium">Pasti, macro, crudo/cotto</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button aria-label="Profilo e obiettivi" onClick={() => setSettings(true)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#26272b] flex items-center justify-center">
              <Settings size={19} />
            </button>
            <button aria-label="Azzera giorno" title="Azzera il giorno scelto" onClick={resetDay} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#26272b] flex items-center justify-center">
              <RotateCcw size={16} />
            </button>
            <button aria-label="Tema" onClick={() => update((d) => ({ ...d, dark: !d.dark }))} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#26272b] flex items-center justify-center">
              {data.dark ? <Sun size={16} className="text-gold-400" /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="home-container pt-3 space-y-4">
        <AndroidDownloadBanner />
        <DayStrip selected={selected} today={today} daysWithData={daysWithData} onSelect={setSelected} />
        {!data.profile && (
          <button onClick={() => setSettings(true)} className="w-full text-left rounded-3xl p-4 bg-blu text-white shadow-md">
            <div className="font-extrabold">Completa il tuo profilo</div>
            <div className="text-xs text-blue-100 mt-0.5">Età, peso, altezza e attività: l'app stima il tuo mantenimento e calcola calorie e macro per il tuo obiettivo.</div>
          </button>
        )}
        <Summary
          total={total}
          goals={data.goals}
          name={data.profile?.name}
        />

        <section className="rounded-[22px] p-4 text-white bg-gradient-to-br from-[#1d3267] via-[#17244b] to-[#101522] border border-[#24345c] shadow-xl">
          <div className="flex items-center gap-2">
            <Wand2 size={18} className="text-blue-300" />
            <h3 className="font-bold">Inserimento rapido a parole</h3>
          </div>
          <VoiceInput text={text} onText={setText} onInsert={() => void addQuick()} busy={thinking} onError={(message) => toast(message, true)} />
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2 px-1">Pasti del giorno</h2>
          <div className="home-meal-grid grid gap-2.5">
            {MEALS.map((m) => {
              const items = day[m.key];
              const t = sumMacros(items);
              return (
                <button key={m.key} onClick={() => setOpenMeal(m.key)} className="home-meal-card w-full text-left bg-[#191a1c] text-white rounded-[22px] border border-[#343538] shadow-sm p-3 hover:border-[#f5b935] transition min-w-0 flex flex-col justify-between min-h-[155px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="home-meal-icon w-9 h-9 shrink-0 rounded-full bg-[#292a2d] flex items-center justify-center text-lg">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="home-meal-title font-bold text-sm sm:text-base truncate">{m.label}</div>
                      <div className="text-[11px] text-neutral-400">{items.length} {items.length === 1 ? 'alimento' : 'alimenti'}</div>
                    </div>
                    <Plus size={18} className="text-neutral-400" />
                  </div>
                  {items.length > 0 && <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2">{items.map((i) => `${i.name} (${i.label})`).join(' • ')}</p>}
                  <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-[#343538]">
                    <span className="text-xl font-extrabold text-[#f5b935]">{t.kcal} kcal</span>
                    <div className="home-meal-macros w-full text-center text-[10px] sm:text-xs whitespace-nowrap" aria-label="Macro del pasto">
                      <span><b className="text-sky-400">C</b> {t.carbs} g</span>
                      <span><b className="text-red-500">P</b> {t.pro} g</span>
                      <span><b className="text-yellow-400">G</b> {t.fats} g</span>
                    </div>
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
          day={selected}
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
          onAddItems={(items) => {
            const copies = items.map((i) => ({ ...i, id: newId('it'), addedAt: new Date().toISOString() }));
            setMeal(openMeal, (l) => [...l, ...copies]);
            toast(`Aggiunto: ${copies.map((i) => `${i.name.split(' (')[0]} ${i.label}`).join(' + ')}`);
          }}
          onUpdate={(itemId, food, p) => setMeal(openMeal, (l) => l.map((i) => (i.id === itemId ? buildItem(food, p, itemId) : i)))}
          onRemove={(itemId) => {
            const meal = openMeal;
            const date = selected;
            const index = day[meal].findIndex((i) => i.id === itemId);
            const removed = day[meal][index];
            if (!removed) return;
            setMeal(meal, (l) => l.filter((i) => i.id !== itemId));
            toast(`Eliminato: ${removed.name}`, false, { label: 'Annulla', run: () => update((d) => {
              const log = getDay(d, date);
              if (log[meal].some((i) => i.id === removed.id)) return d;
              const items = [...log[meal]];
              items.splice(Math.min(index, items.length), 0, removed);
              return withDay(d, date, { ...log, [meal]: items });
            }) });
          }}
        />
      )}
      {quick && <QuickConfirm entries={quick.entries} meal={quick.meal} ai={quick.ai} dayLabel={longLabel(selected)} onClose={() => setQuick(null)} onConfirm={confirmQuick} />}
      {settings && <SettingsModal data={data} email={email} userId={userId} onLogout={onLogout} toast={toast} onClose={() => setSettings(false)} onSaveProfile={(profile, goals) => update((d) => ({ ...d, profile, goals }))} onImport={(d) => update(() => d)} />}

      <div className="app-toasts fixed inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div key={t.id} data-toast role={t.error ? 'alert' : 'status'} className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl ${t.error ? 'bg-red-600' : 'bg-neutral-900 border border-neutral-700'}`}>
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

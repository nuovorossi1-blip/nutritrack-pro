import { useAndroidBack } from '../native/navigation';
import { ArrowLeft, Barcode, Camera, MessageSquare, PlusCircle, Search, Star } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { AppData, Food, MealItem, MealKey } from '../types';
import { MEALS } from '../types';
import { sumMacros, type Portion } from '../lib/nutrition';
import { frequentFor, lastMealBefore } from '../lib/store';
import { longLabel } from '../lib/dates';
import { normalize } from '../lib/parser';
import { findByBarcode, searchByName, type OffResult } from '../lib/off';
import { PortionEditor } from './PortionEditor';
import { FoodReview } from './FoodReview';
import { plausibilityWarnings } from '../lib/plausibility';
import { BarcodeScanner } from './BarcodeScanner';
import { searchUsda, type UsdaResult } from '../lib/usda';
import { SwipeFoodRow } from './SwipeFoodRow';
import { MealSummary, MealProgress } from './MealSummary';
import { FoodPhoto } from './FoodPhoto';
import { VoiceInput } from './VoiceInput';
import { FoodChoices } from './FoodChoices';
import { foodRequests } from '../lib/foodChoices';
import { buildItem } from '../lib/nutrition';
import { recognitionFoods } from '../lib/savedFoodRecognition';

type Tab = 'cerca' | 'foto' | 'voce' | 'barcode';

interface Props {
  meal: MealKey;
  /** Giorno mostrato (AAAA-MM-GG). */
  day: string;
  dayLabel: string;
  items: MealItem[];
  data: AppData;
  onAdd: (food: Food, p: Portion) => void;
  /** Copia voci gia' pronte (stessi grammi e valori), es. "ripeti l'ultimo pranzo". */
  onAddItems: (items: MealItem[]) => void;
  onUpdate: (itemId: string, food: Food, p: Portion) => void;
  onRemove: (itemId: string) => void;
  onSaveFood: (food: Food) => void;
  onClose: () => void;
  toast: (msg: string, error?: boolean) => void;
}

const emptyFood = (): Food => ({ id: `cust_${Date.now().toString(36)}`, name: '', kcal: 0, pro: 0, carbs: 0, fats: 0, source: 'personale' });

export function MealSheet({ meal, day, dayLabel, items, data, onAdd, onAddItems, onUpdate, onRemove, onSaveFood, onClose, toast }: Props) {
  const info = MEALS.find((m) => m.key === meal)!;
  const foods = useMemo(() => recognitionFoods(data), [data]);
  const frequent = useMemo(() => frequentFor(data, meal), [data, meal]);
  const last = useMemo(() => lastMealBefore(data, meal, day), [data, meal, day]);
  const lastKcal = last ? sumMacros(last.items).kcal : 0;
  const total = sumMacros(items);

  const [tab, setTab] = useState<Tab>('cerca');
  const prompt = meal === 'colazione' ? 'Cosa hai mangiato a colazione?' : meal === 'spuntini' ? 'Cosa hai mangiato come spuntino?' : `Cosa hai mangiato a ${info.label.toLowerCase()}?`;
  const [list, setList] = useState<'frequenti' | 'tutti'>('frequenti');
  const [text, setText] = useState('');
  const [voiceChoices, setVoiceChoices] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [online, setOnline] = useState<OffResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [usda, setUsda] = useState<UsdaResult | null>(null);
  const [usdaBusy, setUsdaBusy] = useState(false);
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [openSwipe, setOpenSwipe] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const changeView = (add: boolean) => { if(add) {setTab('cerca');setQuery('');setList('frequenti');} setAdding(add); sheet.current?.scrollTo({ top: 0 }); };

  const [picking, setPicking] = useState<{ food: Food; initial?: Portion; itemId?: string } | null>(null);
  // back: da dove si e' arrivati (correzione dalla schermata della quantita'), per tornarci dopo il salvataggio.
  const [review, setReview] = useState<{ food: Food; missing: string[]; title: string; back?: { initial?: Portion; itemId?: string } } | null>(null);

  useAndroidBack(() => {
    if (openSwipe) setOpenSwipe(null);
    else if (adding) changeView(false);
    else onClose();
  }, 20);

  const local = useMemo(() => {
    const q = normalize(query).trim();
    if (!q) return foods.slice(0, 30);
    const parts = q.split(/\s+/);
    return foods.filter((f) => parts.every((p) => normalize(`${f.name} ${f.brand || ''} ${f.category || ''} ${(f.aliases || []).join(' ')}`).includes(p))).slice(0, 30);
  }, [foods, query]);

  const searchOnline = async () => {
    if (query.trim().length < 2) return toast('Scrivi almeno 2 lettere', true);
    setBusy(true);
    try {
      setOnline(await searchByName(query));
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const searchGeneric = async () => {
    if (usdaBusy) return;
    const q = query.trim();
    if (q.length < 2) return toast('Scrivi almeno 2 lettere', true);
    setUsdaBusy(true);
    setUsda(null);
    try { setUsda(await searchUsda(q)); }
    catch (e) { toast((e as Error).message, true); }
    finally { setUsdaBusy(false); }
  };

  const searchCode = async (value = code) => {
    setBusy(true);
    try {
      const r = await findByBarcode(value);
      if (!r) toast('Prodotto non trovato su Open Food Facts: crealo a mano', true);
      else openResult(r);
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const openResult = (r: OffResult) => {
    const saved = foods.find((f) => f.id === r.food.id);
    if (saved) setPicking({ food: saved });
    else setReview({ food: r.food, missing: r.missing, title: 'Controlla il prodotto' });
  };

  const insertText = () => {
    if (!text.trim()) return;
    if (text.length > 400) return toast('Inserisci al massimo 400 caratteri alla volta.', true);
    if (!foodRequests(text,foods).length) return toast('Scrivi il nome di un alimento.',true);
    setVoiceChoices(text);
  };

  const tabBtn = (t: Tab, label: string, Icon: typeof Star) => (
    <button
      onClick={() => setTab(t)}
      aria-pressed={tab === t}
      className={`min-w-[72px] flex-1 min-h-24 rounded-3xl border-2 text-[11px] font-bold flex flex-col justify-center items-center gap-2 text-center ${tab === t ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300' : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'}`}
    >
      <Icon size={28} /> {label}
    </button>
  );

  const foodRow = (f: Food, extra?: string, onClick?: () => void) => (
    <button key={f.id} onClick={onClick || (() => setPicking({ food: f }))} className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{f.name}</div>
        <div className="text-[11px] text-neutral-400 truncate">
          {f.brand ? `${f.brand} · ` : ''}
          {f.kcal} kcal/100g{f.cookedFactor ? ' crudo' : ''} · P {f.pro} · C {f.carbs} · G {f.fats}{f.source === 'usda' ? ' · USDA' : ''}
          {extra ? ` · ${extra}` : ''}
        </div>
      </div>
      <PlusCircle size={20} className="text-blue-500 shrink-0" />
    </button>
  );

  return (
    <div ref={sheet} data-meal-sheet className="fixed inset-0 z-40 bg-neutral-100 dark:bg-neutral-950 overflow-y-auto">
      <div className="meal-content max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3">
          <button aria-label={adding ? 'Torna al pasto' : 'Indietro'} onClick={() => adding ? changeView(false) : onClose()} className="w-10 h-10 shrink-0 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-extrabold text-lg">
              {adding ? `Aggiungi a ${info.label.toLowerCase()}` : info.label}
            </h2>
            <p className="text-xs text-neutral-400">{dayLabel}</p>
          </div>
          {adding && <div className="ml-auto text-right">
            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{total.kcal} kcal</div>
            <div className="text-[11px] text-neutral-400">C {total.carbs} · P {total.pro} · G {total.fats}</div>
          </div>}
        </div>

        {!adding && <>
        <MealSummary emoji={info.emoji} total={total} />
        <section aria-label="Alimenti del pasto" className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 p-3">
          {items.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">Ancora nessun alimento in questo pasto.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((it) => {
                const food = foods.find((f) => f.id === it.foodId);
                return (
                  <SwipeFoodRow key={it.id} id={it.id} name={it.name} open={openSwipe === it.id}
                    onOpen={(open) => setOpenSwipe(open ? it.id : null)} onRemove={() => { setOpenSwipe(null); onRemove(it.id); }}>
                    <button
                      type="button"
                      aria-label={`Modifica ${it.name}, ${it.label}, ${it.kcal} kcal`}
                      disabled={!food}
                      onClick={() => { if (food) { setOpenSwipe(null); setPicking({ food, initial: { mode: it.mode, qty: it.qty, cooked: it.cooked, cookingYield: it.cookingYield }, itemId: it.id }); } }}
                      className="flex flex-1 min-w-0 items-center justify-between gap-2 text-left py-1 disabled:cursor-default"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold truncate">{it.name}</span>
                        <span className="block text-[11px] text-neutral-400">{it.label}</span>
                      </span>
                      <span className="text-sm font-bold whitespace-nowrap">{it.kcal} kcal</span>
                    </button>
                  </SwipeFoodRow>
                );
              })}
            </ul>
          )}
        </section>
        <MealProgress total={total} goals={data.goals} />
        </>}

        {adding && <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-800 p-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Modalit? di inserimento">
            {tabBtn('cerca', 'Ricerca', Search)}
            {tabBtn('foto', 'Foto', Camera)}
            {tabBtn('barcode', 'Codice a barre', Barcode)}
            {tabBtn('voce', 'Voce/Testo', MessageSquare)}
          </div>
          {tab === 'foto' && <FoodPhoto onRecognised={names => {setText(names.join('\n'));setTab('voce');toast('Controlla i nomi e indica i grammi di ogni alimento.');}} />}
          {tab === 'voce' && <VoiceInput text={text} onText={setText} onInsert={() => void insertText()} busy={false} onError={message => toast(message,true)} placeholder={prompt} multiline />}
          {tab === 'cerca' && <div className="flex gap-2 items-center rounded-2xl border-2 border-blue-500 px-3 py-1">
            <Search size={20} className="text-blue-500 shrink-0"/>
            <input value={query} aria-label="Cerca alimenti" placeholder={prompt} onChange={event => {setQuery(event.target.value);setOnline(null);setUsda(null);}} className="min-w-0 w-full bg-transparent py-3 text-sm outline-none"/>
          </div>}
          {tab === 'cerca' && !query.trim() && <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold flex items-center gap-2"><Star size={16}/>Alimenti</span>
            <select aria-label="Elenco alimenti" value={list} onChange={event => setList(event.target.value as 'frequenti' | 'tutti')} className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-3 text-sm font-bold"><option value="frequenti">Frequenti</option><option value="tutti">Tutti gli alimenti</option></select>
          </div>}

          {tab === 'cerca' && !query.trim() && list === 'frequenti' &&
            (frequent.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">Qui compariranno gli alimenti che usi più spesso a {info.label.toLowerCase()}, con un + per aggiungerli con un tocco.</p>
            ) : (
              <div className="space-y-1">
                {last && (
                  <button
                    onClick={() => onAddItems(last.items)}
                    className="w-full text-left rounded-2xl border border-gold-400/50 bg-gold-400/10 px-3 py-2.5 mb-1"
                  >
                    <div className="text-sm font-extrabold text-blue-600 dark:text-gold-400">
                      ↻ Ripeti {info.label.toLowerCase()} di {longLabel(last.day).split(' ').slice(0, 3).join(' ')} · {lastKcal} kcal
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">{last.items.map((i) => `${i.name.split(' (')[0]} ${i.label}`).join(' + ')}</div>
                  </button>
                )}
                {frequent.map((fr) => (
                  <div key={fr.food.id} className="flex items-center gap-1 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                    <button
                      onClick={() => setPicking({ food: fr.food, initial: { mode: fr.last.mode, qty: fr.last.qty, cooked: fr.last.cooked, cookingYield: fr.last.cookingYield } })}
                      className="flex-1 min-w-0 text-left px-3 py-2.5"
                    >
                      <div className="text-sm font-semibold truncate">{fr.food.name}</div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {fr.last.label} · {fr.last.kcal} kcal · usato {fr.count}×
                      </div>
                    </button>
                    {/* Il + aggiunge subito la stessa quantita' dell'ultima volta; toccando il nome si cambia la quantita'. */}
                    <button
                      aria-label={`Aggiungi ${fr.food.name} ${fr.last.label}`}
                      onClick={() => onAdd(fr.food, { mode: fr.last.mode, qty: fr.last.qty, cooked: fr.last.cooked, cookingYield: fr.last.cookingYield })}
                      className="shrink-0 w-11 h-11 mr-1 rounded-2xl bg-blu text-white flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            ))}

          {tab === 'cerca' && (query.trim() || list === 'tutti') && (
            <div className="space-y-2">
              <button onClick={searchOnline} disabled={busy} className="w-full bg-blu text-white text-xs font-bold rounded-2xl px-4 py-3 disabled:opacity-50">{busy ? 'Cerco?' : 'Cerca prodotti'}</button>
              <button onClick={searchGeneric} disabled={usdaBusy || busy} className="w-full rounded-2xl py-2.5 px-3 bg-blu text-white text-xs font-bold disabled:opacity-50">
                {usdaBusy ? 'Cerco su USDA e traduco…' : 'Cerca su USDA (alimenti generici)'}
              </button>
              <p className="text-[11px] text-neutral-500 px-1">Scrivi in italiano: per esempio petto di tacchino, avena o macinato di vitello. Controlli la scheda prima di salvarla.</p>
              {usda && (
                <div className="space-y-2 border border-gold-500/30 rounded-2xl p-2">
                  <div className="text-xs font-extrabold px-1">Alimenti USDA ({usda.foods.length})</div>
                  {usda.note && <p className="text-xs text-gold-600 dark:text-gold-400 px-1">{usda.note}</p>}
                  {!usda.foods.length && <p className="text-xs text-neutral-500 px-1">Nessuna voce corrispondente. Prova un nome più semplice o inserisci i valori dall'etichetta.</p>}
                  {usda.foods.map((f) => foodRow(f, undefined, () => {
                    const saved = foods.find((item) => item.id === f.id);
                    if (saved) setPicking({ food: saved });
                    else setReview({ food: f, missing: [], title: 'Controlla e salva alimento USDA' });
                  }))}
                  <p className="text-[10px] text-neutral-500 px-1">{usda.dataset}. Valori per 100 g; nomi tradotti automaticamente. Scegli la variante cruda o cotta corretta.</p>
                </div>
              )}
              <div className="text-[11px] font-bold text-neutral-400 px-1 pt-1">I tuoi alimenti e quelli di base</div>
              {local.length ? local.map((f) => foodRow(f)) : <p className="text-xs text-neutral-400 px-1">Non presenti tra i tuoi alimenti: cerca su USDA o tra i prodotti.</p>}
              {online && (
                <>
                  <div className="text-[11px] font-bold text-neutral-400 px-1 pt-2">Open Food Facts ({online.length})</div>
                  {online.length === 0 && <p className="text-xs text-neutral-400 px-1">Nessun prodotto trovato.</p>}
                  {online.map((r) =>
                    foodRow(r.food, [plausibilityWarnings(r.food).length && '⚠ valori da controllare', r.italy && 'venduto in Italia', r.missing.length ? `mancano ${r.missing.join(', ')}` : '', r.food.pieceWeight ? `porzione ${r.food.pieceWeight}g` : ''].filter(Boolean).join(' · '), () => openResult(r)),
                  )}
                  <p className="text-[10px] text-neutral-400 px-1">Dati prodotti: Open Food Facts, licenza ODbL.</p>
                </>
              )}
            </div>
          )}

          {tab === 'barcode' && (
            <div className="space-y-2">
              <p className="text-xs text-neutral-500">Inquadra il codice con la fotocamera oppure scrivi il numero sotto il codice a barre.</p>
              <button onClick={() => setScanning(true)} className="w-full flex items-center justify-center gap-2 bg-blu hover:brightness-110 text-white text-sm font-bold rounded-2xl py-3">
                <Camera size={18} /> Scansiona con la fotocamera
              </button>
              <div className="flex gap-2">
                <input
                  value={code}
                  inputMode="numeric"
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCode()}
                  placeholder="Es. 5201054017418"
                  className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 text-sm"
                />
                <button onClick={() => searchCode()} disabled={busy} className="bg-blu text-white text-xs font-bold rounded-2xl px-4 disabled:opacity-50">
                  {busy ? 'Cerco…' : 'Cerca'}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400">Dati prodotti: Open Food Facts, licenza ODbL.</p>
            </div>
          )}

          <button onClick={() => setReview({food:emptyFood(),missing:[],title:'Nuovo alimento'})} className="text-xs font-bold text-blue-500 py-2">Crea alimento manualmente</button>

        </section>}
      </div>

      {<div className="meal-add-footer fixed bottom-0 inset-x-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 px-4 pt-3">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => changeView(!adding)} className="add-button w-full rounded-2xl bg-blu text-white font-extrabold flex items-center justify-center gap-2">
            {adding ? 'Fine' : <><PlusCircle size={24} /> Aggiungi altro</>}
          </button>
        </div>
      </div>}

      {voiceChoices && <FoodChoices text={voiceChoices} foods={foods} mealLabel={info.label} onClose={() => setVoiceChoices(null)} onConfirm={entries => {
        entries.filter(e => e.food.source !== 'base' || JSON.stringify(e.food) !== JSON.stringify(foods.find(food => food.id === e.food.id))).forEach(e => onSaveFood(e.food));
        onAddItems(entries.map(e => buildItem(e.food,e.portion)));
        setVoiceChoices(null);setText('');changeView(false);
      }} />}

      {scanning && (
        <BarcodeScanner
          onClose={() => setScanning(false)}
          onDetected={(c) => {
            setScanning(false);
            setCode(c);
            searchCode(c);
          }}
        />
      )}
      {review && (
        <FoodReview
          food={review.food}
          missing={review.missing}
          title={review.title}
          onClose={() => setReview(null)}
          onSave={(f) => {
            onSaveFood(f);
            setPicking({ food: f, ...review.back });
            setReview(null);
          }}
        />
      )}
      {picking && (
        <PortionEditor
          food={picking.food}
          alternatives={foods}
          initial={picking.initial}
          confirmLabel={picking.itemId ? 'Salva modifica' : `Aggiungi a ${info.label.toLowerCase()}`}
          onClose={() => setPicking(null)}
          onEditFood={(food, portion) => {
            setReview({ food, missing: [], title: 'Correggi i valori', back: { initial: portion, itemId: picking.itemId } });
            setPicking(null);
          }}
          onConfirm={(p, food) => {
            if (food.id === picking.food.id && (food.pieceWeight !== picking.food.pieceWeight || food.servingGrams !== picking.food.servingGrams || food.servingUnits !== picking.food.servingUnits || food.unitName !== picking.food.unitName || food.unitPlural !== picking.food.unitPlural)) onSaveFood(food);
            if (picking.itemId) onUpdate(picking.itemId, food, p);
            else onAdd(food, p);
            setPicking(null);
            changeView(false);
          }}
        />
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Food } from '../types';
import { foodRequests, matchingFoods } from '../lib/foodChoices';
import { macrosFor, portionLabel, rawGrams, type Portion } from '../lib/nutrition';
import { searchByName, type OffResult } from '../lib/off';
import { searchUsda } from '../lib/usda';
import { aiEntries, askAi } from '../lib/ai';
import { useAndroidBack } from '../native/navigation';
import { PortionEditor } from './PortionEditor';
import { FoodReview } from './FoodReview';
import type { ParsedEntry } from '../lib/parser';

export function FoodChoices({ text, foods, mealLabel, onClose, onConfirm }: {
  text: string; foods: Food[]; mealLabel: string; onClose: () => void;
  onConfirm: (entries: ParsedEntry[]) => void;
}) {
  const [requests]=useState(()=>foodRequests(text,foods));
  const [entries,setEntries]=useState<(ParsedEntry|null)[]>(()=>requests.map(()=>null));
  const [active,setActive]=useState(0), [query,setQuery]=useState(requests[0]?.query||'');
  const [candidates,setCandidates]=useState<OffResult[]>([]),[searching,setSearching]=useState(false),[error,setError]=useState('');
  const [aiState,setAiState]=useState<'idle'|'busy'|'error'>('idle');
  const [picking,setPicking]=useState<Food|null>(null),[review,setReview]=useState<OffResult|null>(null);
  const generation=useRef(0);
  useAndroidBack(onClose,45);
  const localResult=(food: Food): OffResult=>({food,missing:[],italy:false,completeness:1});
  const load=async(term: string)=>{
    const current=++generation.current;
    const local=matchingFoods(term,foods);setCandidates(local.map(localResult));setError('');
    if(term.trim().length<2){setSearching(false);return;}
    setSearching(true);
    const offQuery=/^cornett[oi]$/i.test(term.trim())?'cornetto algida':term;
    const jobs: Promise<OffResult[]>[]=[searchByName(offQuery).then(list=>list.filter(result=>matchingFoods(term,[result.food]).length))];
    if(!local.length && !/\balgida\b/i.test(term)) jobs.push(searchUsda(term).then(result=>
      matchingFoods(term,result.foods.map(food=>({...food,aliases:[]}))).map(localResult)));
    const results=await Promise.allSettled(jobs);
    if(generation.current!==current)return;
    const remote=results.flatMap(result=>result.status==='fulfilled'?result.value:[]);
    const seen=new Set(local.map(f=>f.id));
    setCandidates([...local.map(localResult),...remote.filter(result=>{if(seen.has(result.food.id))return false;seen.add(result.food.id);return true;})]);
    if(results.some(result=>result.status==='rejected')) setError('Una fonte non ha risposto. Puoi scegliere una voce disponibile o riprovare.');
    setSearching(false);
    // Nessuna voce nei database: si chiede subito la stima all'AI, sempre da confermare.
    if(!local.length&&!remote.length) void estimate(term,current);
  };
  /** Valori per 100 g stimati dall'AI (crudo/cotto come scritto): voce indicativa, mai scelta da sola. */
  const estimate=async(term: string,current=generation.current)=>{
    setAiState('busy');
    try{
      const request=requests[active];
      const answer=await askAi(`${request?.grams?`${request.grams} g di `:request?.pieces?`${request.pieces} `:''}${term}`);
      if(generation.current!==current)return;
      const found=aiEntries(answer,foods).map(entry=>localResult({...entry.food,aliases:[term]}));
      setCandidates(list=>{const seen=new Set(list.map(r=>r.food.id));return [...list,...found.filter(r=>!seen.has(r.food.id))];});
      setAiState(found.length?'idle':'error');
    }catch{ if(generation.current===current)setAiState('error'); }
  };
  useEffect(()=>{setAiState('idle');setQuery(requests[active]?.query||'');void load(requests[active]?.query||'');return()=>{generation.current++;};},[active]);
  const choose=(result: OffResult)=>{
    const saved=foods.find(f=>f.id===result.food.id);
    if(saved)setPicking(saved);
    else if(result.missing.length)setReview(result);
    else setPicking(result.food);
  };
  const ready=entries.length>0&&entries.every(Boolean);
  const total=entries.reduce((sum,entry)=>sum+(entry?macrosFor(entry.food,rawGrams(entry.food,entry.portion)).kcal:0),0);
  const pieces=requests[active]?.pieces;
  const initial: Portion={mode:pieces&&picking?.pieceWeight?'pieces':'grams',qty:requests[active]?.grams||(pieces&&picking?.pieceWeight?pieces:0),cooked:/\bcott[oaie]\b/i.test(requests[active]?.query||'')&&!!picking?.cookedFactor};
  return <div className="safe-sheet-overlay fixed inset-0 z-[45] bg-black/70 flex items-end sm:items-center justify-center">
    <section role="dialog" aria-modal="true" aria-label="Scegli gli alimenti" className="ios-sheet safe-bottom-sheet w-full sm:max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-extrabold">Scegli gli alimenti · {mealLabel}</h3><button onClick={onClose} aria-label="Chiudi scelta alimenti" className="p-2"><X size={22}/></button></div>
      <div className="space-y-2">
        {requests.map((request,index)=><button key={index} onClick={()=>setActive(index)} className={`w-full text-left rounded-2xl border-2 p-3 ${active===index?'border-blue-500':'border-neutral-200 dark:border-neutral-700'}`}>
          <div className="font-bold text-sm">{entries[index]?.food.name||request.query}</div>
          <div className="text-xs text-neutral-500">{entries[index]?portionLabel(entries[index]!.food,entries[index]!.portion):request.grams?`${request.grams} g · scegli il tipo`:request.pieces?`${request.pieces} pezzi · scegli il tipo`:'Scegli il tipo e indica il peso'}</div>
        </button>)}
      </div>
      {active>=0&&!!requests.length&&<>
        <form onSubmit={event=>{event.preventDefault();setAiState('idle');void load(query);}} className="flex gap-2">
          <input aria-label="Cerca corrispondenze" value={query} onChange={event=>setQuery(event.target.value)} className="min-w-0 flex-1 rounded-2xl p-3 bg-neutral-100 dark:bg-neutral-800 text-sm"/>
          <button aria-label="Cerca corrispondenze" className="p-3 rounded-2xl bg-blu text-white"><Search size={20}/></button>
        </form>
        <p className="text-sm font-bold">Quale alimento intendi?</p>
        {searching&&<p role="status" className="text-xs text-blue-500">Cerco anche nei database…</p>}
        {error&&<p role="alert" className="text-xs text-amber-600 dark:text-amber-400">{error}</p>}
        <div className="space-y-2">
          {candidates.map(result=><button key={result.food.id} data-food-choice={result.food.id} onClick={()=>choose(result)} className="w-full text-left rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3 space-y-1">
            <div className="text-sm font-bold">{result.food.name}{result.food.brand?` · ${result.food.brand}`:''}</div>
            <div className="text-xs text-neutral-500">{result.food.kcal} kcal / 100 g · {result.food.source==='ai'&&!foods.some(f=>f.id===result.food.id)?'Stima AI · valori indicativi':foods.some(f=>f.id===result.food.id)?result.food.source==='base'||result.food.source==='usda'?'Catalogo':'I tuoi alimenti':result.food.source==='off'?'Open Food Facts':'USDA'}{result.missing.length?' · valori da completare':''}</div>
          </button>)}
          {aiState==='busy'&&<p role="status" className="text-xs text-blue-500">Non è nei database: chiedo una stima all'AI…</p>}
          {!searching&&aiState!=='busy'&&!candidates.length&&<p className="text-sm text-neutral-500">Nessuna corrispondenza{aiState==='error'?" e l'AI non ha risposto":''}. Prova un nome diverso o la marca.</p>}
          {!searching&&aiState!=='busy'&&query.trim().length>=2&&!candidates.some(r=>r.food.source==='ai'&&!foods.some(f=>f.id===r.food.id))&&<button onClick={()=>void estimate(query)} className="w-full text-left text-sm font-bold text-blue-500 p-1">Non c'è? Stima i valori con l'AI</button>}
        </div>
      </>}
      <button disabled={!ready} onClick={()=>ready&&onConfirm(entries as ParsedEntry[])} className="add-button w-full rounded-2xl bg-blu text-white font-extrabold disabled:opacity-40">{ready?`Aggiungi a ${mealLabel.toLowerCase()} · ${total} kcal`:'Scegli alimenti e quantità'}</button>
      {picking&&<PortionEditor key={picking.id} food={picking} initial={entries[active]?.food.id===picking.id?entries[active]!.portion:initial} alternatives={foods} confirmLabel="Conferma alimento" onClose={()=>setPicking(null)} onConfirm={(portion,food)=>{
        const updated=[...entries];updated[active]={food,portion,qtyGiven:true};setEntries(updated);setPicking(null);
        setActive(updated.findIndex(entry=>!entry));
      }} />}
      {review&&<FoodReview food={review.food} missing={review.missing} title="Completa i valori del prodotto" onClose={()=>setReview(null)} onSave={food=>{setReview(null);setPicking(food);}}/>}
    </section>
  </div>;
}

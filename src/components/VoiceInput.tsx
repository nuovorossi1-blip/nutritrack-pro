import { useAndroidBack } from '../native/navigation';
import { Mic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
import { isAndroidApp, SpeechInput } from '../native/android';
import { DENIED_HELP } from '../lib/permissions';

type SpeechResult = { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> };
interface BrowserRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: () => void;
  onresult: (event: SpeechResult) => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  start(): void;
  stop(): void;
  abort(): void;
}
type Session = { stopped: boolean; cancelled: boolean; stop?: () => void; cancel?: () => void; timeout?: ReturnType<typeof setTimeout> };

export function VoiceInput({ text, onText, onInsert, busy, onError, placeholder = 'Cosa hai mangiato?', multiline = false }: {
  text: string; onText: (text: string) => void; onInsert: () => void;
  busy: boolean; onError: (message: string) => void;
  placeholder?: string; multiline?: boolean;
}) {
  const [phase, setPhase] = useState<'idle' | 'starting' | 'listening' | 'finishing'>('idle');
  const session = useRef<Session | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const active = phase === 'starting' || phase === 'listening';

  useAndroidBack(() => {
    const current = session.current;
    if (current) { current.stopped = true; setPhase('finishing'); current.stop?.(); }
  }, 90, active);

  useEffect(() => {
    const showControls = () => {
      if (document.activeElement === input.current) controls.current?.scrollIntoView({ block: 'center' });
    };
    const cancel = () => {
      const current = session.current;
      if (current) { current.cancelled = true; clearTimeout(current.timeout); current.cancel?.(); }
      session.current = null;
      setPhase('idle');
    };
    const hidden = () => { if (document.hidden) cancel(); };
    document.addEventListener('visibilitychange', hidden);
    window.visualViewport?.addEventListener('resize', showControls);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      window.visualViewport?.removeEventListener('resize', showControls);
      cancel();
    };
  }, []);

  const toggle = async () => {
    if (session.current) {
      const current = session.current;
      if (current.stopped) return;
      current.stopped = true;
      setPhase('finishing');
      current.stop?.();
      return;
    }
    input.current?.blur();
    controls.current?.scrollIntoView({ block: 'center' });
    const current: Session = { stopped: false, cancelled: false };
    session.current = current;
    setPhase('starting');
    const live = () => session.current === current && !current.cancelled;
    const finish = () => {
      clearTimeout(current.timeout);
      if (session.current === current) { session.current = null; setPhase('idle'); }
    };
    const report = (message: string) => { if (live() && !current.stopped) onError(message); };

    if (isAndroidApp()) {
      const listeners: PluginListenerHandle[] = [];
      try {
        const capabilities = await SpeechInput.getCapabilities().catch(() => {
          throw new Error('Aggiorna NutriTrack per usare il nuovo microfono.');
        });
        if (!live() || current.stopped) return;
        if (!capabilities.inline || !capabilities.available) throw new Error('Attiva il servizio vocale nelle impostazioni del telefono.');
        listeners.push(await SpeechInput.addListener('text', ({ text }) => { if (live()) onText(text); }));
        listeners.push(await SpeechInput.addListener('state', ({ listening }) => {
          if (live()) setPhase(listening && !current.stopped ? 'listening' : 'finishing');
        }));
        if (!live() || current.stopped) return;
        current.stop = () => { void SpeechInput.stop().catch(() => { void SpeechInput.cancel().catch(() => {}); finish(); }); };
        current.cancel = () => { void SpeechInput.cancel().catch(() => {}); };
        const result = await SpeechInput.start();
        if (live() && result.text.trim()) onText(result.text);
      } catch (error) {
        if ((error as { code?: string }).code !== 'CANCELLED') report((error as Error).message || 'Microfono non disponibile.');
      } finally {
        finish();
        await Promise.all(listeners.map((listener) => listener.remove().catch(() => {})));
      }
      return;
    }

    try {
      const w = window as unknown as { SpeechRecognition?: new () => BrowserRecognition; webkitSpeechRecognition?: new () => BrowserRecognition };
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) throw new Error('Dettatura non disponibile in questo browser.');
      const recognition = new Ctor();
      recognition.lang = 'it-IT';
      recognition.interimResults = true;
      recognition.continuous = false;
      current.stop = () => {
        try {
          recognition.stop();
          current.timeout = setTimeout(() => { recognition.abort(); finish(); }, 3000);
        } catch { recognition.abort(); finish(); }
      };
      current.cancel = () => recognition.abort();
      recognition.onstart = () => { if (live() && !current.stopped) setPhase('listening'); };
      recognition.onresult = ({ results }) => {
        if (live()) onText(Array.from(results, (result) => result[0].transcript).join(' '));
      };
      recognition.onend = finish;
      recognition.onerror = ({ error }) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') report(DENIED_HELP);
        else if (error === 'no-speech') report('Non ho sentito niente: riprova.');
        else if (error !== 'aborted') report('Microfono non disponibile.');
        finish();
      };
      recognition.start();
    } catch (error) { report((error as Error).message); finish(); }
  };

  useEffect(() => {
    const element=input.current;
    if(!element) return;
    element.style.height='auto';
    element.style.height=`${Math.min(element.scrollHeight+2,128)}px`;
  },[text]);

  return (
    <div ref={controls} className="mt-3 space-y-2.5">
      <div className="relative">
      <textarea ref={input} value={text} onChange={(event) => onText(event.target.value)}
        onFocus={() => requestAnimationFrame(() => controls.current?.scrollIntoView({ block: 'center' }))}
        onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !multiline) { event.preventDefault(); if (phase === 'idle') onInsert(); } }}
        placeholder={placeholder} rows={multiline ? 3 : 1}
        className="block w-full resize-none overflow-y-auto leading-6 bg-neutral-900/80 placeholder-neutral-400 text-base rounded-2xl pl-4 pr-14 py-3 border border-blue-700/50 focus:border-blue-400 outline-none" />
        <button type="button" onClick={() => void toggle()} disabled={busy || phase === 'finishing'}
          aria-label={active ? 'Ferma microfono' : 'Attiva microfono'} aria-pressed={active}
          className={`absolute right-2 bottom-1 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-60 ${active ? 'bg-red-600 text-white ring-4 ring-red-500/25' : 'text-neutral-300 hover:bg-neutral-700'}`}>
          <Mic size={23} aria-hidden="true" />
        </button>
      </div>
        <button onClick={onInsert} disabled={busy || phase !== 'idle' || !text.trim()}
          className="w-full min-h-11 bg-blu hover:brightness-110 disabled:opacity-50 rounded-full px-4 py-2.5 font-bold">
          {busy ? 'Leggo…' : 'Inserisci'}
        </button>
      <p role="status" className="sr-only">
        {phase === 'starting' ? 'Avvio microfono…' : phase === 'listening' ? 'Microfono acceso' : phase === 'finishing' ? 'Microfono spento · completo il testo' : 'Microfono spento'}
      </p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import App from './App';
import type { AppData } from './types';
import { AuthScreen } from './components/AuthScreen';
import { loadCloud, saveDiff, supabase } from './lib/cloud';
import { LOCAL_KEY, hasLocalData, loadData } from './lib/store';

// Con Supabase configurato: prima il login, poi i dati dell'utente dal cloud.
// Senza Supabase (vecchia modalita' sul PC): app con i dati solo nel browser.
export default function Root() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) return <App />;
  if (session === undefined) return <Splash text="Caricamento…" />;
  if (recovery || !session) return <AuthScreen recovery={recovery} onPasswordChanged={() => setRecovery(false)} />;
  return <UserApp key={session.user.id} session={session} />;
}

function Splash({ text, error }: { text: string; error?: boolean }) {
  return <div className={`min-h-screen flex items-center justify-center text-sm font-semibold ${error ? 'text-red-500' : 'text-neutral-400'}`}>{text}</div>;
}

function UserApp({ session }: { session: Session }) {
  const userId = session.user.id;
  const key = `${LOCAL_KEY}:${userId}`;
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cloud = await loadCloud(userId);
        if (cloud) return alive && setData(cloud);
        // Primo accesso: si portano nel cloud i dati gia' presenti su questo dispositivo (fase 1), una volta sola.
        const start = hasLocalData(key) ? loadData(key) : hasLocalData() ? loadData() : loadData(key);
        await saveDiff(userId, null, start);
        if (hasLocalData()) localStorage.removeItem(LOCAL_KEY);
        if (alive) setData(start);
      } catch (e) {
        // Senza rete: si usa la copia locale dell'utente, il salvataggio riprova alla prossima modifica.
        if (alive) {
          if (hasLocalData(key)) setData(loadData(key));
          else setError((e as Error).message);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, key]);

  if (error) return <Splash text={`${error}. Riprova fra poco.`} error />;
  if (!data) return <Splash text="Carico i tuoi dati…" />;
  return <App initial={data} storageKey={key} userId={userId} email={session.user.email} onLogout={() => supabase?.auth.signOut()} />;
}

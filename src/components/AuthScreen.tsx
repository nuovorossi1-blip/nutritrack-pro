import { Flame } from 'lucide-react';
import { useState } from 'react';
import { supabase, TERMS_VERSION } from '../lib/cloud';
import { LegalModal } from './Legal';
import { AndroidDownloadBanner } from './AndroidTools';

type Mode = 'accedi' | 'registrati' | 'dimenticata' | 'inviata' | 'nuova-password';

const input = 'w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-sm';

function italiano(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Email o password sbagliate.';
  if (/email not confirmed/i.test(msg)) return "Email non ancora confermata: apri il link che ti abbiamo mandato (controlla anche lo spam).";
  if (/already registered|already been registered/i.test(msg)) return 'Questa email è già registrata: accedi o recupera la password.';
  if (/rate limit|too many/i.test(msg)) return 'Troppi tentativi: riprova fra qualche minuto.';
  if (/password should be at least/i.test(msg)) return 'La password deve avere almeno 8 caratteri.';
  if (/sending.*email|smtp|email address .* not authorized/i.test(msg)) return "Non riesco a mandare l'email di conferma in questo momento: riprova più tardi.";
  return msg;
}

interface Props {
  /** true quando si arriva dal link "nuova password" della email. */
  recovery?: boolean;
  onPasswordChanged?: () => void;
}

export function AuthScreen({ recovery, onPasswordChanged }: Props) {
  const [mode, setMode] = useState<Mode>(recovery ? 'nuova-password' : 'accedi');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [terms, setTerms] = useState(false);
  const [health, setHealth] = useState(false);
  const [legal, setLegal] = useState<'privacy' | 'termini' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await fn();
    } catch (e) {
      setError(italiano((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const redirect = window.location.origin;

  const submit = () =>
    run(async () => {
      if (!supabase) throw new Error('Login non configurato');
      const mail = email.trim().toLowerCase();
      if (mode === 'accedi') {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
        if (error) throw error;
      } else if (mode === 'registrati') {
        if (password.length < 8) throw new Error('La password deve avere almeno 8 caratteri.');
        if (password !== password2) throw new Error('Le due password non coincidono.');
        if (!terms || !health) throw new Error('Per registrarti devi accettare privacy, condizioni d’uso e il trattamento dei dati sulla salute.');
        const now = new Date().toISOString();
        const { error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: { emailRedirectTo: redirect, data: { accepted_terms_at: now, terms_version: TERMS_VERSION, health_consent_at: now } },
        });
        if (error) throw error;
        setMode('inviata');
      } else if (mode === 'dimenticata') {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo: redirect });
        if (error) throw error;
        setInfo('Se l’email è registrata ti abbiamo mandato il link per scegliere una nuova password.');
      } else if (mode === 'nuova-password') {
        if (password.length < 8) throw new Error('La password deve avere almeno 8 caratteri.');
        if (password !== password2) throw new Error('Le due password non coincidono.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        onPasswordChanged?.();
      }
    });

  const resend = () =>
    run(async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: redirect } });
      if (error) throw error;
      setInfo('Email di conferma rimandata.');
    });

  const title = { accedi: 'Accedi', registrati: 'Crea il tuo account', dimenticata: 'Password dimenticata', inviata: 'Controlla la tua email', 'nuova-password': 'Scegli una nuova password' }[mode];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-neutral-950 shadow-md shadow-gold-500/30">
            <Flame size={28} />
          </div>
          <h1 className="text-2xl font-extrabold">NutriTrack PRO</h1>
          <p className="text-xs text-neutral-400">Calorie e macro dei tuoi pasti, giorno per giorno</p>
        </div>

        <AndroidDownloadBanner />
        <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/70 dark:border-neutral-700 p-5 space-y-3">
          <h2 className="font-extrabold text-lg">{title}</h2>

          {mode === 'inviata' ? (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Ti abbiamo mandato un link di conferma a <b>{email}</b>. Aprilo per attivare l'account, poi torna qui e accedi. Se non arriva, controlla nello spam.
              </p>
              <button disabled={busy} onClick={resend} className="w-full rounded-2xl py-3 text-sm font-bold bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50">
                Rimanda l'email
              </button>
              <button onClick={() => setMode('accedi')} className="w-full rounded-2xl py-3 text-sm font-bold bg-blu text-white">
                Ho confermato: accedi
              </button>
            </>
          ) : (
            <>
              {mode !== 'nuova-password' && (
                <input type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
              )}
              {mode !== 'dimenticata' && (
                <input
                  type="password"
                  autoComplete={mode === 'accedi' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'accedi' ? 'Password' : 'Password (almeno 8 caratteri)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && mode === 'accedi' && submit()}
                  className={input}
                />
              )}
              {(mode === 'registrati' || mode === 'nuova-password') && (
                <input type="password" autoComplete="new-password" placeholder="Ripeti la password" value={password2} onChange={(e) => setPassword2(e.target.value)} className={input} />
              )}
              {mode === 'registrati' && (
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <label className="flex gap-2 items-start">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
                    <span>
                      Ho letto e accetto l'{' '}
                      <button type="button" onClick={() => setLegal('privacy')} className="underline font-bold text-blue-600 dark:text-gold-400">
                        informativa privacy
                      </button>{' '}
                      e le{' '}
                      <button type="button" onClick={() => setLegal('termini')} className="underline font-bold text-blue-600 dark:text-gold-400">
                        condizioni d'uso
                      </button>
                      .
                    </span>
                  </label>
                  <label className="flex gap-2 items-start">
                    <input type="checkbox" checked={health} onChange={(e) => setHealth(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
                    <span>Acconsento al trattamento dei miei dati su peso e alimentazione (dati sulla salute) per il funzionamento dell'app.</span>
                  </label>
                </div>
              )}
              {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
              {info && <p className="text-xs font-semibold text-blue-600 dark:text-gold-400">{info}</p>}
              <button disabled={busy} onClick={submit} className="w-full rounded-2xl py-3 text-sm font-bold bg-blu text-white disabled:opacity-50">
                {busy ? 'Attendi…' : { accedi: 'Accedi', registrati: 'Registrati', dimenticata: 'Mandami il link', 'nuova-password': 'Salva la nuova password' }[mode]}
              </button>
            </>
          )}

          <div className="flex flex-col items-center gap-1.5 pt-1 text-xs font-bold text-blue-600 dark:text-gold-400">
            {mode === 'accedi' && (
              <>
                <button onClick={() => setMode('registrati')}>Non hai un account? Registrati</button>
                <button onClick={() => setMode('dimenticata')} className="text-neutral-400">
                  Password dimenticata?
                </button>
              </>
            )}
            {(mode === 'registrati' || mode === 'dimenticata') && <button onClick={() => setMode('accedi')}>Hai già un account? Accedi</button>}
          </div>
        </section>
        <p className="text-center text-[11px] text-neutral-400">
          <button onClick={() => setLegal('privacy')} className="underline">
            Privacy
          </button>{' '}
          ·{' '}
          <button onClick={() => setLegal('termini')} className="underline">
            Condizioni d'uso
          </button>
        </p>
      </div>
      {legal && <LegalModal kind={legal} onClose={() => setLegal(null)} />}
    </div>
  );
}

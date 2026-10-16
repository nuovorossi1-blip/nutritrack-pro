import { useAndroidBack } from '../native/navigation';
import { useEffect, useState } from 'react';
import { App as NativeApp } from '@capacitor/app';
import { ApkUpdater, isAndroidApp, remoteAndroidVersion, type AndroidVersion } from '../native/android';

export function AndroidDownloadBanner() {
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (isAndroidApp()) return;
    let alive = true;
    remoteAndroidVersion().then(() => { if (alive) setAvailable(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  if (isAndroidApp() || !available || dismissed) return null;
  return (
    <div className="rounded-2xl bg-neutral-900 border border-gold-500/50 text-white p-3 flex items-center gap-3">
      <a href="/nutritrack.apk" className="flex-1 font-bold text-sm text-gold-400" download>Scarica NutriTrack per Android</a>
      <button aria-label="Chiudi invito Android" onClick={() => setDismissed(true)} className="px-2 py-1 text-neutral-400">✕</button>
    </div>
  );
}

export function AndroidTools() {
  const [release, setRelease] = useState<AndroidVersion | null>(null);
  const [state, setState] = useState<'ready' | 'permission' | 'downloading' | 'error'>('ready');
  useAndroidBack(() => { if (!release?.mandatory && state !== 'downloading') setRelease(null); }, 100, !!release);
  useEffect(() => {
    if (!isAndroidApp()) return;
    let alive = true;
    const check = async () => {
      try {
        const remote = await remoteAndroidVersion();
        const installed = await ApkUpdater.getCurrentVersion();
        if (alive && remote.versionCode > installed.versionCode) setRelease(remote);
      } catch { /* Nessun aggiornamento disponibile: non bloccare l'accesso al diario. */ }
    };
    void check();
    const listener = NativeApp.addListener('appStateChange', ({ isActive }) => { if (isActive) void check(); });
    return () => { alive = false; void listener?.then((l) => l.remove()); };
  }, []);

  const install = async () => {
    if (!release) return;
    setState('downloading');
    try {
      if (!(await ApkUpdater.canInstallPackages()).allowed) {
        setState('permission'); await ApkUpdater.openInstallSettings(); return;
      }
      await ApkUpdater.downloadAndInstall({ url: release.apkUrl, fileName: `NutriTrack-${release.versionCode}.apk` });
      setState('ready');
    } catch { setState('error'); }
  };

  if (!isAndroidApp() || !release) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Aggiornamento Android" className="safe-sheet-overlay fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <section className="max-w-md w-full rounded-3xl bg-neutral-900 text-white p-5 space-y-3">
        <h2 className="text-xl font-extrabold">NutriTrack {release.version}</h2>
        <p className="text-sm text-neutral-300">{release.notes}</p>
        {state === 'permission' && <p className="text-sm text-gold-400">Consenti a NutriTrack di installare app, poi torna qui e premi “Ho autorizzato”.</p>}
        {state === 'error' && <p role="alert" className="text-sm text-red-400">Download non riuscito. Controlla la connessione e riprova.</p>}
        <button disabled={state === 'downloading'} onClick={install} className="w-full bg-blu rounded-2xl py-3 font-bold disabled:opacity-50">{state === 'downloading' ? 'Download in corso…' : state === 'permission' ? 'Ho autorizzato, aggiorna' : 'Aggiorna app'}</button>
        {!release.mandatory && state !== 'downloading' && <button onClick={() => setRelease(null)} className="w-full py-2 text-sm text-neutral-400">Più tardi</button>}
      </section>
    </div>
  );
}

import { useAndroidBack } from '../native/navigation';
import { Camera, Download, Mic, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DENIED_HELP, permissionState, requestPermission, type Device, type PermState } from '../lib/permissions';
import type { AppData, Goals, Profile } from '../types';
import { ProfileGoals } from './ProfileGoals';
import { deleteMyData } from '../lib/cloud';

interface Props {
  data: AppData;
  onSaveProfile: (p: Profile, g: Goals) => void;
  onImport: (d: AppData) => void;
  onClose: () => void;
  toast: (msg: string, error?: boolean) => void;
  email?: string;
  userId?: string;
  onLogout?: () => void;
}

export function SettingsModal({ data, onSaveProfile, onImport, onClose, toast, email, userId, onLogout }: Props) {
  useAndroidBack(onClose);
  const [perm, setPerm] = useState<Record<Device, PermState>>({ camera: 'unknown', microphone: 'unknown' });
  useEffect(() => {
    Promise.all([permissionState('camera'), permissionState('microphone')]).then(([camera, microphone]) => setPerm({ camera, microphone }));
  }, []);
  const ask = async (d: Device) => {
    const st = await requestPermission(d);
    setPerm((p) => ({ ...p, [d]: st }));
    toast(st === 'granted' ? 'Permesso concesso' : st === 'denied' ? DENIED_HELP : 'Permesso non disponibile su questo dispositivo', st !== 'granted');
  };
  const permRow = (d: Device, label: string, Icon: typeof Camera, use: string) => {
    const st = perm[d];
    const text = { granted: 'Consentito', denied: 'Bloccato', prompt: 'Da consentire', unknown: 'Da verificare', unsupported: 'Non disponibile' }[st];
    const color = st === 'granted' ? 'text-blue-600 dark:text-gold-400' : st === 'denied' ? 'text-red-500' : 'text-neutral-400';
    return (
      <div className="flex items-center gap-3 py-2">
        <Icon size={18} className="text-neutral-400" />
        <div className="flex-1">
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-[11px] text-neutral-400">{use}</div>
        </div>
        <span className={`text-[11px] font-bold ${color}`}>{text}</span>
        {st !== 'granted' && st !== 'unsupported' && (
          <button onClick={() => ask(d)} className="text-xs font-bold rounded-xl px-3 py-1.5 bg-blu text-white">
            Consenti
          </button>
        )}
      </div>
    );
  };
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nutritrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup scaricato');
  };

  const importBackup = (file?: File) => {
    if (!file) return;
    file.text().then((txt) => {
      try {
        const d = JSON.parse(txt) as AppData;
        if (d.version !== 1 || typeof d.days !== 'object') throw new Error();
        onImport(d);
        toast('Backup ripristinato');
        onClose();
      } catch {
        toast('File di backup non valido', true);
      }
    });
  };

  return (
    <div className="safe-sheet-overlay fixed inset-0 z-50 bg-neutral-950/60 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ios-sheet safe-bottom-sheet bg-white dark:bg-neutral-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-extrabold">Profilo e obiettivi</h3>
          <button aria-label="Chiudi" onClick={onClose} className="text-neutral-400 p-1">
            <X size={20} />
          </button>
        </div>
        <ProfileGoals
          profile={data.profile}
          goals={data.goals}
          onSave={(profile, goals) => {
            onSaveProfile(profile, goals);
            toast('Profilo e obiettivi salvati');
            onClose();
          }}
        />

        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <h4 className="text-sm font-extrabold">Permessi</h4>
          {permRow('camera', 'Fotocamera', Camera, 'Per leggere i codici a barre')}
          {permRow('microphone', 'Microfono', Mic, 'Per dettare cosa hai mangiato')}
          {(perm.camera === 'denied' || perm.microphone === 'denied') && <p className="text-[11px] text-red-500 mt-1">{DENIED_HELP}</p>}
        </div>

        {userId && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2">
            <h4 className="text-sm font-extrabold">Account</h4>
            <p className="text-xs text-neutral-500">Accesso come <b>{email}</b>. I dati sono salvati sul tuo account e li ritrovi su ogni dispositivo.</p>
            <div className="flex gap-2">
              <button onClick={onLogout} className="flex-1 text-xs font-bold rounded-xl py-2.5 bg-neutral-100 dark:bg-neutral-800">
                Esci
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm('Cancellare TUTTI i tuoi dati (pasti, alimenti, profilo)? Non si può annullare.')) return;
                  try {
                    await deleteMyData(userId);
                    toast('Dati cancellati');
                    onLogout?.();
                  } catch (e) {
                    toast((e as Error).message, true);
                  }
                }}
                className="flex-1 text-xs font-bold rounded-xl py-2.5 bg-red-600/10 text-red-500"
              >
                Cancella i miei dati
              </button>
            </div>
            <p className="text-[10px] text-neutral-400">Per chiudere anche l'account scrivi a smaugdrago@gmail.com.</p>
          </div>
        )}

        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <h4 className="text-sm font-extrabold">Backup dei dati</h4>
          <p className="text-xs text-neutral-500 mt-1">Scarica una copia dei tuoi dati (file JSON) o ripristinala.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={exportBackup} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl py-2.5 bg-neutral-100 dark:bg-neutral-800">
              <Download size={14} /> Scarica backup
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl py-2.5 bg-neutral-100 dark:bg-neutral-800 cursor-pointer">
              <Upload size={14} /> Ripristina
              <input type="file" accept="application/json" className="hidden" onChange={(e) => importBackup(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

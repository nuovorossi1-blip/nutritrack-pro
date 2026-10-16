import { Download, Upload, X } from 'lucide-react';
import { useState } from 'react';
import type { AppData, Goals } from '../types';

const PRESETS: { label: string; goals: Goals }[] = [
  { label: 'Definizione', goals: { kcal: 1700, carbs: 150, pro: 160, fats: 50 } },
  { label: 'Mantenimento', goals: { kcal: 2100, carbs: 220, pro: 150, fats: 65 } },
  { label: 'Massa', goals: { kcal: 2600, carbs: 320, pro: 170, fats: 70 } },
];

interface Props {
  data: AppData;
  onSaveGoals: (g: Goals) => void;
  onImport: (d: AppData) => void;
  onClose: () => void;
  toast: (msg: string, error?: boolean) => void;
}

export function SettingsModal({ data, onSaveGoals, onImport, onClose, toast }: Props) {
  const [g, setG] = useState<Goals>(data.goals);
  const field = (key: keyof Goals, label: string) => (
    <label className="block">
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={g[key]}
        onChange={(e) => setG({ ...g, [key]: Math.max(0, parseInt(e.target.value) || 0) })}
        className="w-full mt-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold"
      />
    </label>
  );

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
    <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="font-extrabold">Obiettivi giornalieri</h3>
          <button aria-label="Chiudi" onClick={onClose} className="text-slate-400 p-1">
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => setG(p.goals)} className="flex-1 text-xs font-bold rounded-xl py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950">
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {field('kcal', 'Kcal')}
          {field('carbs', 'Carboidrati (g)')}
          {field('pro', 'Proteine (g)')}
          {field('fats', 'Grassi (g)')}
        </div>
        <button
          onClick={() => {
            onSaveGoals(g);
            toast('Obiettivi salvati');
            onClose();
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl py-3"
        >
          Salva obiettivi
        </button>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <h4 className="text-sm font-extrabold">Backup dei dati</h4>
          <p className="text-xs text-slate-500 mt-1">Per ora i dati stanno solo in questo browser. Con il login verranno salvati sul tuo account.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={exportBackup} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl py-2.5 bg-slate-100 dark:bg-slate-800">
              <Download size={14} /> Scarica backup
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl py-2.5 bg-slate-100 dark:bg-slate-800 cursor-pointer">
              <Upload size={14} /> Ripristina
              <input type="file" accept="application/json" className="hidden" onChange={(e) => importBackup(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

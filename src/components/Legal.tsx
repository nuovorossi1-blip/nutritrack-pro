import { useAndroidBack } from '../native/navigation';
import { X } from 'lucide-react';

// Testi di base da far rivedere al titolare: non sono una consulenza legale.
export const PRIVACY = [
  ['Chi tratta i dati', "L'app NutriTrack PRO è gestita da smaugdrago@gmail.com (titolare del trattamento). Per qualsiasi richiesta scrivi a questo indirizzo."],
  ['Quali dati', "Email e password (la password è conservata cifrata), profilo (nome, sesso, età, peso, altezza, livello di attività), obiettivi, pasti e alimenti che inserisci."],
  ['Dati sulla salute', "Peso, alimentazione e obiettivi possono rivelare informazioni sulla salute: li trattiamo solo con il tuo consenso esplicito, dato alla registrazione, e solo per far funzionare l'app."],
  ['Perché', "Solo per calcolare calorie e macro, mostrarti lo storico e salvare i tuoi dati fra un dispositivo e l'altro. Niente pubblicità, niente vendita a terzi."],
  ['Dove', "Database Supabase in Europa (Francoforte); sito su Vercel. Le frasi che scrivi nell'inserimento a parole possono essere inviate a un servizio di intelligenza artificiale (OpenRouter) solo per riconoscere gli alimenti, senza il tuo nome né la tua email. Le foto inviate con Riconosci alimenti sono elaborate tramite OpenRouter per proporre i nomi: devi controllarli e indicare le quantita. L app non salva le foto nel diario. La ricerca dei prodotti usa Open Food Facts."],
  ['Per quanto', "Finché hai l'account. Dalle impostazioni puoi cancellare tutti i tuoi dati in qualsiasi momento; per chiudere anche l'account scrivi all'indirizzo sopra."],
  ['I tuoi diritti', "Accesso, rettifica, cancellazione, limitazione, portabilità (backup scaricabile dalle impostazioni), revoca del consenso e reclamo al Garante per la protezione dei dati personali."],
];

export const TERMS = [
  ['Il servizio', "NutriTrack PRO aiuta a contare calorie e macronutrienti. Le stime (metabolismo, mantenimento, valori degli alimenti, letture dell'AI) sono indicative."],
  ['Non è un consiglio medico', "L'app non sostituisce medico, dietista o nutrizionista. Prima di diete importanti, in gravidanza o con patologie chiedi a un professionista."],
  ['Il tuo account', "Sei responsabile della tua password e dei dati che inserisci. Non usare l'app per scopi illeciti."],
  ['Dati degli alimenti', "I valori provengono da tabelle pubbliche, da Open Food Facts (licenza ODbL) o da stime dell'AI e possono contenere errori: controlla le etichette."],
  ['Modifiche', "Il servizio può cambiare o interrompersi. Se cambiano questi testi te lo chiederemo di nuovo."],
];

export function LegalModal({ kind, onClose }: { kind: 'privacy' | 'termini'; onClose: () => void }) {
  useAndroidBack(onClose, 70);
  const items = kind === 'privacy' ? PRIVACY : TERMS;
  return (
    <div className="safe-sheet-overlay fixed inset-0 z-[70] bg-neutral-950/70 flex items-end sm:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-neutral-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="font-extrabold text-lg">{kind === 'privacy' ? 'Informativa privacy' : "Condizioni d'uso"}</h3>
          <button aria-label="Chiudi" onClick={onClose} className="text-neutral-400 p-1">
            <X size={20} />
          </button>
        </div>
        {items.map(([t, d]) => (
          <div key={t}>
            <div className="text-sm font-bold">{t}</div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{d}</p>
          </div>
        ))}
        <p className="text-[11px] text-neutral-400">Versione del 16 ottobre 2026.</p>
      </div>
    </div>
  );
}

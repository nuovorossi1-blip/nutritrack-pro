# STATO DEL PROGETTO — NutriTrack PRO

> File di memoria AI-OS. Chi apre questo progetto con `/handoff` legge da
> qui. Va **aggiornato** a ogni sessione di lavoro, non accodato all'infinito.
> L'identità del progetto e il percorso di AI-OS stanno in `AIOS_PROJECT.json`.

**Ultimo aggiornamento:** 2026-10-16 — Claude Opus 5.5

Etichette usate in questo file:
`[FACT]` verificato nel codice · `[RICOSTRUITO]` dedotto da indizi ·
`[IGNOTO]` non ricavabile dal repository

---

## 1. Obiettivo finale

Un'app web + APK Android per tenere il conto di calorie e macro dei pasti di
ogni giorno rispetto agli obiettivi, inserendo gli alimenti nel modo più
veloce possibile (a parole, frequenti, ricerca, codice a barre) senza calcoli
a mano crudo/cotto. Ogni utente ha il suo account (registrazione con privacy
e condizioni d'uso + mail di conferma, come il Gestionale Palestra) e il suo
storico per giorno. Online su Vercel + Supabase (account smaugdrago@gmail.com).

---

## 2. Dove siamo adesso

Fase 1 di 4 FATTA (16/10/2026): app React + TypeScript + Vite che gira su
questo PC. Dati salvati nel browser del PC, nessun login ancora.

**Sul PC:** http://127.0.0.1:5180 (icona "NutriTrack PRO" sul Desktop; si avvia
da sola all'accesso a Windows con l'attività pianificata "NutriTrack PRO locale").
**Link di prova:** https://nutritrack.redapp.dev (tunnel Cloudflare 'pc-windows' → questo PC, porta 5180; temporaneo fino a Vercel).

---

## 3. Cosa funziona

- [FACT] Barra dei giorni come PronoBlast (5 giorni, OGGI/IERI, frecce, pallino sui giorni con dati) + calendario per scegliere qualsiasi giorno passato; niente giorni futuri.
- [FACT] Ogni giorno ha i suoi pasti e parte da 0; a mezzanotte, se si guarda "oggi", l'app passa da sola al giorno nuovo (provato simulando le 23:59:30 → 00:00:15). Il giorno prima resta consultabile.
- [FACT] Riepilogo del giorno: anello kcal + carboidrati/proteine/grassi rispetto agli obiettivi.
- [FACT] 4 pasti con dettaglio: aggiungi, modifica quantità (grammi/pezzi, crudo/cotto), elimina.
- [FACT] Inserimento rapido a parole (parole chiave, NON AI) con dettatura: "200g di pasta cotta e 150g di pollo cotto a pranzo" → 95g + 203g crudi, 562 kcal. Parole intere: "panna", "melanzane", "olive" non vengono più scambiate. Numeri a parole ("due uova"). Prima di aggiungere mostra un riepilogo: pasto e quantità si scelgono lì se la frase non li dice (mai indovinati).
- [FACT] Frequenti per pasto calcolati dallo storico vero (conteggio + ultima porzione).
- [FACT] Ricerca per nome su Open Food Facts (passa da /off-search: inoltro di Vite in locale, rewrite in vercel.json online) con prodotti completi e venduti in Italia in cima, schede doppie tolte; ricerca per codice a barre (world.openfoodfacts.org, diretta). Risposte in cache sul dispositivo 7 giorni.
- [FACT] Prima di salvare un prodotto si vedono e correggono i valori (valori mancanti segnalati), peso porzione e "si cuoce?" (pasta/riso/carne/pesce) per pesarlo anche da cotto. Prova: codice 8076800195057 → Spaghetti n.5 Barilla 359 kcal.
- [FACT] Fotocamera: scansione del codice a barre nel browser (ZXing caricato solo all'apertura, EAN-13/8, UPC, Code128), messaggi chiari se il permesso è bloccato. Provato con fotocamera simulata (EAN 8076800195057 → Spaghetti n.5) in locale e su nutritrack.redapp.dev.
- [FACT] Impostazioni → Permessi: stato di fotocamera e microfono, pulsante Consenti (fa comparire la richiesta del browser), istruzioni se bloccati. Dettatura con errori spiegati (permesso negato, nessuna voce).
- [FACT] Inserimento a parole a "pezzi di frase": più alimenti nella stessa frase ("2 uova 100 g di albume e uno yogurt 0" → 2 uova 120 g + albume 100 g + yogurt 0% 1 vasetto 150 g, colazione, 308 kcal). Quantità/«cotto» vanno all'alimento che segue, altrimenti a quello prima; "0%" non è una quantità; "mezzo kg"; nomi di più parole degli alimenti salvati. Se pasto e quantità sono tutti detti aggiunge subito con «Annulla» nell'avviso, altrimenti apre il riquadro di conferma. Le frasi con alimenti sconosciuti passano all'AI (vedi sotto).
- [FACT] AI vera nell'inserimento a parole: se nella frase restano parole che l'elenco non conosce (`unknownWords`), la frase va a POST /api/ai-parse → `server/aiParse.mjs` → OpenRouter `openai/gpt-4o-mini` (~3-6 s, ~0,0003 $ a frase). Chiave SOLO sul server (variabile `OPENROUTER_KEY_NUOVOROSSI1_GMAIL_COM` sul PC, `OPENROUTER_API_KEY` su Vercel), tetti 300 frasi/giorno e 40 per IP (in memoria, si azzerano al riavvio). Il risultato si conferma SEMPRE nel riquadro (badge AI, valori per 100 g); gli alimenti nuovi vengono salvati e la volta dopo si riconoscono senza AI. Provato: "a cena lasagne e un cornetto" → lasagne (porzione 300 g, quantità da scrivere) + 1 cornetto 60 g; poi "un cornetto a merenda" aggiunto subito senza AI. Se l'AI non risponde si usa solo l'elenco locale.
- [FACT] Avviso «⚠ valori da controllare» (`src/lib/plausibility.ts`): kcal oltre 900, macro oltre 100 g, kcal che non tornano con i macro (scarto > 25% e > 40 kcal), «0%» con grassi > 3 g, «magro/light» > 12 g, intervalli tipici per tonno, yogurt, latte, pasta secca, riso, pane, pollo, uova, frutta, bevande (esclusi i piatti misti). Nei risultati di ricerca, nella scheda prodotto e nel riquadro dell'AI; non blocca il salvataggio. Prova "tonno rio mare": 7 schede su 28 segnalate, tutte con dati davvero sbagliati (403/401 kcal; Rio Mare leggero 107 kcal ma i macro danno 167; latte di giumenta 205 kcal ma i macro danno 44); nessun alimento di base segnalato.
- [FACT] Correzione dei valori: nel riquadro dell'avviso istruzioni in 3 passi (valori dall'etichetta / pulsante «Valori tipici dall'AI» che chiede «100 g di <nome> <marca>» e riempie i campi / scegliere un'altra scheda) e, se le kcal non tornano, «Usa N kcal (dai macro)». Dalla schermata della quantità «Correggi i valori per 100 g» anche per alimenti già salvati: dopo il salvataggio si torna alla stessa voce. Provato: tonno 403 → AI 132 kcal (P 29,9, G 1), poi corretto a mano 190 sulla voce già inserita.
- [FACT] Riepilogo come lo screenshot dell'utente del 16/10: titolo «Riepilogo», Mangiate · arco di 270° con Rimanenti (oro, rosso «Oltre») · Bruciate; sotto barre Carboidrati (oro) / Proteine (blu) / Grassi (bianco) con «x / y g». Bruciate scritte a mano per giorno (`data.burned[giorno]`, tocco su «Bruciate»), si sommano alle rimanenti: rimanenti = obiettivo + bruciate − mangiate. Nessun conteggio automatico dell'attività.
- [FACT] Frequenti del pasto: + blu che aggiunge subito stesso alimento e stessa quantità dell'ultima volta (tocco sul nome = cambia quantità) e riquadro «↻ Ripeti <pasto> di <giorno>» che copia l'ultimo pasto dello stesso tipo (`lastMealBefore`). Provato: ieri 60 g riso + 200 g pollo → oggi + riso = 60 g 213 kcal; Ripeti = riso 60 g + pollo 200 g.
- [FACT] Profilo (nome, sesso, età, peso, altezza, attività: sedentario / 1-3 / 3-5 / 6-7 allenamenti / atleta / altro con mantenimento a mano) → metabolismo basale (Mifflin-St Jeor) e mantenimento (× 1,2-1,9), `src/lib/metabolism.ts`. Esempio provato: uomo 35 anni 80 kg 180 cm 1-3 allenamenti → basale 1755, mantenimento 2410.
- [FACT] Obiettivo Dieta (-20%) / Mantenimento / Massa (+10%): calorie e macro suggeriti (proteine 2,2/1,8/2 g per kg, grassi 25%, carboidrati il resto). Calorie modificabili; l'utente scrive due macro e sceglie quale è «auto» (calcolato dalle kcal): 2000 kcal, 200 P, 200 C → grassi 44 g. Avviso se i due macro superano le kcal. Riquadro "Completa il tuo profilo" finché manca; nel riepilogo «Ciao Nome · Dieta».
- [FACT] Crea alimento a mano. Obiettivi con profili rapidi. Backup/ripristino JSON. Tema scuro. Azzera il giorno scelto (con conferma).
- [FACT] Test: 23 test logica (giorni, crudo/cotto, parole, Open Food Facts, storico) ok; tsc ok; build ok; prova completa in Edge senza errori.

## 4. Cosa è in lavorazione

- → niente (fase 1 chiusa)

## 5. Cosa manca ancora

- Fase 2: alimenti sfusi ufficiali CIQUAL tradotti in italiano (oggi 21 alimenti di base del prototipo), USDA come riserva.
- Fase 3: login Supabase (registrazione con privacy/condizioni + mail di conferma), dati per utente con RLS, pubblicazione su Vercel. Account smaugdrago@gmail.com: l'utente lo collega con l'icona "Collega account" (token MAI in chat).
- Fase 4: APK Android auto-aggiornante (modulo AI-OS, come GymBuilder): permessi Android CAMERA e RECORD_AUDIO nel manifest + richiesta in app; ricerca Open Food Facts nell'APK tramite richiesta nativa (niente CORS).
- Vera analisi del piatto da foto con un modello AI (tolta la versione finta).

---

## 6. Problemi aperti

| # | Problema | Da quando | Cosa si è già provato |
|---|---|---|---|
| 1 | Dati solo nel browser del PC: cambiando browser o pulendo i dati del sito si perdono. | 2026-10-16 | Backup JSON nelle impostazioni; si risolve con il login (fase 3). |
| 2 | Molti prodotti Open Food Facts senza peso porzione (es. Fage Total 0 → 100g). | 2026-10-16 | Campo "peso porzione" modificabile prima di salvare. |
| 3 | Valori Open Food Facts a volte poco credibili (es. "tonno rio mare" 403 kcal/100 g). | 2026-10-16 | Avviso «⚠ valori da controllare» aggiunto il 16/10 (vedi sezione 3); i dati restano quelli di OFF, li corregge l'utente. Ordine dei risultati non ancora influenzato dall'avviso. |
| 4 | Dettatura non provabile senza telefono vero (nel browser di prova: "Microfono non disponibile"). | 2026-10-16 | Da provare sul telefono con Chrome. |

## 7. Problemi risolti

> Non cancellare mai questa sezione. Serve a impedire che il prossimo LLM
> rifaccia lo stesso errore. Scrivere **come** è stato risolto, non solo che
> è stato risolto.

| Problema | Causa vera | Soluzione |
|---|---|---|
| Scheda "Foto AI" finta: qualsiasi foto diventava sempre "Pollo, Riso e Verdure" 135 kcal/100g | Gemini aveva simulato l'analisi (funzione `analyzePhotoFood` con dati fissi) | Scheda, sezione e funzione tolte (16/10). Va rifatta solo con un modello vero. |
| Frequenti già pieni al primo avvio (es. albumi usati 12 volte) | Storico inventato dentro `state.frequentPerMeal` | Frequenti calcolati dallo storico reale (16/10). |
| L'app diceva "Assistente AI" ma non c'è nessuna AI | Etichette del prototipo | Rinominato "Inserimento rapido a parole" (16/10). |
| Parole chiave troppo corte ("pan" → panna, "mel" → melanzane, "oli" → olive) | Confronto su pezzi di parola | `src/lib/parser.ts`: regole su parole intere (regex) + test (16/10). |
| Pasti senza data, "azzera" cancellava tutto | Prototipo con un solo giorno | Dati per giorno `days[AAAA-MM-GG]`, azzera solo il giorno scelto (16/10). |
| Sincronizzazione Supabase senza login (profilo scritto a mano, dati di tutti leggibili) | Prototipo Gemini | Tolta nella versione React; tornerà con login vero e RLS (fase 3). |
| Ricerca per nome di Open Food Facts bloccata nel browser | search.openfoodfacts.org non manda l'intestazione CORS | Passa da `/off-search` (proxy Vite in locale, rewrite vercel.json online, nessuna funzione Vercel) (16/10). |
| Campo calorie aggiornato con un passaggio di ritardo dopo la scelta dell'obiettivo | `NumberInput` riallineava il testo in useEffect (render successivo) | Riallineato nello stesso render (stato `seen`) (16/10). |
| AI: "90 g di pasta al pomodoro" = 135 kcal (piatto cotto), "un filo d'olio" e "insalata" senza quantità (test utente del 16/10) | Modello troppo piccolo (gpt-4.1-nano) e istruzioni senza la convenzione italiana dei grammi a crudo | Istruzioni: pasta/riso a crudo se non c'è «cotto», condimento come voce a parte, peso porzione obbligatorio; modello gpt-4o-mini. Ora: pasta 90 g crudi 320 + sugo 64 + insalata 12 + olio 5 g 44 = 440 kcal, tutto già compilato. |
| "petto di pollo" aggiunto subito a pranzo con 200g inventati (segnalato dall'utente) | Inserimento a parole: pasto dedotto dall'ora e quantità predefinita della regola | Riquadro "Controlla prima di aggiungere" (`QuickConfirm`): pasto da scegliere se non detto, quantità vuota da scrivere se non detta (grammi/pezzi, crudo/cotto), niente aggiunto finché non è chiaro. Test + prova su nutritrack.redapp.dev (16/10). |
| Campo grammi: svuotandolo e scrivendo 100 usciva "0100" (segnalato dall'utente con screenshot dal telefono) | `<input type="number">` con valore forzato a 0 quando vuoto; toccando un campo già attivo il cursore restava in mezzo | `NumberInput`: testo libero (anche vuoto), selezione di tutto a ogni tocco, virgola = punto; usato in quantità, valori alimento, obiettivi. Provato: 100, 150, 75,5 e + (16/10). |
| A mezzanotte l'app restava sul giorno vecchio | In `App.tsx` l'aggiornamento di setSelected leggeva il ref già cambiato | Valore precedente copiato prima; provato con orologio simulato (16/10). |

---

## 8. Decisioni prese

- **React + TypeScript + Vite + Tailwind (Capacitor per l'APK)** — motivo: stesso codice per sito e APK, come GymBuilder (modulo Android già pronto), Vercel/Supabase nativi; scartati React Native/Expo (web peggiore, modulo da rifare), Flutter (linguaggio diverso), HTML unico (ingestibile con login/APK) — data: 2026-10-16
- **Registrazione: privacy e condizioni d'uso + mail di conferma**, come il Gestionale Palestra (non approvazione manuale dell'amministratore) — data: 2026-10-16
- **Giorni: dalla mezzanotte alla mezzanotte locale, barra giorni come PronoBlast + calendario, niente giorni futuri** — data: 2026-10-16
- **Fasi: 1 app React sul PC (fatta) → 2 CIQUAL → 3 login Supabase + Vercel → 4 APK** — data: 2026-10-16
- **Nessuna funzione finta nell'interfaccia** — motivo: regola AI-OS — data: 2026-10-16
- **Repository GitHub privato `nutritrack-pro`**; prototipo Gemini conservato in `prototipo/nutritrack-gemini.html` (originale anche in Download, non toccato) — data: 2026-10-16
- **Fonti alimenti: Open Food Facts (confezionati/codici a barre) + CIQUAL (sfusi, dentro l'app) + USDA riserva** — motivo: aperte e gratuite; CREA e BDA IEO non riutilizzabili (diritto d'autore); OpenNutrition scartata finché la licenza non è chiara. Citare la fonte in app — data: 2026-10-16
- **Poche richieste a Vercel/Supabase** — motivo: l'utente non vuole problemi di limiti. Ricerca alimenti mai tramite funzioni Vercel (solo rewrite), CIQUAL dentro l'app, cache locale delle ricerche; Supabase solo per i dati utente con salvataggi raggruppati — data: 2026-10-16
- **Tema stile PronoBlast scuro (scuro predefinito): sfondo nero (neutral-950), schede neutral-900, testi bianchi; sfumatura ORO (`bg-gold`, colori `gold-*` in tailwind.config.js: giorno scelto, logo, anello kcal, kcal rimaste, carboidrati) e sfumatura BLU (`bg-blu`: pulsanti, proteine); grassi bianchi; rosso solo per errori e "oltre l'obiettivo".** Sostituisce la regola precedente blu/giallo/verde (richiesta utente del 16/10 pomeriggio). Non usare verde, indigo, violet, slate, amber, sky, emerald — data: 2026-10-16
- **AI dell'inserimento: OpenRouter `openai/gpt-4o-mini` dal server, ok utente del 16/10 alla spesa** — motivo: nel test utente gpt-4.1-nano leggeva "90 g di pasta al pomodoro" come piatto cotto (135 kcal invece di ~320), perdeva alimenti e a volte non rispondeva; gpt-4o-mini corretto su 4 frasi di prova a ~1/3 del costo di gpt-4.1-mini/gemini-2.5-flash. DeepSeek V4 Flash troppo lento (7-20 s), Gemini 2.5 Flash Lite JSON non leggibile. Istruzioni: pasta/riso con condimento = due voci, grammi di pasta/riso senza «cotto» = a crudo, peso porzione sempre indicato. Su Vercel (fase 3) impostare `OPENROUTER_API_KEY` e, con il login, permettere l'AI solo agli utenti registrati — data: 2026-10-16
- **Account nuovo per Vercel + Supabase: smaugdrago@gmail.com**, collegato dall'utente con "Collega account" — data: 2026-10-16

---

## 9. Trappole di questo progetto

- Il server locale (`vite preview`) serve la cartella `dist`: dopo ogni modifica al codice rifare `npm run build`, altrimenti sul PC si vede la versione vecchia.
- La ricerca per nome funziona solo passando da `/off-search`: aprendo `dist/index.html` come file, o su un hosting senza la regola di vercel.json, la ricerca per nome fallisce (il codice a barre invece va).
- Nell'APK (fase 4) `/off-search` non esiste: usare la richiesta nativa di Capacitor verso search.openfoodfacts.org.
- I giorni sono in ora locale (`src/lib/dates.ts`): non usare `toISOString()` per la data del giorno (darebbe il giorno UTC).
- Fotocamera e microfono funzionano solo su HTTPS (nutritrack.redapp.dev) o su 127.0.0.1: aprendo l'app da un indirizzo http qualsiasi il browser non li concede.
- `vite.config.ts` contiene anche l'endpoint /api/ai-parse (plugin `nutritrack-ai`): funziona sia con `npm run dev` sia con `vite preview`; cambiando `server/aiParse.mjs` o `vite.config.ts` va riavviato il server locale (non basta la build). Il processo deve avere la variabile della chiave OpenRouter nell'ambiente (l'attività pianificata la eredita dall'utente).
- Il server locale ascolta solo su 127.0.0.1; dall'esterno arriva da nutritrack.redapp.dev (regola nel tunnel Cloudflare 'pc-windows', gestito dal pannello Cloudflare, + CNAME). Vite rifiuta indirizzi sconosciuti: il nome sta in `preview.allowedHosts` di vite.config.ts. Se il PC è spento il link non risponde.

---

## 10. Dove si è fermato l'ultimo lavoro

**Modello:** Claude Opus 5.5 · **Data:** 2026-10-16

Fase 1 completata e verificata (test, build, prova in Edge, mezzanotte
simulata), in funzione sul PC su http://127.0.0.1:5180. In attesa che
l'utente la provi e dica se procedere con la fase 2 (CIQUAL).

---

## 11. Prossimi passi

1. L'utente prova l'app sul PC (icona "NutriTrack PRO" sul Desktop) e segnala cosa cambiare.
2. Fase 2: scaricare CIQUAL, tradurre i nomi in italiano, inserirlo nell'app con crudo/cotto e fonte citata; USDA come riserva.
3. Fase 3: quando l'utente ha collegato smaugdrago@gmail.com con "Collega account": progetto Supabase (auth con conferma mail, tabelle per utente con RLS, accettazione privacy/condizioni salvata), progetto Vercel con rewrite /off-search.
4. Fase 4: APK Android auto-aggiornante + fotocamera per i codici a barre.

---

## 12. Storico delle sessioni

| Data | Modello | Cosa è stato fatto |
|---|---|---|
| 2026-10-16 | Claude Opus 5.5 | Riepilogo Mangiate/Rimanenti/Bruciate con arco; + rapido sui frequenti e «Ripeti l'ultimo pasto» |
| 2026-10-16 | Claude Opus 5.5 | Pulsanti per correggere i valori (dai macro, valori tipici dall'AI, correzione di alimenti salvati) |
| 2026-10-16 | Claude Opus 5.5 | Avviso valori fuori norma (ricerca, scheda prodotto, AI) |
| 2026-10-16 | Claude Opus 5.5 | Test completo come un utente (telefono simulato): corretta la lettura AI di pasta/condimenti, modello gpt-4o-mini |
| 2026-10-16 | Claude Opus 5.5 | AI vera (OpenRouter gpt-4.1-nano) per le frasi con alimenti sconosciuti, con conferma e salvataggio |
| 2026-10-16 | Claude Opus 5.5 | Tema scuro stile PronoBlast: sfumature oro e blu su nero, testi bianchi |
| 2026-10-16 | Claude Opus 5.5 | Inserimento a parole con più alimenti per frase, aggiunta automatica con Annulla; proposta AI vera (OpenRouter) in attesa di ok |
| 2026-10-16 | Claude Opus 5.5 | Profilo utente, metabolismo/mantenimento, obiettivo dieta/mantenimento/massa, macro con terzo calcolato dalle kcal |
| 2026-10-16 | Claude Opus 5.5 | Palette blu/bianco/giallo/nero/verde/rosso; intestazione su una riga sul telefono |
| 2026-10-16 | Claude Opus 5.5 | Inserimento a parole con conferma: pasto e quantità mai indovinati |
| 2026-10-16 | Claude Opus 5.5 | Corretto campo grammi "0100" (NumberInput) |
| 2026-10-16 | Claude Opus 5.5 | Fotocamera per codici a barre + sezione Permessi (fotocamera/microfono) nella web app |
| 2026-10-16 | Claude Opus 5.5 | Link di prova nutritrack.redapp.dev via tunnel Cloudflare pc-windows |
| 2026-10-16 | Claude Opus 5.5 | Fase 1: app React sul PC (giorni, pasti, parole, Open Food Facts nome/codice, storico, mezzanotte), 12 test, avvio automatico sul PC |
| 2026-10-16 | Claude Opus 5.5 | Decise fonti alimenti e percorso React/APK/Vercel+Supabase con login (nessun codice cambiato) |
| 2026-10-16 | Claude Opus 5.5 | Adozione AI-OS del prototipo Gemini; tolte foto AI finta e frequenti inventati; etichette AI corrette; prova in Edge ok |

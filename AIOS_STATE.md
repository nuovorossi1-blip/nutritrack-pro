# STATO DEL PROGETTO — NutriTrack PRO

> File di memoria AI-OS. Chi apre questo progetto con `/handoff` legge da
> qui. Va **aggiornato** a ogni sessione di lavoro, non accodato all'infinito.
> L'identità del progetto e il percorso di AI-OS stanno in `AIOS_PROJECT.json`.

**Ultimo aggiornamento:** 2026-10-16 - Codex (GPT-6)

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

Fase 1 e fase 3 pubblicate. Al primo accesso, se il profilo manca o non è completo,
si apre la creazione del profilo prima del diario: nome, data di nascita, sesso,
peso, altezza, attività e obiettivo. Calcolo automatico di età, TDEE, calorie e macro;
modifica successiva da Profilo e obiettivi. I profili completi precedenti restano validi.
SMTP Gmail e testi italiani configurati; l'utente ha confermato la registrazione.
Catalogo generico USDA aggiunto; CIQUAL resta una possibile espansione. Fase 4 (APK) da fare.

**Online (Vercel, account smaugdrago@gmail.com, team Decisione):** https://nutritrack-pro-zeta.vercel.app
**Sul PC (stessa app e stesso database):** https://nutritrack.redapp.dev (tunnel Cloudflare) e http://127.0.0.1:5180
**Database:** Supabase `nutritrack-pro` ref `vlikdzmixlhlrxjovrlg` (org ugwvopmwgayvxvqlroen, eu-central-1, piano free).

---

## 3. Cosa funziona

- [FACT] Ricerca USDA: da Cerca → «Cerca su USDA (alimenti generici)», query in italiano, 8.104 voci ufficiali complete (Foundation aprile 2026 + SR Legacy aprile 2018, CC0) incluse SOLO sul server. Query comuni deterministiche; altrimenti AI traduce query inglese e poi nomi italiani. Macro copiati dal record FDC validato, mai dal modello. Scheda con fonte/link/descrizione originale, crudo/cotto e % grassi mantenuti; scelta e conferma prima del salvataggio tra alimenti personali, quindi quantità e pasto. Alimento e alias italiano ritrovati sul secondo dispositivo senza ricerca esterna. Nessuna API key USDA né scraping ad ogni ricerca; aggiornamenti del catalogo richiedono nuova importazione e deploy. 30 test, build e prova completa Edge mobile locale riusciti; prova completa riuscita anche sul sito pubblico, con utente temporaneo poi eliminato. Endpoint autenticato, limiti in memoria 200/giorno globali e 40/utente per istanza, cache query 24 ore (non un limite globale distribuito). Scottona segnalata come categoria non distinta da USDA, risultati di manzo generico; niente falsa equivalenza. «Petto / fesa di tacchino (carne fresca, cruda)» chiarisce la vecchia voce locale senza cambiarne i valori.

- [FACT] Primo accesso: schermata «Creiamo il tuo profilo» per profili assenti/incompleti. Nome, data di nascita, sesso, peso, altezza, attività e obiettivo obbligatori; selezioni esplicite, niente sesso/attività scelti in automatico per utenti nuovi. Calorie e macro si aggiornano anche se si cambia peso dopo aver scelto l'obiettivo. Salvataggio iniziale attende conferma cloud; errore rete mostra riprova senza perdere i campi. Profili precedenti con età e senza data di nascita ancora utilizzabili. Profilo e calorie manuali persistono anche su un altro dispositivo. Test 27/27, build e prova Edge mobile locale riusciti il 16/10/2026.

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
- [FACT] Riepilogo come lo screenshot dell'utente del 16/10: titolo «Riepilogo», Mangiate · arco di 270° con Rimanenti (oro) · Eccesso; sotto barre Carboidrati (oro) / Proteine (blu) / Grassi (bianco) con «x / y g». Oltre l'obiettivo: Rimanenti 0, arco pieno rosso, Eccesso «+N» rosso, bordo rosso e frase «Hai superato l'obiettivo di N kcal (X%)»; macro oltre l'obiettivo con barra rossa e «+N g». «Bruciate» tolto su richiesta dell'utente (non esiste un conteggio dell'attività).
- [FACT] Frequenti del pasto: + blu che aggiunge subito stesso alimento e stessa quantità dell'ultima volta (tocco sul nome = cambia quantità) e riquadro «↻ Ripeti <pasto> di <giorno>» che copia l'ultimo pasto dello stesso tipo (`lastMealBefore`). Provato: ieri 60 g riso + 200 g pollo → oggi + riso = 60 g 213 kcal; Ripeti = riso 60 g + pollo 200 g.
- [FACT] Piatti e marche (frasi utente 16/10): istruzioni AI = piatti unici non divisi («pizza tonno e cipolle» un solo elemento), nome con tipo/marca («cornetto (bar)» ≠ «Cornetto Algida (gelato)»), pizza senza «fetta» = intera 330 g. Nel riconoscimento locale i nomi salvati con «e/con» vengono protetti prima di dividere la frase (`protectNames`), così «una pizza tonno e cipolle» la seconda volta si aggiunge subito senza AI. Server: secondo tentativo automatico se OpenRouter non risponde in 12 s. Provato: pizza tonno e cipolle 825 kcal, cornetto bar 240, Cornetto Algida 150, seconda pizza aggiunta in 0,3 s.
- [FACT] Fase 3: login Supabase (email + password ≥ 8, conferma via email obbligatoria, «password dimenticata» e nuova password), registrazione con spunte obbligatorie per privacy + condizioni d'uso e consenso ai dati sulla salute (salvati in `profiles.accepted_terms_at / terms_version / health_consent_at` dal trigger `nuovo_utente`), testi in `src/components/Legal.tsx` (da far rivedere al titolare, non consulenza legale). Dati per utente in `profiles` / `day_logs` / `foods` con RLS (`supabase/schema.sql`); salvataggio solo delle differenze 1,5 s dopo l'ultima modifica (`src/lib/cloud.ts`), indicatore «☁ Salvato»; copia locale per utente; al primo accesso i dati della fase 1 del dispositivo vengono portati nel cloud una volta. Impostazioni → Account: Esci, Cancella i miei dati. AI solo per utenti registrati (token verificato da Supabase, limite per utente). Verificato il 16/10 con 2 utenti di prova (poi cancellati): dati ritrovati dopo aver svuotato il browser, utente 2 non vede né può scrivere i dati dell'utente 1 (RLS 403), senza login 0 righe, AI 401 senza login o con token falso; stesse prove su Vercel.
- [FACT] Profilo (nome, sesso, età, peso, altezza, attività: sedentario / 1-3 / 3-5 / 6-7 allenamenti / atleta / altro con mantenimento a mano) → metabolismo basale (Mifflin-St Jeor) e mantenimento (× 1,2-1,9), `src/lib/metabolism.ts`. Esempio provato: uomo 35 anni 80 kg 180 cm 1-3 allenamenti → basale 1755, mantenimento 2410.
- [FACT] Obiettivo Dieta (-20%) / Mantenimento / Massa (+10%): calorie e macro suggeriti (proteine 2,2/1,8/2 g per kg, grassi 25%, carboidrati il resto). Calorie modificabili; l'utente scrive due macro e sceglie quale è «auto» (calcolato dalle kcal): 2000 kcal, 200 P, 200 C → grassi 44 g. Avviso se i due macro superano le kcal. Riquadro "Completa il tuo profilo" finché manca; nel riepilogo «Ciao Nome · Dieta».
- [FACT] Crea alimento a mano. Obiettivi con profili rapidi. Backup/ripristino JSON. Tema scuro. Azzera il giorno scelto (con conferma).
- [FACT] Test: 30 test logica e USDA (giorni, crudo/cotto, parole, Open Food Facts, storico, profilo, provenienza valori) ok; tsc ok; build ok; prova completa in Edge senza errori.

## 4. Cosa è in lavorazione

- → niente (fase 1 chiusa)

## 5. Cosa manca ancora

- Catalogo generico: ricerca USDA in italiano implementata (8.104 voci); valutare CIQUAL come ampliamento successivo e migliorare ulteriormente sinonimi e traduzioni.
- Fase 3: login, cloud e Vercel pubblicati; SMTP configurato, manca solo la verifica reale delle email (vedi problema 1).
- Fase 4: APK Android auto-aggiornante (modulo AI-OS, come GymBuilder): permessi Android CAMERA e RECORD_AUDIO nel manifest + richiesta in app; ricerca Open Food Facts nell'APK tramite richiesta nativa (niente CORS).
- Vera analisi del piatto da foto con un modello AI (tolta la versione finta).

---

## 6. Problemi aperti

| # | Problema | Da quando | Cosa si è già provato |
|---|---|---|---|
| 1 | Recupero password via email da provare con l'utente. | 2026-10-16 | SMTP Gmail configurato e verificato. L'utente ha confermato la registrazione il 16/10 prima di richiedere la creazione del profilo iniziale. Non richiedere nuovamente il collegamento Gmail. |
| 2 | Molti prodotti Open Food Facts senza peso porzione (es. Fage Total 0 → 100g). | 2026-10-16 | Campo "peso porzione" modificabile prima di salvare. |
| 3 | Valori Open Food Facts a volte poco credibili (es. "tonno rio mare" 403 kcal/100 g). | 2026-10-16 | Avviso «⚠ valori da controllare» aggiunto il 16/10 (vedi sezione 3); i dati restano quelli di OFF, li corregge l'utente. Ordine dei risultati non ancora influenzato dall'avviso. |
| 4 | Dettatura non provabile senza telefono vero (nel browser di prova: "Microfono non disponibile"). | 2026-10-16 | Da provare sul telefono con Chrome. |

## 7. Problemi risolti

> Non cancellare mai questa sezione. Serve a impedire che il prossimo LLM
> rifaccia lo stesso errore. Scrivere **come** è stato risolto, non solo che
> è stato risolto.

| Problema | Causa vera | Soluzione |
|---|---|---|
| Petto di tacchino e generici difficili da trovare | Catalogo base limitato, nome fesa ambiguo e ricerca online solo prodotti Open Food Facts | Nome locale chiarito; aggiunta ricerca USDA in italiano con descrizioni originali, 8.104 record ufficiali, scheda di conferma e salvataggio persistente sull’account. |
| Primo accesso senza creazione profilo | Profilo e TDEE esistevano solo nelle impostazioni, senza passaggio iniziale; età scritta a mano | Schermata obbligatoria per profilo incompleto, birthDate con età calcolata, TDEE e calorie per obiettivo, salvataggio cloud prima del diario e modifica dalle impostazioni. Header adattato anche a 320 px. |
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

- **Ricerca USDA e salvataggio alimenti generici approvati dall'utente (16/10/2026):** catalogo ufficiale scaricabile incluso sul server per evitare nuova chiave/API e richieste ripetute a USDA. AI già autorizzata solo per traduzioni, valori dal record originale; conferma variante prima di salvare. Questa attuazione anticipa USDA rispetto alla precedente previsione CIQUAL → USDA di riserva. CIQUAL resta possibile estensione, non ancora importata.

- **Proposta utente da valutare per il catalogo generico:** USDA FoodData Central (link ricerca Turkey breast), 16/10/2026. Fonte verificata come riutilizzabile CC0; nessun cambio della precedente scelta CIQUAL/USDA eseguito in questa diagnosi. Possibile importazione selezionata in italiano senza richieste API a ogni ricerca.

- **Profilo al primo accesso obbligatorio:** nome, data di nascita, sesso, peso, altezza necessaria al calcolo, attività e obiettivo (perdere peso/mantenere/mettere massa); calorie automatiche modificabili dalle impostazioni. Richiesta utente 16/10/2026, implementata da Codex.

- **Mittente email NutriTrack PRO: nuovorossi1@gmail.com** - scelto dall'utente in Collega account, opzione 14. Indipendente dagli account Supabase/Vercel smaugdrago@gmail.com. Configurazione SMTP e testi italiani verificati da Codex il 16/10/2026.

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
- **Fase 3 su account smaugdrago@gmail.com**: Supabase nell'organizzazione «smaugdrago@gmail.com's Org» (free), regione Francoforte; Vercel team «Decisione», progetto `nutritrack-pro` (prj_TiOVBVDkN4bqm9JAoet7oI9nTQ5F). Pubblicazione con Vercel CLI dal PC (`.vercel/project.json`, token in `VERCEL_TOKEN_SMAUGDRAGO_GMAIL_COM`): il repository GitHub è di nuovorossi1-blip, quindi NIENTE pubblicazione automatica al push — data: 2026-10-16
- **Chiave OpenRouter dell'AI su Vercel = quella di nuovorossi1 (OPENROUTER_API_KEY, tipo sensitive)**, già approvata dall'utente per l'AI — data: 2026-10-16
- **Account nuovo per Vercel + Supabase: smaugdrago@gmail.com**, collegato dall'utente con "Collega account" — data: 2026-10-16

---

## 9. Trappole di questo progetto

- Il server locale (`vite preview`) serve la cartella `dist`: dopo ogni modifica al codice rifare `npm run build`, altrimenti sul PC si vede la versione vecchia.
- La ricerca per nome funziona solo passando da `/off-search`: aprendo `dist/index.html` come file, o su un hosting senza la regola di vercel.json, la ricerca per nome fallisce (il codice a barre invece va).
- Nell'APK (fase 4) `/off-search` non esiste: usare la richiesta nativa di Capacitor verso search.openfoodfacts.org.
- I giorni sono in ora locale (`src/lib/dates.ts`): non usare `toISOString()` per la data del giorno (darebbe il giorno UTC).
- Fotocamera e microfono funzionano solo su HTTPS (nutritrack.redapp.dev) o su 127.0.0.1: aprendo l'app da un indirizzo http qualsiasi il browser non li concede.
- Variabili: sul PC `.env.local` (non in git) con VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (chiave pubblica); su Vercel VITE_SUPABASE_*, SUPABASE_URL, SUPABASE_ANON_KEY, OPENROUTER_API_KEY. `.vercelignore` esclude `.env*`. La password del database è solo nella variabile utente `SUPABASE_DBPASS_NUTRITRACK` (non serve all'app).
- La chiave segreta Supabase (service_role / sb_secret) NON va mai nell'app né su Vercel: l'app usa solo la chiave pubblica + RLS. Le chiavi sb_secret vengono rifiutate se usate da un browser.
- Su Supabase free i testi delle email non si possono cambiare senza SMTP proprio (errore 400 «Email template modification is not available...»).
- Consigli di sicurezza Supabase (16/10): risolto «funzione SECURITY DEFINER richiamabile» (revoke execute su `nuovo_utente`); resta «Leaked Password Protection» che sul piano free non si può attivare (402: solo piano Pro).
- Il server MCP `supabase-smaugdrago-gmail-com` non si collegava nella sessione del 16/10 (401 «JWT could not be decoded»), mentre la Management API col token funzionava: probabile sessione avviata prima che la variabile esistesse; riprovare in una chat nuova.
- `vite.config.ts` contiene anche l'endpoint /api/ai-parse (plugin `nutritrack-ai`): funziona sia con `npm run dev` sia con `vite preview`; cambiando `server/aiParse.mjs` o `vite.config.ts` va riavviato il server locale (non basta la build). Il processo deve avere la variabile della chiave OpenRouter nell'ambiente (l'attività pianificata la eredita dall'utente).
- Il server locale ascolta solo su 127.0.0.1; dall'esterno arriva da nutritrack.redapp.dev (regola nel tunnel Cloudflare 'pc-windows', gestito dal pannello Cloudflare, + CNAME). Vite rifiuta indirizzi sconosciuti: il nome sta in `preview.allowedHosts` di vite.config.ts. Se il PC è spento il link non risponde.

---

## 10. Dove si è fermato l'ultimo lavoro

**Modello:** Codex (GPT-6) · **Data:** 2026-10-16

Ricerca USDA in italiano e salvataggio sull'account implementati. Catalogo generato con
scripts/import-usda.py da download ufficiali CC0; 8.104 record completi in server/data/usda.mjs.
Non è scraping in tempo reale: Foundation aprile 2026 e SR Legacy aprile 2018.
AI traduce solo query e nomi, numeri dal catalogo e fonte visibile; conferma prima del salvataggio.
Endpoint /api/usda-search solo autenticati, cache e limiti in memoria per istanza; stessa
implementazione su Vite e Vercel. Server locale riavviato per caricare il nuovo endpoint.
30 test e build riusciti. Prova reale dei sei esempi utente; patate inizialmente502,
risolto con retry e query comuni senza traduzione AI. Glossario corretto per avena steel cut.
Browser mobile locale: fonte, macro identici al catalogo, nessun salvataggio prima della
conferma, cloud/pasto e secondo dispositivo senza nuova ricerca riusciti; utente test eliminato.
Deploy manuale senza .git/.env come richiesto dagli account separati. Deploy dpl_4U9Beg5EEx7rxUqbhAECwcJazc2L READY; prova completa sul sito pubblico riuscita, utente temporaneo eliminato.
APK ancora da realizzare; obiettivo finale web + APK con profilo e archivio personali.

---

## 11. Prossimi passi

1. [utente] Ricaricare NutriTrack, aprire un pasto → Cerca, scrivere il nome in italiano e premere «Cerca su USDA (alimenti generici)». Scegliere la variante, controllare e salvare: da quel momento resta fra i propri alimenti.
2. Decidere con l'utente se nutritrack.redapp.dev deve puntare a Vercel (CNAME) e spegnere la copia sul PC, o restare sul PC.
3. Valutare CIQUAL come ampliamento del catalogo USDA già disponibile; migliorare traduzioni e sinonimi con esempi reali.
4. Fase 4: APK Android auto-aggiornante (modulo AI-OS) con permessi fotocamera/microfono e ricerca Open Food Facts nativa.
5. Rivedere con l'utente i testi di privacy e condizioni (titolare, contatti).
6. Verificare il recupero password via email con l'utente (registrazione confermata riuscita).

---

## 12. Storico delle sessioni

| Data | Modello | Cosa è stato fatto |
|---|---|---|
| 2026-10-16 | Codex (GPT-6) | Ricerca USDA in italiano, 8.104 record ufficiali, fonte e scheda di conferma, salvataggio cloud e riutilizzo senza ricerca. Tacchino locale chiarito. 30 test/build/Edge mobile locale ok; prova completa riuscita anche sul sito pubblico, con utente temporaneo poi eliminato. |
| 2026-10-16 | Codex (GPT-6) | Creazione profilo al primo accesso, data nascita ed età automatica, TDEE e calorie per tre obiettivi, salvataggio cloud con riprova e modifica manuale persistita. 27 test e build ok, Edge mobile locale ok. Deploy Vercel READY; prova browser completa riuscita anche sul sito pubblico. |
| 2026-10-16 | Codex (GPT-6) | SMTP Gmail e testi italiani configurati su Supabase; confronto PATCH/GET riuscito. Nessun codice o deploy modificato. Manca prova reale delle email. |
| 2026-10-16 | Claude Opus 5.5 | Fase 3: Supabase (tabelle + RLS + login con conferma email + privacy/consensi), salvataggio cloud, AI solo registrati, pubblicazione Vercel; voce Gmail in Collega account |
| 2026-10-16 | Claude Opus 5.5 | AI: piatti unici, marche, pizza intera; nomi salvati con «e» protetti; secondo tentativo |
| 2026-10-16 | Claude Opus 5.5 | «Bruciate» sostituito da «Eccesso» in rosso oltre l'obiettivo |
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

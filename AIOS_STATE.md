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
Catalogo generico USDA aggiunto; CIQUAL resta una possibile espansione. APK Android1.0.3/code3 pubblicato e download verificato, con servizio Google preferito/punteggiatura e nuova UI. Pipeline automatica e prove su telefono ancora aperte.

**Online (Vercel, account smaugdrago@gmail.com, team Decisione):** https://nutritrack-pro-zeta.vercel.app
**Sul PC (stessa app e stesso database):** https://nutritrack.redapp.dev (tunnel Cloudflare) e http://127.0.0.1:5180
**Database:** Supabase `nutritrack-pro` ref `vlikdzmixlhlrxjovrlg` (org ugwvopmwgayvxvqlroen, eu-central-1, piano free).

---

## 3. Cosa funziona

- [FACT] Voce/Testo nel pasto mostra corrispondenze da alimenti salvati/catalogo/OFF/USDA, utente sceglie tipo e grammi, poi riepilogo finale. Cornetto bar genericoUSDA e prodottiAlgida reali distinti; zero macroAI in questo flusso.59test/build e QA realeOFF/browser positivi.

- [FACT] Inserimento pasti dal riferimento utente: Ricerca/Foto/Barcode/Voce-Testo, placeholder per pasto, frequenti reali e Fine protetto. FotoAI propone solo nomi; grammi e conferma utente obbligatori, zero foto salvate.56test/build e QA reale vision/browser positivi; camera fisica da confermare.

- [FACT] Resa crudo/cotto per porzione: pesi totali prima/dopo e grammi cotti da mangiare; misura persistita in cloud/edit/frequenti. Schede gia cotte mai convertite di nuovo; stato/etichette coerenti. Conversioni generiche marcate stime.53test/build e QA browser positivi; storico conservato.

- [FACT] Navigazione Android pulsante/gesto Back gerarchica, radice minimizeApp, bordi swipe24px riservati e insets laterali landscape.50test/build e QA bridge mobile positivi; prova fisica delle due modalit? ancora da confermare. UI aggiornata remotamente, APK1.0.3 invariato.

- [FACT] Revisione16/10 sera: calendario custom bubble con mese/anno, giorni tondi, futuro disabilitato, tastiera/Escape/focus e320px; bordi piu morbidi nell'app. C azzurro/P arancione/G giallo,100%verde e oltre rosso; macro nelle card pasti centrati. Browser locale e LIVE positivi anche per soglie di completamento/superamento.
- [FACT] Porzioni: peso totale in grammi + pezzi contenuti separati dai pezzi/grammi da mangiare.14g/2fette=7g per fetta; valori100g invariati, preview e salvataggio personalizzato. Nessun fallback100g per pezzo sconosciuto. OFF usa serving_size/serving_quantity e mai peso confezione come porzione. Test logici e browser locale/LIVE/cloud7g28kcal con fixture400kcal/100g positivi. Decimali nel cambio unita preservati; conteggi senza peso pezzo chiedono grammi, mai1g inventato.
- [FACT] Prodotti salvati: alias locali proteine in polvere, marca e sottotipo, ultimo uso poi ordine salvataggio (cloud updated_at desc). Egg White PROZIS viene riusato con ID e macro originali, zero chiamataAI nel test; barrette/yogurt/albume liquido esclusi dalla categoria. Supportati nomi100% e marca. Se marca/tipo espliciti non coincidono non vengono sostituiti silenziosamente. Nessun alimento reale dell'utente letto/modificato: QA su account temporanei.
- [FACT]35schede comuni da record ufficiali USDA: carote/patate crude e bollite, pasta normale/integrale e formati penne/spaghetti/fusilli/rigatoni/farfalle/tortiglioni/linguine/maccheroni, preparazioni crude/cotte distinte; frutta e pane tostato. Mela/banana trovabili anche al plurale, ricerca frutta. Counterpart crudo/cotto usa valori della preparazione scelta allo stesso peso misurato, senza doppia conversione o resa universale inventata. Pane normale gia cotto, tostato distinto; non equiparare impasto crudo al pane. Dataset ridotto generato da scripts/generate-common-foods.mjs, fonte/link in UI. Storico e valori legacy invariati, parser cotto usa nuove schede quando riconosciute.

- [FACT] Pane bianco, casereccio tipo0 e integrale come3nuove voci con alias fetta/fette. Dati CREA000530 bianco e000550 integrale, link fonte nella porzione; casereccio usa tipo0 come riferimento esplicitamente indicativo, non composizione universale. Fetta30g marcata circa e alternativa grammi; peso personalizzabile. Parser riconosce tipi/alias prima di pane generico, App chiede quale tipo per pane non specificato invece di scegliere integrale. Legacyf16 e storico invariati.36test/build e QA browser locale/LIVE positivi: ricerca3voci, bianco100g268kcal, integrale2fette60g134kcal senzaAI, casereccio fonte indicativa, persistenza cloud. Utenti temporanei eliminati.

- [FACT] Ultima preferenza voce: campo compatto con microfono44px DENTRO a destra e Inserisci sotto (44px), niente pulsante grande a sinistra. Stato acceso rosso/secondo tocco stop; testo parziale e finale conservati. APK1.0.3 preferisce servizio Google installato e richiede punteggiatura quality daAndroid13; evita activity esterna Google, che non puo essere nascosta o ridimensionata dalla UI web. Qualita voce/punteggiatura da confermare su telefono.

- [FACT] Conferme aggiunta in alto2secondi, Annulla eliminazione7secondi. Motore voce inline con start/stop/cancel e stato accessibile; Google quando presente in APK1.0.3. Prove UI e bridge simulato positive, nessun test acustico/installazione update fisico.

- [FACT] Aggiungi altro e conferma alimento/rapida maggiori (64px, testo18px), footer e pannelli rispettano barra Android usando sia env sia variabili Capacitor, contenuto scrollabile e pannelli protetti. Le notifiche, compreso Annulla, ora sono in alto. Rimossa nota didattica swipe. Build e browser mobile locale/LIVE con inset0/24/48px e top28px, portrait/landscape e flusso pasti/cloud positivi. Conferma sul telefono utente ancora attesa; nessun nuovo APK, UI remota.

- [FACT] Dettaglio del pasto come riferimento utente (16/10/2026): tocco su Colazione/Pranzo/Cena/Spuntini apre hero con emoji e tema oro/blu, griglia 2×2 calorie/carboidrati/proteine/grassi, elenco con quantità/kcal e swipe, quattro barre nutrizionali. Barre etichettate come contributo agli obiettivi GIORNALIERI (non esistono ancora quote per pasto, nessun valore inventato). Pulsante fisso «Aggiungi altro» apre picker esistente (frequenti, ricerca locale/USDA/prodotti, barcode, creazione); salvataggio porzione torna al dettaglio e scroll iniziale. Modifica, eliminazione e Annulla aggiornano riepilogo e barre. Build e browser locale: totali 372→455→541→369→541, cloud, 320px e zero errori JS verificati; prova completa sul sito pubblico riuscita, account temporaneo eliminato. Nessuna foto AI o icona fotocamera finta aggiunta.

- [FACT] Swipe sugli alimenti del pasto (16/10/2026): breve da destra a sinistra scopre pulsante rosso Elimina, lungo oltre 60% riga (minimo 130px) elimina subito. Azioni esistenti Modifica/Elimina conservate. Scroll verticale e touchCancel non eliminano. Un solo swipe aperto per volta. Annulla per 7 secondi ripristina la voce nella posizione originale del giorno/pasto corretto, senza sovrascrivere altri cambiamenti o duplicarla. Browser touch CDP mobile locale: swipe, annullamento, persistenza cloud e riapertura riusciti; build ok, prova touch completa riuscita anche sul sito pubblico; utente temporaneo eliminato.

- [FACT] Frase completa «fettina di vitello 200 g cotta pranzo»: inserimento AI diretto con Annulla, senza chiedere di ridigitare quantità/pasto. Ingredienti e macro completi, nessun avviso plausibilità, pasto riconosciuto dalla frase necessari per l'inserimento diretto. Preparazione AI cruda/cotta persistita in `Food.preparation`, nome e ID distinti; non riusa una voce cruda per una cotta o un vecchio AI ambiguo. 200 g cotti usano valori per 100 g da cotto senza seconda conversione. Macro AI restano stime e sono indicati come tali nel messaggio. In errore AI nessun ripiego sul parser parziale (evita macinato di vitello → manzo). Prova browser locale riuscita: frase reale, peso cotto, macro calcolati, Annulla, quantità mancante e errore503 senza aggiunta; prova completa sul sito pubblico riuscita, utente temporaneo eliminato.

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
- [FACT] AI vera nell'inserimento a parole: se nella frase restano parole che l'elenco non conosce (`unknownWords`), la frase va a POST /api/ai-parse → `server/aiParse.mjs` → OpenRouter `openai/gpt-4o-mini` (~3-6 s, ~0,0003 $ a frase). Chiave SOLO sul server (variabile `OPENROUTER_KEY_NUOVOROSSI1_GMAIL_COM` sul PC, `OPENROUTER_API_KEY` su Vercel), tetti 300 frasi/giorno e 40 per IP (in memoria, si azzerano al riavvio). Le frasi complete con pasto esplicito, quantità e macro completi/coerenti si inseriscono direttamente con Annulla e dicitura stima AI; altrimenti si apre il riquadro (badge AI, valori per 100 g); gli alimenti nuovi vengono salvati e la volta dopo si riconoscono senza AI. Provato: "a cena lasagne e un cornetto" → lasagne (porzione 300 g, quantità da scrivere) + 1 cornetto 60 g; poi "un cornetto a merenda" aggiunto subito senza AI. Se l'AI non risponde si usa solo l'elenco locale.
- [FACT] Avviso «⚠ valori da controllare» (`src/lib/plausibility.ts`): kcal oltre 900, macro oltre 100 g, kcal che non tornano con i macro (scarto > 25% e > 40 kcal), «0%» con grassi > 3 g, «magro/light» > 12 g, intervalli tipici per tonno, yogurt, latte, pasta secca, riso, pane, pollo, uova, frutta, bevande (esclusi i piatti misti). Nei risultati di ricerca, nella scheda prodotto e nel riquadro dell'AI; non blocca il salvataggio. Prova "tonno rio mare": 7 schede su 28 segnalate, tutte con dati davvero sbagliati (403/401 kcal; Rio Mare leggero 107 kcal ma i macro danno 167; latte di giumenta 205 kcal ma i macro danno 44); nessun alimento di base segnalato.
- [FACT] Correzione dei valori: nel riquadro dell'avviso istruzioni in 3 passi (valori dall'etichetta / pulsante «Valori tipici dall'AI» che chiede «100 g di <nome> <marca>» e riempie i campi / scegliere un'altra scheda) e, se le kcal non tornano, «Usa N kcal (dai macro)». Dalla schermata della quantità «Correggi i valori per 100 g» anche per alimenti già salvati: dopo il salvataggio si torna alla stessa voce. Provato: tonno 403 → AI 132 kcal (P 29,9, G 1), poi corretto a mano 190 sulla voce già inserita.
- [FACT] Riepilogo come lo screenshot dell'utente del 16/10: titolo «Riepilogo», Mangiate · arco di 270° con Rimanenti (oro) · Eccesso; sotto barre Carboidrati (azzurro) / Proteine (arancione) / Grassi (giallo) con «x / y g». Oltre l'obiettivo: Rimanenti 0, arco pieno rosso, Eccesso «+N» rosso, bordo rosso e frase «Hai superato l'obiettivo di N kcal (X%)»; macro oltre l'obiettivo con barra rossa e «+N g». «Bruciate» tolto su richiesta dell'utente (non esiste un conteggio dell'attività).
- [FACT] Frequenti del pasto: + blu che aggiunge subito stesso alimento e stessa quantità dell'ultima volta (tocco sul nome = cambia quantità) e riquadro «↻ Ripeti <pasto> di <giorno>» che copia l'ultimo pasto dello stesso tipo (`lastMealBefore`). Provato: ieri 60 g riso + 200 g pollo → oggi + riso = 60 g 213 kcal; Ripeti = riso 60 g + pollo 200 g.
- [FACT] Piatti e marche (frasi utente 16/10): istruzioni AI = piatti unici non divisi («pizza tonno e cipolle» un solo elemento), nome con tipo/marca («cornetto (bar)» ≠ «Cornetto Algida (gelato)»), pizza senza «fetta» = intera 330 g. Nel riconoscimento locale i nomi salvati con «e/con» vengono protetti prima di dividere la frase (`protectNames`), così «una pizza tonno e cipolle» la seconda volta si aggiunge subito senza AI. Server: secondo tentativo automatico se OpenRouter non risponde in 12 s. Provato: pizza tonno e cipolle 825 kcal, cornetto bar 240, Cornetto Algida 150, seconda pizza aggiunta in 0,3 s.
- [FACT] Fase 3: login Supabase (email + password ≥ 8, conferma via email obbligatoria, «password dimenticata» e nuova password), registrazione con spunte obbligatorie per privacy + condizioni d'uso e consenso ai dati sulla salute (salvati in `profiles.accepted_terms_at / terms_version / health_consent_at` dal trigger `nuovo_utente`), testi in `src/components/Legal.tsx` (da far rivedere al titolare, non consulenza legale). Dati per utente in `profiles` / `day_logs` / `foods` con RLS (`supabase/schema.sql`); salvataggio solo delle differenze 1,5 s dopo l'ultima modifica (`src/lib/cloud.ts`), indicatore «☁ Salvato»; copia locale per utente; al primo accesso i dati della fase 1 del dispositivo vengono portati nel cloud una volta. Impostazioni → Account: Esci, Cancella i miei dati. AI solo per utenti registrati (token verificato da Supabase, limite per utente). Verificato il 16/10 con 2 utenti di prova (poi cancellati): dati ritrovati dopo aver svuotato il browser, utente 2 non vede né può scrivere i dati dell'utente 1 (RLS 403), senza login 0 righe, AI 401 senza login o con token falso; stesse prove su Vercel.
- [FACT] Profilo (nome, sesso, età, peso, altezza, attività: sedentario / 1-3 / 3-5 / 6-7 allenamenti / atleta / altro con mantenimento a mano) → metabolismo basale (Mifflin-St Jeor) e mantenimento (× 1,2-1,9), `src/lib/metabolism.ts`. Esempio provato: uomo 35 anni 80 kg 180 cm 1-3 allenamenti → basale 1755, mantenimento 2410.
- [FACT] Obiettivo Dieta (-20%) / Mantenimento / Massa (+10%): calorie e macro suggeriti (proteine 2,2/1,8/2 g per kg, grassi 25%, carboidrati il resto). Calorie modificabili; l'utente scrive due macro e sceglie quale è «auto» (calcolato dalle kcal): 2000 kcal, 200 P, 200 C → grassi 44 g. Avviso se i due macro superano le kcal. Riquadro "Completa il tuo profilo" finché manca; nel riepilogo «Ciao Nome · Dieta».
- [FACT] Crea alimento a mano. Obiettivi con profili rapidi. Backup/ripristino JSON. Tema scuro. Azzera il giorno scelto (con conferma).
- [FACT] Test: 33 test logica, Android e USDA (giorni, crudo/cotto, parole, Open Food Facts, storico, profilo, provenienza valori) ok; tsc ok; build ok; prova completa in Edge senza errori.

## 4. Cosa e in lavorazione

- APK1.0.3/code3 pubblicato: JDK21/SDK36, firma identica a1.0.2 verificata apksigner; app.nutritrack.pro, minSDK24/target36,4.133.592byte. Download pubblico SHA256 identico al build firmato. API/OFF restano sul sito Vercel remoto. Test fisici installazione/Google/voce/fotocamera/aggiornamento ancora da confermare.
- Pipeline pronta in scripts/android-build.workflow.yml ma NON ATTIVA: push del workflow rifiutato da GitHub per scope workflow mancante. Segreti cifrati firma stabile e Vercel impostati; nessun keystore nel repository. Per attivarla rinnovare autorizzazione GitHub con scope workflow, poi spostare template in .github/workflows/build-apk.yml. Nessun rinnovo richiesto per scaricare questo APK.

## 5. Cosa manca ancora

- Catalogo generico: ricerca USDA in italiano implementata (8.104 voci); valutare CIQUAL come ampliamento successivo e migliorare ulteriormente sinonimi e traduzioni.
- Fase 3: login, cloud e Vercel pubblicati; SMTP configurato, manca solo la verifica reale delle email (vedi problema 1).
- Android: completare test fisici installazione, login, barcode, dettatura e aggiornamento; attivare workflow dopo autorizzazione GitHub scope workflow.
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
| Nome generico proteine generava stime invece di usare prodotto salvato | Solo nomi interi, nessuna priorita recenza/alias | recognitionFoods con prodotti realmente salvati e ultimo uso, marca/sottotipo; ID e macro originali verificati senzaAI. |
| Porzione confusa con grammi o confezione | Mancava conteggio pezzi nella porzione e OFF usava anche peso confezione | servingGrams/servingUnits separati, pieceWeight=grammi/pezzi; UI quantit? mangiata distinta, nessun default100g per pezzo ignoto, OFF solo porzione dichiarata. |
| Eliminazione del cibo solo tramite icona, mancava il gesto mostrato dall’utente | Riga statica senza riconoscimento swipe e senza ripristino | SwipeFoodRow con blocco direzione, azione rossa e swipe lungo; Annulla ripristina singola voce, posizione e totali. Scroll verticale/touchCancel sicuri, prova touch/cloud locale riuscita. |
| Frase AI completa sempre da confermare e rischio confusione crudo/cotto | aiEntries ignorava cotto nel riuso omonimo; App confermava sempre e ripiegava sul parser parziale in errore | Preparazione e ID distinti, riuso solo stessa preparazione, grammi senza doppia conversione; frase completa inserita con Annulla e stima AI; errore senza aggiunta parziale. |
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

- **APK scaricabile richiesto il 16/10/2026:** applicare MODULO_ANDROID_AUTOAGGIORNANTE di AI-OS con guscio Capacitor e sito Vercel remoto. Firma stabile come segreto cifrato GitHub (istruzioni utente vietano segreti nel repository, quindi nessun keystore committato). Build su push main e pubblicazione APK/version.json sul sito; conferma installazione obbligatoria Android. Per caricamento remoto sullo stesso dominio, ricerca Open Food Facts usa il proxy Vercel esistente, non necessita richieste native alternative.

- **Apertura del pasto come negli screenshot**, conferma utente 16/10/2026: dettaglio prima della ricerca, riepilogo macro 2×2, elenco swipe, barre e Aggiungi altro. Conservato tema oro/blu. Le barre usano gli obiettivi giornalieri esistenti e lo dichiarano; obiettivi per pasto non introdotti senza scelta specifica.

- **Swipe per eliminare come nell’altra app mostrata negli screenshot**, richiesta utente 16/10/2026: gesto da destra a sinistra. Implementati swipe breve con pulsante rosso, lungo diretto e Annulla per il recupero, mantenendo il tema NutriTrack.

- **Frasi naturali complete da inserire direttamente**, richiesta utente 16/10/2026: «fettina di vitello 200 g cotta pranzo». Nessun obbligo di riformulare; pasto/quantità/qualificatori devono essere riconosciuti. Valori cotti separati dai crudi; niente promessa di esattezza assoluta per stime AI. Se mancano quantità/pasto o i valori sono da controllare si chiede conferma, negli altri casi Annulla disponibile.

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

- **Campo di inserimento (16/10, richiesta utente, contributi Claude integrati)**: campo1riga auto-crescente fino128px, microfono44px dentro a destra, Inserisci subito sotto. APK1.0.3 Codex firmato come precedente preferisce Google disponibile e richiede formattingAPI33+, senza activity esterna. Precisione/punteggiatura da confermare sul telefono.
- **Porzione dalla confezione (16/10, contributi Claude integrati)**: nome/plurale personalizzabili (helper PortionSetup), peso totale e numero pezzi con withServing; quantit? mangiata distinta, macro100g invariati. Nome/peso/grammi/pezzi persistiti su cloud. Test1fetta7g e14g/2pezzi, nomi biscotto/biscotti e cambio7.5g verificati.
- **Stile iPhone (16/10, richiesta utente)**: angoli più tondi in tutta l'app tramite `borderRadius` in tailwind.config.js (lg 0.875rem, xl 1.125rem, 2xl 1.5rem, 3xl 2rem: le classi `rounded-*` restano le stesse), font di sistema Apple prima di Inter, pulsanti che si rimpiccioliscono al tocco, campi a pillola, fogli dal basso animati (`.ios-sheet`). Calendario: `CalendarSheet.tsx` (foglio dal basso, griglia dal lunedì, cerchi, oggi con anello oro, scelto pieno blu, pallino sui giorni con pasti, futuri spenti) al posto del selettore data del telefono — data: 2026-10-16

---

## 9. Trappole di questo progetto

- Il server locale (`vite preview`) serve la cartella `dist`: dopo ogni modifica al codice rifare `npm run build`, altrimenti sul PC si vede la versione vecchia.
- La ricerca per nome funziona solo passando da `/off-search`: aprendo `dist/index.html` come file, o su un hosting senza la regola di vercel.json, la ricerca per nome fallisce (il codice a barre invece va).
- Nell'APK la shell carica il sito Vercel remoto: /off-search e API restano sul medesimo dominio. Non passare a bundle locale senza adeguare proxy e autenticazione.
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

## 10. Dove si ? fermato l'ultimo lavoro

**Modello:** Codex (GPT-6) ? **Data:** 2026-10-16

Richiesta Voce/Testo nel pasto: 'ho mangiato un cornetto' deve mostrare alternative
database, non far decidere al modello bar/Algida; poi grammi e conferma utente.
Implementati foodRequests (frasi semplici/liste, pesi solo espliciti g/kg, nessun
peso da articolo un), matchingFoods (nome/marca/alias, plurali, dedup IDs) e dialog
FoodChoices. Alimenti salvati/base immediati, ricerca OFF reale e USDA solo se
nessuna voce locale, nessun macro generato da AI in questo flusso. USDA pu?
tradurre query/nomi come prima ma i macro sono dal catalogo. Brand Algida non
rimpiazzato con USDA generico. Eventuale fonte indisponibile segnalata, locali
ancora usabili. Query modificabile e scelta esplicita prima di PortionEditor:
quantit? iniziale0 salvo grammi gi? detti. Riepilogo finale Aggiungi al pasto;
puoi cambiare scelta prima di confermare. Liste multiple scelgono una voce per
riga, al termine nascondono risultati e mostrano subito conferma/riepilogo.
Prodotti con nutrienti mancanti aprono FoodReview prima del peso; ID/macro originali
conservati. Salvataggio prodotti scelti e modifiche porzioni al commit del pasto,
non durante ricerca. AndroidBack priorit?45 lista/50 porzione/20 pasto.
Aggiunta36esima voce comune: USDA174987 croissant butter,406kcal/100g, nome
'Cornetto del bar / croissant al burro (generico)', fonte esplicitamente indicativa
per ricette del bar. Generic cornetto NON aggiunto come alias al parser globale:
prima versione aveva2regressioni test (riconosceva bar automaticamente), corretto
restringendo alias a delbar/albar/croissant/brioche. Tutti59test/build positivi.
Input rapido iniziale App.tsx conservato: questa revisione riguarda Voce/Testo
nel pasto e il testo proposto dalla foto. Il vecchio parser principale non e
riscritto. Estrazione richieste usa frasi semplici e nomi composti salvati; per
liste complesse usare una riga per alimento o correggere query, non promettere
comprensione universale senza errori.
QA browser locale reale OFF: dettatura simulata 'ho mangiato un cornetto', bar e
Algida mostrati, nessun peso implicito,100gbar406kcal; cambio sceltaAlgida50g,
macro della scheda reale, conferma esplicita e reloadcloud conservati. Lista
100gbanana50gmela115kcal,0erroriJS;320px e screenshot dialog verificati. Utenti
prova eliminati. Nuova APK non necessaria. Pubblicazione e QA LIVE nel logDesktop.

Conservati9fb2ea9 fotoAI/4schede/frequenti,ec46971 crudo-cotto/resa misurata,
12525a5 navigazione e aeecf02 contributiClaude. APK1.0.3 invariato. Test fisici
Google/camera/gesti/installazione e scope workflow ancora aperti.

---

## 11. Prossimi passi

1. [utente] Installare APK1.0.3 senza disinstallare: provare Google/punteggiatura, microfono a destra, stop e Inserisci sotto. Controllare porzione14g/2pezzi=7g, prodotto Egg White salvato, calendario e colori. Test fisici installazione/audio/fotocamera ancora da confermare.

2. Decidere con l'utente se nutritrack.redapp.dev deve puntare a Vercel (CNAME) e spegnere la copia sul PC, o restare sul PC.
3. Valutare CIQUAL come ampliamento del catalogo USDA già disponibile; migliorare traduzioni e sinonimi con esempi reali.
4. Autorizzazione GitHub scope workflow e attivazione template; test aggiornamento tra due versionCode sul telefono.
5. Rivedere con l'utente i testi di privacy e condizioni (titolare, contatti).
6. Verificare il recupero password via email con l'utente (registrazione confermata riuscita).

---

## 12. Storico delle sessioni

| Data | Modello | Cosa è stato fatto |
|---|---|---|
| 2026-10-16 | Codex (GPT-6) | Revisione serale: prodotti salvati prima AI, porzioni grammi/pezzi, calendario bubble, voce Google preferita con UI compatta,35schede USDA crudo/cotto, colori macro e centratura;48test e QA locale/LIVE ok. APK1.0.3 firma stabile, pubblicazione/LIVE/SHA256 verificati; prove fisiche aperte. |
| 2026-10-16 | Codex (GPT-6) | APK Android1.0.1 compilato/firma verificata, download pubblico SHA256 identico e banner mobile LIVE ok,33 test. Capacitor remoto, updater e dettatura nativa. Workflow solo template per scope mancante; prove telefono ancora aperte. |
| 2026-10-16 | Codex (GPT-6) | Nuovo dettaglio pasto come screenshot: hero, griglia2×2 macro, elenco swipe, barre giornaliere e Aggiungi altro con picker separato. Build/browser locale/cloud320px ok; prova completa sul sito pubblico riuscita, account temporaneo eliminato. |
| 2026-10-16 | Codex (GPT-6) | Swipe breve/lungo per eliminare alimenti con azione rossa e Annulla; scroll verticale sicuro. Build e browser touch/cloud locale ok; prova touch completa riuscita anche sul sito pubblico; utente temporaneo eliminato. |
| 2026-10-16 | Codex (GPT-6) | Frasi AI complete aggiunte direttamente con Annulla; distinzione persistita crudo/cotto e nessun fallback ambiguo in errore. 31 test/build/browser locale ok, prova completa sul sito pubblico riuscita, utente temporaneo eliminato. |
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

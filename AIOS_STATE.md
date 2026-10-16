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

Un'app (anche da telefono) per tenere il conto di calorie e macro dei pasti
della giornata rispetto agli obiettivi, inserendo gli alimenti nel modo più
veloce possibile: a parole ("200g di pasta cotta a pranzo"), dai frequenti,
dal database o con il codice a barre, senza dover calcolare a mano crudo/cotto.

---

## 2. Dove siamo adesso

Prototipo a file unico (`index.html`) nato con Gemini, adottato in AI-OS il
16/10/2026. Funziona tutto in locale nel browser. Non è ancora online.

**Sito online:** non ancora pubblicato

---

## 3. Cosa funziona

- [FACT] Riepilogo giornata: kcal, carboidrati, proteine, grassi con barre rispetto agli obiettivi.
- [FACT] 4 pasti (colazione, pranzo, cena, spuntini) con dettaglio, modifica grammi/pezzi/cotto e rimozione.
- [FACT] Inserimento rapido a parole (riconoscimento per parole chiave, NON un'AI): capisce grammi, pezzi, "cotto" e il pasto. Provato in Edge: "200g di pasta cotta e 150g di pollo cotto a pranzo" → 95g e 203g a crudo, 562 kcal.
- [FACT] Dettatura vocale (solo browser con SpeechRecognition, es. Chrome/Edge).
- [FACT] Database di 23 alimenti con fattore di cottura; alimenti personalizzati.
- [FACT] Codice a barre: ricerca su OpenFoodFacts, con 3 prodotti di riserva se non c'è rete.
- [FACT] Obiettivi personalizzabili e profili rapidi (definizione, mantenimento, massa).
- [FACT] Dati salvati nel browser (localStorage `nutritrack_app_data`), backup/ripristino JSON.
- [FACT] Tema scuro.

## 4. Cosa è in lavorazione

- → niente

## 5. Cosa manca ancora

- Pubblicazione online (Vercel o hosting locale temporaneo): da decidere con l'utente.
- Storico dei giorni: i pasti non hanno data, "azzera giornata" cancella tutto.
- Vera analisi del piatto da foto con un modello AI (tolta la versione finta, vedi 7).

---

## 6. Problemi aperti

| # | Problema | Da quando | Cosa si è già provato |
|---|---|---|---|
| 1 | Sincronizzazione Cloud (Supabase) senza login: il profilo è un nome scritto a mano (`default_user`), chiunque abbia URL e chiave pubblica legge/scrive tutti i profili. Manca anche lo script della tabella `nutritrack_profiles`. Oggi non è attiva (nessun URL/chiave nel codice). | 2026-10-16 | Niente: va deciso se servono login e cloud o basta il locale. |
| 2 | Parole chiave troppo corte nel riconoscimento a parole: "pan" prende anche "panna", "mel" anche "melanzane", "oli" anche "olive", "fett" qualsiasi fetta → pane. | 2026-10-16 | Niente. |
| 3 | Prodotti da codice a barre salvati sempre con categoria "carboidrati" e porzione 100g. | 2026-10-16 | Niente. |

## 7. Problemi risolti

> Non cancellare mai questa sezione. Serve a impedire che il prossimo LLM
> rifaccia lo stesso errore. Scrivere **come** è stato risolto, non solo che
> è stato risolto.

| Problema | Causa vera | Soluzione |
|---|---|---|
| Scheda "Foto AI" finta: qualsiasi foto diventava sempre "Pollo, Riso e Verdure" 135 kcal/100g | Gemini aveva simulato l'analisi (funzione `analyzePhotoFood` con dati fissi) | Scheda, sezione e funzione tolte (16/10). Va rifatta solo con un modello vero. |
| Frequenti già pieni al primo avvio (es. albumi usati 12 volte) | Storico inventato dentro `state.frequentPerMeal` | Frequenti vuoti all'avvio, si riempiono con l'uso reale (16/10). |
| L'app diceva "Assistente AI" ma non c'è nessuna AI | Etichette del prototipo | Rinominato "Inserimento rapido a parole" (16/10). |

---

## 8. Decisioni prese

- **Resta un solo `index.html` senza build** — motivo: è come l'ha fatto l'utente, funziona e si pubblica così com'è (Vercel lo serve senza configurazione) — data: 2026-10-16
- **Nessuna funzione finta nell'interfaccia** — motivo: regola AI-OS "niente pulsanti che non fanno niente" — data: 2026-10-16
- **Repository GitHub privato `nutritrack-pro`** — motivo: app personale; si può rendere pubblico in seguito — data: 2026-10-16
- Il file originale di Gemini resta in Download, non toccato.
- **Fonti alimenti: Open Food Facts (codici a barre/confezionati) + CIQUAL (sfusi, dentro l'app) + USDA come riserva** — motivo: aperte e gratuite; CREA e BDA IEO non riutilizzabili (diritto d'autore, serve autorizzazione); OpenNutrition scartata finche' la licenza non e' chiara. Citare la fonte in app (ODbL/CIQUAL) — data: 2026-10-16
- **Percorso: rifare in React + APK Android installabile (modulo AI-OS MODULO_ANDROID_AUTOAGGIORNANTE), prova prima su questo PC, poi Vercel + Supabase su account NUOVO dell'utente (smaugdrago@gmail.com, da collegare con l'icona 'Collega account'), con login proprio: ogni utente il suo account e i suoi dati** — data: 2026-10-16
- **Poche richieste a Vercel/Supabase** — motivo: l'utente non vuole problemi di limiti. Regole: ricerca alimenti dal telefono direttamente a Open Food Facts (mai tramite funzioni Vercel), CIQUAL incluso nell'app, prodotti gia' cercati salvati in locale; Supabase solo per i dati dell'utente con salvataggi raggruppati — data: 2026-10-16

---

## 9. Trappole di questo progetto

- Tailwind, Font Awesome, Supabase e i font arrivano da CDN: senza internet la grafica si rompe.
- I dati stanno nel browser: cambiando browser o cancellando i dati del sito si perdono (usare il backup JSON).

---

## 10. Dove si è fermato l'ultimo lavoro

**Modello:** Claude Opus 5.5 · **Data:** 2026-10-16

App portata in AI-OS e corretta (vedi 7), provata in Edge headless: nessun
errore, inserimento a parole e calcolo crudo/cotto corretti. Non pubblicata
online: in attesa che l'utente scelga dove.

---

## 11. Prossimi passi

0. [in attesa risposta utente] Cosa intende per 'accettazione' degli utenti: approvazione dell'amministratore o accettazione di privacy/condizioni.
1. Rifare l'app in React (prova su questo PC) con Open Food Facts + CIQUAL; poi APK; poi Vercel + Supabase sull'account nuovo (vedi decisioni).
2. Storico per giorno (pasti con data, vista dei giorni passati).
3. Decidere il cloud: solo locale oppure login + Supabase con dati separati per utente (problema aperto 1).
4. Rendere più precise le parole chiave (problema aperto 2).

---

## 12. Storico delle sessioni

| Data | Modello | Cosa è stato fatto |
|---|---|---|
| 2026-10-16 | Claude Opus 5.5 | Decise fonti alimenti e percorso React/APK/Vercel+Supabase con login (nessun codice cambiato) |
| 2026-10-16 | Claude Opus 5.5 | Adozione AI-OS del prototipo Gemini; tolte foto AI finta e frequenti inventati; etichette AI corrette; prova in Edge ok |

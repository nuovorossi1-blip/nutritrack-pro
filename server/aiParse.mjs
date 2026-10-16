// Analisi AI di una frase sui pasti ("ho mangiato a pranzo lasagne e un cornetto").
// Gira SOLO sul server: la chiave OpenRouter non arriva mai al browser.
// Usato da vite.config.ts (sul PC) e da api/ai-parse.js (su Vercel, fase 3).

// gpt-4o-mini: ~3-4 s, ~0,0003 $ a frase. Provati il 16/10 su 4 frasi: gpt-4.1-nano perdeva alimenti (birra) e
// a volte non rispondeva; DeepSeek V4 Flash 7-20 s; gemini-2.5-flash-lite JSON non leggibile; gpt-4.1-mini e
// gemini-2.5-flash corretti ma 3 volte piu' cari.
const MODEL_DEFAULT = 'openai/gpt-4o-mini';
const MAX_TEXT = 400;
// Tetti di spesa: con ~0,0003 $ a frase, 300 frasi al giorno sono circa 0,10 $.
const LIMIT_DAY = 300;
const LIMIT_IP_DAY = 40;

const usage = { day: '', total: 0, perIp: new Map() };

function allowed(ip) {
  const day = new Date().toISOString().slice(0, 10);
  if (usage.day !== day) Object.assign(usage, { day, total: 0, perIp: new Map() });
  const mine = usage.perIp.get(ip) || 0;
  if (usage.total >= LIMIT_DAY || mine >= LIMIT_IP_DAY) return false;
  usage.total++;
  usage.perIp.set(ip, mine + 1);
  return true;
}

const PROMPT = `Sei un nutrizionista italiano. Ricevi una frase su cosa ha mangiato una persona.
Rispondi SOLO con un oggetto JSON, senza testo prima o dopo, con questa forma:
{"pasto": "colazione"|"pranzo"|"cena"|"spuntini"|null,
 "alimenti": [{"nome": "nome breve in italiano",
   "grammi": numero o null,
   "pezzi": numero o null,
   "peso_pezzo_g": numero o null,
   "cotto": true|false,
   "kcal_100g": numero, "proteine_100g": numero, "carboidrati_100g": numero, "grassi_100g": numero}]}
Regole:
- "pasto" solo se la frase lo dice (merenda/snack = "spuntini"), altrimenti null.
- Un elemento per ogni alimento nominato. Piatti unici come UN solo elemento, senza dividerli negli ingredienti: "pizza tonno e cipolle", "pizza margherita", "lasagne", "parmigiana", "panino prosciutto e formaggio".
- nome: specifico, con tipo o marca se detti, cosi' prodotti diversi con lo stesso nome restano distinti: "cornetto (bar)" per la brioche, "Cornetto Algida (gelato)" per il gelato, "pizza tonno e cipolle". Con una marca nota (Algida, Mulino Bianco, Ferrero, Barilla...) usa i valori di quel prodotto.
- Pizza senza "fetta"/"trancio" = pizza intera da pizzeria: pezzi 1, peso_pezzo_g circa 330. "fetta"/"trancio" di pizza = 120 g.
- PASTA, RISO, CEREALI con condimento ("pasta al pomodoro", "riso al pesto"): DUE elementi, la pasta/riso e il condimento (es. "sugo di pomodoro", peso_pezzo_g tipico della porzione di condimento, pezzi 1).
- Grammi di pasta, riso, cereali, legumi secchi SENZA la parola cotto/cotta: sono grammi A CRUDO, quindi valori per 100 g A CRUDO (pasta secca circa 355 kcal, riso circa 350). Solo se la frase dice "cotto/cotta" usa valori da cotto.
- grammi: solo se la frase indica un peso. pezzi: numero di pezzi/porzioni. Articolo o numero davanti all'alimento = pezzi ("una birra" = 1, "un filo d'olio" = 1, "un'insalata" = 1, "due fette di pizza" = 2). Se non c'e' nessuna quantita' lascia grammi e pezzi null: NON inventare.
- peso_pezzo_g: OBBLIGATORIO per ogni elemento, mai null: peso tipico di UN pezzo/porzione in grammi o ml (cornetto 60, fetta di pizza 120, vasetto di yogurt 125, birra media 400, porzione di lasagne 300, filo d'olio 5, cucchiaio d'olio 10, porzione di insalata 80, sugo di pomodoro 80, tazzina di caffe 30).
- Valori nutrizionali per 100 g dell'alimento come indicato sopra, da tabelle affidabili (CREA, CIQUAL, USDA). Numeri, non stringhe.`;

function num(v) {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null;
}

/** Controlla e ripulisce la risposta del modello. */
export function cleanResult(raw) {
  const meals = ['colazione', 'pranzo', 'cena', 'spuntini'];
  const foods = Array.isArray(raw?.alimenti) ? raw.alimenti : [];
  return {
    pasto: meals.includes(raw?.pasto) ? raw.pasto : null,
    alimenti: foods
      .map((f) => ({
        nome: String(f?.nome || '').trim().slice(0, 60),
        grammi: num(f?.grammi),
        pezzi: num(f?.pezzi),
        peso_pezzo_g: num(f?.peso_pezzo_g),
        cotto: !!f?.cotto,
        kcal_100g: num(f?.kcal_100g),
        proteine_100g: num(f?.proteine_100g),
        carboidrati_100g: num(f?.carboidrati_100g),
        grassi_100g: num(f?.grassi_100g),
      }))
      .filter((f) => f.nome && f.kcal_100g !== null && f.kcal_100g <= 950)
      .slice(0, 12),
  };
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('risposta non valida');
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * @returns {Promise<{status: number, body: object}>}
 */
export async function aiParse(text, { apiKey, model, ip = 'locale' }) {
  const frase = String(text || '').trim().slice(0, MAX_TEXT);
  if (!frase) return { status: 400, body: { errore: 'Frase vuota' } };
  if (!apiKey) return { status: 503, body: { errore: 'AI non configurata su questo server' } };
  if (!allowed(ip)) return { status: 429, body: { errore: "Limite giornaliero dell'AI raggiunto: riprova domani o inserisci a mano" } };
  // Di solito risponde in 2-5 s; ogni tanto OpenRouter resta appeso: dopo 12 s si riprova una volta.
  let last = { status: 502, body: { errore: "L'AI non ha risposto in tempo" } };
  for (const wait of [12000, 14000]) {
    last = await callModel(frase, apiKey, model, wait);
    if (last.status === 200 || !last.retry) break;
  }
  delete last.retry;
  return last;
}

async function callModel(frase, apiKey, model, wait) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), wait);
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nutritrack.redapp.dev',
        'X-Title': 'NutriTrack PRO',
      },
      body: JSON.stringify({
        model: model || MODEL_DEFAULT,
        temperature: 0,
        max_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: PROMPT },
          { role: 'user', content: frase },
        ],
      }),
    });
    if (!res.ok) return { status: 502, retry: res.status >= 500 || res.status === 429, body: { errore: `AI non disponibile (errore ${res.status})` } };
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { status: 200, body: cleanResult(extractJson(content)) };
  } catch (e) {
    const timeout = e.name === 'AbortError';
    return { status: 502, retry: true, body: { errore: timeout ? "L'AI non ha risposto in tempo" : "Risposta dell'AI non leggibile" } };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Con Supabase configurato l'AI e' solo per utenti registrati: il token di accesso
 * dell'app viene controllato da Supabase (GET /auth/v1/user). Ritorna l'id utente o null.
 */
export async function verifyUser(authHeader, env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anon = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return 'senza-login';
  const token = String(authHeader || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id || null;
  } catch {
    return null;
  }
}

export function aiConfig(env) {
  return {
    apiKey: env.OPENROUTER_API_KEY || env.OPENROUTER_KEY_NUOVOROSSI1_GMAIL_COM || '',
    model: env.NUTRITRACK_AI_MODEL || MODEL_DEFAULT,
  };
}

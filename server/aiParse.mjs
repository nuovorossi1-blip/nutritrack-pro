// Analisi AI di una frase sui pasti ("ho mangiato a pranzo lasagne e un cornetto").
// Gira SOLO sul server: la chiave OpenRouter non arriva mai al browser.
// Usato da vite.config.ts (sul PC) e da api/ai-parse.js (su Vercel, fase 3).

// gpt-4.1-nano: ~1,7 s e ~0,00003 $ a frase (provato il 16/10: DeepSeek V4 Flash 7-20 s, Gemini 2.5 Flash Lite JSON non leggibile).
const MODEL_DEFAULT = 'openai/gpt-4.1-nano';
const MAX_TEXT = 400;
// Tetti di spesa: con ~0,00003 $ a frase, 300 frasi al giorno sono meno di 0,01 $.
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
- Un elemento per ogni alimento o piatto nominato. Piatti composti (es. lasagne, pizza margherita) come un solo alimento.
- grammi: solo se la frase indica un peso. pezzi: solo se indica un numero di pezzi/porzioni ("un cornetto" = 1). Articolo o numero davanti all'alimento = numero di pezzi ("una birra" = 1, "due fette di pizza" = 2). Se non c'e' nessuna quantita' lascia entrambi null: NON inventare.
- peso_pezzo_g: SEMPRE il peso tipico di un pezzo/porzione in grammi o ml (cornetto 60, fetta di pizza 120, vasetto di yogurt 125, birra media 400, porzione di lasagne 300...).
- Valori nutrizionali per 100 g dell'alimento COME VIENE MANGIATO (cotto se cotto), da tabelle affidabili (CREA, CIQUAL, USDA). Numeri, non stringhe.`;

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
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
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
    if (!res.ok) return { status: 502, body: { errore: `AI non disponibile (errore ${res.status})` } };
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { status: 200, body: cleanResult(extractJson(content)) };
  } catch (e) {
    return { status: 502, body: { errore: e.name === 'AbortError' ? "L'AI non ha risposto in tempo" : "Risposta dell'AI non leggibile" } };
  } finally {
    clearTimeout(timer);
  }
}

export function aiConfig(env) {
  return {
    apiKey: env.OPENROUTER_API_KEY || env.OPENROUTER_KEY_NUOVOROSSI1_GMAIL_COM || '',
    model: env.NUTRITRACK_AI_MODEL || MODEL_DEFAULT,
  };
}

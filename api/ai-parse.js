// Funzione Vercel (fase 3): stesso comportamento di /api/ai-parse sul PC.
// Variabile da impostare su Vercel: OPENROUTER_API_KEY (mai nel codice).
import { aiConfig, aiParse } from '../server/aiParse.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ errore: 'Solo POST' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'vercel';
  const out = await aiParse(req.body?.text, { ...aiConfig(process.env), ip });
  res.status(out.status).json(out.body);
}

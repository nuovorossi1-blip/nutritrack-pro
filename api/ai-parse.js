// Funzione Vercel (fase 3): stesso comportamento di /api/ai-parse sul PC.
// Variabili su Vercel: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY (mai nel codice).
import { aiConfig, aiParse, verifyUser } from '../server/aiParse.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ errore: 'Solo POST' });
  // Solo utenti registrati: il limite per persona usa l'id utente.
  const user = await verifyUser(req.headers.authorization, process.env);
  if (!user) return res.status(401).json({ errore: "Accedi per usare l'AI" });
  const out = await aiParse(req.body?.text, { ...aiConfig(process.env), ip: user });
  res.status(out.status).json(out.body);
}

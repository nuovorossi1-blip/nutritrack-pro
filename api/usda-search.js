import { aiConfig, verifyUser } from '../server/aiParse.mjs';
import { usdaSearch } from '../server/usdaSearch.mjs';
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') return res.status(405).json({ errore: 'Solo POST' });
  const user = await verifyUser(req.headers.authorization, process.env);
  if (!user || user === 'senza-login') return res.status(401).json({ errore: 'Accedi per cercare su USDA' });
  const result = await usdaSearch(req.body?.text, { ...aiConfig(process.env), ip: user });
  res.status(result.status).json(result.body);
}

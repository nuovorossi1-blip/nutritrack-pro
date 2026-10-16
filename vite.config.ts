import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
// @ts-expect-error modulo JS del server, senza tipi
import { aiConfig, aiParse } from './server/aiParse.mjs';

// La ricerca per nome di Open Food Facts (search.openfoodfacts.org) non
// accetta richieste dirette dal browser (niente CORS): passa da /off-search.
// In locale la inoltra Vite; su Vercel la stessa regola sta in vercel.json.
const offProxy = {
  '/off-search': {
    target: 'https://search.openfoodfacts.org',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/off-search/, ''),
    headers: { 'User-Agent': 'NutriTrackPRO/0.2 (github.com/nuovorossi1-blip/nutritrack-pro)' },
  },
};

// POST /api/ai-parse sul PC (su Vercel lo stesso percorso e' api/ai-parse.js).
// La chiave OpenRouter si legge dall'ambiente del processo, mai dal browser.
function aiEndpoint(): Plugin {
  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/api/ai-parse' || req.method !== 'POST') return next();
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 4000) req.destroy();
    });
    req.on('end', async () => {
      let text = '';
      try {
        text = JSON.parse(body || '{}').text;
      } catch {
        /* corpo non valido: frase vuota */
      }
      const ip = String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || 'locale');
      const out = await aiParse(text, { ...aiConfig(process.env), ip });
      res.statusCode = out.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(out.body));
    });
  };
  return {
    name: 'nutritrack-ai',
    configureServer: (s) => void s.middlewares.use(handler),
    configurePreviewServer: (s) => void s.middlewares.use(handler),
  };
}

export default defineConfig({
  plugins: [react(), aiEndpoint()],
  server: { port: 5180, strictPort: true, proxy: offProxy },
  // allowedHosts: l'app arriva anche dal tunnel Cloudflare (nutritrack.redapp.dev).
  preview: { port: 5180, strictPort: true, host: '127.0.0.1', allowedHosts: ['nutritrack.redapp.dev'], proxy: offProxy },
});

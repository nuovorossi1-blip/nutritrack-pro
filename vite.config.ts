import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true, proxy: offProxy },
  // allowedHosts: l'app arriva anche dal tunnel Cloudflare (nutritrack.redapp.dev).
  preview: { port: 5180, strictPort: true, host: '127.0.0.1', allowedHosts: ['nutritrack.redapp.dev'], proxy: offProxy },
});

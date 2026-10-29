/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Grafica standard AI-OS (ai-os/STILE_GRAFICO.md): Manrope per i testi, Barlow Condensed per i titoli.
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        titoli: ['"Barlow Condensed"', 'Manrope', 'sans-serif'],
      },
      // Stile iPhone: angoli piu' morbidi in tutta l'app (le classi rounded-* restano le stesse).
      borderRadius: { lg: '0.875rem', xl: '1.125rem', '2xl': '1.5rem', '3xl': '2rem' },
      // Grafite e oro: le scure dei grigi diventano i riquadri grafite, il blu d'accento diventa oro.
      colors: {
        gold: { 200: '#FFD99A', 300: '#FFC15E', 400: '#F5A623', 500: '#F5A623', 600: '#D98E12', 700: '#A86A00' },
        neutral: { 700: '#3A3A3A', 800: '#2D2D2D', 900: '#242424', 950: '#1A1A1A' },
        blue: {
          50: '#FFF7E8', 100: '#FFEFD1', 200: '#FFD99A', 300: '#FFC15E', 400: '#F5A623', 500: '#F5A623',
          600: '#C9850F', 700: '#A86A00', 800: '#6B4600', 900: '#3D2A08', 950: '#2A1D06',
        },
      },
      backgroundImage: {
        gold: 'linear-gradient(135deg, #FFC15E 0%, #F5A623 55%, #FF6B6B 100%)',
        blu: 'linear-gradient(135deg, #FFC15E 0%, #F5A623 55%, #FF6B6B 100%)',
      },
    },
  },
  plugins: [],
};

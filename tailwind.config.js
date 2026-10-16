/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      // Stile PronoBlast scuro: oro e blu a sfumatura su nero, testi bianchi.
      colors: { gold: { 200: '#FFE29A', 300: '#FFD76A', 400: '#FFC857', 500: '#F5B300', 600: '#D99A00', 700: '#A87700' } },
      backgroundImage: {
        gold: 'linear-gradient(135deg, #FFE29A 0%, #FFC857 45%, #E6A800 100%)',
        blu: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
      },
    },
  },
  plugins: [],
};

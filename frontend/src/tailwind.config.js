/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',     // verde amazônico
        secondary: '#0ea5e9',   // azul água
        forest: '#065f46',      // verde escuro
        sand: '#fef7e3',        // tom areia (fundo leve)
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,.08)',
      }
    },
  },
  plugins: [],
}

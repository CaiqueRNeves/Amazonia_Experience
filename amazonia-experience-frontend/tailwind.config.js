/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais baseadas no tema da Amazônia e COP30
        'amazon-green': {
          DEFAULT: '#0B6623', // Verde escuro da floresta
          '50': '#E6F2EC',
          '100': '#C0DFC8',
          '200': '#93C6A1',
          '300': '#67AD7A',
          '400': '#459A5E',
          '500': '#0B6623', // Base
          '600': '#095C1F',
          '700': '#07511B',
          '800': '#054716',
          '900': '#033D12'
        },
        'sustainable-green': {
          DEFAULT: '#5DBB63', // Verde claro para sustentabilidade
          '50': '#F0F9F1',
          '100': '#D9F0DB',
          '200': '#B4E2B8',
          '300': '#8ED394',
          '400': '#69C570',
          '500': '#5DBB63', // Base
          '600': '#41A147',
          '700': '#347D38',
          '800': '#275D2A',
          '900': '#1A3E1C'
        },
        'amazon-river': {
          DEFAULT: '#1E90FF', // Azul dos rios
          '50': '#E9F4FF',
          '100': '#C7E3FF',
          '200': '#94CAFF',
          '300': '#62B0FF',
          '400': '#3FA0FF',
          '500': '#1E90FF', // Base
          '600': '#0077EA',
          '700': '#0062C1',
          '800': '#004E9A',
          '900': '#003A73'
        },
        'amazon-earth': {
          DEFAULT: '#8B4513', // Marrom da terra
          '50': '#F4ECE6',
          '100': '#E3D0C0',
          '200': '#CBA987',
          '300': '#B3814D',
          '400': '#9C5D2E',
          '500': '#8B4513', // Base
          '600': '#7A3D11',
          '700': '#69340E',
          '800': '#582C0C',
          '900': '#47230A'
        }
      },
      fontFamily: {
        'sans': ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'display': ['Montserrat', 'ui-sans-serif', 'system-ui'],
        'body': ['Open Sans', 'ui-sans-serif', 'system-ui']
      },
      spacing: {
        '128': '32rem',
        '144': '36rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.16)'
      },
      backgroundImage: {
        'amazon-pattern': "url('/src/assets/images/amazon-pattern.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      height: {
        'screen-90': '90vh',
        'screen-80': '80vh',
      },
      maxWidth: {
        '8xl': '90rem',
        '9xl': '100rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
  darkMode: 'class' // Suporte ao modo escuro via classe
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0E11',
          surface: '#1E2329',
          elevated: '#2B3139',
        },
        border: {
          DEFAULT: '#2B3139',
          light: '#363C45',
        },
        text: {
          primary: '#EAECEF',
          secondary: '#848E9C',
          muted: '#474D57',
        },
        accent: {
          DEFAULT: '#F0B90B',
          hover: '#D4A009',
          muted: '#F0B90B22',
        },
        buy: {
          DEFAULT: '#0ECB81',
          hover: '#0AB572',
          muted: '#0ECB8122',
        },
        sell: {
          DEFAULT: '#F6465D',
          hover: '#D93D52',
          muted: '#F6465D22',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        moms: {
          50: '#fdf8f6',
          100: '#f9ece5',
          200: '#f3d5c4',
          300: '#e8b598',
          400: '#d9916a',
          500: '#c97a4f',
          600: '#b86440',
          700: '#9a4f35',
          800: '#7d4130',
          900: '#66382b',
          950: '#381b14',
        },
        bakery: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
      },
    },
  },
  plugins: [forms],
}

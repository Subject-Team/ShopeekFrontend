/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        // Brand green: anchor #00CEAB (teal-green), full 50–950 scale.
        brand: {
          50: '#ecfdfb',
          100: '#d9fdf7',
          200: '#b6fcf0',
          300: '#7efce7',
          400: '#33ffdd',
          500: '#00ceab',
          600: '#00a388',
          700: '#03816c',
          800: '#056152',
          900: '#064b40',
          950: '#052923',
        },
        // Brand blue: anchor #259DEF, full 50–950 scale.
        accent: {
          50: '#ecf7fd',
          100: '#d9eefd',
          200: '#b6e0fc',
          300: '#83cbfc',
          400: '#59b5f3',
          500: '#259def',
          600: '#1086d5',
          700: '#0870b5',
          800: '#095a90',
          900: '#094871',
          950: '#082c45',
        },
        // Re-anchor the default green/blue palettes the UI uses as brand
        // colors (emerald-*, indigo-*) onto the same brand anchors.
        emerald: {
          50: '#ecfdfb',
          100: '#d9fdf7',
          200: '#b6fcf0',
          300: '#7efce7',
          400: '#33ffdd',
          500: '#00ceab',
          600: '#00a388',
          700: '#03816c',
          800: '#056152',
          900: '#064b40',
          950: '#052923',
        },
        indigo: {
          50: '#ecf7fd',
          100: '#d9eefd',
          200: '#b6e0fc',
          300: '#83cbfc',
          400: '#59b5f3',
          500: '#259def',
          600: '#1086d5',
          700: '#0870b5',
          800: '#095a90',
          900: '#094871',
          950: '#082c45',
        },
      }
    },
  },
  plugins: [],
}

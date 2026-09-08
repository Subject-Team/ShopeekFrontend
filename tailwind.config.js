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
        // Brand green: anchor #00A388 (teal-green, one level darker than #00CEAB), full 50–950 scale.
        brand: {
          50: '#e7fdf9',
          100: '#d4fcf6',
          200: '#b1fcef',
          300: '#74fbe5',
          400: '#00ffd5',
          500: '#00a388',
          600: '#00856f',
          700: '#036b5a',
          800: '#045245',
          900: '#054036',
          950: '#04221d',
        },
        // Brand blue: anchor #2579EF (#259DEF with yellow cast removed, hue 204→215), full 50–950 scale.
        accent: {
          50: '#ecf3fd',
          100: '#d9e8fd',
          200: '#b6d3fc',
          300: '#83b5fc',
          400: '#5999f3',
          500: '#2579ef',
          600: '#1062d5',
          700: '#0850b5',
          800: '#094190',
          900: '#093571',
          950: '#082145',
        },
        // Re-anchor the default green/blue palettes the UI uses as brand
        // colors (emerald-*, indigo-*) onto the same brand anchors.
        emerald: {
          50: '#e7fdf9',
          100: '#d4fcf6',
          200: '#b1fcef',
          300: '#74fbe5',
          400: '#00ffd5',
          500: '#00a388',
          600: '#00856f',
          700: '#036b5a',
          800: '#045245',
          900: '#054036',
          950: '#04221d',
        },
        indigo: {
          50: '#ecf3fd',
          100: '#d9e8fd',
          200: '#b6d3fc',
          300: '#83b5fc',
          400: '#5999f3',
          500: '#2579ef',
          600: '#1062d5',
          700: '#0850b5',
          800: '#094190',
          900: '#093571',
          950: '#082145',
        },
      }
    },
  },
  plugins: [],
}

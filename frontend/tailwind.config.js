/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        'carbon': {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        'accent': {
          DEFAULT: '#00d4aa',
          50: '#edfff9',
          100: '#d5fff2',
          200: '#aeffea',
          300: '#70ffdd',
          400: '#2bfdc9',
          500: '#00d4aa',
          600: '#00b892',
          700: '#009075',
          800: '#06715f',
          900: '#075d4f',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 170, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './nl/**/*.html',
    './en/**/*.html',
    './fi/**/*.html',
    './index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        void: '#05060f',
        surface: { DEFAULT: '#0a0d1a', 2: '#111527', 3: '#181d35' },
        accent: {
          cyan: '#00d4ff',
          violet: '#8b5cf6',
          emerald: '#00dfa2',
        },
        muted: '#6b7394',
        light: '#e4e8f1',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        matrix: {
          dark: '#030704',
          dim: '#0a2312',
          base: '#22c55e',
          bright: '#4ade80',
          glow: '#86efac',
        }
      }
    },
  },
  plugins: [],
}

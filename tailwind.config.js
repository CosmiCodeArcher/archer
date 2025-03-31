/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundClip: {
        'text': 'text',
        'padding': 'padding-box',
        'border': 'border-box',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'karla': ['Karla', 'sans-serif'],
      },
      colors: {
        vintage: {
          beige: '#F5E6D3',
          sage: '#C7D3C5',
        },
        modern: {
          teal: '#00CED1',
          coral: '#FF7F50',
          purrple: '#9370DB',
          gold: '#FFD700',
          pink: '#ff80b5',
          purple: '#9089fc',
        },
      },
      animation: {
        'bounce-left': 'bounce-left 1s infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 127, 80, 0.8)',
      },
    },
  },
  plugins: [],
}


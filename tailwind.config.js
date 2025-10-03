/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        "vintage-beige": "#F5E8C7",
        "vintage-sage": "#C2D8B9",
        "modern-teal": "#00CED1",
        "modern-coral": "#FF7F50",
      },
      fontFamily: {
        karla: ["Karla", "sans-serif"],
        geist: ["Geist", "sans-serif"],
      },
      animation: {
        "gradient-shift": "gradientShift 15s ease infinite",
        "mini-pop": "mini-pop 0.6s ease-out",
        "tooltip-pop": "tooltip-pop 0.3s ease-out",
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "mini-pop": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.5)", opacity: "0" },
        },
        "tooltip-pop": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        glow: "0 0 15px rgba(255, 127, 80, 0.8)",
      },
    },
  },
  plugins: [],
};
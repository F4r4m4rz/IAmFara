/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        term: {
          bg: "#0d1117",
          panel: "#161b22",
          border: "#30363d",
          text: "#c9d1d9",
          muted: "#8b949e",
          green: "#3fb950",
          blue: "#58a6ff",
          purple: "#d2a8ff",
          orange: "#e3b341",
          pink: "#ff7b72",
        },
      },
      keyframes: {
        caret: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        typing: {
          from: { width: "0" },
          to: { width: "2ch" },
        },
        fadeSlideIn: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        puzzleFlash: {
          "0%, 100%": { filter: "brightness(1)" },
          "15%": { filter: "brightness(1.9)" },
          "30%": { filter: "brightness(1)" },
          "45%": { filter: "brightness(1.9)" },
          "60%": { filter: "brightness(1)" },
          "75%": { filter: "brightness(1.5)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "60%": { opacity: "1", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        caret: "caret 1s step-end infinite",
        typing: "typing 0.3s steps(2, end) forwards",
        "fade-slide-in": "fadeSlideIn 0.25s ease-out forwards",
        "puzzle-flash": "puzzleFlash 1.1s ease-in-out",
        "pop-in": "popIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};

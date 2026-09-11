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
      },
      animation: {
        caret: "caret 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

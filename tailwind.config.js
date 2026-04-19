/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["'IBM Plex Mono'", "monospace"],
        sans:    ["'IBM Plex Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        ink: {
          50:  "#f7ffe0",
          100: "#eeff99",
          200: "#e8ff47",   // ← primary accent (lime-yellow)
          300: "#d4f000",
          400: "#b8d400",
          500: "#e8ff47",   // main
          600: "#c8e000",
          700: "#a0b800",
          800: "#788800",
          900: "#506000",
          950: "#283000",
        },
        surface: {
          base:     "#0d0d0f",
          card:     "#131316",
          elevated: "#1a1a1f",
          border:   "#26262e",
          hover:    "#1e1e24",
        },
        accent: {
          cyan:  "#2dd4bf",
          green: "#4ade80",
          amber: "#fbbf24",
          red:   "#fb7185",
          blue:  "#4f8eff",
          lime:  "#e8ff47",
        },
      },
      animation: {
        "fade-in":    "pageIn 0.25s ease-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer:      "shimmer 1.6s infinite",
      },
      keyframes: {
        pageIn: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition: "800px 0" },
        },
      },
      boxShadow: {
        glow:      "0 0 30px rgba(232,255,71,0.12)",
        "glow-blue": "0 0 24px rgba(79,142,255,0.2)",
        card:      "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(38,38,46,0.8)",
        elevated:  "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(38,38,46,0.8)",
      },
      borderRadius: {
        DEFAULT: "10px",
      },
    },
  },
  plugins: [],
};
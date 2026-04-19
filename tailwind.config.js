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
          50:  "#eef1ff",
          100: "#dde3ff",
          200: "#c0caff",
          300: "#9aaeff",
          400: "#7d94ff",
          500: "#6c8aff",   // ← main accent (soft blue)
          600: "#4f6ef5",
          700: "#3a54e0",
          800: "#2a3db5",
          900: "#1e2d8a",
          950: "#111a5a",
        },
        surface: {
          base:     "#08090c",
          card:     "#0e1018",
          elevated: "#141720",
          border:   "#1f2336",
          hover:    "#181c28",
        },
        accent: {
          cyan:   "#2dd4bf",
          green:  "#4ade80",
          amber:  "#fbbf24",
          red:    "#fb7185",
          blue:   "#6c8aff",
          violet: "#a78bfa",
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
        glow:        "0 0 30px rgba(108,138,255,0.15)",
        "glow-blue": "0 0 24px rgba(108,138,255,0.2)",
        card:        "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(31,35,54,0.8)",
        elevated:    "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(31,35,54,0.8)",
      },
    },
  },
  plugins: [],
};
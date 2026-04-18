/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c2d4ff",
          300: "#94b0ff",
          400: "#5f84ff",
          500: "#3a5aff",
          600: "#2040f5",
          700: "#1a30e0",
          800: "#1628b5",
          900: "#162490",
          950: "#0f1660",
        },
        surface: {
          base: "#0a0c14",
          card: "#0f1220",
          elevated: "#141828",
          border: "#1e2440",
          hover: "#1a2035",
        },
        accent: {
          cyan: "#00d4ff",
          green: "#00ff88",
          amber: "#ffb800",
          red: "#ff4466",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(58, 90, 255, 0.15)",
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.2)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,36,64,0.8)",
      },
    },
  },
  plugins: [],
};

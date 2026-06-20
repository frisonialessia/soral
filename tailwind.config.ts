import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rampa de riesgo cerrada — única fuente de color
        risk: {
          sol: "#5B6EF5",   // Sólido / acción     < 40
          est: "#8476FF",   // Estable          40–54
          vig: "#B49AED",   // Vigilancia       55–69
          med: "#E59BB0",   // Medio            70–79
          alt: "#F56C89",   // Alto             80–89
          cri: "#EB4F6C",   // Crítico           ≥ 90
          "sol-soft": "#EAEDFE",
        },
        // Neutros
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#FAFBFE",
          bg: "#F3F6FD",
        },
        line: {
          DEFAULT: "#E8EAF2",
          2: "#DADEEC",
        },
        ink: {
          1: "#2B2D42",
          2: "#6B7088",
          3: "#A9AEC2",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
      animation: {
        fade: "fade 0.4s ease",
        pop: "pop 0.25s ease",
      },
    },
  },
  plugins: [],
};

export default config;

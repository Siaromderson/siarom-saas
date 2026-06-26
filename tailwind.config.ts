import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade Siarom AI — paleta verde extraída da logo oficial
        brand: {
          50: "#edf7f1",
          100: "#d2ebdf",
          200: "#a8d8c0",
          300: "#78c09e",
          400: "#4ea27b",
          500: "#2f8560",
          600: "#1f6a4b",
          700: "#14573d",
          800: "#0c4630",
          900: "#06371f",
        },
        // Verde-menta vibrante para detalhes (checks, status)
        accent: {
          400: "#5fd39e",
          500: "#2fb985",
          600: "#1f9c6e",
        },
        // Fundo escuro com leve matiz verde
        ink: {
          900: "#08120d",
          800: "#0c1a13",
          700: "#12241a",
          600: "#1a3025",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        // Sombra suave esverdeada para superfícies de vidro
        glass: "0 8px 32px -8px rgba(12, 70, 48, 0.18), inset 0 1px 0 0 rgba(255,255,255,0.55)",
        "glass-lg": "0 24px 60px -16px rgba(12, 70, 48, 0.28), inset 0 1px 0 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        // Gradiente principal (botões/realces) — texto branco legível
        "brand-gradient": "linear-gradient(135deg, #0e5a3a 0%, #2f8560 55%, #4ea27b 100%)",
        // Gradiente completo da logo (decorativo) — escuro ao menta
        "logo-gradient": "linear-gradient(135deg, #044d2f 0%, #2f8560 50%, #a2d4bb 100%)",
        "glow": "radial-gradient(60% 60% at 50% 0%, rgba(47,133,96,0.30) 0%, rgba(8,18,13,0) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

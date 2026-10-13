import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172d4e",
        forest: "#155b48",
        leaf: "#4e9c76",
        sun: "#edbd46",
        paper: "#f8f7f2",
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 45, 78, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;

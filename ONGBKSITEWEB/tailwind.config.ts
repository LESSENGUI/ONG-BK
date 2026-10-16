import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#3B4A5A",
        forest: "#0B5A9B",
        leaf: "#19A7E6",
        sun: "#F2B233",
        paper: "#F7F7F7",
        ciel: "#19A7E6",
        rose: "#E8195F",
        blue: "#3FA0DC",
        marine: "#0B5A9B",
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

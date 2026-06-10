import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: "#E4017F", light: "#FCE4F1", dark: "#A8005D" },
        ink: "#1A1A1A",
        cream: "#FFF9FC",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        luxe: "0 30px 80px rgba(79, 4, 47, .12)",
        soft: "0 16px 50px rgba(79, 4, 47, .08)",
      },
    },
  },
  plugins: [],
};

export default config;

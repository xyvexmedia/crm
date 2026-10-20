import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08080a",
        surface: "#121215",
        crimson: {
          DEFAULT: "#e11d48",
          light: "#fb7185",
          bright: "#f43f5e",
          dark: "#be123c",
          deep: "#881337",
          wine: "#5c081e",
          muted: "rgba(225, 29, 72, 0.15)",
          glow: "rgba(225, 29, 72, 0.4)",
        },
        card: {
          dark: "#161619",
          darker: "#0e0e11",
          elevated: "#1c1c21",
          slate: "#d9e2e8",
          white: "#ffffff",
        },
        border: "rgba(255, 255, 255, 0.08)",
        "border-subtle": "rgba(255, 255, 255, 0.05)",
        "border-glow": "rgba(225, 29, 72, 0.3)",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
        "4xl": "36px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        crimson: "0 0 25px rgba(225, 29, 72, 0.35)",
        "crimson-sm": "0 0 12px rgba(225, 29, 72, 0.25)",
        card: "0 8px 32px -4px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;

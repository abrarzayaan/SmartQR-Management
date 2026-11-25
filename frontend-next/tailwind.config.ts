import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#111215",
        surface: "#181A1F",
        elevated: "#20232A",
        ink: {
          DEFAULT: "#F3F4F6",
          secondary: "#A1A7B3",
          muted: "#767D8C",
          subtle: "#555B68",
        },
        line: {
          DEFAULT: "#272B34",
          strong: "#373C48",
          subtle: "#1F2229",
        },
        brand: {
          DEFAULT: "#10B981",
          hover: "#059669",
          soft: "rgba(16, 185, 129, 0.14)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.4)",
        modal: "0 24px 48px -12px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};

export default config;

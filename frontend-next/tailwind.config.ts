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
        canvas: "#F7F8FA",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#111827",
          secondary: "#4B5563",
          muted: "#6B7280",
          subtle: "#9CA3AF",
        },
        line: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
          subtle: "#F3F4F6",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
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
        card: "0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.03)",
        "card-hover": "0 4px 12px rgba(16, 24, 40, 0.07), 0 1px 2px rgba(16, 24, 40, 0.04)",
        modal: "0 20px 40px -12px rgba(16, 24, 40, 0.18), 0 4px 12px -4px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

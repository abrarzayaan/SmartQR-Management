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
        background: "#0a0e17",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "#121824",
          foreground: "#f8fafc",
          subtle: "#161f30",
          hover: "#1a2438",
        },
        border: {
          DEFAULT: "#1e293b",
          subtle: "rgba(255, 255, 255, 0.08)",
          hover: "#334155",
        },
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
          hover: "#2563eb",
          muted: "rgba(59, 130, 246, 0.15)",
        },
        emerald: {
          DEFAULT: "#10b981",
          muted: "rgba(16, 185, 129, 0.15)",
        },
        amber: {
          DEFAULT: "#f59e0b",
          muted: "rgba(245, 158, 11, 0.15)",
        },
        rose: {
          DEFAULT: "#f43f5e",
          muted: "rgba(244, 63, 94, 0.15)",
        },
        muted: {
          DEFAULT: "#94a3b8",
          foreground: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.24)",
        "elevation-2": "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "elevation-3": "0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)",
        "elevation-modal": "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;


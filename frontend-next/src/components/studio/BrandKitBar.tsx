"use client";

import React from "react";
import { Sparkles, BookmarkPlus, Palette } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { BrandKitRecord, DotStyle, EyeBall, EyeFrame, GradientType } from "@/lib/types";

interface BrandKitBarProps {
  onOpenSaveKitModal: () => void;
}

interface PresetItem {
  id: string;
  name: string;
  fg: string;
  fg2: string;
  bg: string;
  grad: GradientType;
  dot: DotStyle;
  eyeFrame: EyeFrame;
  eyeBall: EyeBall;
  badge?: string;
}

const PRESETS: PresetItem[] = [
  {
    id: "luxury-dark",
    name: "Luxury Dark",
    fg: "#0f172a",
    fg2: "#334155",
    bg: "#ffffff",
    grad: "solid",
    dot: "rounded",
    eyeFrame: "rounded",
    eyeBall: "circle",
  },
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    fg: "#1d4ed8",
    fg2: "#0284c7",
    bg: "#ffffff",
    grad: "horizontal",
    dot: "liquid",
    eyeFrame: "circle",
    eyeBall: "circle",
  },
  {
    id: "emerald-tech",
    name: "Emerald Tech",
    fg: "#047857",
    fg2: "#059669",
    bg: "#ffffff",
    grad: "horizontal",
    dot: "gem",
    eyeFrame: "rounded",
    eyeBall: "square",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    fg: "#c2410c",
    fg2: "#e11d48",
    bg: "#ffffff",
    grad: "horizontal",
    dot: "rounded",
    eyeFrame: "leaf",
    eyeBall: "leaf",
  },
  {
    id: "deep-indigo",
    name: "Deep Indigo",
    fg: "#4338ca",
    fg2: "#6366f1",
    bg: "#ffffff",
    grad: "radial",
    dot: "circle",
    eyeFrame: "rounded",
    eyeBall: "circle",
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    fg: "#000000",
    fg2: "#000000",
    bg: "#ffffff",
    grad: "solid",
    dot: "square",
    eyeFrame: "square",
    eyeBall: "square",
  },
];

export function BrandKitBar({ onOpenSaveKitModal }: BrandKitBarProps) {
  const { applyPreset, applyBrandKit, fg_color, fg_color_2, gradient_type } = useStudioStore();

  const { data: customKits = [] } = useQuery<BrandKitRecord[]>({
    queryKey: ["brand-kits"],
    queryFn: () => api.getBrandKits(),
  });

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            Brand Kits & Color Schemes
          </span>
        </div>
        <button
          onClick={onOpenSaveKitModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-blue-400 hover:text-blue-300 border border-blue-500/20 text-xs font-medium transition-all"
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          <span>Save Current Kit</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {/* Built-in Presets */}
        {PRESETS.map((p) => {
          const isActive = fg_color === p.fg && fg_color_2 === p.fg2 && gradient_type === p.grad;
          return (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-800 border-blue-500/60 text-white shadow-sm shadow-blue-500/10"
                  : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full flex-shrink-0 border border-white/20"
                style={{
                  background:
                    p.grad === "solid"
                      ? p.fg
                      : `linear-gradient(135deg, ${p.fg}, ${p.fg2})`,
                }}
              />
              <span>{p.name}</span>
            </button>
          );
        })}

        {/* Custom Saved Kits from DB */}
        {customKits.map((kit) => (
          <button
            key={kit.id}
            onClick={() => applyBrandKit(kit)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 text-indigo-200 hover:bg-indigo-900/30 text-xs font-medium transition-all"
          >
            <span
              className="h-3 w-3 rounded-full flex-shrink-0 border border-white/20"
              style={{
                background:
                  kit.gradient_type === "solid"
                    ? kit.fg_color
                    : `linear-gradient(135deg, ${kit.fg_color}, ${kit.fg_color_2 || kit.fg_color})`,
              }}
            />
            <span>{kit.name}</span>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-1 py-0.2 rounded">Custom</span>
          </button>
        ))}
      </div>
    </div>
  );
}


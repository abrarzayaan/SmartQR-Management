"use client";

import React from "react";
import { Paintbrush, Sparkles } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { GradientType } from "@/lib/types";

const GRADIENT_TYPES: { id: GradientType; label: string }[] = [
  { id: "solid", label: "Solid Color" },
  { id: "horizontal", label: "Linear Flow" },
  { id: "radial", label: "Radial Sphere" },
];

export function ColorEngine() {
  const {
    gradient_type,
    fg_color,
    fg_color_2,
    bg_color,
    setField,
  } = useStudioStore();

  const isTransparent = bg_color === "transparent";

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-blue-400" />
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Color Engine & Gradients
          </label>
        </div>
      </div>

      {/* Gradient Mode Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {GRADIENT_TYPES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setField("gradient_type", g.id)}
            className={`py-2 px-2 rounded-xl border text-center text-xs font-medium transition-all ${
              gradient_type === g.id
                ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Colors Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Foreground Primary */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
            {gradient_type === "solid" ? "QR Pattern Color" : "Start Gradient Color"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fg_color}
              onChange={(e) => setField("fg_color", e.target.value)}
              className="h-9 w-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5 flex-shrink-0"
            />
            <input
              type="text"
              value={fg_color}
              onChange={(e) => setField("fg_color", e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
            />
          </div>
        </div>

        {/* Foreground Secondary (if gradient active) */}
        {gradient_type !== "solid" && (
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              End Gradient Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fg_color_2}
                onChange={(e) => setField("fg_color_2", e.target.value)}
                className="h-9 w-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={fg_color_2}
                onChange={(e) => setField("fg_color_2", e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
              />
            </div>
          </div>
        )}

        {/* Background Color */}
        <div className={gradient_type === "solid" ? "" : "sm:col-span-2"}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-slate-400 block">
              Background Canvas
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={(e) => {
                  setField("bg_color", e.target.checked ? "transparent" : "#ffffff");
                }}
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span>Transparent</span>
            </label>
          </div>

          {!isTransparent && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bg_color}
                onChange={(e) => setField("bg_color", e.target.value)}
                className="h-9 w-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={bg_color}
                onChange={(e) => setField("bg_color", e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


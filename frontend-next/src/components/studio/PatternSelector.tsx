"use client";

import React from "react";
import { Grid, Circle, Diamond, Droplet, LayoutGrid, Square } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { DotStyle } from "@/lib/types";

const PATTERNS: { id: DotStyle; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "rounded", label: "Rounded", icon: Grid, desc: "Smooth curved dots" },
  { id: "circle", label: "Circle", icon: Circle, desc: "Precise circular dots" },
  { id: "gem", label: "Gem", icon: Diamond, desc: "Faceted diamond dots" },
  { id: "liquid", label: "Liquid", icon: Droplet, desc: "Fluid organic blobs" },
  { id: "gapped", label: "Gapped", icon: LayoutGrid, desc: "Spaced micro-tiles" },
  { id: "square", label: "Classic", icon: Square, desc: "Standard sharp matrix" },
];

export function PatternSelector() {
  const { dot_style, setField } = useStudioStore();

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          Dot Geometry Pattern
        </label>
        <span className="text-xs text-blue-400 capitalize font-medium">{dot_style}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PATTERNS.map((p) => {
          const Icon = p.icon;
          const isSelected = dot_style === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setField("dot_style", p.id)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-blue-600/15 border-blue-500/80 text-white shadow-sm shadow-blue-500/10"
                  : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-blue-500/20 text-blue-400" : "bg-slate-900 text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-200 truncate">{p.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{p.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


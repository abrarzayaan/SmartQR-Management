"use client";

import React from "react";
import { Grid, Circle, Diamond, Droplet, LayoutGrid, Square } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { DotStyle } from "@/lib/types";
import { Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const PATTERNS: { id: DotStyle; label: string; icon: React.ElementType }[] = [
  { id: "rounded", label: "Rounded", icon: Grid },
  { id: "circle", label: "Dots", icon: Circle },
  { id: "gem", label: "Diamond", icon: Diamond },
  { id: "liquid", label: "Liquid", icon: Droplet },
  { id: "gapped", label: "Tiles", icon: LayoutGrid },
  { id: "square", label: "Classic", icon: Square },
];

export function PatternSelector() {
  const { dot_style, setField } = useStudioStore();

  return (
    <div>
      <Label>Dot Pattern</Label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PATTERNS.map((p) => {
          const Icon = p.icon;
          const isSelected = dot_style === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setField("dot_style", p.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all",
                isSelected
                  ? "bg-emerald-500 text-zinc-950 font-semibold border-emerald-400 shadow-sm"
                  : "bg-canvas text-ink-secondary border-line hover:border-line-strong hover:bg-elevated hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[11px]">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

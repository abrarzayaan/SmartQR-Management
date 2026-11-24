"use client";

import React from "react";
import { BookmarkPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { BrandKitRecord, DotStyle, EyeBall, EyeFrame, GradientType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

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
}

const PRESETS: PresetItem[] = [
  {
    id: "classic-ink",
    name: "Classic Ink",
    fg: "#111827",
    fg2: "#374151",
    bg: "#ffffff",
    grad: "solid",
    dot: "rounded",
    eyeFrame: "rounded",
    eyeBall: "circle",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    fg: "#1d4ed8",
    fg2: "#0284c7",
    bg: "#ffffff",
    grad: "horizontal",
    dot: "liquid",
    eyeFrame: "circle",
    eyeBall: "circle",
  },
  {
    id: "forest-green",
    name: "Forest",
    fg: "#047857",
    fg2: "#059669",
    bg: "#ffffff",
    grad: "horizontal",
    dot: "gem",
    eyeFrame: "rounded",
    eyeBall: "square",
  },
  {
    id: "warm-coral",
    name: "Warm Coral",
    fg: "#c2410c",
    fg2: "#e11d48",
    bg: "#ffffff",
    grad: "horizontal",
    dot: "rounded",
    eyeFrame: "leaf",
    eyeBall: "leaf",
  },
  {
    id: "royal-indigo",
    name: "Indigo",
    fg: "#4338ca",
    fg2: "#6366f1",
    bg: "#ffffff",
    grad: "radial",
    dot: "circle",
    eyeFrame: "rounded",
    eyeBall: "circle",
  },
];

export function BrandKitBar({ onOpenSaveKitModal }: BrandKitBarProps) {
  const { applyPreset, applyBrandKit, fg_color, fg_color_2, gradient_type } = useStudioStore();

  const { data: customKits = [] } = useQuery<BrandKitRecord[]>({
    queryKey: ["brand-kits"],
    queryFn: () => api.getBrandKits(),
  });

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="mb-0">Quick Style Presets</Label>
        <Button
          variant="outline"
          size="xs"
          onClick={onOpenSaveKitModal}
          leftIcon={<BookmarkPlus className="h-3.5 w-3.5 text-gray-500" />}
        >
          Save as Kit
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PRESETS.map((p) => {
          const isActive = fg_color === p.fg && fg_color_2 === p.fg2 && gradient_type === p.grad;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={cn(
                "shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                isActive
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0 ring-1 ring-black/10"
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

        {customKits.map((kit) => (
          <button
            key={kit.id}
            type="button"
            onClick={() => applyBrandKit(kit)}
            className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100/70 text-xs font-medium transition-all"
          >
            <span
              className="h-3 w-3 rounded-full shrink-0 ring-1 ring-black/10"
              style={{
                background:
                  kit.gradient_type === "solid"
                    ? kit.fg_color
                    : `linear-gradient(135deg, ${kit.fg_color}, ${kit.fg_color_2 || kit.fg_color})`,
              }}
            />
            <span>{kit.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useStudioStore } from "@/lib/store";
import { GradientType } from "@/lib/types";
import { Input, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const GRADIENT_TYPES: { id: GradientType; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "horizontal", label: "Linear Gradient" },
  { id: "radial", label: "Radial Gradient" },
];

export function ColorEngine() {
  const { gradient_type, fg_color, fg_color_2, bg_color, setField } = useStudioStore();
  const isTransparent = bg_color === "transparent";

  return (
    <div className="space-y-4">
      <div>
        <Label>Fill Style</Label>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_TYPES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setField("gradient_type", g.id)}
              className={cn(
                "py-2 px-3 rounded-xl border text-xs font-medium transition-all",
                gradient_type === g.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>{gradient_type === "solid" ? "QR Color" : "Gradient Start"}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fg_color}
              onChange={(e) => setField("fg_color", e.target.value)}
              className="h-10 w-10 rounded-xl border border-gray-200 bg-white cursor-pointer p-1 shrink-0"
            />
            <Input
              value={fg_color}
              onChange={(e) => setField("fg_color", e.target.value)}
              className="font-mono text-xs uppercase"
            />
          </div>
        </div>

        {gradient_type !== "solid" && (
          <div>
            <Label>Gradient End</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fg_color_2}
                onChange={(e) => setField("fg_color_2", e.target.value)}
                className="h-10 w-10 rounded-xl border border-gray-200 bg-white cursor-pointer p-1 shrink-0"
              />
              <Input
                value={fg_color_2}
                onChange={(e) => setField("fg_color_2", e.target.value)}
                className="font-mono text-xs uppercase"
              />
            </div>
          </div>
        )}

        <div className={gradient_type === "solid" ? "" : "sm:col-span-2"}>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="mb-0">Background</Label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={(e) => setField("bg_color", e.target.checked ? "transparent" : "#ffffff")}
                className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
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
                className="h-10 w-10 rounded-xl border border-gray-200 bg-white cursor-pointer p-1 shrink-0"
              />
              <Input
                value={bg_color}
                onChange={(e) => setField("bg_color", e.target.value)}
                className="font-mono text-xs uppercase"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useStudioStore } from "@/lib/store";
import { EyeBall, EyeFrame } from "@/lib/types";
import { Input, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const EYE_FRAMES: { id: EyeFrame; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "leaf", label: "Leaf" },
];

const EYE_BALLS: { id: EyeBall; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "diamond", label: "Diamond" },
  { id: "leaf", label: "Leaf" },
];

export function EyeSelector() {
  const {
    eye_frame,
    eye_ball,
    eye_color,
    has_custom_eye_color,
    setField,
  } = useStudioStore();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Corner Outer Frame</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {EYE_FRAMES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setField("eye_frame", f.id)}
                className={cn(
                  "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  eye_frame === f.id
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Corner Inner Dot</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {EYE_BALLS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setField("eye_ball", b.id)}
                className={cn(
                  "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  eye_ball === b.id
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={has_custom_eye_color}
            onChange={(e) => {
              const checked = e.target.checked;
              setField("has_custom_eye_color", checked);
              if (checked && !eye_color) {
                setField("eye_color", "#2563eb");
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span>Use custom corner eye color</span>
        </label>

        {has_custom_eye_color && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={eye_color || "#2563eb"}
              onChange={(e) => setField("eye_color", e.target.value)}
              className="h-8 w-8 rounded-lg border border-gray-200 bg-white cursor-pointer p-0.5"
            />
            <Input
              value={eye_color || "#2563eb"}
              onChange={(e) => setField("eye_color", e.target.value)}
              className="w-24 h-8 font-mono text-xs uppercase"
            />
          </div>
        )}
      </div>
    </div>
  );
}

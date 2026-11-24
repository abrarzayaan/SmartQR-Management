"use client";

import React from "react";
import { useStudioStore } from "@/lib/store";
import { FrameStyle } from "@/lib/types";
import { Input, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const FRAME_STYLES: { id: FrameStyle; label: string }[] = [
  { id: "none", label: "No Frame" },
  { id: "bottom_banner", label: "Bottom Banner" },
  { id: "top_banner", label: "Top Banner" },
  { id: "badge", label: "Rounded Badge" },
];

export function CtaFrameCustom() {
  const { frame_style, frame_text, frame_color, setField } = useStudioStore();

  return (
    <div className="space-y-4">
      <div>
        <Label>Call-to-Action Frame</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FRAME_STYLES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setField("frame_style", f.id)}
              className={cn(
                "py-2.5 px-3 rounded-xl border text-xs font-medium transition-all",
                frame_style === f.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {frame_style !== "none" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="sm:col-span-2">
            <Label>Banner Text</Label>
            <Input
              value={frame_text}
              onChange={(e) => setField("frame_text", e.target.value)}
              placeholder="SCAN ME"
              maxLength={24}
              className="uppercase font-semibold tracking-wide"
            />
          </div>
          <div>
            <Label>Frame Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={frame_color}
                onChange={(e) => setField("frame_color", e.target.value)}
                className="h-10 w-10 rounded-xl border border-gray-200 bg-white cursor-pointer p-1 shrink-0"
              />
              <Input
                value={frame_color}
                onChange={(e) => setField("frame_color", e.target.value)}
                className="font-mono text-xs uppercase"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

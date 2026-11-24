"use client";

import React from "react";
import { Frame, Type } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { FrameStyle } from "@/lib/types";

const FRAME_STYLES: { id: FrameStyle; label: string; desc: string }[] = [
  { id: "none", label: "None", desc: "Clean borderless QR" },
  { id: "bottom_banner", label: "Bottom Banner", desc: "SaaS callout ribbon" },
  { id: "top_banner", label: "Top Banner", desc: "Header banner CTA" },
  { id: "badge", label: "Badge Pill", desc: "Rounded badge badge" },
];

export function CtaFrameCustom() {
  const { frame_style, frame_text, frame_color, setField } = useStudioStore();

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Frame className="h-4 w-4 text-blue-400" />
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            CTA Frame & Banners
          </label>
        </div>
      </div>

      {/* Frame Style Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FRAME_STYLES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setField("frame_style", f.id)}
            className={`py-2 px-2 rounded-xl border text-center transition-all ${
              frame_style === f.id
                ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-medium">{f.label}</div>
            <div className="text-[10px] text-slate-500">{f.desc}</div>
          </button>
        ))}
      </div>

      {/* Frame Text & Color Settings (shown when a frame is chosen) */}
      {frame_style !== "none" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Call-To-Action Text
            </label>
            <div className="relative">
              <input
                type="text"
                value={frame_text}
                onChange={(e) => setField("frame_text", e.target.value)}
                placeholder="SCAN ME"
                maxLength={24}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold tracking-wider"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Frame Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={frame_color}
                onChange={(e) => setField("frame_color", e.target.value)}
                className="h-8 w-8 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5 flex-shrink-0"
              />
              <input
                type="text"
                value={frame_color}
                onChange={(e) => setField("frame_color", e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono uppercase"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


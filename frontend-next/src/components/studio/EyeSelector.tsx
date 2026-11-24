"use client";

import React from "react";
import { Eye, Square, Circle, Sparkles, Feather } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { EyeBall, EyeFrame } from "@/lib/types";

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
    fg_color,
    setField,
  } = useStudioStore();

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-400" />
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Corner Eye Geometries
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Outer Frame Shape */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
            Outer Eye Frame
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {EYE_FRAMES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setField("eye_frame", f.id)}
                className={`py-2 px-1.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  eye_frame === f.id
                    ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inner Ball Shape */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
            Inner Eye Ball
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {EYE_BALLS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setField("eye_ball", b.id)}
                className={`py-2 px-1.5 rounded-xl border text-center text-xs font-medium transition-all ${
                  eye_ball === b.id
                    ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Eye Color Tint */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
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
            className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
          />
          <span>Custom Eye Color (Distinct from QR Dots)</span>
        </label>

        {has_custom_eye_color && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={eye_color || "#2563eb"}
              onChange={(e) => setField("eye_color", e.target.value)}
              className="h-7 w-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={eye_color || "#2563eb"}
              onChange={(e) => setField("eye_color", e.target.value)}
              className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono uppercase"
            />
          </div>
        )}
      </div>
    </div>
  );
}


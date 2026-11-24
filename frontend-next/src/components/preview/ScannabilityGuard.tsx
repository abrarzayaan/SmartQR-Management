"use client";

import React, { useMemo } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Wand2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { calculateScannabilityScore, getContrastRatio } from "@/lib/utils";

export function ScannabilityGuard() {
  const {
    fg_color,
    bg_color,
    fg_color_2,
    gradient_type,
    margin,
    error_correction,
    logo_type,
    logo_data,
    autoFixContrast,
  } = useStudioStore();

  const hasLogo = logo_type !== "none" || Boolean(logo_data);

  const evaluation = useMemo(() => {
    return calculateScannabilityScore({
      fg_color,
      bg_color,
      fg_color_2,
      gradient_type,
      margin,
      error_correction,
      hasLogo,
    });
  }, [fg_color, bg_color, fg_color_2, gradient_type, margin, error_correction, hasLogo]);

  const contrastRatio = useMemo(() => {
    return getContrastRatio(fg_color, bg_color);
  }, [fg_color, bg_color]);

  const status = evaluation?.status || "optimal";
  const isLowContrast = status === "critical";
  const isWarning = status === "warning";

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-3">
      {/* Header and Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "optimal" ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : isWarning ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          )}
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            Scannability Guard
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              status === "optimal"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : isWarning
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
            }`}
          >
            {evaluation.score}% {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            status === "optimal"
              ? "bg-emerald-500"
              : isWarning
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
          style={{ width: `${evaluation?.score ?? 95}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
          <span className="text-slate-400 block mb-0.5">WCAG 2.1 Contrast</span>
          <span className="text-white font-mono font-semibold">{contrastRatio.toFixed(1)}:1</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
          <span className="text-slate-400 block mb-0.5">Error Correction</span>
          <span className="text-white font-mono font-semibold">EC-{error_correction} (30% Max)</span>
        </div>
      </div>

      {/* Issues or Recommendations */}
      {evaluation?.issues && evaluation.issues.length > 0 && (
        <div className="space-y-1 pt-1">
          {evaluation.issues.map((issue, idx) => (
            <p key={idx} className="text-[11px] text-amber-300/90 flex items-start gap-1.5 leading-snug">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>{issue}</span>
            </p>
          ))}
        </div>
      )}

      {/* 1-Click Auto-Fix Contrast Button */}
      {(isLowContrast || isWarning) && (
        <button
          type="button"
          onClick={autoFixContrast}
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium transition-all"
        >
          <Wand2 className="h-3.5 w-3.5 text-blue-400" />
          <span>Auto-Fix Contrast (Guaranteed Scan)</span>
        </button>
      )}
    </div>
  );
}


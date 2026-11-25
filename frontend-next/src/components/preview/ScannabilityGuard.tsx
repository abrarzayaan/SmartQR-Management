"use client";

import React, { useMemo } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Wand2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { calculateScannabilityScore, getContrastRatio, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {status === "optimal" ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : isWarning ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-red-400" />
          )}
          <span className="text-xs font-semibold text-ink">Scannability Check</span>
        </div>

        <Badge
          variant={status === "optimal" ? "success" : isWarning ? "warning" : "danger"}
          className="font-mono"
        >
          {evaluation.score}% {evaluation.grade}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 rounded-full",
            status === "optimal"
              ? "bg-emerald-500"
              : isWarning
              ? "bg-amber-500"
              : "bg-red-500"
          )}
          style={{ width: `${evaluation?.score ?? 95}%` }}
        />
      </div>

      {/* Compact Metrics */}
      <div className="flex items-center justify-between text-[11px] text-ink-muted">
        <span>
          Contrast: <strong className="text-ink font-mono">{contrastRatio.toFixed(1)}:1</strong>
        </span>
        <span>
          Resilience: <strong className="text-ink font-mono">EC-{error_correction}</strong>
        </span>
      </div>

      {/* Issues */}
      {evaluation?.issues && evaluation.issues.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-2.5 space-y-1">
          {evaluation.issues.map((issue, idx) => (
            <p key={idx} className="text-[11px] text-amber-300 leading-snug">
              • {issue}
            </p>
          ))}
        </div>
      )}

      {(isLowContrast || isWarning) && (
        <Button
          variant="outline"
          size="sm"
          onClick={autoFixContrast}
          leftIcon={<Wand2 className="h-3.5 w-3.5 text-emerald-400" />}
          className="w-full"
        >
          Auto-Fix Contrast
        </Button>
      )}
    </div>
  );
}

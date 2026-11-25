"use client";

import React, { useEffect, useState, useRef } from "react";
import { ExternalLink, RefreshCw, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { ScannabilityGuard } from "./ScannabilityGuard";
import { ExportBar } from "./ExportBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function LivePreviewCard() {
  const store = useStudioStore();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const payload = store.getPayload();
        const previewBlob = await api.preview(payload);

        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
        }

        const newUrl = URL.createObjectURL(previewBlob);
        currentBlobUrlRef.current = newUrl;
        store.setField("previewBlobUrl", newUrl);
        setBlob(previewBlob);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [
    store.target_url,
    store.fg_color,
    store.bg_color,
    store.gradient_type,
    store.fg_color_2,
    store.dot_style,
    store.eye_frame,
    store.eye_ball,
    store.eye_color,
    store.has_custom_eye_color,
    store.error_correction,
    store.margin,
    store.size,
    store.logo_type,
    store.logo_data,
    store.frame_style,
    store.frame_text,
    store.frame_color,
  ]);

  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="sticky top-24 space-y-4">
      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Live Preview</span>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            ) : (
              <Badge variant={store.qr_type === "dynamic" ? "info" : "default"}>
                {store.qr_type === "dynamic" ? "Dynamic" : "Static"}
              </Badge>
            )}
          </div>

          {/* QR Canvas */}
          <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl bg-preview-grid border border-line p-5 flex items-center justify-center overflow-hidden">
            {store.previewBlobUrl ? (
              <img
                src={store.previewBlobUrl}
                alt="QR Code Preview"
                className={`max-h-full max-w-full object-contain rounded-lg transition-opacity duration-200 ${
                  loading ? "opacity-70" : "opacity-100"
                }`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-ink-muted">
                <QrCode className="h-12 w-12 stroke-[1.2] mb-2 animate-pulse" />
                <span className="text-xs">Generating preview...</span>
              </div>
            )}
          </div>

          {/* Target Preview Pill */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-canvas border border-line text-xs">
            <span className="text-ink-secondary font-mono text-[11px] truncate flex-1">
              {store.target_url}
            </span>
            {store.target_url.startsWith("http") && (
              <a
                href={store.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted hover:text-ink transition-colors shrink-0"
                title="Open URL"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Primary Save & Export Actions */}
          <div className="pt-2 border-t border-line">
            <ExportBar previewBlob={blob} />
          </div>
        </CardContent>
      </Card>

      {/* Scannability Widget */}
      <ScannabilityGuard />
    </div>
  );
}

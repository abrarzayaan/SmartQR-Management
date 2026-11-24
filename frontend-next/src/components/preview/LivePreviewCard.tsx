"use client";

import React, { useEffect, useState, useRef } from "react";
import { ExternalLink, RefreshCw, Smartphone, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { ScannabilityGuard } from "./ScannabilityGuard";
import { ExportBar } from "./ExportBar";

export function LivePreviewCard() {
  const store = useStudioStore();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Debounced live preview generation
  useEffect(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const payload = store.getPayload();
        const previewBlob = await api.preview(payload);

        // Revoke previous object url to prevent memory leaks
        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
        }

        const newUrl = URL.createObjectURL(previewBlob);
        currentBlobUrlRef.current = newUrl;
        store.setField("previewBlobUrl", newUrl);
        setBlob(previewBlob);
        setLoading(false);
      } catch (err: any) {
        setError("Preview generation failed");
        setLoading(false);
      }
    }, 280);

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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="sticky top-20 space-y-4">
      {/* Visual Canvas Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Live Real-Time Engine
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Rendering</span>
            </div>
          )}
        </div>

        {/* QR Display Frame */}
        <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 p-5 flex items-center justify-center shadow-inner overflow-hidden">
          {/* Subtle micro dot grid background */}
          <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

          {store.previewBlobUrl ? (
            <img
              src={store.previewBlobUrl}
              alt="Dynamic QR Code Preview"
              className={`relative z-10 max-h-full max-w-full object-contain rounded-lg transition-opacity duration-200 ${
                loading ? "opacity-75 blur-[0.5px]" : "opacity-100"
              }`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <QrCode className="h-12 w-12 stroke-[1.2] mb-2 text-slate-600 animate-pulse" />
              <span className="text-xs">Preparing preview...</span>
            </div>
          )}
        </div>

        {/* Target Destination Bar */}
        <div className="mt-4 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              {store.qr_type === "dynamic" ? "Tracked Destination" : "Static Payload"}
            </span>
            <span className="text-slate-300 font-mono text-[11px] truncate block">
              {store.target_url}
            </span>
          </div>
          {store.target_url.startsWith("http") && (
            <a
              href={store.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex-shrink-0"
              title="Open Destination"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Export & Primary Action Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800/60">
          <ExportBar previewBlob={blob} />
        </div>
      </div>

      {/* Scannability Guard */}
      <ScannabilityGuard />
    </div>
  );
}


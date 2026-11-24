"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Share2,
  FileDown,
  Printer,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { copyToClipboard } from "@/lib/utils";

interface ExportBarProps {
  previewBlob: Blob | null;
}

export function ExportBar({ previewBlob }: ExportBarProps) {
  const queryClient = useQueryClient();
  const { getPayload, previewBlobUrl, setActiveTab } = useStudioStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadFormatOpen, setDownloadFormatOpen] = useState(false);

  // Mutation to create QR
  const createMutation = useMutation({
    mutationFn: () => api.createQr(getPayload()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });

      const destination = data.dynamic_url || `${window.location.origin}/r/${data.short_code}`;

      toast.success("Smart QR Code Created Successfully!", {
        description: `Short Code: ${data.short_code} • Live routing active`,
        action: {
          label: "View in Manager",
          onClick: () => setActiveTab("manager"),
        },
      });
    },
    onError: (err: any) => {
      toast.error("Failed to create QR Code", {
        description: err?.message || "Internal server error occurred",
      });
    },
  });

  // Direct PNG Download (renders requested resolution from backend)
  const handleDownloadPng = async (size: number = 1200) => {
    try {
      const payload = getPayload();
      const res = await fetch(`/api/qr/preview?format=png&size=${size}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smartqr-${Date.now()}-${size}px.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded PNG (${size}x${size}px)`);
    } catch {
      toast.error("Failed to download PNG");
    }
  };

  // Direct 300 DPI Print PDF Download from backend
  const handleDownloadPdf = async () => {
    try {
      const payload = getPayload();
      const res = await fetch("/api/qr/preview?format=pdf&size=2400", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smartqr-print-300dpi-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Downloaded 300 DPI Print PDF");
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  // Direct SVG Download from backend
  const handleDownloadSvg = async () => {
    try {
      const payload = getPayload();
      const res = await fetch("/api/qr/preview?format=svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smartqr-vector-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Downloaded SVG Vector Graphic");
    } catch {
      toast.error("Failed to download SVG");
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!previewBlob) {
      toast.error("Preview image unavailable");
      return;
    }
    try {
      if (typeof window !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ "image/png": previewBlob });
        await navigator.clipboard.write([item]);
        toast.success("QR Code image copied to clipboard!");
      } else {
        toast.info("Direct image copy not supported in this browser");
      }
    } catch {
      toast.error("Clipboard permission denied");
    }
  };

  // Copy Link
  const handleCopyLink = async () => {
    const payload = getPayload();
    const success = await copyToClipboard(payload.target_url);
    if (success) {
      setCopiedLink(true);
      toast.success("Destination payload copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Primary Action Button */}
      <button
        type="button"
        disabled={createMutation.isPending}
        onClick={() => createMutation.mutate()}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Smart QR...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-blue-200" />
            <span>Save & Create Smart QR</span>
          </>
        )}
      </button>

      {/* Secondary Quick Export Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleDownloadPng(1200)}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-medium transition-all"
        >
          <Download className="h-3.5 w-3.5 text-blue-400" />
          <span>PNG (1200px)</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadSvg}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-medium transition-all"
        >
          <FileDown className="h-3.5 w-3.5 text-indigo-400" />
          <span>SVG Vector</span>
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-medium transition-all"
        >
          <Copy className="h-3.5 w-3.5 text-emerald-400" />
          <span>Copy Image</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
        <button
          type="button"
          onClick={handleCopyLink}
          className="hover:text-blue-400 flex items-center gap-1 transition-all"
        >
          {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copiedLink ? "Link Copied" : "Copy Target URL"}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="hover:text-blue-400 flex items-center gap-1 transition-all"
        >
          <Printer className="h-3 w-3" />
          <span>300 DPI Print PDF</span>
        </button>
      </div>
    </div>
  );
}


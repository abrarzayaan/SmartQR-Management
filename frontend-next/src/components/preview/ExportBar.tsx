"use client";

import React, { useState } from "react";
import { Download, Copy, Check, FileDown, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ExportBarProps {
  previewBlob: Blob | null;
}

export function ExportBar({ previewBlob }: ExportBarProps) {
  const queryClient = useQueryClient();
  const { getPayload, setActiveTab } = useStudioStore();
  const [copiedLink, setCopiedLink] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => api.createQr(getPayload()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });

      toast.success("QR Code saved to workspace!", {
        description: `Short link: /r/${data.short_code}`,
        action: {
          label: "View in My QRs",
          onClick: () => setActiveTab("manager"),
        },
      });
    },
    onError: (err: any) => {
      toast.error("Failed to save QR Code", {
        description: err?.message || "Please check that the backend is running.",
      });
    },
  });

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
      toast.success(`Downloaded PNG (${size}px)`);
    } catch {
      toast.error("Failed to download PNG");
    }
  };

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
      toast.success("Downloaded SVG vector");
    } catch {
      toast.error("Failed to download SVG");
    }
  };

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

  const handleCopyImage = async () => {
    if (!previewBlob) {
      toast.error("Preview image unavailable");
      return;
    }
    try {
      if (typeof window !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ "image/png": previewBlob });
        await navigator.clipboard.write([item]);
        toast.success("QR image copied to clipboard");
      } else {
        toast.info("Image copy not supported in this browser");
      }
    } catch {
      toast.error("Clipboard permission denied");
    }
  };

  const handleCopyLink = async () => {
    const payload = getPayload();
    const success = await copyToClipboard(payload.target_url);
    if (success) {
      setCopiedLink(true);
      toast.success("Target payload copied");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary Save Button */}
      <Button
        variant="primary"
        size="lg"
        loading={createMutation.isPending}
        onClick={() => createMutation.mutate()}
        leftIcon={<Save className="h-4 w-4" />}
        className="w-full"
      >
        {createMutation.isPending ? "Saving QR Code..." : "Save QR Code"}
      </Button>

      {/* Download Format Row */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadPng(1200)}
          leftIcon={<Download className="h-3.5 w-3.5 text-gray-500" />}
        >
          PNG
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSvg}
          leftIcon={<FileDown className="h-3.5 w-3.5 text-gray-500" />}
        >
          SVG
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          leftIcon={<Printer className="h-3.5 w-3.5 text-gray-500" />}
        >
          Print PDF
        </Button>
      </div>

      {/* Subtle Utility Row */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="xs"
          onClick={handleCopyImage}
          leftIcon={<Copy className="h-3 w-3" />}
        >
          Copy Image
        </Button>

        <Button
          variant="ghost"
          size="xs"
          onClick={handleCopyLink}
          leftIcon={
            copiedLink ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )
          }
        >
          {copiedLink ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </div>
  );
}

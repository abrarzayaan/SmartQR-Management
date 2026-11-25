"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  BarChart2,
  GitFork,
  Edit,
  Trash2,
  Lock,
  Clock,
  Hash,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeRecord } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface QrCardProps {
  qr: QRCodeRecord;
  onOpenAnalytics: (qr: QRCodeRecord) => void;
  onOpenRules: (qr: QRCodeRecord) => void;
  onOpenEdit: (qr: QRCodeRecord) => void;
  onDelete: (id: number) => void;
}

export function QrCard({
  qr,
  onOpenAnalytics,
  onOpenRules,
  onOpenEdit,
  onDelete,
}: QrCardProps) {
  const [copied, setCopied] = useState(false);

  const shortUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${qr.short_code}`
      : `/r/${qr.short_code}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(shortUrl);
    if (success) {
      setCopied(true);
      toast.success("Short link copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/qr/${qr.id}/download/png?size=1200`;
    link.download = `smartqr-${qr.short_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded QR PNG");
  };

  const isExpired = qr.expires_at && new Date(qr.expires_at) < new Date();

  return (
    <div className="bg-surface border border-line hover:border-line-strong rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Row: Thumbnail + Info */}
        <div className="flex items-start gap-3.5">
          <div className="h-16 w-16 rounded-xl bg-canvas border border-line p-1.5 flex items-center justify-center shrink-0">
            <img
              src={`/api/qr/${qr.id}/image`}
              alt={qr.title}
              className="max-h-full max-w-full object-contain rounded"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge variant={qr.qr_type === "dynamic" ? "info" : "default"}>
                {qr.qr_type}
              </Badge>
              <Badge variant="outline" className="uppercase text-[10px]">
                {qr.content_type}
              </Badge>
            </div>

            <h4 className="font-semibold text-ink text-sm truncate" title={qr.title}>
              {qr.title}
            </h4>
            <p className="text-[11px] text-ink-muted font-mono truncate mt-0.5" title={qr.target_url}>
              {qr.target_url}
            </p>
          </div>
        </div>

        {/* Meta Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-canvas hover:bg-elevated border border-line text-ink-secondary text-[11px] font-mono transition-colors"
            title="Copy short redirect link"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3 text-ink-muted" />
            )}
            <span>/r/{qr.short_code}</span>
          </button>

          <Badge variant="default" className="font-mono">
            <BarChart2 className="h-3 w-3 text-ink-muted" />
            {qr.scan_count} scans
          </Badge>

          {qr.is_password_protected && (
            <Badge variant="warning">
              <Lock className="h-2.5 w-2.5" />
              PIN
            </Badge>
          )}

          {qr.expires_at && (
            <Badge variant={isExpired ? "danger" : "outline"}>
              <Clock className="h-2.5 w-2.5" />
              {isExpired ? "Expired" : "Timed"}
            </Badge>
          )}

          {qr.scan_limit && (
            <Badge variant="outline">
              <Hash className="h-2.5 w-2.5" />
              Max {qr.scan_limit}
            </Badge>
          )}

          {typeof qr.rules_count === "number" && qr.rules_count > 0 && (
            <Badge variant="info">
              <GitFork className="h-2.5 w-2.5" />
              {qr.rules_count} rules
            </Badge>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 mt-4 border-t border-line">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenAnalytics(qr)}
            title="View Analytics"
          >
            <BarChart2 className="h-4 w-4 text-ink-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenRules(qr)}
            title="Smart Routing Rules"
          >
            <GitFork className="h-4 w-4 text-ink-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenEdit(qr)}
            title="Edit Destination"
          >
            <Edit className="h-4 w-4 text-ink-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            title="Download PNG"
          >
            <Download className="h-4 w-4 text-ink-secondary" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm(`Delete QR code "${qr.title}"?`)) {
              onDelete(qr.id);
            }
          }}
          title="Delete QR"
          className="hover:text-red-400 hover:bg-red-500/15"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  ExternalLink,
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
  Folder,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeRecord } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

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
      toast.success("Short redirect URL copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/qr/${qr.id}/png`;
    link.download = `smartqr-${qr.short_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded QR PNG");
  };

  const isExpired = qr.expires_at && new Date(qr.expires_at) < new Date();

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 backdrop-blur-sm transition-all flex flex-col justify-between group">
      {/* Top Details & Thumbnail */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="h-16 w-16 rounded-xl bg-slate-950 border border-slate-800/80 p-1.5 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 transition-all">
            <img
              src={`/api/qr/${qr.id}/png`}
              alt={qr.title}
              className="max-h-full max-w-full object-contain rounded"
              loading="lazy"
            />
          </div>

          {/* Title & Tags */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  qr.qr_type === "dynamic"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {qr.qr_type}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-950 text-slate-400 border border-slate-800">
                {qr.content_type}
              </span>
            </div>

            <h4 className="font-semibold text-white text-sm truncate" title={qr.title}>
              {qr.title}
            </h4>

            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5" title={qr.target_url}>
              {qr.target_url}
            </div>
          </div>
        </div>

        {/* Short Code & Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Direct Short Link Pill */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white text-[11px] font-mono transition-all"
            title="Click to copy short code link"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
            <span>/r/{qr.short_code}</span>
          </button>

          {/* Total Scans Pill */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800/80 text-blue-400 text-[11px] font-mono font-medium">
            <BarChart2 className="h-3 w-3" />
            <span>{qr.scan_count} scans</span>
          </span>

          {/* Password Locked Badge */}
          {qr.is_password_protected && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/20"
              title="PIN Gate Active"
            >
              <Lock className="h-2.5 w-2.5" />
              <span>PIN</span>
            </span>
          )}

          {/* Expiration Badge */}
          {qr.expires_at && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                isExpired
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              <Clock className="h-2.5 w-2.5" />
              <span>{isExpired ? "Expired" : "Timed"}</span>
            </span>
          )}

          {/* Scan Limit Badge */}
          {qr.scan_limit && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              <Hash className="h-2.5 w-2.5" />
              <span>Max {qr.scan_limit}</span>
            </span>
          )}

          {/* Smart Rules Badge */}
          {typeof qr.rules_count === "number" && qr.rules_count > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/20">
              <GitFork className="h-2.5 w-2.5" />
              <span>{qr.rules_count} rules</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenAnalytics(qr)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="View Analytics"
          >
            <BarChart2 className="h-4 w-4 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={() => onOpenRules(qr)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Configure Smart Routing Rules"
          >
            <GitFork className="h-4 w-4 text-indigo-400" />
          </button>

          <button
            type="button"
            onClick={() => onOpenEdit(qr)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Edit Destination"
          >
            <Edit className="h-4 w-4 text-slate-300" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Download PNG"
          >
            <Download className="h-4 w-4 text-emerald-400" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm(`Are you sure you want to delete QR code "${qr.title}"?`)) {
              onDelete(qr.id);
            }
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all"
          title="Delete QR"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


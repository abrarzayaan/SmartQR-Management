"use client";

import React from "react";
import { QrCode, Plus, Sparkles } from "lucide-react";
import { QRCodeRecord } from "@/lib/types";
import { QrCard } from "./QrCard";
import { useStudioStore } from "@/lib/store";

interface QrGridProps {
  qrs: QRCodeRecord[];
  isLoading: boolean;
  onOpenAnalytics: (qr: QRCodeRecord) => void;
  onOpenRules: (qr: QRCodeRecord) => void;
  onOpenEdit: (qr: QRCodeRecord) => void;
  onDelete: (id: number) => void;
}

export function QrGrid({
  qrs,
  isLoading,
  onOpenAnalytics,
  onOpenRules,
  onOpenEdit,
  onDelete,
}: QrGridProps) {
  const { setActiveTab } = useStudioStore();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 animate-pulse flex flex-col justify-between"
          >
            <div className="flex gap-3">
              <div className="h-16 w-16 bg-slate-800 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
              </div>
            </div>
            <div className="h-8 bg-slate-800/40 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (qrs.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-3xl bg-slate-900/30">
        <div className="h-14 w-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4">
          <QrCode className="h-7 w-7 text-slate-500" />
        </div>
        <h4 className="text-white font-semibold text-base mb-1">No QR Codes Found</h4>
        <p className="text-slate-400 text-xs max-w-sm mb-5">
          No QR codes match the current search or campaign filter. Create your first branded QR code in the Studio.
        </p>
        <button
          onClick={() => setActiveTab("studio")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Smart QR Code</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {qrs.map((qr) => (
        <QrCard
          key={qr.id}
          qr={qr}
          onOpenAnalytics={onOpenAnalytics}
          onOpenRules={onOpenRules}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


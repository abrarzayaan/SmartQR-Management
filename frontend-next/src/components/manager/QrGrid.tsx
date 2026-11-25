"use client";

import React from "react";
import { QrCode, Plus } from "lucide-react";
import { QRCodeRecord } from "@/lib/types";
import { QrCard } from "./QrCard";
import { useStudioStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

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
            className="h-44 rounded-2xl bg-canvas border border-line p-4 animate-pulse flex flex-col justify-between"
          >
            <div className="flex gap-3">
              <div className="h-16 w-16 bg-elevated rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-elevated rounded w-3/4" />
                <div className="h-3 bg-elevated rounded w-1/2" />
              </div>
            </div>
            <div className="h-8 bg-elevated rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (qrs.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center p-6 border border-dashed border-line-strong rounded-2xl bg-surface">
        <div className="h-12 w-12 rounded-2xl bg-elevated text-ink-muted flex items-center justify-center mb-3">
          <QrCode className="h-6 w-6" />
        </div>
        <h4 className="text-ink font-semibold text-base mb-1">No QR codes yet</h4>
        <p className="text-ink-muted text-xs max-w-sm mb-5">
          Create your first QR code in seconds, customize its look, and track live scans.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => setActiveTab("studio")}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Your First QR
        </Button>
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

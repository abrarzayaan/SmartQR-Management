"use client";

import React, { useState } from "react";
import { Search, Layers, BarChart3, Users, Zap, FileSpreadsheet } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { QRCodeRecord, WorkspaceStats } from "@/lib/types";
import { FolderCampaignBar } from "./FolderCampaignBar";
import { QrGrid } from "./QrGrid";
import { AnalyticsModal } from "../modals/AnalyticsModal";
import { SmartRulesModal } from "../modals/SmartRulesModal";
import { EditQrModal } from "../modals/EditQrModal";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ManagerViewProps {
  onOpenBulkModal: () => void;
  onOpenNewFolderModal: () => void;
}

export function ManagerView({ onOpenBulkModal, onOpenNewFolderModal }: ManagerViewProps) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [qrType, setQrType] = useState<string>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null | undefined>(undefined);

  const [analyticsTarget, setAnalyticsTarget] = useState<QRCodeRecord | null>(null);
  const [rulesTarget, setRulesTarget] = useState<QRCodeRecord | null>(null);
  const [editTarget, setEditTarget] = useState<QRCodeRecord | null>(null);

  const { data: stats } = useQuery<WorkspaceStats>({
    queryKey: ["workspace-stats"],
    queryFn: () => api.getWorkspaceStats(),
  });

  const { data: qrs = [], isLoading } = useQuery<QRCodeRecord[]>({
    queryKey: ["qrs", { search, qrType, selectedFolderId }],
    queryFn: () =>
      api.getAllQrs({
        search: search || undefined,
        qr_type: qrType !== "all" ? qrType : undefined,
        folder_id: selectedFolderId,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteQr(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("QR code deleted");
    },
    onError: () => toast.error("Failed to delete QR code"),
  });

  const kpis = [
    {
      label: "Total QR Codes",
      value: stats?.total_qrs ?? qrs.length,
      icon: Layers,
    },
    {
      label: "Total Scans",
      value: (stats?.total_scans ?? 0).toLocaleString(),
      icon: BarChart3,
    },
    {
      label: "Unique Scanners",
      value: (stats?.unique_scans ?? 0).toLocaleString(),
      icon: Users,
    },
    {
      label: "Dynamic QRs",
      value: stats?.dynamic_qrs ?? qrs.filter((q) => q.qr_type === "dynamic").length,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">My QR Codes</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Manage campaigns, edit destinations, and view real-time scan analytics.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBulkModal}
          leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-ink-muted" />}
          className="sm:hidden self-start"
        >
          Bulk CSV Generator
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4">
              <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
                <span>{item.label}</span>
                <Icon className="h-4 w-4 text-ink-muted" />
              </div>
              <div className="text-2xl font-semibold font-mono text-ink tracking-tight">
                {item.value}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Folder Filter Chips */}
      <FolderCampaignBar
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onOpenNewFolderModal={onOpenNewFolderModal}
        totalCount={stats?.total_qrs ?? qrs.length}
      />

      {/* Search & Type Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, short code, or destination URL..."
            className="pl-10"
          />
        </div>

        <div className="inline-flex items-center bg-elevated p-1 rounded-xl border border-line self-start sm:self-auto">
          {["all", "dynamic", "static"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQrType(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg capitalize text-xs font-medium transition-all",
                qrType === t
                  ? "bg-elevated text-ink shadow-sm"
                  : "text-ink-secondary hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* QR Grid */}
      <QrGrid
        qrs={qrs}
        isLoading={isLoading}
        onOpenAnalytics={setAnalyticsTarget}
        onOpenRules={setRulesTarget}
        onOpenEdit={setEditTarget}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      {/* Modals */}
      <AnalyticsModal
        qrId={analyticsTarget?.id ?? null}
        qrTitle={analyticsTarget?.title}
        onClose={() => setAnalyticsTarget(null)}
      />
      <SmartRulesModal
        qrId={rulesTarget?.id ?? null}
        qrTitle={rulesTarget?.title}
        onClose={() => setRulesTarget(null)}
      />
      <EditQrModal qr={editTarget} onClose={() => setEditTarget(null)} />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Search,
  Layers,
  BarChart3,
  Users,
  Sparkles,
  Filter,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { QRCodeRecord, WorkspaceStats } from "@/lib/types";
import { FolderCampaignBar } from "./FolderCampaignBar";
import { QrGrid } from "./QrGrid";
import { AnalyticsModal } from "../modals/AnalyticsModal";
import { SmartRulesModal } from "../modals/SmartRulesModal";
import { EditQrModal } from "../modals/EditQrModal";

interface ManagerViewProps {
  onOpenBulkModal: () => void;
  onOpenNewFolderModal: () => void;
}

export function ManagerView({ onOpenBulkModal, onOpenNewFolderModal }: ManagerViewProps) {
  const queryClient = useQueryClient();

  // Filters state
  const [search, setSearch] = useState("");
  const [qrType, setQrType] = useState<string>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null | undefined>(undefined);

  // Modal target states
  const [analyticsTarget, setAnalyticsTarget] = useState<QRCodeRecord | null>(null);
  const [rulesTarget, setRulesTarget] = useState<QRCodeRecord | null>(null);
  const [editTarget, setEditTarget] = useState<QRCodeRecord | null>(null);

  // Fetch workspace KPIs
  const { data: stats } = useQuery<WorkspaceStats>({
    queryKey: ["workspace-stats"],
    queryFn: () => api.getWorkspaceStats(),
  });

  // Fetch QR codes with current filters
  const { data: qrs = [], isLoading } = useQuery<QRCodeRecord[]>({
    queryKey: ["qrs", { search, qrType, selectedFolderId }],
    queryFn: () =>
      api.getAllQrs({
        search: search || undefined,
        qr_type: qrType !== "all" ? qrType : undefined,
        folder_id: selectedFolderId,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteQr(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("QR Code deleted successfully");
    },
    onError: () => toast.error("Failed to delete QR Code"),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Total QR Codes</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.total_qrs ?? qrs.length}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span>Total Audience Scans</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.total_scans?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>Unique Scanners</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.unique_scans?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Active Dynamic QRs</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats?.dynamic_qrs ?? qrs.filter((q) => q.qr_type === "dynamic").length}
          </div>
        </div>
      </div>

      {/* Campaign Folders Filter Bar */}
      <FolderCampaignBar
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onOpenNewFolderModal={onOpenNewFolderModal}
        totalCount={stats?.total_qrs ?? qrs.length}
      />

      {/* Search & Type Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name, short code, destination URL..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs self-start sm:self-auto">
          {["all", "dynamic", "static"].map((t) => (
            <button
              key={t}
              onClick={() => setQrType(t)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                qrType === t ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* QR Codes Grid */}
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


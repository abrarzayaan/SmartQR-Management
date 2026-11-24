"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Clock, Hash, Folder, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { FolderRecord } from "@/lib/types";

interface SecuritySectionProps {
  onOpenNewFolderModal?: () => void;
}

export function SecuritySection({ onOpenNewFolderModal }: SecuritySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    password,
    scan_limit,
    expires_at,
    folder_id,
    error_correction,
    setField,
  } = useStudioStore();

  const { data: folders = [] } = useQuery<FolderRecord[]>({
    queryKey: ["folders"],
    queryFn: () => api.getFolders(),
  });

  const hasActiveSecurity = Boolean(password || scan_limit || expires_at);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-sm overflow-hidden transition-all">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Security Gates & Campaign Routing
            </span>
            {hasActiveSecurity && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                Active Policies
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span>{isExpanded ? "Collapse" : "Configure"}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-4 pt-1 border-t border-slate-800/60 space-y-4 text-xs">
          {/* Campaign Folder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-blue-400" />
                <span>Campaign Workspace Folder</span>
              </label>
              {onOpenNewFolderModal && (
                <button
                  type="button"
                  onClick={onOpenNewFolderModal}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Create Folder</span>
                </button>
              )}
            </div>
            <select
              value={folder_id ?? ""}
              onChange={(e) => setField("folder_id", e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="">(No folder / General Root)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.qr_count} items)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* PIN Gate */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>PIN Passcode Gate</span>
              </label>
              <input
                type="text"
                value={password || ""}
                onChange={(e) => setField("password", e.target.value || null)}
                placeholder="e.g. 1234"
                maxLength={8}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Locks destination behind PIN screen</span>
            </div>

            {/* Scan Limit */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-blue-400" />
                <span>Scan Limit</span>
              </label>
              <input
                type="number"
                value={scan_limit || ""}
                onChange={(e) => setField("scan_limit", e.target.value ? Number(e.target.value) : null)}
                placeholder="Unlimited"
                min={1}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Auto-expires once limit reached</span>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                <span>Expiration Date</span>
              </label>
              <input
                type="datetime-local"
                value={expires_at ? expires_at.slice(0, 16) : ""}
                onChange={(e) => setField("expires_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Routing ends automatically</span>
            </div>
          </div>

          {/* Error Correction Level */}
          <div className="pt-2 border-t border-slate-800/60">
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Error Correction Level (Reed-Solomon Resilience)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["L", "M", "Q", "H"] as const).map((lvl) => {
                const isSelected = error_correction === lvl;
                const labels: Record<string, string> = {
                  L: "Low (7%)",
                  M: "Medium (15%)",
                  Q: "Quartile (25%)",
                  H: "High (30%)",
                };
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setField("error_correction", lvl)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-semibold">{lvl}</div>
                    <div className="text-[10px] text-slate-500">{labels[lvl]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import React from "react";
import { Lock, Clock, Hash, Folder, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { FolderRecord } from "@/lib/types";
import { Input, Select, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SecuritySectionProps {
  onOpenNewFolderModal?: () => void;
}

export function SecuritySection({ onOpenNewFolderModal }: SecuritySectionProps) {
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

  return (
    <div className="space-y-5">
      {/* Folder */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="mb-0 flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5 text-gray-400" />
            <span>Campaign Folder</span>
          </Label>
          {onOpenNewFolderModal && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onOpenNewFolderModal}
              leftIcon={<Plus className="h-3 w-3" />}
            >
              New Folder
            </Button>
          )}
        </div>
        <Select
          value={folder_id ?? ""}
          onChange={(e) => setField("folder_id", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">No folder (General)</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.qr_count} items)
            </option>
          ))}
        </Select>
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <Label className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-gray-400" />
            <span>PIN Passcode</span>
          </Label>
          <Input
            value={password || ""}
            onChange={(e) => setField("password", e.target.value || null)}
            placeholder="Optional (e.g. 1234)"
            maxLength={8}
            className="font-mono"
          />
          <p className="text-[11px] text-gray-500 mt-1">Require PIN before redirect</p>
        </div>

        <div>
          <Label className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-gray-400" />
            <span>Max Scans</span>
          </Label>
          <Input
            type="number"
            value={scan_limit || ""}
            onChange={(e) => setField("scan_limit", e.target.value ? Number(e.target.value) : null)}
            placeholder="Unlimited"
            min={1}
            className="font-mono"
          />
          <p className="text-[11px] text-gray-500 mt-1">Stop after N total scans</p>
        </div>

        <div>
          <Label className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>Expiration</span>
          </Label>
          <Input
            type="datetime-local"
            value={expires_at ? expires_at.slice(0, 16) : ""}
            onChange={(e) =>
              setField("expires_at", e.target.value ? new Date(e.target.value).toISOString() : null)
            }
            className="text-xs"
          />
          <p className="text-[11px] text-gray-500 mt-1">Auto-expire date & time</p>
        </div>
      </div>

      {/* Error Correction */}
      <div className="pt-2 border-t border-gray-100">
        <Label>Error Correction Level</Label>
        <div className="grid grid-cols-4 gap-2">
          {(["L", "M", "Q", "H"] as const).map((lvl) => {
            const labels: Record<string, string> = {
              L: "7%",
              M: "15%",
              Q: "25%",
              H: "30%",
            };
            const isSelected = error_correction === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setField("error_correction", lvl)}
                className={cn(
                  "py-2 px-2 rounded-xl border text-center transition-all",
                  isSelected
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="text-xs font-semibold">{lvl}</div>
                <div className={cn("text-[10px]", isSelected ? "text-gray-300" : "text-gray-400")}>
                  {labels[lvl]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

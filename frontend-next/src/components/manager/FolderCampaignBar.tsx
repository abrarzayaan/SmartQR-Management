"use client";

import React from "react";
import { Folder, Plus, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FolderRecord } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FolderCampaignBarProps {
  selectedFolderId: number | null | undefined;
  onSelectFolder: (folderId: number | null | undefined) => void;
  onOpenNewFolderModal: () => void;
  totalCount?: number;
}

export function FolderCampaignBar({
  selectedFolderId,
  onSelectFolder,
  onOpenNewFolderModal,
  totalCount,
}: FolderCampaignBarProps) {
  const { data: folders = [] } = useQuery<FolderRecord[]>({
    queryKey: ["folders"],
    queryFn: () => api.getFolders(),
  });

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onSelectFolder(undefined)}
        className={cn(
          "shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
          selectedFolderId === undefined
            ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-semibold shadow-sm"
            : "bg-surface border-line text-ink-secondary hover:text-ink hover:border-line-strong"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>All Campaigns</span>
        {typeof totalCount === "number" && (
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
              selectedFolderId === undefined
                ? "bg-zinc-950/20 text-zinc-950"
                : "bg-elevated text-ink-secondary"
            )}
          >
            {totalCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={cn(
          "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
          selectedFolderId === null
            ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-semibold shadow-sm"
            : "bg-surface border-line text-ink-secondary hover:text-ink hover:border-line-strong"
        )}
      >
        <Folder className="h-3.5 w-3.5" />
        <span>Unassigned</span>
      </button>

      {folders.map((folder) => {
        const isSelected = selectedFolderId === folder.id;
        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelectFolder(folder.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
              isSelected
                ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-semibold shadow-sm"
                : "bg-surface border-line text-ink-secondary hover:text-ink hover:border-line-strong"
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span>{folder.name}</span>
            <span className={cn("text-[10px] font-mono", isSelected ? "text-gray-300" : "text-ink-muted")}>
              {folder.qr_count}
            </span>
          </button>
        );
      })}

      <Button
        variant="outline"
        size="xs"
        onClick={onOpenNewFolderModal}
        leftIcon={<Plus className="h-3.5 w-3.5" />}
        className="shrink-0 rounded-full border-dashed"
      >
        New Folder
      </Button>
    </div>
  );
}

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
            ? "bg-gray-900 border-gray-900 text-white shadow-sm"
            : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>All Campaigns</span>
        {typeof totalCount === "number" && (
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
              selectedFolderId === undefined
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-600"
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
            ? "bg-gray-900 border-gray-900 text-white shadow-sm"
            : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
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
                ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span>{folder.name}</span>
            <span className={cn("text-[10px] font-mono", isSelected ? "text-gray-300" : "text-gray-400")}>
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

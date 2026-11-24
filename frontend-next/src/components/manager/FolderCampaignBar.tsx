"use client";

import React from "react";
import { Folder, Plus, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FolderRecord } from "@/lib/types";

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
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {/* All Folders */}
      <button
        onClick={() => onSelectFolder(undefined)}
        className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          selectedFolderId === undefined
            ? "bg-blue-600 border-blue-500 text-white shadow-sm"
            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        <span>All Campaigns</span>
        {typeof totalCount === "number" && (
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white/90 font-mono">
            {totalCount}
          </span>
        )}
      </button>

      {/* Root (Uncategorized) */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          selectedFolderId === null
            ? "bg-blue-600 border-blue-500 text-white shadow-sm"
            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
        }`}
      >
        <Folder className="h-3.5 w-3.5 text-slate-400" />
        <span>Root (Unassigned)</span>
      </button>

      {/* Custom Dynamic Campaign Folders */}
      {folders.map((folder) => {
        const isSelected = selectedFolderId === folder.id;
        return (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isSelected
                ? "bg-slate-800 border-blue-500/80 text-white shadow-sm"
                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span>{folder.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({folder.qr_count})</span>
          </button>
        );
      })}

      {/* + New Campaign Folder */}
      <button
        onClick={onOpenNewFolderModal}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-medium transition-all"
      >
        <Plus className="h-3.5 w-3.5 text-blue-400" />
        <span>New Folder</span>
      </button>
    </div>
  );
}


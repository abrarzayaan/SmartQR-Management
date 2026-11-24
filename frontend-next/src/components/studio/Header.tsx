"use client";

import React from "react";
import { Sparkles, Layers, QrCode, FileSpreadsheet, Plus, ShieldCheck } from "lucide-react";
import { useStudioStore } from "@/lib/store";

interface HeaderProps {
  onOpenBulkModal: () => void;
  onOpenNewFolderModal?: () => void;
  qrCount?: number;
}

export function Header({ onOpenBulkModal, qrCount }: HeaderProps) {
  const { activeTab, setActiveTab } = useStudioStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1px] shadow-lg shadow-blue-500/10">
            <div className="h-full w-full rounded-[11px] bg-slate-950 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">SmartQR</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Active</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center bg-slate-900/90 border border-slate-800/80 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "studio"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Studio</span>
          </button>
          <button
            onClick={() => setActiveTab("manager")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "manager"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All QR Codes</span>
            {typeof qrCount === "number" && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {qrCount}
              </span>
            )}
          </button>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBulkModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
            <span>Bulk ZIP</span>
          </button>
          <button
            onClick={() => setActiveTab("studio")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">New Smart QR</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
}


"use client";

import React from "react";
import { QrCode, LayoutGrid, PlusCircle, FileSpreadsheet } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenBulkModal: () => void;
  onOpenNewFolderModal?: () => void;
  qrCount?: number;
}

export function Header({ onOpenBulkModal, qrCount }: HeaderProps) {
  const { activeTab, setActiveTab } = useStudioStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="h-9 w-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm group-hover:bg-gray-800 transition-colors">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base text-gray-900 tracking-tight">SmartQR</span>
              <span className="hidden sm:inline-block text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-none hidden sm:block">
              Dynamic QR Workspace
            </p>
          </div>
        </button>

        {/* Center Navigation Switcher */}
        <nav className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/70">
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeTab === "studio"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manager")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeTab === "manager"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>My QR Codes</span>
            {typeof qrCount === "number" && (
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                  activeTab === "manager"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-200/80 text-gray-600"
                )}
              >
                {qrCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBulkModal}
            leftIcon={<FileSpreadsheet className="h-3.5 w-3.5 text-gray-500" />}
            className="hidden sm:inline-flex"
          >
            Bulk CSV
          </Button>
          {activeTab === "manager" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab("studio")}
              leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
            >
              New QR
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

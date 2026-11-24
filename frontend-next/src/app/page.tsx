"use client";

import React, { useState } from "react";
import { Header } from "@/components/studio/Header";
import { BrandKitBar } from "@/components/studio/BrandKitBar";
import { ContentSection } from "@/components/studio/ContentSection";
import { PatternSelector } from "@/components/studio/PatternSelector";
import { EyeSelector } from "@/components/studio/EyeSelector";
import { ColorEngine } from "@/components/studio/ColorEngine";
import { LogoUploader } from "@/components/studio/LogoUploader";
import { CtaFrameCustom } from "@/components/studio/CtaFrameCustom";
import { SecuritySection } from "@/components/studio/SecuritySection";
import { LivePreviewCard } from "@/components/preview/LivePreviewCard";
import { ManagerView } from "@/components/manager/ManagerView";
import { BulkGeneratorModal } from "@/components/modals/BulkGeneratorModal";
import { NewFolderModal } from "@/components/modals/NewFolderModal";
import { SaveBrandKitModal } from "@/components/modals/SaveBrandKitModal";
import { useStudioStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Home() {
  const { activeTab } = useStudioStore();

  // Modals state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isSaveKitOpen, setIsSaveKitOpen] = useState(false);

  // Fetch count for header
  const { data: qrs = [] } = useQuery({
    queryKey: ["qrs"],
    queryFn: () => api.getAllQrs(),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Navbar */}
      <Header
        onOpenBulkModal={() => setIsBulkOpen(true)}
        onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
        qrCount={qrs.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "studio" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Customization Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Brand Kit Presets */}
              <BrandKitBar onOpenSaveKitModal={() => setIsSaveKitOpen(true)} />

              {/* Dynamic Payload Form */}
              <ContentSection />

              {/* Dot Geometry Patterns */}
              <PatternSelector />

              {/* Corner Eye Geometries */}
              <EyeSelector />

              {/* Color Engine & Gradients */}
              <ColorEngine />

              {/* Center Logo & Badges */}
              <LogoUploader />

              {/* Outer CTA Frame */}
              <CtaFrameCustom />

              {/* Security & Expiration */}
              <SecuritySection onOpenNewFolderModal={() => setIsNewFolderOpen(true)} />
            </div>

            {/* Right Column: Live Sticky Preview & Scannability (5 cols) */}
            <div className="lg:col-span-5">
              <LivePreviewCard />
            </div>
          </div>
        ) : (
          /* Manager View */
          <ManagerView
            onOpenBulkModal={() => setIsBulkOpen(true)}
            onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
          />
        )}
      </main>

      {/* Standalone Modals */}
      <BulkGeneratorModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
      <NewFolderModal isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} />
      <SaveBrandKitModal isOpen={isSaveKitOpen} onClose={() => setIsSaveKitOpen(false)} />
    </div>
  );
}


"use client";

import React, { useState } from "react";
import {
  FileText,
  Palette,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  Grid,
  Paintbrush,
  Image as ImageIcon,
  Frame,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type StudioStep = "content" | "design" | "settings";
type DesignSubTab = "pattern" | "colors" | "logo" | "frame";

const STUDIO_STEPS: { id: StudioStep; num: string; label: string; icon: React.ElementType }[] = [
  { id: "content", num: "1", label: "Content", icon: FileText },
  { id: "design", num: "2", label: "Design", icon: Palette },
  { id: "settings", num: "3", label: "Settings", icon: SlidersHorizontal },
];

const DESIGN_TABS: { id: DesignSubTab; label: string; icon: React.ElementType }[] = [
  { id: "pattern", label: "Shapes", icon: Grid },
  { id: "colors", label: "Colors", icon: Paintbrush },
  { id: "logo", label: "Logo", icon: ImageIcon },
  { id: "frame", label: "Frame", icon: Frame },
];

export default function Home() {
  const { activeTab } = useStudioStore();

  const [step, setStep] = useState<StudioStep>("content");
  const [designTab, setDesignTab] = useState<DesignSubTab>("pattern");

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isSaveKitOpen, setIsSaveKitOpen] = useState(false);

  const { data: qrs = [] } = useQuery({
    queryKey: ["qrs"],
    queryFn: () => api.getAllQrs(),
  });

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <Header
        onOpenBulkModal={() => setIsBulkOpen(true)}
        onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
        qrCount={qrs.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "studio" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Clean 3-Step Guided Builder */}
            <div className="lg:col-span-7 space-y-5">
              {/* Stepper Bar */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-1.5 shadow-card grid grid-cols-3 gap-1.5">
                {STUDIO_STEPS.map((s) => {
                  const isActive = step === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <span
                        className={cn(
                          "h-5 w-5 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {s.num}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Card */}
              <Card>
                <CardContent className="p-6">
                  {step === "content" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Enter QR Content
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Choose what happens when someone scans your QR code.
                        </p>
                      </div>

                      <ContentSection />

                      <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button
                          variant="primary"
                          onClick={() => setStep("design")}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Next: Customize Design
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === "design" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Customize Appearance
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pick a quick preset or fine-tune shapes, colors, logo, and frame.
                        </p>
                      </div>

                      <BrandKitBar onOpenSaveKitModal={() => setIsSaveKitOpen(true)} />

                      {/* Clean Design Sub-Tabs */}
                      <div className="flex items-center gap-1.5 border-b border-gray-200 pb-3 overflow-x-auto">
                        {DESIGN_TABS.map((t) => {
                          const Icon = t.icon;
                          const isActive = designTab === t.id;
                          return (
                            <Button
                              key={t.id}
                              variant={isActive ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setDesignTab(t.id)}
                              leftIcon={<Icon className="h-3.5 w-3.5" />}
                              className={cn(isActive && "text-gray-900 font-semibold")}
                            >
                              {t.label}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Focused Design Sub-Panel */}
                      <div className="pt-1">
                        {designTab === "pattern" && (
                          <div className="space-y-6">
                            <PatternSelector />
                            <div className="border-t border-gray-100 pt-5">
                              <EyeSelector />
                            </div>
                          </div>
                        )}
                        {designTab === "colors" && <ColorEngine />}
                        {designTab === "logo" && <LogoUploader />}
                        {designTab === "frame" && <CtaFrameCustom />}
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setStep("content")}
                          leftIcon={<ArrowLeft className="h-4 w-4" />}
                        >
                          Back
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => setStep("settings")}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Next: Settings (Optional)
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === "settings" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Folder & Access Settings
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Organize into a campaign folder or add optional PIN, scan limit, or expiry.
                        </p>
                      </div>

                      <SecuritySection
                        onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
                      />

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setStep("design")}
                          leftIcon={<ArrowLeft className="h-4 w-4" />}
                        >
                          Back to Design
                        </Button>
                        <span className="text-xs text-gray-500">
                          Ready? Click <strong className="text-gray-900">Save QR Code</strong> on the right.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Sticky Live Preview */}
            <div className="lg:col-span-5">
              <LivePreviewCard />
            </div>
          </div>
        ) : (
          <ManagerView
            onOpenBulkModal={() => setIsBulkOpen(true)}
            onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
          />
        )}
      </main>

      <BulkGeneratorModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
      <NewFolderModal isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} />
      <SaveBrandKitModal isOpen={isSaveKitOpen} onClose={() => setIsSaveKitOpen(false)} />
    </div>
  );
}

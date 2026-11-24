"use client";

import React, { useRef } from "react";
import { Upload, X, Globe, Wifi, Link as LinkIcon, Star, MessageSquare } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRESET_LOGOS = [
  { id: "none", label: "None", icon: X },
  { id: "globe", label: "Web", icon: Globe },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "link", label: "Link", icon: LinkIcon },
  { id: "star", label: "Star", icon: Star },
  { id: "whatsapp", label: "Chat", icon: MessageSquare },
];

export function LogoUploader() {
  const { logo_type, logo_data, setField } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, SVG, JPG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setField("logo_data", reader.result as string);
      setField("logo_type", "custom");
      setField("error_correction", "H");
      toast.success("Custom logo added");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setField("logo_data", null);
    setField("logo_type", "none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Quick Center Icon</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_LOGOS.map((p) => {
            const Icon = p.icon;
            const isSelected = logo_type === p.id && !logo_data;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setField("logo_type", p.id);
                  setField("logo_data", null);
                  if (p.id !== "none") setField("error_correction", "H");
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all",
                  isSelected
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px]">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Or Upload Your Brand Logo</Label>
        {logo_data ? (
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <img
                src={logo_data}
                alt="Logo Preview"
                className="h-10 w-10 object-contain rounded-lg bg-white border border-gray-200 p-1"
              />
              <div>
                <div className="text-xs font-semibold text-gray-900">Custom Logo Active</div>
                <div className="text-[11px] text-gray-500">Auto High error correction enabled</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeLogo} title="Remove logo">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              id="custom-logo-file"
            />
            <label
              htmlFor="custom-logo-file"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/70 hover:bg-gray-50 text-gray-600 hover:text-gray-900 cursor-pointer transition-all text-xs font-medium"
            >
              <Upload className="h-4 w-4 text-gray-500" />
              <span>Click to upload PNG, SVG, or JPG logo</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { Image as ImageIcon, Upload, X, ShieldAlert, Globe, Wifi, Link as LinkIcon, Star, MessageSquare } from "lucide-react";
import { useStudioStore } from "@/lib/store";

const PRESET_LOGOS = [
  { id: "none", label: "None", icon: X },
  { id: "globe", label: "Web", icon: Globe },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "link", label: "Link", icon: LinkIcon },
  { id: "star", label: "Star", icon: Star },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];

export function LogoUploader() {
  const { logo_type, logo_data, setField } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, SVG, JPG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setField("logo_data", result);
      setField("logo_type", "custom");
      setField("error_correction", "H"); // automatically raise to High for scannability
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setField("logo_data", null);
    setField("logo_type", "none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-blue-400" />
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Center Logo & Branding
          </label>
        </div>
      </div>

      {/* Preset Badges */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
          Preset Brand Badges
        </label>
        <div className="grid grid-cols-6 gap-1.5">
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
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500/80 text-blue-400 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-[10px] font-medium truncate w-full">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Brand Logo Upload */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
          Custom Brand Asset (PNG / SVG)
        </label>

        {logo_data ? (
          <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/40 bg-blue-950/20">
            <div className="flex items-center gap-3">
              <img
                src={logo_data}
                alt="Logo Preview"
                className="h-10 w-10 object-contain rounded-lg bg-white p-1"
              />
              <div>
                <div className="text-xs font-medium text-white">Custom Logo Embedded</div>
                <div className="text-[11px] text-blue-300">EC automatically elevated to High (30%)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
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
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/40 text-slate-400 hover:text-white cursor-pointer transition-all text-xs font-medium"
            >
              <Upload className="h-4 w-4 text-blue-400" />
              <span>Click or drop custom brand logo (PNG / SVG)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}


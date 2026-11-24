"use client";

import React, { useState } from "react";
import { X, BookmarkPlus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";

interface SaveBrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveBrandKitModal({ isOpen, onClose }: SaveBrandKitModalProps) {
  if (!isOpen) return null;

  const queryClient = useQueryClient();
  const store = useStudioStore();
  const [name, setName] = useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      api.createBrandKit({
        name,
        fg_color: store.fg_color,
        bg_color: store.bg_color,
        gradient_type: store.gradient_type,
        fg_color_2: store.fg_color_2,
        dot_style: store.dot_style,
        eye_frame: store.eye_frame,
        eye_ball: store.eye_ball,
        eye_color: store.has_custom_eye_color ? store.eye_color : null,
        logo_data: store.logo_data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-kits"] });
      toast.success(`Brand Kit "${name}" saved!`);
      setName("");
      onClose();
    },
    onError: () => toast.error("Failed to save Brand Kit"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookmarkPlus className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Save as Brand Kit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Save your active dot patterns, eye geometries, gradients, and custom colors as a reusable
            Brand Kit preset across all campaigns.
          </p>

          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Brand Kit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Brand Palette, Minimalist Black"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl border border-white/20 flex-shrink-0"
              style={{
                background:
                  store.gradient_type === "solid"
                    ? store.fg_color
                    : `linear-gradient(135deg, ${store.fg_color}, ${store.fg_color_2})`,
              }}
            />
            <div className="min-w-0">
              <div className="text-white font-medium capitalize">
                {store.dot_style} dots • {store.eye_frame} eyes
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {store.fg_color} on {store.bg_color}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim() || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" />
            )}
            <span>Save Kit</span>
          </button>
        </div>
      </div>
    </div>
  );
}


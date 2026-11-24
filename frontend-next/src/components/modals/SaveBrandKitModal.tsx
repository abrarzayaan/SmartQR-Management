"use client";

import React, { useState } from "react";
import { BookmarkPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

interface SaveBrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveBrandKitModal({ isOpen, onClose }: SaveBrandKitModalProps) {
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
      toast.success(`Brand Kit "${name}" saved`);
      setName("");
      onClose();
    },
    onError: () => toast.error("Failed to save Brand Kit"),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Brand Kit"
      description="Reuse your current colors, dot style, eyes, and logo with 1 click"
      icon={<BookmarkPlus className="h-4 w-4" />}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={saveMutation.isPending}
            disabled={!name.trim()}
            onClick={() => saveMutation.mutate()}
            leftIcon={<BookmarkPlus className="h-4 w-4" />}
          >
            Save Kit
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Kit Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Company Brand, Minimal Black"
          />
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl border border-gray-200 shrink-0"
            style={{
              background:
                store.gradient_type === "solid"
                  ? store.fg_color
                  : `linear-gradient(135deg, ${store.fg_color}, ${store.fg_color_2})`,
            }}
          />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-900 capitalize">
              {store.dot_style} dots • {store.eye_frame} eyes
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              {store.fg_color} on {store.bg_color}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

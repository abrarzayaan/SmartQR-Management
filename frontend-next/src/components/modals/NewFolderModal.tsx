"use client";

import React, { useState } from "react";
import { FolderPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOLDER_COLORS = [
  "#111827",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#64748b",
];

export function NewFolderModal({ isOpen, onClose }: NewFolderModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");

  const createMutation = useMutation({
    mutationFn: () => api.createFolder(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`Folder "${name}" created`);
      setName("");
      onClose();
    },
    onError: () => toast.error("Failed to create folder"),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Campaign Folder"
      description="Group related QR codes for easier organization"
      icon={<FolderPlus className="h-4 w-4" />}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={createMutation.isPending}
            disabled={!name.trim()}
            onClick={() => createMutation.mutate()}
            leftIcon={<FolderPlus className="h-4 w-4" />}
          >
            Create Folder
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Folder Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q4 Marketing, Restaurant Tables"
          />
        </div>

        <div>
          <Label>Color Label</Label>
          <div className="flex items-center gap-2.5">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  color === c ? "ring-2 ring-gray-900 ring-offset-2 scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

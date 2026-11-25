"use client";

import React, { useState, useEffect } from "react";
import { Edit3, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { QRCodeRecord, FolderRecord } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Input";

interface EditQrModalProps {
  qr: QRCodeRecord | null;
  onClose: () => void;
}

export function EditQrModal({ qr, onClose }: EditQrModalProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(qr?.title || "");
  const [targetUrl, setTargetUrl] = useState(qr?.target_url || "");
  const [folderId, setFolderId] = useState<number | null>(qr?.folder_id ?? null);

  useEffect(() => {
    if (qr) {
      setTitle(qr.title);
      setTargetUrl(qr.target_url);
      setFolderId(qr.folder_id ?? null);
    }
  }, [qr]);

  const { data: folders = [] } = useQuery<FolderRecord[]>({
    queryKey: ["folders"],
    queryFn: () => api.getFolders(),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.updateQr(qr!.id, {
        title,
        target_url: targetUrl,
        folder_id: folderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("QR code updated");
      onClose();
    },
    onError: () => toast.error("Failed to update QR code"),
  });

  return (
    <Modal
      isOpen={Boolean(qr)}
      onClose={onClose}
      title="Edit QR Code"
      description="Update destination or move to another folder without reprinting"
      icon={<Edit3 className="h-4 w-4" />}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={updateMutation.isPending}
            disabled={!title || !targetUrl}
            onClick={() => updateMutation.mutate()}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>QR Code Name</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label>Destination URL</Label>
          <Input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-ink-muted mt-1">
            Dynamic QR codes redirect to the new destination immediately.
          </p>
        </div>

        <div>
          <Label>Campaign Folder</Label>
          <Select
            value={folderId ?? ""}
            onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">No folder (General)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
}

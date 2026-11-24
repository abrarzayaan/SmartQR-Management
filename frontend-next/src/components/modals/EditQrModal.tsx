"use client";

import React, { useState, useEffect } from "react";
import { X, Edit3, Save, Folder, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { QRCodeRecord, FolderRecord } from "@/lib/types";

interface EditQrModalProps {
  qr: QRCodeRecord | null;
  onClose: () => void;
}

export function EditQrModal({ qr, onClose }: EditQrModalProps) {
  if (!qr) return null;

  const queryClient = useQueryClient();

  const [title, setTitle] = useState(qr.title);
  const [targetUrl, setTargetUrl] = useState(qr.target_url);
  const [folderId, setFolderId] = useState<number | null>(qr.folder_id ?? null);

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
      api.updateQr(qr.id, {
        title,
        target_url: targetUrl,
        folder_id: folderId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("QR Code updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update QR code"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Edit3 className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Edit QR Code Destination</h3>
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
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Title / Campaign</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">
              Destination URL
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              For dynamic QR codes, this updates instantly for all future scans without reprinting.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 text-blue-400" />
              <span>Assigned Campaign Folder</span>
            </label>
            <select
              value={folderId ?? ""}
              onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
            >
              <option value="">(No folder / General Root)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
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
            disabled={!title || !targetUrl || updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}


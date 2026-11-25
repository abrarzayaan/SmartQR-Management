"use client";

import React, { useState, useRef } from "react";
import { FileSpreadsheet, Upload, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface BulkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkGeneratorModal({ isOpen, onClose }: BulkGeneratorModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.getBulkTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "smartqr_bulk_template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 6);
      setCsvPreview(lines.map((line) => line.split(",").map((c) => c.trim())));
    };
    reader.readAsText(selectedFile);
  };

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload a CSV file first");
      return;
    }

    setIsUploading(true);
    try {
      const zipBlob = await api.generateBulkZip(file);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smartqr-bulk-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Bulk QR ZIP archive generated!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to process bulk QR batch");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk QR Generator"
      description="Generate up to 500 QR codes from a single CSV file"
      icon={<FileSpreadsheet className="h-4 w-4" />}
      maxWidth="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isUploading}
            disabled={!file}
            onClick={handleGenerate}
            leftIcon={<Download className="h-4 w-4" />}
          >
            {isUploading ? "Generating ZIP..." : "Generate & Download ZIP"}
          </Button>
        </>
      }
    >
      <div className="space-y-5 text-xs text-ink-secondary">
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-canvas border border-line">
          <div>
            <div className="font-semibold text-ink">Need the CSV format?</div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              Download our ready-to-use CSV template with example rows.
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Template
          </Button>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
            id="bulk-csv-input"
          />
          <label
            htmlFor="bulk-csv-input"
            className={`flex flex-col items-center justify-center p-7 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              file
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-line hover:border-line-strong bg-canvas hover:bg-elevated"
            }`}
          >
            {file ? (
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <div className="font-semibold text-ink">{file.name}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Click to replace file
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-7 w-7 text-ink-muted mx-auto mb-2" />
                <div className="font-semibold text-ink">Click to select CSV file</div>
                <div className="text-[11px] text-ink-muted mt-1">
                  Columns: title, target_url, qr_type, fg_color, bg_color
                </div>
              </div>
            )}
          </label>
        </div>

        {csvPreview.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-ink-muted">
              Preview ({Math.max(0, csvPreview.length - 1)} sample rows):
            </span>
            <div className="overflow-x-auto rounded-xl border border-line bg-surface font-mono text-[11px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas text-ink-secondary">
                    {csvPreview[0]?.map((col, idx) => (
                      <th key={idx} className="py-2 px-3 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {csvPreview.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="text-ink-secondary">
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-3 truncate max-w-[160px]">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

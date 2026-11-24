"use client";

import React, { useState, useRef } from "react";
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface BulkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkGeneratorModal({ isOpen, onClose }: BulkGeneratorModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

    // Read preview lines
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 6);
      const parsed = lines.map((line) => line.split(",").map((c) => c.trim()));
      setCsvPreview(parsed);
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
      link.download = `smartqr-bulk-package-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Bulk QR Archive Generated & Downloaded!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to process bulk QR batch");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Bulk QR Generator Engine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          <p className="leading-relaxed">
            Generate up to <strong className="text-white">500 branded QR codes in one batch</strong>.
            The platform will automatically generate all individual high-resolution PNGs and a summary{" "}
            <code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded">manifest.csv</code> bundled into a single ZIP file.
          </p>

          {/* Template Download Box */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="font-medium text-white mb-0.5">Need the CSV structure?</div>
              <div className="text-[11px] text-slate-400">Download our formatted CSV template with example columns.</div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700 font-medium transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
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
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                file
                  ? "border-emerald-500/50 bg-emerald-950/10"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
              }`}
            >
              {file ? (
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="font-medium text-white">{file.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • Click to choose a different CSV
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="font-medium text-white">Click or drag & drop CSV file</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Columns: title, target_url, qr_type, fg_color, bg_color
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* CSV Preview */}
          {csvPreview.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">
                Preview ({csvPreview.length - 1} rows parsed):
              </span>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 font-mono text-[10px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      {csvPreview[0]?.map((col, idx) => (
                        <th key={idx} className="pb-1 px-2 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-900/60 text-slate-300">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-1 px-2 truncate max-w-[140px]">
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
            disabled={!file || isUploading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Generate & Download ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


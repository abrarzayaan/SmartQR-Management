"use client";

import React from "react";
import {
  X,
  BarChart3,
  Users,
  Smartphone,
  Clock,
  Globe,
  Laptop,
  Loader2,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ScanAnalytics } from "@/lib/types";

interface AnalyticsModalProps {
  qrId: number | null;
  qrTitle?: string;
  onClose: () => void;
}

export function AnalyticsModal({ qrId, qrTitle, onClose }: AnalyticsModalProps) {
  if (!qrId) return null;

  const { data: analytics, isLoading, error } = useQuery<ScanAnalytics>({
    queryKey: ["analytics", qrId],
    queryFn: () => api.getAnalytics(qrId),
    enabled: Boolean(qrId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-white text-sm">Audience & Scan Telemetry</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-sm">
                {qrTitle ? `Campaign: ${qrTitle}` : `QR Code #${qrId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span>Compiling scan telemetry metrics...</span>
            </div>
          ) : error || !analytics ? (
            <div className="py-12 text-center text-rose-400">
              Failed to load analytics data for this QR code.
            </div>
          ) : (
            <>
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                    <span>Total Scans</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {analytics.total_scans.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Unique Scans</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {analytics.unique_scans.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Mobile Ratio</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {analytics.mobile_percentage}%
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Peak Hour</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {analytics.peak_hour}
                  </div>
                </div>
              </div>

              {/* 24-Hour Scan Distribution Bar Chart */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>24-Hour Scan Distribution Heatmap</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">UTC Breakdown</span>
                </div>

                <div className="h-28 flex items-end gap-1 pt-4 border-b border-slate-800">
                  {analytics.hourly_breakdown?.map((item, idx) => {
                    const maxVal = Math.max(
                      1,
                      ...(analytics.hourly_breakdown?.map((h) => h.count) || [1])
                    );
                    const pct = Math.round((item.count / maxVal) * 100);
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                      >
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-20">
                          {item.hour}: {item.count} scans
                        </div>
                        {/* Bar */}
                        <div
                          style={{ height: `${Math.max(4, pct)}%` }}
                          className={`w-full rounded-t transition-all ${
                            item.count > 0
                              ? "bg-blue-500 group-hover:bg-blue-400"
                              : "bg-slate-800/50"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono px-0.5">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* OS & Geo Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Operating Systems */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Laptop className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Operating Systems</span>
                  </div>
                  {Object.entries(analytics.os_breakdown || {}).length === 0 ? (
                    <div className="text-slate-500 text-[11px] py-4 text-center">No OS logs yet</div>
                  ) : (
                    Object.entries(analytics.os_breakdown || {}).map(([os, count]) => {
                      const pct = Math.round((count / (analytics.total_scans || 1)) * 100);
                      return (
                        <div key={os} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">{os}</span>
                            <span className="text-slate-400 font-mono">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Top Geos */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Top Geographic Locations</span>
                  </div>
                  {(!analytics.top_countries || analytics.top_countries.length === 0) ? (
                    <div className="text-slate-500 text-[11px] py-4 text-center">No geo logs yet</div>
                  ) : (
                    analytics.top_countries.slice(0, 5).map((loc, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-none">
                        <span className="text-slate-300">{loc.country || "Direct / Local"}</span>
                        <span className="text-slate-400 font-mono">{loc.count} scans</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Scan Activity Log Table */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" />
                  <span>Recent Scan Event Feed</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                        <th className="py-2 px-3 font-semibold">Timestamp</th>
                        <th className="py-2 px-3 font-semibold">Device / OS</th>
                        <th className="py-2 px-3 font-semibold">Browser</th>
                        <th className="py-2 px-3 font-semibold">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {analytics.recent_scans?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            No scan events recorded yet.
                          </td>
                        </tr>
                      ) : (
                        analytics.recent_scans?.slice(0, 10).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/30">
                            <td className="py-2 px-3 text-slate-300 truncate max-w-[140px]">
                              {new Date(log.scanned_at).toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {log.device_type} • {log.os_name}
                            </td>
                            <td className="py-2 px-3 text-slate-400 truncate max-w-[100px]">
                              {log.browser_name || "Camera Scanner"}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {log.city ? `${log.city}, ${log.country}` : log.country || "Direct"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


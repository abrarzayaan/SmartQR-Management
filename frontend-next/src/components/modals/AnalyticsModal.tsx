"use client";

import React from "react";
import { BarChart3, Users, Smartphone, Clock, Globe, Laptop, Loader2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ScanAnalytics } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface AnalyticsModalProps {
  qrId: number | null;
  qrTitle?: string;
  onClose: () => void;
}

export function AnalyticsModal({ qrId, qrTitle, onClose }: AnalyticsModalProps) {
  const { data: analytics, isLoading, error } = useQuery<ScanAnalytics>({
    queryKey: ["analytics", qrId],
    queryFn: () => api.getAnalytics(qrId!),
    enabled: Boolean(qrId),
  });

  return (
    <Modal
      isOpen={Boolean(qrId)}
      onClose={onClose}
      title="Scan Analytics"
      description={qrTitle ? `Campaign: ${qrTitle}` : qrId ? `QR #${qrId}` : ""}
      icon={<BarChart3 className="h-4 w-4" />}
      maxWidth="3xl"
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6 text-xs text-gray-600">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            <span>Loading scan analytics...</span>
          </div>
        ) : error || !analytics ? (
          <div className="py-12 text-center text-red-600">
            Could not load analytics for this QR code.
          </div>
        ) : (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Total Scans</span>
                </div>
                <div className="text-xl font-semibold font-mono text-gray-900">
                  {analytics.total_scans.toLocaleString()}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>Unique</span>
                </div>
                <div className="text-xl font-semibold font-mono text-gray-900">
                  {analytics.unique_scans.toLocaleString()}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </div>
                <div className="text-xl font-semibold font-mono text-gray-900">
                  {analytics.mobile_percentage}%
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Peak Hour</span>
                </div>
                <div className="text-xl font-semibold font-mono text-gray-900">
                  {analytics.peak_hour}
                </div>
              </div>
            </div>

            {/* 24-Hour Distribution */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">24-Hour Scan Activity</span>
                <span className="text-[10px] text-gray-400 font-mono">UTC</span>
              </div>
              <div className="h-28 flex items-end gap-1 pt-4 border-b border-gray-200">
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
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-20">
                        {item.hour}: {item.count}
                      </div>
                      <div
                        style={{ height: `${Math.max(4, pct)}%` }}
                        className={`w-full rounded-t transition-all ${
                          item.count > 0 ? "bg-gray-900 group-hover:bg-blue-600" : "bg-gray-100"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* OS & Location Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-gray-400" />
                  <span>Operating Systems</span>
                </div>
                {Object.entries(analytics.os_breakdown || {}).length === 0 ? (
                  <div className="text-gray-400 py-4 text-center">No OS data yet</div>
                ) : (
                  Object.entries(analytics.os_breakdown || {}).map(([os, count]) => {
                    const pct = Math.round((count / (analytics.total_scans || 1)) * 100);
                    return (
                      <div key={os} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-700 font-medium">{os}</span>
                          <span className="text-gray-500 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  <span>Top Locations</span>
                </div>
                {!analytics.top_countries || analytics.top_countries.length === 0 ? (
                  <div className="text-gray-400 py-4 text-center">No location data yet</div>
                ) : (
                  analytics.top_countries.slice(0, 5).map((loc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-gray-100 last:border-none"
                    >
                      <span className="text-gray-700">{loc.country || "Direct / Local"}</span>
                      <span className="text-gray-500 font-mono">{loc.count} scans</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Scan Logs */}
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>Recent Scans</span>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                      <th className="py-2 px-3 font-medium">Time</th>
                      <th className="py-2 px-3 font-medium">Device / OS</th>
                      <th className="py-2 px-3 font-medium">Browser</th>
                      <th className="py-2 px-3 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {analytics.recent_scans?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-5 text-center text-gray-400">
                          No scans recorded yet.
                        </td>
                      </tr>
                    ) : (
                      analytics.recent_scans?.slice(0, 10).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-700">
                            {new Date(log.scanned_at).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-gray-700">
                            {log.device_type} • {log.os_name}
                          </td>
                          <td className="py-2 px-3 text-gray-500">
                            {log.browser_name || "Scanner"}
                          </td>
                          <td className="py-2 px-3 text-gray-500">
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
    </Modal>
  );
}

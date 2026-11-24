"use client";

import React, { useState } from "react";
import { X, GitFork, Plus, Trash2, Smartphone, Clock, Calendar, Check, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RoutingRule } from "@/lib/types";

interface SmartRulesModalProps {
  qrId: number | null;
  qrTitle?: string;
  onClose: () => void;
}

export function SmartRulesModal({ qrId, qrTitle, onClose }: SmartRulesModalProps) {
  if (!qrId) return null;

  const queryClient = useQueryClient();

  const [ruleType, setRuleType] = useState<"os" | "time" | "date">("os");
  const [conditionVal, setConditionVal] = useState("iOS");
  const [redirectUrl, setRedirectUrl] = useState("https://apps.apple.com/app/id12345");
  const [priority, setPriority] = useState(1);

  // Fetch active rules
  const { data: rules = [], isLoading } = useQuery<RoutingRule[]>({
    queryKey: ["rules", qrId],
    queryFn: () => api.getRules(qrId),
    enabled: Boolean(qrId),
  });

  // Create rule mutation
  const addMutation = useMutation({
    mutationFn: () =>
      api.createRule(qrId, {
        rule_type: ruleType,
        condition_key: ruleType === "os" ? "os" : ruleType === "time" ? "time_slot" : "date_range",
        condition_value: conditionVal,
        redirect_url: redirectUrl,
        priority: priority,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules", qrId] });
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      toast.success("Smart routing rule created!");
      setRedirectUrl("");
    },
    onError: () => toast.error("Failed to add routing rule"),
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: (ruleId: number) => api.deleteRule(qrId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules", qrId] });
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      toast.success("Rule deleted");
    },
    onError: () => toast.error("Failed to delete rule"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <GitFork className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-white text-sm">Smart Routing & Conditional Rules</h3>
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
          <p className="leading-relaxed">
            Configure dynamic redirection logic based on the scanner's device operating system,
            time of day, or promotional date windows. The engine evaluates rules sequentially by priority.
          </p>

          {/* Existing Rules List */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 block text-xs">
              Active Routing Rules ({rules.length})
            </span>

            {isLoading ? (
              <div className="py-6 text-center text-slate-500">Loading rules...</div>
            ) : rules.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-slate-500">
                No custom routing rules set. All visitors are routed directly to the primary target URL.
              </div>
            ) : (
              <div className="space-y-2">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        P{r.priority}
                      </span>
                      <div className="min-w-0">
                        <div className="text-white font-medium flex items-center gap-1.5">
                          {r.rule_type === "os" ? (
                            <Smartphone className="h-3.5 w-3.5 text-blue-400" />
                          ) : r.rule_type === "time" ? (
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                          ) : (
                            <Calendar className="h-3.5 w-3.5 text-rose-400" />
                          )}
                          <span className="capitalize">{r.rule_type}</span>: {r.condition_value}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                          → {r.redirect_url}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(r.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Rule Form */}
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 space-y-3.5">
            <span className="font-semibold text-slate-200 block text-xs">Create New Routing Rule</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Rule Type</label>
                <select
                  value={ruleType}
                  onChange={(e) => {
                    const val = e.target.value as "os" | "time" | "date";
                    setRuleType(val);
                    if (val === "os") setConditionVal("iOS");
                    if (val === "time") setConditionVal("morning");
                    if (val === "date") setConditionVal("2026-11-01,2026-11-30");
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="os">Device OS</option>
                  <option value="time">Time Slot</option>
                  <option value="date">Date Range</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Condition Value</label>
                {ruleType === "os" ? (
                  <select
                    value={conditionVal}
                    onChange={(e) => setConditionVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="iOS">iOS (Apple iPhone/iPad)</option>
                    <option value="Android">Android</option>
                    <option value="Windows">Windows Desktop</option>
                    <option value="Mac">macOS Desktop</option>
                  </select>
                ) : ruleType === "time" ? (
                  <select
                    value={conditionVal}
                    onChange={(e) => setConditionVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="morning">Morning (06:00 - 12:00)</option>
                    <option value="afternoon">Afternoon (12:00 - 18:00)</option>
                    <option value="evening">Evening (18:00 - 24:00)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={conditionVal}
                    onChange={(e) => setConditionVal(e.target.value)}
                    placeholder="YYYY-MM-DD,YYYY-MM-DD"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Priority (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Conditional Redirect Destination</label>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://apps.apple.com/... or https://play.google.com/..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={!redirectUrl || addMutation.isPending}
                onClick={() => addMutation.mutate()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Rule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


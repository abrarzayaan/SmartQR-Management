"use client";

import React, { useState } from "react";
import { GitFork, Plus, Trash2, Smartphone, Clock, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RoutingRule } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface SmartRulesModalProps {
  qrId: number | null;
  qrTitle?: string;
  onClose: () => void;
}

export function SmartRulesModal({ qrId, qrTitle, onClose }: SmartRulesModalProps) {
  const queryClient = useQueryClient();

  const [ruleType, setRuleType] = useState<"os" | "time" | "date">("os");
  const [conditionVal, setConditionVal] = useState("iOS");
  const [redirectUrl, setRedirectUrl] = useState("https://apps.apple.com/");
  const [priority, setPriority] = useState(1);

  const { data: rules = [], isLoading } = useQuery<RoutingRule[]>({
    queryKey: ["rules", qrId],
    queryFn: () => api.getRules(qrId!),
    enabled: Boolean(qrId),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      api.createRule(qrId!, {
        rule_type: ruleType,
        condition_key: ruleType === "os" ? "os" : ruleType === "time" ? "time_slot" : "date_range",
        condition_value: conditionVal,
        redirect_url: redirectUrl,
        priority,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules", qrId] });
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      toast.success("Routing rule added");
      setRedirectUrl("");
    },
    onError: () => toast.error("Failed to add rule"),
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: number) => api.deleteRule(qrId!, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules", qrId] });
      queryClient.invalidateQueries({ queryKey: ["qrs"] });
      toast.success("Rule removed");
    },
    onError: () => toast.error("Failed to delete rule"),
  });

  return (
    <Modal
      isOpen={Boolean(qrId)}
      onClose={onClose}
      title="Smart Routing Rules"
      description={qrTitle ? `Campaign: ${qrTitle}` : ""}
      icon={<GitFork className="h-4 w-4" />}
      maxWidth="2xl"
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-6 text-xs text-gray-600">
        {/* Active Rules */}
        <div className="space-y-2.5">
          <div className="font-semibold text-gray-900">Active Rules ({rules.length})</div>

          {isLoading ? (
            <div className="py-6 text-center text-gray-400">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 text-center text-gray-500">
              No routing rules yet. All visitors go to the default target URL.
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge variant="info" className="font-mono">
                      P{r.priority}
                    </Badge>
                    <div className="min-w-0">
                      <div className="text-gray-900 font-medium flex items-center gap-1.5">
                        {r.rule_type === "os" ? (
                          <Smartphone className="h-3.5 w-3.5 text-gray-500" />
                        ) : r.rule_type === "time" ? (
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                        ) : (
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        )}
                        <span className="capitalize">{r.rule_type}:</span> {r.condition_value}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono truncate max-w-md">
                        → {r.redirect_url}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(r.id)}
                    className="hover:text-red-600 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Rule Form */}
        <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-4">
          <div className="font-semibold text-gray-900">Add New Rule</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Condition Type</Label>
              <Select
                value={ruleType}
                onChange={(e) => {
                  const val = e.target.value as "os" | "time" | "date";
                  setRuleType(val);
                  if (val === "os") setConditionVal("iOS");
                  if (val === "time") setConditionVal("morning");
                  if (val === "date") setConditionVal("2026-11-01,2026-11-30");
                }}
              >
                <option value="os">Device OS</option>
                <option value="time">Time of Day</option>
                <option value="date">Date Range</option>
              </Select>
            </div>

            <div>
              <Label>Match Value</Label>
              {ruleType === "os" ? (
                <Select value={conditionVal} onChange={(e) => setConditionVal(e.target.value)}>
                  <option value="iOS">iOS (iPhone / iPad)</option>
                  <option value="Android">Android</option>
                  <option value="Windows">Windows</option>
                  <option value="Mac">macOS</option>
                </Select>
              ) : ruleType === "time" ? (
                <Select value={conditionVal} onChange={(e) => setConditionVal(e.target.value)}>
                  <option value="morning">Morning (06–12)</option>
                  <option value="afternoon">Afternoon (12–18)</option>
                  <option value="evening">Evening (18–24)</option>
                </Select>
              ) : (
                <Input
                  value={conditionVal}
                  onChange={(e) => setConditionVal(e.target.value)}
                  placeholder="YYYY-MM-DD,YYYY-MM-DD"
                  className="font-mono text-xs"
                />
              )}
            </div>

            <div>
              <Label>Priority (1–10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label>Redirect Destination URL</Label>
            <Input
              type="url"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://apps.apple.com/..."
              className="font-mono text-xs"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              loading={addMutation.isPending}
              disabled={!redirectUrl}
              onClick={() => addMutation.mutate()}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Rule
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

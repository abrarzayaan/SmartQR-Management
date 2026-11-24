import {
  QRCodeRecord,
  QRCodeCreatePayload,
  FolderRecord,
  BrandKitRecord,
  RoutingRule,
  ScanAnalytics,
  WorkspaceStats,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const api = {
  // Live Preview Image
  async preview(payload: QRCodeCreatePayload): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/api/qr/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Preview generation failed");
    return res.blob();
  },

  // QR CRUD
  async getAllQrs(params?: {
    search?: string;
    qr_type?: string;
    folder_id?: number | null;
  }): Promise<QRCodeRecord[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.qr_type && params.qr_type !== "all") query.set("qr_type", params.qr_type);
    if (params?.folder_id !== undefined && params?.folder_id !== null) {
      query.set("folder_id", params.folder_id.toString());
    }

    const res = await fetch(`${BASE_URL}/api/qrs?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch QR codes");
    return res.json();
  },

  async getQr(id: number): Promise<QRCodeRecord> {
    const res = await fetch(`${BASE_URL}/api/qr/${id}`);
    if (!res.ok) throw new Error("Failed to fetch QR details");
    return res.json();
  },

  async createQr(payload: QRCodeCreatePayload): Promise<QRCodeRecord> {
    const res = await fetch(`${BASE_URL}/api/qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create QR code");
    return res.json();
  },

  async updateQr(id: number, updates: Partial<QRCodeCreatePayload>): Promise<QRCodeRecord> {
    const res = await fetch(`${BASE_URL}/api/qr/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update QR code");
    return res.json();
  },

  async deleteQr(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/qr/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete QR code");
    return res.json();
  },

  // Analytics & Stats
  async getAnalytics(id: number): Promise<ScanAnalytics> {
    const res = await fetch(`${BASE_URL}/api/qr/${id}/analytics`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  },

  async getWorkspaceStats(): Promise<WorkspaceStats> {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error("Failed to fetch workspace stats");
    return res.json();
  },

  // Folders
  async getFolders(): Promise<FolderRecord[]> {
    const res = await fetch(`${BASE_URL}/api/folders`);
    if (!res.ok) throw new Error("Failed to fetch folders");
    return res.json();
  },

  async createFolder(name: string, color: string = "#3b82f6"): Promise<FolderRecord> {
    const res = await fetch(`${BASE_URL}/api/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    return res.json();
  },

  async deleteFolder(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/folders/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete folder");
    return res.json();
  },

  // Brand Kits
  async getBrandKits(): Promise<BrandKitRecord[]> {
    const res = await fetch(`${BASE_URL}/api/brand-kits`);
    if (!res.ok) throw new Error("Failed to fetch brand kits");
    return res.json();
  },

  async createBrandKit(data: Partial<BrandKitRecord>): Promise<BrandKitRecord> {
    const res = await fetch(`${BASE_URL}/api/brand-kits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save brand kit");
    return res.json();
  },

  async deleteBrandKit(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/brand-kits/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete brand kit");
    return res.json();
  },

  // Routing Rules
  async getRules(qrId: number): Promise<RoutingRule[]> {
    const res = await fetch(`${BASE_URL}/api/qr/${qrId}/rules`);
    if (!res.ok) throw new Error("Failed to fetch routing rules");
    return res.json();
  },

  async addRule(
    qrId: number,
    rule: Omit<RoutingRule, "id" | "qr_id" | "created_at">
  ): Promise<RoutingRule> {
    const res = await fetch(`${BASE_URL}/api/qr/${qrId}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    if (!res.ok) throw new Error("Failed to add routing rule");
    return res.json();
  },

  async createRule(
    qrId: number,
    rule: Omit<RoutingRule, "id" | "qr_id" | "created_at">
  ): Promise<RoutingRule> {
    return api.addRule(qrId, rule);
  },

  async deleteRule(first: number, second?: number): Promise<{ success: boolean }> {
    const ruleId = second !== undefined ? second : first;
    const res = await fetch(`${BASE_URL}/api/rules/${ruleId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete rule");
    return res.json();
  },

  // Bulk Generator
  async getBulkTemplate(): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/api/qr/bulk/template`);
    if (!res.ok) throw new Error("Failed to download bulk template");
    return res.blob();
  },

  async generateBulkZip(
    file: File,
    options?: Partial<{
      folder_id: number | null;
      qr_type: string;
      fg_color: string;
      bg_color: string;
      dot_style: string;
      eye_frame: string;
      eye_ball: string;
    }>
  ): Promise<Blob> {
    const csv_text = await file.text();
    return api.bulkGenerate({
      csv_text,
      ...options,
    });
  },

  async bulkGenerate(payload: {
    csv_text: string;
    folder_id?: number | null;
    qr_type?: string;
    fg_color?: string;
    bg_color?: string;
    gradient_type?: string;
    fg_color_2?: string;
    dot_style?: string;
    eye_frame?: string;
    eye_ball?: string;
    eye_color?: string | null;
    error_correction?: string;
    margin?: number;
    size?: number;
  }): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/api/qr/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Bulk generation failed" }));
      throw new Error(err.detail || "Bulk generation failed");
    }
    return res.blob();
  },
};


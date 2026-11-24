export type QRType = "dynamic" | "static";

export type ContentType =
  | "url"
  | "vcard"
  | "wifi"
  | "whatsapp"
  | "email"
  | "sms"
  | "maps"
  | "applink"
  | "text";

export type GradientType = "solid" | "horizontal" | "radial";
export type DotStyle = "rounded" | "circle" | "gem" | "liquid" | "gapped" | "square";
export type EyeFrame = "square" | "rounded" | "circle" | "leaf";
export type EyeBall = "square" | "circle" | "diamond" | "leaf";
export type FrameStyle = "none" | "bottom_banner" | "top_banner" | "badge";

export interface QRCodeRecord {
  id: number;
  short_code: string;
  title: string;
  qr_type: QRType;
  content_type: ContentType;
  target_url: string;
  dynamic_url?: string;
  fg_color: string;
  bg_color: string;
  gradient_type: GradientType;
  fg_color_2?: string;
  dot_style: DotStyle;
  eye_frame: EyeFrame;
  eye_ball: EyeBall;
  eye_color?: string | null;
  error_correction: "L" | "M" | "Q" | "H";
  margin: number;
  size: number;
  logo_type?: string;
  logo_data?: string | null;
  frame_style: FrameStyle;
  frame_text?: string;
  frame_color?: string;
  folder_id?: number | null;
  is_password_protected?: boolean;
  scan_limit?: number | null;
  expires_at?: string | null;
  scan_count: number;
  rules_count?: number;
  created_at: string;
  updated_at: string;
}

export interface QRCodeCreatePayload {
  title: string;
  qr_type: QRType;
  content_type: ContentType;
  target_url: string;
  fg_color: string;
  bg_color: string;
  gradient_type: GradientType;
  fg_color_2?: string;
  dot_style: DotStyle;
  eye_frame: EyeFrame;
  eye_ball: EyeBall;
  eye_color?: string | null;
  error_correction: "L" | "M" | "Q" | "H";
  margin: number;
  size: number;
  logo_type?: string;
  logo_data?: string | null;
  frame_style: FrameStyle;
  frame_text?: string;
  frame_color?: string;
  folder_id?: number | null;
  password?: string | null;
  scan_limit?: number | null;
  expires_at?: string | null;
}

export interface FolderRecord {
  id: number;
  name: string;
  color: string;
  qr_count: number;
  created_at: string;
  updated_at: string;
}

export interface BrandKitRecord {
  id: number;
  name: string;
  fg_color: string;
  bg_color: string;
  gradient_type: GradientType;
  fg_color_2?: string;
  dot_style: DotStyle;
  eye_frame: EyeFrame;
  eye_ball: EyeBall;
  eye_color?: string | null;
  logo_data?: string | null;
  created_at: string;
}

export interface RoutingRule {
  id: number;
  qr_id: number;
  rule_type: "os" | "time" | "date";
  condition_key: string;
  condition_value: string;
  redirect_url: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface HourlyStat {
  hour: string;
  count: number;
}

export interface TopLocation {
  country?: string;
  city?: string;
  count: number;
}

export interface ScanLog {
  id: number;
  qr_id: number;
  scanned_at: string;
  ip_address?: string;
  device_type?: string;
  os_name?: string;
  browser_name?: string;
  country?: string;
  city?: string;
  user_agent?: string;
}

export interface ScanAnalytics {
  total_scans: number;
  unique_scans: number;
  mobile_percentage: number;
  peak_hour: string;
  hourly_breakdown: HourlyStat[];
  recent_scans: ScanLog[];
  device_breakdown: Record<string, number>;
  os_breakdown: Record<string, number>;
  browser_breakdown: Record<string, number>;
  country_breakdown: Record<string, number>;
  top_countries: TopLocation[];
  top_cities: TopLocation[];
}

export interface WorkspaceStats {
  total_qrs: number;
  total_scans: number;
  unique_scans: number;
  dynamic_qrs: number;
  top_qr_title: string;
  top_qr_scans: number;
}


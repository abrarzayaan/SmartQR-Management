import { create } from "zustand";
import {
  QRType,
  ContentType,
  GradientType,
  DotStyle,
  EyeFrame,
  EyeBall,
  FrameStyle,
  QRCodeCreatePayload,
  BrandKitRecord,
} from "./types";
import { getContrastRatio } from "./utils";

export interface StudioState {
  // Navigation
  activeTab: "studio" | "manager";
  setActiveTab: (tab: "studio" | "manager") => void;

  // Studio configuration
  title: string;
  qr_type: QRType;
  content_type: ContentType;
  target_url: string;
  fg_color: string;
  bg_color: string;
  gradient_type: GradientType;
  fg_color_2: string;
  dot_style: DotStyle;
  eye_frame: EyeFrame;
  eye_ball: EyeBall;
  eye_color: string | null;
  has_custom_eye_color: boolean;
  error_correction: "L" | "M" | "Q" | "H";
  margin: number;
  size: number;
  logo_type: string;
  logo_data: string | null;
  frame_style: FrameStyle;
  frame_text: string;
  frame_color: string;
  folder_id: number | null;
  password: string | null;
  scan_limit: number | null;
  expires_at: string | null;

  // Preview state
  previewBlobUrl: string | null;
  isPreviewLoading: boolean;

  // Actions
  setField: <K extends keyof StudioState>(key: K, value: StudioState[K]) => void;
  applyPreset: (preset: {
    fg: string;
    fg2: string;
    bg: string;
    grad: GradientType;
    dot: DotStyle;
    eyeFrame: EyeFrame;
    eyeBall: EyeBall;
  }) => void;
  applyBrandKit: (kit: BrandKitRecord) => void;
  autoFixContrast: () => void;
  getPayload: () => QRCodeCreatePayload;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  activeTab: "studio",
  setActiveTab: (tab) => set({ activeTab: tab }),

  title: "My Smart QR",
  qr_type: "dynamic",
  content_type: "url",
  target_url: "https://antigravity.google",
  fg_color: "#0f172a",
  bg_color: "#ffffff",
  gradient_type: "solid",
  fg_color_2: "#3b82f6",
  dot_style: "rounded",
  eye_frame: "square",
  eye_ball: "square",
  eye_color: null,
  has_custom_eye_color: false,
  error_correction: "H",
  margin: 2,
  size: 800,
  logo_type: "none",
  logo_data: null,
  frame_style: "none",
  frame_text: "SCAN ME",
  frame_color: "#0f172a",
  folder_id: null,
  password: null,
  scan_limit: null,
  expires_at: null,

  previewBlobUrl: null,
  isPreviewLoading: false,

  setField: (key, value) => set({ [key]: value } as Partial<StudioState>),

  applyPreset: (preset) =>
    set({
      fg_color: preset.fg,
      fg_color_2: preset.fg2,
      bg_color: preset.bg,
      gradient_type: preset.grad,
      dot_style: preset.dot,
      eye_frame: preset.eyeFrame,
      eye_ball: preset.eyeBall,
    }),

  applyBrandKit: (kit) =>
    set({
      fg_color: kit.fg_color,
      fg_color_2: kit.fg_color_2 || kit.fg_color,
      bg_color: kit.bg_color,
      gradient_type: kit.gradient_type,
      dot_style: kit.dot_style,
      eye_frame: kit.eye_frame,
      eye_ball: kit.eye_ball,
      eye_color: kit.eye_color || null,
      has_custom_eye_color: Boolean(kit.eye_color),
      logo_data: kit.logo_data || null,
      logo_type: kit.logo_data ? "custom" : "none",
      error_correction: "H",
    }),

  autoFixContrast: () => {
    const s = get();
    const effectiveBg = s.bg_color === "transparent" ? "#ffffff" : s.bg_color;
    // If background is light, use deep luxury slate foreground; else use crisp white
    if (effectiveBg.toLowerCase() === "#ffffff" || effectiveBg.toLowerCase() === "transparent") {
      set({
        fg_color: "#0f172a",
        fg_color_2: s.gradient_type !== "solid" ? "#334155" : s.fg_color_2,
      });
    } else {
      set({
        fg_color: "#ffffff",
        fg_color_2: s.gradient_type !== "solid" ? "#38bdf8" : s.fg_color_2,
      });
    }
  },

  getPayload: () => {
    const s = get();
    return {
      title: s.title,
      qr_type: s.qr_type,
      content_type: s.content_type,
      target_url: s.target_url,
      fg_color: s.fg_color,
      bg_color: s.bg_color,
      gradient_type: s.gradient_type,
      fg_color_2: s.gradient_type !== "solid" ? s.fg_color_2 : undefined,
      dot_style: s.dot_style,
      eye_frame: s.eye_frame,
      eye_ball: s.eye_ball,
      eye_color: s.has_custom_eye_color ? s.eye_color : null,
      error_correction: s.logo_type !== "none" || Boolean(s.logo_data) ? "H" : s.error_correction,
      margin: s.margin,
      size: s.size,
      logo_type: s.logo_type,
      logo_data: s.logo_data,
      frame_style: s.frame_style,
      frame_text: s.frame_style !== "none" ? s.frame_text : undefined,
      frame_color: s.frame_style !== "none" ? s.frame_color : undefined,
      folder_id: s.folder_id,
      password: s.password || undefined,
      scan_limit: s.scan_limit || undefined,
      expires_at: s.expires_at || undefined,
    };
  },
}));


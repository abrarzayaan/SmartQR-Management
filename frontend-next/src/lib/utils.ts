import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";

extend([a11yPlugin]);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates WCAG contrast ratio between foreground and effective background.
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  const effectiveBg = !bgHex || bgHex === "transparent" ? "#ffffff" : bgHex;
  try {
    const c1 = colord(fgHex || "#000000");
    const c2 = colord(effectiveBg);
    const ratio = c1.contrast(c2);
    return isNaN(ratio) ? 7.0 : Math.round(ratio * 100) / 100;
  } catch {
    return 7.0;
  }
}

export interface ScannabilityResult {
  score: number;
  grade: "Excellent" | "Good" | "Moderate" | "Poor";
  status: "optimal" | "warning" | "critical";
  minRatio: number;
  color: string;
  issues: string[];
}

/**
 * Calculates scannability readiness score (0-100%).
 * Supports both object params and positional arguments.
 */
export function calculateScannabilityScore(
  arg1:
    | string
    | {
        fg_color: string;
        fg_color_2?: string;
        bg_color: string;
        gradient_type?: string;
        error_correction?: string;
        margin?: number;
        hasLogo?: boolean;
      },
  arg2?: string,
  arg3?: string,
  arg4?: boolean,
  arg5?: string,
  arg6?: string,
  arg7?: number
): ScannabilityResult {
  let fg_color = "#0f172a";
  let bg_color = "#ffffff";
  let error_correction = "H";
  let hasLogo = false;
  let gradient_type = "solid";
  let fg_color_2: string | undefined = undefined;
  let margin = 2;

  if (typeof arg1 === "object" && arg1 !== null) {
    fg_color = arg1.fg_color || "#0f172a";
    bg_color = arg1.bg_color || "#ffffff";
    error_correction = arg1.error_correction || "H";
    hasLogo = Boolean(arg1.hasLogo);
    gradient_type = arg1.gradient_type || "solid";
    fg_color_2 = arg1.fg_color_2;
    margin = arg1.margin ?? 2;
  } else if (typeof arg1 === "string") {
    fg_color = arg1;
    bg_color = arg2 || "#ffffff";
    error_correction = arg3 || "H";
    hasLogo = Boolean(arg4);
    gradient_type = arg5 || "solid";
    fg_color_2 = arg6;
    margin = arg7 ?? 2;
  }

  const effectiveBg = !bg_color || bg_color === "transparent" ? "#ffffff" : bg_color;
  const ratio1 = getContrastRatio(fg_color, effectiveBg);
  const ratio2 =
    gradient_type !== "solid" && fg_color_2
      ? getContrastRatio(fg_color_2, effectiveBg)
      : ratio1;
  const minRatio = Math.min(ratio1, ratio2);

  const issues: string[] = [];

  // Contrast pts (40)
  let contrastPts = 0;
  if (minRatio >= 7.0) {
    contrastPts = 40;
  } else if (minRatio >= 4.5) {
    contrastPts = 34;
    issues.push("Contrast ratio is acceptable (4.5:1+) but higher contrast improves scan speed in dim lighting.");
  } else if (minRatio >= 3.0) {
    contrastPts = 20;
    issues.push("Low contrast detected (under 4.5:1). Some legacy smartphone cameras may struggle to decode.");
  } else if (minRatio >= 2.0) {
    contrastPts = 10;
    issues.push("Critical low contrast! Very difficult for standard mobile cameras to decode.");
  } else {
    contrastPts = 0;
    issues.push("Insufficient contrast! Scanner cannot distinguish dots from background.");
  }

  // Inverted check
  try {
    const isBgDark = colord(effectiveBg).isDark();
    const isFgLight = colord(fg_color).isLight();
    if (isBgDark && isFgLight) {
      issues.push("Inverted color scheme (light dots on dark background). Default camera apps may scan slower.");
    }
  } catch {}

  // Error correction pts (25)
  let ecPts = 10;
  if (error_correction === "H") {
    ecPts = 25;
  } else if (error_correction === "Q") {
    ecPts = 22;
  } else if (error_correction === "M") {
    ecPts = 17;
  }

  // Margin pts (15)
  let marginPts = 5;
  if (margin >= 2) marginPts = 15;
  else if (margin === 1) marginPts = 10;
  else issues.push("Zero quiet zone margin! Surrounding elements may obstruct scan reading.");

  // Logo factor (20)
  let logoPts = 20;
  if (hasLogo && error_correction !== "H") {
    logoPts = 8;
    issues.push("Logo embedded without EC-H (High) error correction may cause decoding failure.");
  }

  const score = Math.max(10, Math.min(100, contrastPts + ecPts + marginPts + logoPts));

  let grade: "Excellent" | "Good" | "Moderate" | "Poor" = "Excellent";
  let status: "optimal" | "warning" | "critical" = "optimal";
  let color = "#10b981"; // Emerald

  if (score >= 88 && minRatio >= 4.5) {
    grade = "Excellent";
    status = "optimal";
    color = "#10b981";
  } else if (score >= 70 && minRatio >= 3.5) {
    grade = "Good";
    status = "warning";
    color = "#3b82f6";
  } else if (score >= 55 && minRatio >= 2.5) {
    grade = "Moderate";
    status = "warning";
    color = "#f59e0b";
  } else {
    grade = "Poor";
    status = "critical";
    color = "#f43f5e";
  }

  return { score, grade, status, minRatio, color, issues };
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.clipboard) {
    return Promise.resolve(false);
  }
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

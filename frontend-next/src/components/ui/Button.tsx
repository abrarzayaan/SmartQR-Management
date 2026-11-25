"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 border border-emerald-400/40 shadow-sm focus-visible:ring-emerald-500/30",
  accent:
    "bg-zinc-100 text-zinc-950 font-semibold hover:bg-white border border-zinc-200 shadow-sm focus-visible:ring-zinc-400/30",
  secondary:
    "bg-elevated text-ink hover:bg-[#282C35] border border-line focus-visible:ring-zinc-500/25",
  outline:
    "bg-surface text-ink-secondary hover:bg-elevated hover:text-ink border border-line hover:border-line-strong focus-visible:ring-zinc-500/25",
  ghost:
    "bg-transparent text-ink-secondary hover:bg-elevated hover:text-ink border border-transparent focus-visible:ring-zinc-500/20",
  danger:
    "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 focus-visible:ring-red-500/25",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7 px-2.5 text-xs rounded-lg gap-1.5",
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-5 text-sm rounded-xl gap-2",
  icon: "h-8 w-8 p-0 rounded-lg justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "outline",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
          "focus:outline-none focus-visible:ring-4 active:scale-[0.98]",
          "disabled:opacity-45 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

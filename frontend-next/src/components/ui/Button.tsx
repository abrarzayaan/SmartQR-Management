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
    "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900 shadow-sm focus-visible:ring-gray-900/20",
  accent:
    "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-sm focus-visible:ring-blue-600/20",
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200/80 border border-transparent focus-visible:ring-gray-400/20",
  outline:
    "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus-visible:ring-gray-400/20",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent focus-visible:ring-gray-400/20",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/70 focus-visible:ring-red-500/20",
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
          "disabled:opacity-50 disabled:pointer-events-none",
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

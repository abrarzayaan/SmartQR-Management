import React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium text-ink-secondary mb-1.5", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-10 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink",
      "placeholder:text-ink-subtle transition-all duration-150",
      "hover:border-line-strong focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink",
      "placeholder:text-ink-subtle transition-all duration-150 resize-none",
      "hover:border-line-strong focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15",
      "disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full h-10 rounded-xl border border-line bg-canvas px-3 text-sm text-ink",
      "transition-all duration-150",
      "hover:border-line-strong focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

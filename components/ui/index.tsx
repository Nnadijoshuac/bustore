"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ── Button ────────────────────────────────────────────────────

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:   "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",
        secondary: "bg-surface-elevated hover:bg-surface-muted text-white border border-surface-border",
        ghost:     "hover:bg-surface-elevated text-gray-400 hover:text-white",
        danger:    "bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/20",
        success:   "bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/20",
        outline:   "border border-surface-border hover:bg-surface-elevated text-gray-300",
      },
      size: {
        sm:   "h-8  px-3  text-sm",
        md:   "h-10 px-4  text-sm",
        lg:   "h-12 px-6  text-base",
        icon: "h-9  w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

// ── Badge ─────────────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:   "bg-surface-muted text-gray-300",
        green:     "bg-accent-green/10 text-accent-green",
        amber:     "bg-accent-amber/10 text-accent-amber",
        red:       "bg-accent-red/10 text-accent-red",
        blue:      "bg-brand-500/10 text-brand-400",
        purple:    "bg-accent-purple/10 text-accent-purple",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ── Card ──────────────────────────────────────────────────────

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface-card border border-surface-border",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6 pb-4", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-400 mt-1", className)} {...props} />;
}

// ── Input ─────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-gray-400 text-sm pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-surface-elevated border border-surface-border px-4 py-2.5 text-sm text-white placeholder:text-gray-500",
            "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            prefix && "pl-10",
            suffix && "pr-10",
            error && "border-accent-red focus:border-accent-red",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-gray-400 text-sm pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ── Select ────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-surface-elevated border border-surface-border px-4 py-2.5 text-sm text-white",
          "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed appearance-none",
          error && "border-accent-red",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ── Textarea ──────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-surface-elevated border border-surface-border px-4 py-2.5 text-sm text-white placeholder:text-gray-500",
          "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors resize-none",
          error && "border-accent-red",
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

// ── Skeleton ──────────────────────────────────────────────────

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface-elevated animate-pulse",
        className
      )}
      {...props}
    />
  );
}

// ── Divider ───────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-surface-border", className)} />;
}

// ── Empty State ───────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && (
        <div className="h-12 w-12 rounded-2xl bg-surface-elevated flex items-center justify-center text-gray-400">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

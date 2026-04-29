"use client";

import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  widthClassName?: string;
  headerContent?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  widthClassName = "max-w-lg",
  headerContent,
  footer,
  children,
}: SlideOverProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />

      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full transform border-l border-border/50 bg-card shadow-2xl transition-transform duration-300 ease-out",
          widthClassName,
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            {headerContent || (
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
                {subtitle ? (
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-5">{children}</div>

          {footer ? <div className="border-t border-border/40 bg-slate-50/50 px-5 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

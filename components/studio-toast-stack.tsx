"use client";

import { CheckCircle2, Info, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioToastItem } from "@/hooks/use-studio-toast";

type Props = {
  toasts: StudioToastItem[];
  onDismiss: (id: number) => void;
};

const ICON = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export function StudioToastStack({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none top-[calc(3rem+env(safe-area-inset-top))] sm:top-[calc(3.5rem+env(safe-area-inset-top))]"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const Icon = ICON[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto w-full max-w-md flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-300",
              toast.variant === "success" &&
                "bg-primary/15 border-primary/40 text-foreground",
              toast.variant === "error" &&
                "bg-destructive/15 border-destructive/40 text-foreground",
              toast.variant === "info" &&
                "bg-white/10 border-white/20 text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0 mt-0.5",
                toast.variant === "success" && "text-primary",
                toast.variant === "error" && "text-destructive",
                toast.variant === "info" && "text-muted-foreground",
              )}
            />
            <p className="text-sm font-medium leading-snug flex-1 pt-0.5">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10"
              aria-label="閉じる"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

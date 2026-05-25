"use client";

import { useCallback, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export type StudioToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

const AUTO_DISMISS_MS = 4200;

export function useStudioToast() {
  const [toasts, setToasts] = useState<StudioToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      if (variant === "success" && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(12);
      }
      window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  return { toasts, showToast, dismissToast };
}

"use client";

import { cn } from "@/lib/utils";
import { Mic2, BarChart3, Sparkles, Settings2 } from "lucide-react";
import type { WorkspaceTab } from "@/components/workspace-tabs";

export type MobileView = "setup" | WorkspaceTab;

type Props = {
  active: MobileView;
  onChange: (view: MobileView) => void;
  hasLyrics: boolean;
};

const ITEMS: {
  id: MobileView;
  label: string;
  icon: typeof Mic2;
}[] = [
  { id: "setup", label: "入力", icon: Settings2 },
  { id: "lyrics", label: "歌詞", icon: Mic2 },
  { id: "rhymes", label: "韻", icon: Sparkles },
  { id: "analysis", label: "分析", icon: BarChart3 },
];

export function MobileNav({ active, onChange, hasLyrics }: Props) {
  return (
    <nav
      className="xl:hidden shrink-0 border-t border-white/10 bg-black/40 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="メインナビゲーション"
    >
      <div className="grid grid-cols-4 h-14">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const disabled = id === "analysis" && !hasLyrics;
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-h-[44px] text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground active:bg-white/5",
                disabled && "opacity-40 cursor-not-allowed",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

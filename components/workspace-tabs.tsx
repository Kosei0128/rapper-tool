"use client";

import { cn } from "@/lib/utils";
import { Mic2, BarChart3, Sparkles } from "lucide-react";

export type WorkspaceTab = "lyrics" | "rhymes" | "analysis";

type Props = {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
  hasLyrics: boolean;
  densityScore?: number;
};

const TABS: {
  id: WorkspaceTab;
  label: string;
  icon: typeof Mic2;
}[] = [
  { id: "lyrics", label: "歌詞", icon: Mic2 },
  { id: "rhymes", label: "韻候補", icon: Sparkles },
  { id: "analysis", label: "分析", icon: BarChart3 },
];

export function WorkspaceTabs({
  active,
  onChange,
  hasLyrics,
  densityScore,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex p-1 rounded-xl bg-black/30 border border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            disabled={id === "analysis" && !hasLyrics}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] sm:min-h-0",
              active === id
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_-4px] shadow-primary/50"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              id === "analysis" && !hasLyrics && "opacity-40 cursor-not-allowed",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      {densityScore !== undefined && (
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
          <span className="text-[10px] uppercase tracking-widest text-primary font-display">
            韻密度
          </span>
          <span className="font-display text-lg font-bold text-primary leading-none">
            {densityScore}
          </span>
        </div>
      )}
    </div>
  );
}

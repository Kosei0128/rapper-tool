"use client";

import { ArrowLeft, NotebookPen, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onApplyToLyrics?: () => void;
  hasRhymes: boolean;
  isApplying?: boolean;
};

export function LyricNotepad({
  value,
  onChange,
  onBack,
  onApplyToLyrics,
  hasRhymes,
  isApplying,
}: Props) {
  const lineCount = value.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="studio-panel p-4 sm:p-5 space-y-4 h-full flex flex-col min-h-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold tracking-wider uppercase flex items-center gap-2">
            <NotebookPen className="size-4 text-primary" />
            メモ帳
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            1本の歌詞の中でサビ・バースを混ぜて書けます。{" "}
            <code className="text-primary/80">--hook</code>{" "}
            <code className="text-primary/80">--verse</code> は区切りメモ（反映時は消えます）
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Setup
        </Button>
      </div>

      {hasRhymes && (
        <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          <Sparkles className="size-3.5 shrink-0" />
          <span>韻候補タブを開いたままメモできます</span>
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`--verse\n町田の路地を抜けて\nみんなで炊いたガンジャ\n\n--hook\n夜明け前 ポリス来る前\nこの街で生き残るだけ`}
        className="flex-1 min-h-[280px] resize-none bg-black/30 border-white/10 focus-visible:ring-primary/50 font-mono text-[15px] leading-relaxed"
      />

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {lineCount} 行 · {value.length} 文字
        </span>
        <span className="text-primary/60">自動保存</span>
      </div>

      <div className="flex flex-col gap-2">
        {onApplyToLyrics && value.trim() && (
          <Button
            type="button"
            variant="outline"
            onClick={onApplyToLyrics}
            disabled={isApplying}
            className="w-full border-white/10 bg-white/5 hover:bg-white/10"
          >
            <Upload className="size-4" />
            {isApplying ? "反映・分析中..." : "歌詞に反映して分析"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full border-white/10 bg-white/5 hover:bg-white/10"
        >
          <ArrowLeft className="size-4" />
          Setup に戻る
        </Button>
      </div>
    </div>
  );
}

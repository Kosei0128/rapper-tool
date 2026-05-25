"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Save, Mic2, Pencil, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LineAnalysis } from "@/lib/analysis/types";

type Props = {
  lyrics: string;
  analysisLines?: LineAnalysis[];
  showReadings?: boolean;
  onChange?: (lyrics: string) => void;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
  onSave: () => Promise<void>;
  isSaving: boolean;
  saveMessage: string | null;
  isLoading?: boolean;
  isDirty?: boolean;
  onExportTxt?: () => void;
};

export function GeneratedLyrics({
  lyrics,
  analysisLines,
  showReadings = true,
  onChange,
  onReanalyze,
  isReanalyzing,
  onSave,
  isSaving,
  saveMessage,
  isLoading,
  isDirty,
  onExportTxt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(lyrics);

  useEffect(() => {
    if (!editing) setDraft(lyrics);
  }, [lyrics, editing]);

  const handleCopy = async () => {
    const text = editing ? draft : lyrics;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setDraft(lyrics);
    setEditing(true);
  };

  const handleApplyEdit = () => {
    onChange?.(draft.trim());
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setDraft(lyrics);
    setEditing(false);
  };

  const displayLines = (editing ? draft : lyrics)
    .split("\n")
    .filter(Boolean);

  const hasReadings =
    showReadings &&
    !editing &&
    analysisLines &&
    analysisLines.length > 0 &&
    analysisLines.some((l) => l.reading);

  return (
    <div className="studio-panel studio-panel-glow h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 border-b border-white/10 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <Mic2 className="size-5 text-primary" />
          <h2 className="font-display text-lg font-bold tracking-wider">
            歌詞
          </h2>
          {isDirty && !editing && (
            <span className="text-[10px] text-accent px-1.5 py-0.5 rounded border border-accent/30">
              未分析
            </span>
          )}
        </div>
        {(lyrics || editing) && (
          <div className="flex gap-2 flex-wrap">
            {!editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <Pencil className="size-4" />
                  編集
                </Button>
                {isDirty && onReanalyze && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReanalyze}
                    disabled={isReanalyzing}
                    className="border-primary/30 bg-primary/10 hover:bg-primary/20"
                  >
                    <BarChart3 className="size-4" />
                    {isReanalyzing ? "分析中..." : "分析更新"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "コピー済" : "コピー"}
                </Button>
                {onExportTxt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExportTxt}
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Download className="size-4" />
                    TXT
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <Save className="size-4" />
                  {isSaving ? "..." : "保存"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={handleApplyEdit}
                  className="h-8"
                >
                  反映
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="border-white/10 bg-white/5 h-8"
                >
                  キャンセル
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-3 sm:p-5 overflow-y-auto studio-scrollbar min-h-0">
        {isLoading && !lyrics ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-display tracking-widest uppercase">
              Writing bars...
            </p>
          </div>
        ) : editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[360px] resize-none bg-black/30 border-white/10 font-mono text-[15px] leading-relaxed"
            placeholder="1行ずつ改行で入力"
          />
        ) : lyrics ? (
          <div className="space-y-1">
            {hasReadings && (
              <div className="hidden sm:flex gap-4 px-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                <span className="w-6 shrink-0" />
                <span className="flex-1">歌詞</span>
                <span className="shrink-0 max-w-[42%] text-right">読み</span>
              </div>
            )}
            {displayLines.map((line, i) => {
              const analyzed =
                analysisLines?.[i]?.text === line ? analysisLines[i] : undefined;
              return (
              <div
                key={i}
                className="group flex flex-col sm:flex-row sm:gap-4 gap-1 py-2 px-2 sm:px-3 rounded-lg hover:bg-white/[0.04] transition-colors items-start"
              >
                <div className="flex gap-3 sm:gap-4 w-full sm:flex-1 min-w-0">
                  <span className="font-mono text-xs text-primary/50 w-6 shrink-0 pt-0.5 text-right select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-mono text-sm sm:text-[15px] leading-relaxed text-foreground/95 flex-1 min-w-0 break-words">
                    {line}
                  </p>
                  {hasReadings && (
                    <p
                      className={`hidden sm:block font-mono text-[11px] leading-relaxed shrink-0 max-w-[42%] text-right pt-0.5 ${
                        analyzed?.reading
                          ? "text-primary/55"
                          : "text-muted-foreground/30"
                      }`}
                      title={analyzed?.reading ? `${analyzed.moras}モーラ` : undefined}
                    >
                      {analyzed?.reading ?? "—"}
                    </p>
                  )}
                </div>
                {hasReadings && analyzed?.reading && (
                  <p
                    className="sm:hidden pl-9 font-mono text-[11px] leading-relaxed text-primary/50 break-all"
                    title={`${analyzed.moras}モーラ`}
                  >
                    {analyzed.reading}
                  </p>
                )}
              </div>
            );
            })}
            {saveMessage && (
              <p
                className={`text-xs mt-4 px-3 ${
                  saveMessage.startsWith("保存")
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <p className="font-display text-2xl font-bold tracking-wider text-muted-foreground/40">
              ここに歌詞
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              左のセットアップから言葉を入れて「生成」を押す
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

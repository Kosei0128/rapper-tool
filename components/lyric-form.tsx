"use client";

import { Plus, X, Flame, NotebookPen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SetupDraft, LyricFormData } from "@/lib/setup-draft";
import { DEFAULT_SETUP_DRAFT, setupDraftToFormData } from "@/lib/setup-draft";
import type { Mood, LyricFormat, PunchlineStyle } from "@/lib/rhyme/types";

export type { LyricFormData } from "@/lib/setup-draft";

type Props = {
  draft: SetupDraft;
  onDraftChange: (draft: SetupDraft) => void;
  onSubmit: (data: LyricFormData) => void;
  onFetchRhymesOnly?: (data: LyricFormData) => void;
  isLoading: boolean;
  isFetchingRhymes?: boolean;
  onOpenNotepad?: () => void;
};

const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "street", label: "ストリート" },
  { value: "emotional", label: "エモーショナル" },
  { value: "battle", label: "バトル" },
  { value: "mellow", label: "メロウ" },
  { value: "business", label: "ビジネス" },
];

const FORMAT_OPTIONS: { value: LyricFormat; label: string; hint?: string }[] = [
  { value: "4bars", label: "短め（約4行）", hint: "1フレーズのたたき台" },
  { value: "8bars", label: "標準（約8行）", hint: "バース1本分の目安" },
  { value: "16bars", label: "長め（約16行）", hint: "2バース分の目安" },
  { value: "punchline", label: "パンチライン（1〜2行）", hint: "オチだけ欲しいとき" },
];

const PUNCHLINE_OPTIONS: { value: PunchlineStyle; label: string }[] = [
  { value: "default", label: "インパクト" },
  { value: "metaphor", label: "比喩" },
  { value: "aggressive", label: "アグレッシブ" },
  { value: "witty", label: "ウィット" },
  { value: "story", label: "ストーリー" },
];

const BPM_PRESETS = [
  { value: "none", label: "—" },
  { value: "70", label: "70" },
  { value: "90", label: "90" },
  { value: "110", label: "110" },
  { value: "140", label: "140" },
];

export function LyricForm({
  draft: draftProp,
  onDraftChange,
  onSubmit,
  onFetchRhymesOnly,
  isLoading,
  isFetchingRhymes,
  onOpenNotepad,
}: Props) {
  const draft = draftProp ?? DEFAULT_SETUP_DRAFT;
  const { words, mood, format, bpmPreset, customBpm, beatsPerBar, punchlineStyle, allowArchaicRhymes } =
    draft;

  const patch = (partial: Partial<SetupDraft>) =>
    onDraftChange({ ...draft, ...partial });

  const addWord = () => patch({ words: [...words, ""] });
  const removeWord = (index: number) => {
    if (words.length <= 1) return;
    patch({ words: words.filter((_, i) => i !== index) });
  };
  const updateWord = (index: number, value: string) => {
    const next = [...words];
    next[index] = value;
    patch({ words: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = setupDraftToFormData(draft);
    if (data.inputWords.length === 0) return;
    onSubmit(data);
  };

  const handleRhymesOnly = () => {
    const data = setupDraftToFormData(draft);
    if (data.inputWords.length === 0) return;
    onFetchRhymesOnly?.(data);
  };

  const busy = isLoading || isFetchingRhymes;

  return (
    <div className="studio-panel p-5 space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold tracking-wider uppercase flex items-center gap-2">
          <Flame className="size-4 text-primary" />
          セットアップ
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          1行ずつフレーズを入力すると歌詞タブに反映され、行ごとに韻検索できます。
          歌詞タブにまとめて貼るより、ここで1行ずつ入れるのがおすすめです。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">
            言葉 / フレーズ
          </Label>
          {words.map((word, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={
                  index === 0
                    ? "町田 / みんなで炊いたガンジャ"
                    : "言葉 or フレーズ"
                }
                value={word}
                onChange={(e) => updateWord(index, e.target.value)}
                disabled={isLoading}
                className="bg-black/30 border-white/10 focus-visible:ring-primary/50 h-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeWord(index)}
                disabled={words.length <= 1 || isLoading}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="削除"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addWord}
            disabled={isLoading}
            className="w-full border-white/10 bg-white/5 hover:bg-white/10"
          >
            <Plus className="size-4" />
            追加
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              ムード
            </Label>
            <Select
              value={mood}
              onValueChange={(v) => patch({ mood: v as Mood })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-black/30 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              生成量
            </Label>
            <Select
              value={format === "hook" ? "8bars" : format}
              onValueChange={(v) => patch({ format: v as LyricFormat })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-black/30 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              サビ・バースの区切りはメモ帳の{" "}
              <code className="text-primary/80">--hook</code> /{" "}
              <code className="text-primary/80">--verse</code>{" "}
              で書く。歌詞は1本につながって保存・分析されます。
            </p>
          </div>
        </div>

        {format === "punchline" && (
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              パンチライン種類
            </Label>
            <Select
              value={punchlineStyle}
              onValueChange={(v) =>
                patch({ punchlineStyle: v as PunchlineStyle })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-black/30 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PUNCHLINE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              BPM
            </Label>
            <Select
              value={bpmPreset}
              onValueChange={(v) => v && patch({ bpmPreset: v })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-black/30 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BPM_PRESETS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">カスタム</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              拍子
            </Label>
            <Select
              value={beatsPerBar}
              onValueChange={(v) => v && patch({ beatsPerBar: v })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-black/30 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4/4</SelectItem>
                <SelectItem value="3">3/4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {bpmPreset === "custom" && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                #
              </Label>
              <Input
                type="number"
                min={40}
                max={200}
                placeholder="95"
                value={customBpm}
                onChange={(e) => patch({ customBpm: e.target.value })}
                disabled={isLoading}
                className="bg-black/30 border-white/10 h-9"
              />
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowArchaicRhymes}
            onChange={(e) => patch({ allowArchaicRhymes: e.target.checked })}
            disabled={isLoading}
            className="mt-1 size-4 accent-primary shrink-0"
          />
          <span className="space-y-1">
            <span className="text-sm font-medium block">古典韻候補も含める</span>
            <span className="text-[11px] text-muted-foreground leading-relaxed block">
              韻システム由来の「白々しきゃ」「よだちゃ」等（現代口語では古い縮約形）。
              OFF=自然な語優先 / ON=韻探索用に表示（スコアは下位）
            </span>
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            type="submit"
            className="w-full h-12 font-display text-base tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_-4px] shadow-primary/40"
            disabled={busy}
          >
            {isLoading ? "生成中..." : "生成"}
          </Button>
          {onFetchRhymesOnly && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRhymesOnly}
              disabled={busy}
              className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 font-display tracking-wider"
            >
              <Sparkles className="size-4" />
              {isFetchingRhymes ? "取得中..." : "韻だけ取得"}
            </Button>
          )}
        </div>

        {onOpenNotepad && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenNotepad}
            disabled={busy}
            className="w-full border-white/10 bg-white/5 hover:bg-white/10"
          >
            <NotebookPen className="size-4" />
            メモ帳で書く
          </Button>
        )}
      </form>
    </div>
  );
}

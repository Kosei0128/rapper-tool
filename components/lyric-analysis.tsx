"use client";

import type { LyricAnalysis, LyricCritique, RhymeMatch } from "@/lib/analysis/types";
import { BarChart3, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  analysis: LyricAnalysis | null;
  critique: LyricCritique | null;
  inputWords?: string[];
  isAnalyzing: boolean;
  onRequestCritique: () => void;
};

function ScoreBar({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-primary shrink-0">
          {value}
        </span>
      </div>
      <div className="h-2 rounded-full bg-black/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      {hint && (
        <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function rhymeStrengthLabel(strength: number): string {
  const pct = Math.round(strength * 100);
  if (pct >= 75) return "強";
  if (pct >= 50) return "中";
  return "弱";
}

function RhymeRow({ match }: { match: RhymeMatch }) {
  const isEnd = match.type === "end";
  const lineA = match.lineIndexA + 1;
  const lineB = match.lineIndexB + 1;
  const strength = Math.round(match.strength * 100);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs px-3 py-2 rounded-lg bg-black/25 border border-white/5">
      <Badge
        variant={isEnd ? "default" : "secondary"}
        className="text-[9px] h-5 shrink-0"
      >
        {isEnd ? "行末" : "内部"}
      </Badge>
      <span className="font-mono text-muted-foreground shrink-0">
        L{lineA}↔L{lineB}
      </span>
      <span className="text-foreground/90">
        {match.wordA} ↔ {match.wordB}
      </span>
      <span className="font-mono text-primary/70">{match.tail}</span>
      <span className="ml-auto text-[10px] text-muted-foreground">
        {rhymeStrengthLabel(match.strength)} {strength}%
      </span>
    </div>
  );
}

export function LyricAnalysisPanel({
  analysis,
  critique,
  inputWords = [],
  isAnalyzing,
  onRequestCritique,
}: Props) {
  if (!analysis) {
    return (
      <div className="studio-panel h-full min-h-0 flex flex-col items-center justify-center p-8 text-center">
        <BarChart3 className="size-10 text-muted-foreground/30 mb-3" />
        <p className="font-display text-lg tracking-wider text-muted-foreground/50">
          分析
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          歌詞生成後に韻密度・フロー・母音解析を表示
        </p>
      </div>
    );
  }

  const { density, flow, lines, rhymeMatches, rhymeQuality } = analysis;
  const endMatches = [...rhymeMatches]
    .filter((m) => m.type === "end")
    .sort((a, b) => b.strength - a.strength);
  const internalMatches = [...rhymeMatches]
    .filter((m) => m.type === "internal")
    .sort((a, b) => b.strength - a.strength);

  const inputUsage = inputWords.map((word) => ({
    word,
    found: lines.some((l) => l.text.includes(word.trim())),
  }));

  return (
    <div className="studio-panel h-full min-h-0 flex flex-col">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-wider">
              分析
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            行末韻・内部韻・フロー・入力語の使用状況
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-4xl font-bold text-gradient-neon leading-none">
            {density.overall}
          </div>
          <div className="text-[10px] tracking-widest text-muted-foreground">
            韻密度
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto studio-scrollbar space-y-6">
        {/* スコア内訳 */}
        <section className="grid sm:grid-cols-2 gap-4">
          <ScoreBar
            label="行末韻"
            value={density.endRhyme}
            hint="行末の母音が揃っているほど高得点"
          />
          <ScoreBar
            label="内部韻"
            value={density.internalRhyme}
            hint="行の途中で響きが合う語の密度"
          />
          <ScoreBar
            label="入力語使用率"
            value={density.inputWordUsage}
            hint="セットアップで入れた言葉・文章が歌詞に含まれているか"
          />
          <ScoreBar
            label="フロー均一性"
            value={density.flowUniformity}
            hint="各行のモーラ数が揃っているほどリズムが安定"
          />
        </section>

        {rhymeQuality && (
          <section className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs tracking-widest text-primary font-display">
                韻品質（論文ベース）
              </h3>
              <span className="font-display text-2xl font-bold text-primary">
                {rhymeQuality.overallQuality}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <ScoreBar
                label="韻の長さ"
                value={rhymeQuality.rhymeLengthScore}
                hint="行末5モーラ前後の脚韻が長いほど高得点"
              />
              <ScoreBar
                label="低重複"
                value={rhymeQuality.lowDuplicationScore}
                hint="行末表層のコピペ韻が少ないほど高得点"
              />
              <ScoreBar
                label="モーラ範囲"
                value={rhymeQuality.moraRangeScore}
                hint="8〜16モーラの行が多いほど高得点"
              />
              <ScoreBar
                label="行間バランス"
                value={rhymeQuality.moraBalanceScore}
                hint="隣接行のモーラ差≤4が多いほど高得点"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              行末類似度（低いほど良）: {Math.round(rhymeQuality.avgSuffixSimilarity * 100)}%
            </p>
          </section>
        )}

        {/* 入力ワード */}
        {inputWords.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs tracking-widest text-muted-foreground font-display">
              入力ワードの使用
            </h3>
            <div className="flex flex-wrap gap-2">
              {inputUsage.map(({ word, found }) => (
                <span
                  key={word}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                    found
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 bg-black/20 text-muted-foreground"
                  }`}
                >
                  {found ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3 opacity-60" />
                  )}
                  {word}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* フロー */}
        <section className="space-y-3">
          <h3 className="text-xs tracking-widest text-muted-foreground font-display">
            フロー（モーラ数）
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-md bg-black/30">
              平均 {flow.averageMoras} モーラ
            </span>
            <span className="px-2 py-1 rounded-md bg-black/30">
              ばらつき σ {flow.stdDevMoras}
            </span>
            {flow.bpm && (
              <span className="px-2 py-1 rounded-md bg-black/30">
                {flow.bpm} BPM
              </span>
            )}
            {flow.targetMorasPerLine !== undefined && (
              <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                目標 {flow.targetMorasPerLine} モーラ/行
              </span>
            )}
          </div>
          <div className="flex items-end gap-1.5 h-24 px-1">
            {flow.morasPerLine.map((moras, i) => {
              const max = Math.max(...flow.morasPerLine, 1);
              const height = Math.max(10, (moras / max) * 100);
              const off =
                flow.targetMorasPerLine !== undefined &&
                Math.abs(moras - flow.targetMorasPerLine) > 2;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0"
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      off ? "bg-accent/80" : "bg-primary/80"
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${i + 1}行目: ${moras}モーラ`}
                  />
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            緑=目標付近 / ピンク=目標から外れている行
          </p>
        </section>

        {/* 行ごとの解析 */}
        <section className="space-y-2">
          <h3 className="text-xs tracking-widest text-muted-foreground font-display">
            行ごとの解析
          </h3>
          <div className="space-y-2">
            {lines.map((line) => {
              const offTarget =
                flow.targetMorasPerLine !== undefined &&
                Math.abs(line.moras - flow.targetMorasPerLine) > 2;
              return (
                <div
                  key={line.index}
                  className="rounded-xl border border-white/5 bg-black/25 px-4 py-3 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-primary/50 shrink-0 pt-0.5">
                      {String(line.index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-relaxed flex-1">{line.text}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                      行末: <strong className="text-foreground">{line.endUnit}</strong>
                      {line.endReading && line.endReading !== line.endUnit && (
                        <span className="text-muted-foreground ml-1">
                          ({line.endReading})
                        </span>
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 font-mono text-primary">
                      母音 {line.endVowels || "—"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono ${
                        offTarget
                          ? "bg-accent/10 border border-accent/30 text-accent"
                          : "bg-white/5 border border-white/10 text-muted-foreground"
                      }`}
                    >
                      {line.moras} モーラ
                    </span>
                  </div>
                  {line.tokens.length > 0 && (
                    <div className="pl-7 flex flex-wrap gap-1.5">
                      {line.tokens.map((t) => (
                        <span
                          key={`${line.index}-${t.surface}`}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-muted-foreground"
                          title={`${t.reading} / ${t.vowels}`}
                        >
                          {t.surface}
                          <span className="font-mono text-primary/50 ml-1">
                            {t.vowels}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 韻のペア */}
        <section className="space-y-2">
          <h3 className="text-xs tracking-widest text-muted-foreground font-display">
            韻のペア（{endMatches.length + internalMatches.length} 件）
          </h3>
          {endMatches.length === 0 && internalMatches.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">
              検出された韻ペアはありません
            </p>
          ) : (
            <div className="space-y-1.5">
              {endMatches.map((m, i) => (
                <RhymeRow key={`e-${i}`} match={m} />
              ))}
              {internalMatches.slice(0, 12).map((m, i) => (
                <RhymeRow key={`i-${i}`} match={m} />
              ))}
              {internalMatches.length > 12 && (
                <p className="text-[10px] text-muted-foreground px-1">
                  他 {internalMatches.length - 12} 件の内部韻
                </p>
              )}
            </div>
          )}
        </section>

        {/* AIコーチ */}
        <section className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xs tracking-widest text-muted-foreground font-display">
              AIコーチ
            </h3>
            {!critique && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestCritique}
                disabled={isAnalyzing}
                className="border-white/10 bg-white/5 text-xs h-8"
              >
                {isAnalyzing ? "添削中..." : "AI添削を実行"}
              </Button>
            )}
          </div>
          {critique && (
            <div className="space-y-3 text-sm rounded-xl bg-black/25 border border-white/10 p-4">
              <p>{critique.summary}</p>
              {critique.strengths.length > 0 && (
                <div>
                  <p className="text-xs text-primary mb-1">良い点</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    {critique.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {critique.improvements.length > 0 && (
                <div>
                  <p className="text-xs text-accent mb-1">改善ポイント</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    {critique.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {critique.suggestedLines && critique.suggestedLines.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">提案ライン</p>
                  {critique.suggestedLines.map((line, i) => (
                    <p key={i} className="text-xs font-mono text-foreground/80">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

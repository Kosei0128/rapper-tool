"use client";

import { useMemo, useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  dedupeRhymeCandidates,
  highlightPhraseAnchor,
} from "@/lib/rhyme/dedupeRhymes";
import { isLikelyInvalidRhymeWord, isArchaicRhymeHackWord } from "@/lib/rhyme/rhymeWordValidity";
import type { InputPhrasePlan, RhymeCandidate, RhymeSource } from "@/lib/rhyme/types";

type Props = {
  rhymeCandidates: Record<string, RhymeCandidate[]>;
  inputPlan?: InputPhrasePlan[];
  isLoading: boolean;
  allowArchaicRhymes?: boolean;
};

const SOURCE_LABEL: Record<RhymeSource, string> = {
  nwnwn: "韻システム",
  azrhymes: "AZRhymes",
  "in-note": "韻ノート",
  kujirahand: "くじら",
  mock: "mock",
};

const INITIAL_SHOW = 16;

function InputCard({
  plan,
  candidates,
}: {
  plan: InputPhrasePlan;
  candidates: RhymeCandidate[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? candidates : candidates.slice(0, INITIAL_SHOW);
  const highlight = plan.isPhrase
    ? highlightPhraseAnchor(plan.original, plan.primaryRhymeWord)
    : null;

  const meta = candidates[0];

  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
      {/* 入力見出し */}
      <header className="px-5 py-4 border-b border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={plan.isPhrase ? "default" : "outline"}
            className="text-[10px] uppercase tracking-wide shrink-0"
          >
            {plan.isPhrase ? "文章" : "単語"}
          </Badge>
          {meta?.inputVowels && (
            <span className="text-[10px] font-mono text-muted-foreground ml-auto">
              母音: {meta.inputVowels}
            </span>
          )}
        </div>

        {plan.isPhrase && highlight ? (
          <div className="space-y-2">
            <p className="text-base leading-relaxed">
              {highlight.before}
              <mark className="bg-primary/25 text-primary px-1 rounded not-italic font-semibold">
                {highlight.anchor}
              </mark>
              {highlight.after}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              この<strong className="text-foreground font-medium">文章をそのまま</strong>
              歌詞に入れて、
              <strong className="text-primary font-medium">「{plan.primaryRhymeWord}」</strong>
              の韻を踏む
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-lg font-semibold">「{plan.original}」</p>
            <p className="text-xs text-muted-foreground">
              この言葉の韻候補
            </p>
          </div>
        )}
      </header>

      {/* 韻候補一覧 */}
      <div className="px-5 py-4">
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">韻候補が見つかりませんでした</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {candidates.length} 件（同じ読みの重複は除外済み）
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {visible.map((c) => (
                <div
                  key={`${c.word}-${c.source}-${c.reading ?? ""}`}
                  className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border border-white/10 bg-black/30 hover:border-primary/30 transition-colors"
                  title={[c.reading, c.vowels].filter(Boolean).join(" / ")}
                >
                  <span className="text-sm font-medium truncate">{c.word}</span>
                  {isArchaicRhymeHackWord(c.word) && (
                    <span className="text-[9px] text-accent/90 uppercase tracking-wide">
                      古典韻
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                    <span className="truncate">
                      {c.reading ? c.reading : c.vowels ?? "—"}
                    </span>
                    {c.score !== undefined && (
                      <span className="text-accent shrink-0 font-mono">
                        {Math.round(c.score * 100)}%
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70">
                    {SOURCE_LABEL[c.source]}
                  </span>
                </div>
              ))}
            </div>
            {candidates.length > INITIAL_SHOW && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs text-muted-foreground"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="size-3.5 mr-1" />
                    折りたたむ
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5 mr-1" />
                    残り {candidates.length - INITIAL_SHOW} 件を表示
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

export function RhymeResults({
  rhymeCandidates,
  inputPlan,
  isLoading,
  allowArchaicRhymes = false,
}: Props) {
  const hasPlan = inputPlan && inputPlan.length > 0;

  const cards = useMemo(() => {
    if (hasPlan) {
      return inputPlan.map((plan) => ({
        plan,
        candidates: dedupeRhymeCandidates(
          rhymeCandidates[plan.primaryRhymeWord] ?? [],
        ).filter(
          (c) =>
            !isLikelyInvalidRhymeWord(c.word, {
              queryWord: plan.primaryRhymeWord,
              allowArchaicRhymes,
            }),
        ),
      }));
    }
    return Object.entries(rhymeCandidates).map(([word, list]) => ({
      plan: {
        original: word,
        isPhrase: false,
        rhymeKeywords: [word],
        primaryRhymeWord: word,
      } satisfies InputPhrasePlan,
      candidates: dedupeRhymeCandidates(list).filter(
        (c) =>
          !isLikelyInvalidRhymeWord(c.word, {
            queryWord: word,
            allowArchaicRhymes,
          }),
      ),
    }));
  }, [hasPlan, inputPlan, rhymeCandidates]);

  const isEmpty = cards.every((c) => c.candidates.length === 0);

  return (
    <div className="studio-panel h-full min-h-0 flex flex-col">
      <div className="px-5 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-accent" />
          <h2 className="font-display text-lg font-bold tracking-wider uppercase">
            韻候補
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          入力した言葉・文章ごとに韻を表示。文章は末尾の韻軸語で検索します。
        </p>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {isLoading && isEmpty ? (
          <div className="flex items-center gap-3 text-muted-foreground py-12 justify-center">
            <div className="size-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-sm">韻候補を検索中...</span>
          </div>
        ) : isEmpty ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Generate を押すと韻候補が表示されます
          </p>
        ) : (
          <div className="space-y-5">
            {cards.map(({ plan, candidates }) => (
              <InputCard
                key={plan.original}
                plan={plan}
                candidates={candidates}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

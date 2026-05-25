import { tailMatchScore } from "@/lib/analysis/kana";
import type { RhymeCandidate, RhymeSource } from "./types";
import { isArchaicRhymeHackWord } from "./rhymeWordValidity";

/** ラップで自然な末尾（古典語ハックは除外） */
function hasNaturalRapEnding(word: string): boolean {
  if (isArchaicRhymeHackWord(word)) return false;
  if (/(?:者|なきゃ|なくちゃ|じゃ|ちゃ)$/.test(word)) return true;
  if (word.length <= 5 && /(?:みゃ|まりゃ|ばしゃ|とばしゃ)$/.test(word)) return true;
  return false;
}

/** ラップ用途の韻スコア（0〜1） */
export function scoreRhymeCandidate(
  queryWord: string,
  candidate: RhymeCandidate,
  queryVowels?: string,
  providerIndex = 0,
): number {
  const cWord = candidate.word;
  const source = candidate.source;

  // --- azrhymes: 辞書順位がそのまま韻の強さ（患者が1位など） ---
  if (source === "azrhymes") {
    let score = 0.98 - providerIndex * 0.012;
    if (hasNaturalRapEnding(cWord)) score += 0.02;
    if (cWord.endsWith(queryWord.slice(-2)) && queryWord.length >= 2) {
      score += 0.05;
    }
    return Math.min(1, score);
  }

  // --- in-note: 中位優先、変な語は下げる ---
  if (source === "in-note") {
    let score = 0.72 - providerIndex * 0.02;
    if (/ッ{2,}|ン{3,}/.test(cWord)) score -= 0.3;
    if (hasNaturalRapEnding(cWord)) score += 0.1;
    return Math.max(0.2, Math.min(0.85, score));
  }

  // --- nwnwn: 母音が緩い一致が多いので厳しめに ---
  let score = 0.45 - providerIndex * 0.003;

  if (hasNaturalRapEnding(cWord)) {
    score += 0.08;
  }

  if (queryWord.length >= 2 && cWord.endsWith(queryWord.slice(-2))) {
    score += 0.2;
  }

  if (queryVowels && candidate.vowels) {
    const tail = tailMatchScore(candidate.vowels, queryVowels, 2);
    score += tail * 0.2;
    // 「ana」系の緩い一致だけでは加点しない（末尾が響かない語）
    if (tail >= 0.5 && !hasNaturalRapEnding(cWord) && cWord.length > 4) {
      score -= 0.15;
    }
  }

  if (cWord.length <= 4) score += 0.05;
  if (cWord.length >= 8) score -= 0.1;

  return Math.max(0.1, Math.min(0.82, score));
}

/** マージ後の候補を関連度順に並べ替え */
export function rankRhymeCandidates(
  queryWord: string,
  candidates: RhymeCandidate[],
  queryVowels?: string,
): RhymeCandidate[] {
  const providerIndex = new Map<RhymeSource, number>();

  const scored = candidates.map((c) => {
    const idx = providerIndex.get(c.source) ?? 0;
    providerIndex.set(c.source, idx + 1);

    return {
      ...c,
      score: scoreRhymeCandidate(queryWord, c, queryVowels, idx),
    };
  });

  return scored.sort((a, b) => {
    const diff = (b.score ?? 0) - (a.score ?? 0);
    if (Math.abs(diff) > 0.001) return diff;
    return a.word.length - b.word.length;
  });
}

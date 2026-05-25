import type { RhymeCandidate } from "../types";
import { fetchWithTimeout } from "./fetchUtils";

const DEFAULT_BASE = "https://ja.azrhymes.com";

/**
 * AZRhymes プロバイダー
 *
 * 正: GET /?rhymes={word} → その単語の韻一覧（HTML）
 * 誤: /rhyme-game/next-word/ → 別単語向けゲーム用ヒント（使わない）
 */
export async function getRhymesFromAzrhymes(word: string): Promise<RhymeCandidate[]> {
  const baseUrl = process.env.RHYME_AZRHYMES_BASE_URL ?? DEFAULT_BASE;
  const url = `${baseUrl.replace(/\/$/, "")}/?rhymes=${encodeURIComponent(word)}`;

  const response = await fetchWithTimeout(url, {
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(`azrhymes HTTP ${response.status}`);
  }

  const html = await response.text();
  const seen = new Set<string>();
  const candidates: RhymeCandidate[] = [];

  // 検索結果の韻候補（result クラス）
  const pattern = /class="result[^"]*"[^>]*>([^<]+)/g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(html)) !== null) {
    const w = match[1].trim().replace(/、$/, "");
    if (!w || seen.has(w)) continue;
    seen.add(w);
    candidates.push({
      word: w,
      score: Math.max(0.5, 0.95 - index * 0.02),
      source: "azrhymes",
    });
    index++;
  }

  return candidates;
}

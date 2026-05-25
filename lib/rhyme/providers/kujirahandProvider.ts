import type { RhymeCandidate } from "../types";
import { fetchWithTimeout } from "./fetchUtils";

const DEFAULT_BASE = "https://kujirahand.com/web-tools";

/**
 * くじらはんど 韻検索プロバイダー
 * GET Words.php?key={word}&m=boin-search → HTML からリンクテキストを抽出
 */
export async function getRhymesFromKujirahand(word: string): Promise<RhymeCandidate[]> {
  const baseUrl = process.env.RHYME_KUJIRAHAND_BASE_URL ?? DEFAULT_BASE;
  const url = `${baseUrl.replace(/\/$/, "")}/Words.php?key=${encodeURIComponent(word)}&m=boin-search`;

  const response = await fetchWithTimeout(url, {
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(`kujirahand HTTP ${response.status}`);
  }

  const html = await response.text();
  const candidates: RhymeCandidate[] = [];
  const seen = new Set<string>();

  // boin-search 結果リンク: m=boin-search'>単語</a>
  const pattern = /m=boin-search'>([^<]+)<\/a>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const w = match[1].trim();
    if (w && !seen.has(w)) {
      seen.add(w);
      candidates.push({ word: w, source: "kujirahand" });
    }
  }

  return candidates;
}

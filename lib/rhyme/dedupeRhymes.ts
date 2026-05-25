import { toHiragana } from "@/lib/analysis/kana";
import { lookupWordFromNwnwn } from "./providers/nwnwnProvider";
import type { RhymeCandidate } from "./types";

/** 韻候補の同一判定キー（読み優先 → ひらがな化） */
export function rhymeDedupeKey(candidate: RhymeCandidate): string {
  if (candidate.reading?.trim()) {
    return toHiragana(candidate.reading.trim());
  }
  return toHiragana(candidate.word.trim());
}

/** 表記の好み: 漢字 > かな混じり > カタカナのみ > ひらがなのみ */
function representationRank(word: string): number {
  if (/[一-龥々]/.test(word)) return 4;
  if (/[一-龥々]/.test(word) || /[ぁ-ん][一-龥]|[一-龥][ぁ-ん]/.test(word)) return 3;
  if (/[ァ-ヴー]/.test(word)) return 2;
  if (/[ぁ-ん]/.test(word)) return 1;
  return 0;
}

function pickBetter(a: RhymeCandidate, b: RhymeCandidate): RhymeCandidate {
  const scoreA = a.score ?? 0;
  const scoreB = b.score ?? 0;
  if (Math.abs(scoreA - scoreB) > 0.02) {
    return scoreA >= scoreB ? a : b;
  }
  const rankA = representationRank(a.word);
  const rankB = representationRank(b.word);
  if (rankA !== rankB) return rankA >= rankB ? a : b;
  return a.word.length <= b.word.length ? a : b;
}

/** 同一読み・同一表記の韻候補を1件にまとめる */
export function dedupeRhymeCandidates(
  candidates: RhymeCandidate[],
): RhymeCandidate[] {
  const byKey = new Map<string, RhymeCandidate>();

  for (const c of candidates) {
    const key = rhymeDedupeKey(c);
    if (!key) continue;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, c);
      continue;
    }
    byKey.set(key, pickBetter(c, existing));
  }

  return [...byKey.values()];
}

/** 読みがない候補に nwnwn から読みを付与（漢字/カナ重複除去用） */
export async function enrichRhymeReadings(
  candidates: RhymeCandidate[],
  limit = 24,
): Promise<RhymeCandidate[]> {
  const target = candidates.slice(0, limit);
  const rest = candidates.slice(limit);

  const enriched = await Promise.all(
    target.map(async (c) => {
      if (c.reading?.trim()) return c;
      try {
        const lookup = await lookupWordFromNwnwn(c.word);
        if (lookup?.reading) {
          return {
            ...c,
            reading: lookup.reading,
            vowels: c.vowels ?? lookup.vowels,
          };
        }
      } catch {
        // skip
      }
      return c;
    }),
  );

  return [...enriched, ...rest];
}

/** 入力文中の韻軸語をハイライト表示用に分割 */
export function highlightPhraseAnchor(
  phrase: string,
  anchor: string,
): { before: string; anchor: string; after: string } | null {
  const idx = phrase.lastIndexOf(anchor);
  if (idx < 0) return null;
  return {
    before: phrase.slice(0, idx),
    anchor: phrase.slice(idx, idx + anchor.length),
    after: phrase.slice(idx + anchor.length),
  };
}

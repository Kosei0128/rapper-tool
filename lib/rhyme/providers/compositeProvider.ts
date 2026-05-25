import type { RhymeCandidate, RhymeProvider, RhymeProviderName } from "../types";
import { lookupWordFromNwnwn } from "./nwnwnProvider";
import { getRhymesFromAzrhymes } from "./azrhymesProvider";
import { getRhymesFromInNote } from "./inNoteProvider";
import { getRhymesFromKujirahand } from "./kujirahandProvider";
import { getRhymesFromNwnwn } from "./nwnwnProvider";
import { rankRhymeCandidates } from "../rankRhymes";
import {
  dedupeRhymeCandidates,
  enrichRhymeReadings,
  rhymeDedupeKey,
} from "../dedupeRhymes";
import { filterRhymeCandidates } from "../filterRhymes";

/** プロバイダー名 → 取得関数 */
const PROVIDER_MAP: Record<
  RhymeProviderName,
  (word: string) => Promise<RhymeCandidate[]>
> = {
  nwnwn: getRhymesFromNwnwn,
  azrhymes: getRhymesFromAzrhymes,
  "in-note": getRhymesFromInNote,
  kujirahand: getRhymesFromKujirahand,
};

const DEFAULT_CHAIN: RhymeProviderName[] = ["nwnwn", "azrhymes"];

/** 環境変数 RHYME_PROVIDERS からチェーンを構築（例: nwnwn,azrhymes,in-note） */
export function parseProviderChain(): RhymeProviderName[] {
  const raw = process.env.RHYME_PROVIDERS?.trim();
  if (!raw) return DEFAULT_CHAIN;

  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as RhymeProviderName[];

  return names.filter((n) => n in PROVIDER_MAP);
}

/**
 * 複数プロバイダーを並列取得 → マージ → 関連度スコアで並べ替え。
 * 以前は nwnwn 優先で先頭8件が埋まり、azrhymes の「患者」等が下に埋もれていた。
 */
export function createCompositeProvider(
  chain: RhymeProviderName[],
): RhymeProvider {
  return {
    async getRhymes(word: string): Promise<RhymeCandidate[]> {
      const maxTotal = Number(process.env.RHYME_MAX_CANDIDATES ?? 24);
      const seen = new Set<string>();
      const merged: RhymeCandidate[] = [];

      // 入力語の母音（スコアリング用）
      let queryVowels: string | undefined;
      try {
        const lookup = await lookupWordFromNwnwn(word);
        queryVowels = lookup?.vowels;
      } catch {
        // スコアリングのみなので続行
      }

      // 全プロバイダー並列取得
      const batches = await Promise.all(
        chain.map(async (name) => {
          const fetcher = PROVIDER_MAP[name];
          if (!fetcher) return [] as RhymeCandidate[];
          try {
            return await fetcher(word);
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`[rhyme/${name}] 失敗 (${word}): ${msg}`);
            return [];
          }
        }),
      );

      for (const batch of batches) {
        for (const c of batch) {
          const key = rhymeDedupeKey(c);
          if (!key || seen.has(key)) continue;
          seen.add(key);
          merged.push(c);
          if (!queryVowels && c.inputVowels) {
            queryVowels = c.inputVowels;
          }
        }
      }

      const ranked = rankRhymeCandidates(word, merged, queryVowels);
      const enriched = await enrichRhymeReadings(ranked.slice(0, 32));
      const rest = ranked.slice(32);
      const deduped = dedupeRhymeCandidates([...enriched, ...rest]);
      const filtered = await filterRhymeCandidates(deduped, word);
      return filtered.slice(0, maxTotal);
    },
  };
}

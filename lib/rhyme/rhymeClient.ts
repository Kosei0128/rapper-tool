import { getMockRhymes } from "./mockRhymes";
import {
  createCompositeProvider,
  parseProviderChain,
} from "./providers/compositeProvider";
import type { RhymeCandidate, RhymeProvider } from "./types";
import type { RhymeFetchOptions } from "./rhymeOptions";

/** モック専用（開発・テスト） */
const mockRhymeProvider: RhymeProvider = {
  async getRhymes(word: string): Promise<RhymeCandidate[]> {
    return getMockRhymes(word);
  },
};

/**
 * フォールバック付きプロバイダー。
 * 全プロバイダー失敗時のみモック辞書を返す。
 */
function createProviderWithFallback(): RhymeProvider {
  const composite = createCompositeProvider(parseProviderChain());

  return {
    async getRhymes(
      word: string,
      options?: RhymeFetchOptions,
    ): Promise<RhymeCandidate[]> {
      const candidates = await composite.getRhymes(word, options);
      if (candidates.length > 0) return candidates;

      console.warn(`[rhymeClient] 全プロバイダー空/失敗 → モック: ${word}`);
      return getMockRhymes(word);
    },
  };
}

function getActiveProvider(): RhymeProvider {
  if (process.env.RHYME_USE_MOCK === "true") {
    return mockRhymeProvider;
  }
  return createProviderWithFallback();
}

/**
 * 単語の韻候補を取得。
 * デフォルト: nwnwn → azrhymes → モック
 */
export async function getRhymes(
  word: string,
  options?: RhymeFetchOptions,
): Promise<RhymeCandidate[]> {
  const trimmed = word.trim();
  if (!trimmed) return [];
  return getActiveProvider().getRhymes(trimmed, options);
}

/** 複数単語の韻候補を並列取得 */
export async function getRhymesForWords(
  words: string[],
  options?: RhymeFetchOptions,
): Promise<Record<string, RhymeCandidate[]>> {
  const uniqueWords = [...new Set(words.map((w) => w.trim()).filter(Boolean))];
  const results: Record<string, RhymeCandidate[]> = {};

  await Promise.all(
    uniqueWords.map(async (word) => {
      results[word] = await getRhymes(word, options);
    }),
  );

  return results;
}

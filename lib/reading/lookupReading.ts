import { toHiragana, vowelsFromReading, isMostlyKana } from "@/lib/analysis/kana";
import { getKuromojiTokenizer } from "@/lib/kuromoji/getTokenizer";
import { isKuromojiEnabled } from "@/lib/kuromoji/isEnabled";
import { lookupWordFromNwnwn } from "@/lib/rhyme/providers/nwnwnProvider";

export type ReadingLookupResult = {
  reading: string;
  vowels: string;
  source: "kana" | "kuromoji" | "nwnwn" | "fallback";
};

const cache = new Map<string, ReadingLookupResult>();

async function lookupFromKuromoji(text: string): Promise<string | null> {
  if (!isKuromojiEnabled()) return null;

  try {
    const tokenizer = await getKuromojiTokenizer();
    const tokens = tokenizer.tokenize(text.trim());
    if (tokens.length === 0) return null;

    const reading = tokens
      .map((token) => toHiragana(token.reading ?? token.surface_form))
      .join("");
    return reading || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[kuromoji] lookup failed:", message);
    return null;
  }
}

/**
 * 表記 → 読み・母音を解決。
 * 優先: かな入力 → kuromoji → nwnwn API → 表面形フォールバック
 */
export async function lookupReading(text: string): Promise<ReadingLookupResult> {
  const key = text.trim();
  if (!key) {
    return { reading: "", vowels: "", source: "fallback" };
  }

  const cached = cache.get(key);
  if (cached) return cached;

  if (isMostlyKana(key)) {
    const reading = toHiragana(key);
    const result: ReadingLookupResult = {
      reading,
      vowels: vowelsFromReading(reading),
      source: "kana",
    };
    cache.set(key, result);
    return result;
  }

  const kuromojiReading = await lookupFromKuromoji(key);
  if (kuromojiReading) {
    const result: ReadingLookupResult = {
      reading: kuromojiReading,
      vowels: vowelsFromReading(kuromojiReading),
      source: "kuromoji",
    };
    cache.set(key, result);
    return result;
  }

  try {
    const nwnwn = await lookupWordFromNwnwn(key);
    if (nwnwn?.reading) {
      const reading = toHiragana(nwnwn.reading);
      const result: ReadingLookupResult = {
        reading,
        vowels: nwnwn.vowels ?? vowelsFromReading(reading),
        source: "nwnwn",
      };
      cache.set(key, result);
      return result;
    }
  } catch {
    // nwnwn 失敗時は表面形へ
  }

  const reading = toHiragana(key);
  const result: ReadingLookupResult = {
    reading,
    vowels: vowelsFromReading(reading),
    source: "fallback",
  };
  cache.set(key, result);
  return result;
}

/** 歌詞1行全体の読み（kuromoji 優先） */
export async function lookupLineReading(text: string): Promise<string | null> {
  const cleaned = text.trim();
  if (!cleaned) return null;
  if (isMostlyKana(cleaned)) return toHiragana(cleaned);
  return lookupFromKuromoji(cleaned);
}

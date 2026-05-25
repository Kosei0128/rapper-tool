import { lookupWordFromNwnwn } from "@/lib/rhyme/providers/nwnwnProvider";
import {
  countMoras,
  isMostlyKana,
  toHiragana,
  vowelsFromReading,
} from "./kana";
import type { WordAnalysis } from "./types";

const cache = new Map<string, WordAnalysis>();

/** 歌詞中の読み仮名注釈を除去 */
export function stripReadingAnnotations(text: string): string {
  return text.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
}

/** 1語の読み・母音・モーラを解決（キャッシュ付き） */
export async function resolveWord(surface: string): Promise<WordAnalysis> {
  const key = surface.trim();
  if (!key) {
    return { surface: "", reading: "", vowels: "", moras: 0 };
  }

  const cached = cache.get(key);
  if (cached) return cached;

  let reading = "";
  let vowels = "";

  if (isMostlyKana(key)) {
    reading = toHiragana(key);
    vowels = vowelsFromReading(reading);
  } else {
    try {
      const lookup = await lookupWordFromNwnwn(key);
      if (lookup?.reading) {
        reading = toHiragana(lookup.reading);
        vowels = lookup.vowels ?? vowelsFromReading(reading);
      }
    } catch {
      // nwnwn 失敗時は表面形から推定
    }
  }

  if (!reading) {
    reading = key;
    vowels = vowelsFromReading(reading);
  }

  const result: WordAnalysis = {
    surface: key,
    reading,
    vowels,
    moras: countMoras(reading),
  };
  cache.set(key, result);
  return result;
}

/** 行をトークン分割（助詞境界で分割、機械的3文字切りはしない） */
export function tokenizeLine(line: string): string[] {
  const cleaned = stripReadingAnnotations(line);
  const parts = cleaned.split(/[\s、。，．！？…・\-—]+/).filter(Boolean);
  const tokens: string[] = [];

  for (const part of parts) {
    // 助詞・接続で分割（長い塊を意味のある塊に）
    const segments = part
      .split(/(?<=[のはがをにでとへ])(?=[一-龥ぁ-んァ-ヴー])|(?<=[ぁ-ん])(?=[ァ-ヴー一-龥])/)
      .map((s) => trimEndGlue(s.trim()))
      .filter((s) => s.length >= 2);

    if (segments.length > 0) {
      tokens.push(...segments);
    } else if (part.length >= 2 && part.length <= 8) {
      tokens.push(part);
    } else if (part.length > 8) {
      // 長文は末尾の韻語＋残りの後半だけ（ぐカジャ等の断片を防ぐ）
      const end = extractEndUnit(part);
      if (end.length >= 2) tokens.push(end);
      const rest = part.slice(0, -end.length).trim();
      if (rest.length >= 2 && rest.length <= 8) tokens.push(rest);
    }
  }

  return tokens;
}

/** 行末の1文字助詞を除いて韻語を取る（ぐカジャ → カジャ、く夜明け → 夜明け） */
function trimEndGlue(unit: string): string {
  let trimmed = unit
    .replace(/^[ぁ-ん]{1,2}(?=[一-龥ァ-ヴー])/, "")
    .replace(/^[ぁ-ん](?=[ァ-ヴー一-龥])/, "")
    .replace(/^[のはがをにでとへくて](?=[一-龥ぁ-んァ-ヴー])/, "");

  // 助詞除去後も断片なら空にして呼び出し側でフォールバック
  if (trimmed.length < 2) return unit;

  return trimmed;
}

/** 行全体の読み（表示用・ひらがな） */
export function lineReadingFromTokens(
  text: string,
  tokens: WordAnalysis[],
): string {
  const cleaned = stripReadingAnnotations(text);
  if (!cleaned) return "";

  if (isMostlyKana(cleaned)) {
    return toHiragana(cleaned);
  }

  const fromTokens = tokens
    .map((t) => t.reading)
    .filter(Boolean)
    .join("");
  if (fromTokens) return fromTokens;

  return toHiragana(cleaned);
}

/** 行末の韻単位（末尾2〜5文字の意味のある塊） */
export function extractEndUnit(line: string): string {
  const cleaned = stripReadingAnnotations(line);
  const match = cleaned.match(
    /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\u3400-\u4dbfa-zA-Z0-9]+$/,
  );
  if (!match) return cleaned.slice(-3);

  const word = match[0];

  // 末尾の語句を優先（最長5文字）
  const tailMatch = word.match(/([一-龥々]{2,5}|[ァ-ヴー]{2,5}|[ぁ-ん]{2,5})$/u);
  if (tailMatch) {
    const trimmed = trimEndGlue(tailMatch[1]);
    if (trimmed.length >= 2) return trimmed;
  }

  const fallback = word.length <= 4 ? word : word.slice(-4);
  return trimEndGlue(fallback);
}

import type { RhymeCandidate } from "../types";
import { fetchWithTimeout } from "./fetchUtils";

/** 韻システム (in.nwnwn.com) の1件 */
type NwnwnItem = {
  surface: string;
  yomi: string;
  vowels: string;
};

/** 韻システム API レスポンス */
type NwnwnResponse = {
  yomi?: string;
  vowels?: string;
  results?: Record<string, NwnwnItem[]>;
};

const DEFAULT_BASE = "https://in.nwnwn.com";

/**
 * 韻システム (in.nwnwn.com) プロバイダー
 *
 * POST /api/rhyme  { "text": "町田" }
 * → Nelogd ベースの脚韻候補（JSON）
 *
 * 参考: https://note.com/wnw/n/n9372fc75fa35
 * - 韻ノートより短い韻の網羅性を重視
 * - kuromoji.js で読み仮名変換（弱い場合はひらがな入力推奨）
 */
export async function getRhymesFromNwnwn(word: string): Promise<RhymeCandidate[]> {
  const baseUrl = process.env.RHYME_NWNWN_BASE_URL ?? DEFAULT_BASE;
  const url = `${baseUrl.replace(/\/$/, "")}/api/rhyme`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ text: word }),
  });

  if (!response.ok) {
    throw new Error(`nwnwn HTTP ${response.status}`);
  }

  const data = (await response.json()) as NwnwnResponse;
  const buckets = data.results ?? {};
  const items: NwnwnItem[] = Object.values(buckets).flat();

  if (items.length === 0) return [];

  const inputReading = data.yomi;
  const inputVowels = data.vowels;

  return items.map((item, index) => ({
    word: item.surface,
    reading: item.yomi,
    vowels: item.vowels,
    score: Math.max(0.5, 1 - index * 0.02),
    source: "nwnwn" as const,
    ...(index === 0 ? { inputReading, inputVowels } : {}),
  }));
}

/** 単語の読み・母音を取得（韻候補なしでも yomi/vowels が返る） */
export async function lookupWordFromNwnwn(
  text: string,
): Promise<{ reading?: string; vowels?: string } | null> {
  const baseUrl = process.env.RHYME_NWNWN_BASE_URL ?? DEFAULT_BASE;
  const url = `${baseUrl.replace(/\/$/, "")}/api/rhyme`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as NwnwnResponse;
  if (!data.yomi && !data.vowels) return null;

  return {
    reading: data.yomi,
    vowels: data.vowels,
  };
}

/** 頭韻検索（必要になったら composite から呼べる） */
export async function getAlliterationFromNwnwn(
  word: string,
): Promise<RhymeCandidate[]> {
  const baseUrl = process.env.RHYME_NWNWN_BASE_URL ?? DEFAULT_BASE;
  const url = `${baseUrl.replace(/\/$/, "")}/api/alliteration`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ text: word }),
  });

  if (!response.ok) throw new Error(`nwnwn alliteration HTTP ${response.status}`);

  const data = (await response.json()) as NwnwnResponse;
  const items = Object.values(data.results ?? {}).flat();

  return items.map((item, index) => ({
    word: item.surface,
    reading: item.yomi,
    vowels: item.vowels,
    score: Math.max(0.5, 1 - index * 0.02),
    source: "nwnwn" as const,
  }));
}

import type { RhymeCandidate } from "./types";

/**
 * 外部APIが使えないときのフォールバック辞書。
 * 実API確定後も、開発・テスト用として残しておく。
 */
const MOCK_RHYME_DICTIONARY: Record<string, RhymeCandidate[]> = {
  町田: [
    { word: "真田", reading: "まだ", vowels: "a-a", score: 0.95, source: "mock" },
    { word: "待った", reading: "まった", vowels: "a-a", score: 0.9, source: "mock" },
    { word: "跨いだ", reading: "またいだ", vowels: "a-a-i-a", score: 0.85, source: "mock" },
    { word: "真打", reading: "しんうち", vowels: "i-u-i", score: 0.7, source: "mock" },
  ],
  IT: [
    { word: "ビート", reading: "びーと", vowels: "i-i-u", score: 0.88, source: "mock" },
    { word: "リリック", reading: "りりっく", vowels: "i-i-u", score: 0.82, source: "mock" },
    { word: "シート", reading: "しーと", vowels: "i-i-u", score: 0.8, source: "mock" },
    { word: "ヒート", reading: "ひーと", vowels: "i-i-u", score: 0.78, source: "mock" },
  ],
  過去: [
    { word: "誇り", reading: "ほこり", vowels: "o-o-i", score: 0.9, source: "mock" },
    { word: "焦り", reading: "あせり", vowels: "a-e-i", score: 0.75, source: "mock" },
    { word: "語り", reading: "かたり", vowels: "a-a-i", score: 0.85, source: "mock" },
    { word: "通り", reading: "とおり", vowels: "o-o-i", score: 0.7, source: "mock" },
  ],
  成り上がり: [
    { word: "上がり", reading: "あがり", vowels: "a-a-i", score: 0.92, source: "mock" },
    { word: "繰り上がり", reading: "くりあがり", vowels: "u-i-a-a-i", score: 0.88, source: "mock" },
    { word: "照り返し", reading: "てりかえし", vowels: "e-i-a-e-i", score: 0.65, source: "mock" },
    { word: "走り", reading: "はしり", vowels: "a-i-i", score: 0.72, source: "mock" },
  ],
  街: [
    { word: "迷い", reading: "まよい", vowels: "a-o-i", score: 0.9, source: "mock" },
    { word: "誓い", reading: "ちかい", vowels: "i-a-i", score: 0.85, source: "mock" },
    { word: "未来", reading: "みらい", vowels: "i-a-i", score: 0.8, source: "mock" },
  ],
  夢: [
    { word: "芽", reading: "め", vowels: "e", score: 0.85, source: "mock" },
    { word: "雨", reading: "あめ", vowels: "a-e", score: 0.8, source: "mock" },
    { word: "絆", reading: "きずな", vowels: "i-u-a", score: 0.7, source: "mock" },
  ],
  夜: [
    { word: "灯", reading: "ひ", vowels: "i", score: 0.75, source: "mock" },
    { word: "道", reading: "みち", vowels: "i-i", score: 0.8, source: "mock" },
    { word: "声", reading: "こえ", vowels: "o-e", score: 0.7, source: "mock" },
  ],
};

/** 汎用フォールバック候補（辞書にない単語向け） */
const GENERIC_FALLBACK: RhymeCandidate[] = [
  { word: "リズム", reading: "りずむ", score: 0.6, source: "mock" },
  { word: "ビート", reading: "びーと", score: 0.55, source: "mock" },
  { word: "フロウ", reading: "ふろう", score: 0.5, source: "mock" },
  { word: "ストーリー", reading: "すとーりー", score: 0.45, source: "mock" },
];

/**
 * モック辞書から韻候補を取得する。
 * 完全一致 → 部分一致 → 汎用候補の順で探す。
 */
export function getMockRhymes(word: string): RhymeCandidate[] {
  const trimmed = word.trim();
  if (!trimmed) return [];

  // 完全一致
  if (MOCK_RHYME_DICTIONARY[trimmed]) {
    return MOCK_RHYME_DICTIONARY[trimmed].map((c) => ({ ...c, source: "mock" }));
  }

  // 部分一致（入力語が辞書キーに含まれる、またはその逆）
  for (const [key, candidates] of Object.entries(MOCK_RHYME_DICTIONARY)) {
    if (key.includes(trimmed) || trimmed.includes(key)) {
      return candidates.map((c) => ({ ...c, source: "mock" }));
    }
  }

  // 汎用フォールバック
  return GENERIC_FALLBACK.map((c) => ({ ...c, source: "mock" }));
}

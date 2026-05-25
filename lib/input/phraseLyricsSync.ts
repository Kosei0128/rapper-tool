/** フレーズ入力（1行ずつ）と歌詞テキストの相互変換 */

export function normalizePhrases(words: string[]): string[] {
  return words.map((w) => w.trim()).filter(Boolean);
}

/** フレーズ配列 → 歌詞（改行区切り） */
export function phrasesToLyrics(words: string[]): string {
  return normalizePhrases(words).join("\n");
}

/** 歌詞 → フレーズ配列（空のときは入力欄2つ分を確保） */
export function lyricsToPhrases(lyrics: string): string[] {
  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return ["", ""];
  return lines;
}

export function phrasesEqual(a: string[], b: string[]): boolean {
  const na = normalizePhrases(a);
  const nb = normalizePhrases(b);
  if (na.length !== nb.length) return false;
  return na.every((line, i) => line === nb[i]);
}

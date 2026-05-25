/** 韻候補をメモ帳・歌詞テキストの末尾行に追加 */
export function appendRhymeWord(existing: string, word: string): string {
  const trimmedWord = word.trim();
  if (!trimmedWord) return existing;

  const base = existing.trimEnd();
  if (!base) return trimmedWord;

  const lines = base.split("\n");
  const lastLine = lines[lines.length - 1] ?? "";
  if (lastLine.trim() === "") {
    return `${base}${trimmedWord}`;
  }

  return `${base}\n${trimmedWord}`;
}

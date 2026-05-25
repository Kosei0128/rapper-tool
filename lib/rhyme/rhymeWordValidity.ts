const KATAKANA_ONLY = /^[ァ-ヴー・]+$/u;

export type RhymeWordValidityOptions = {
  /** 韻検索の入力語（これ自体は有効） */
  queryWord?: string;
  /** ユーザー入力語（歌詞分析で有効扱い） */
  allowedWords?: string[];
};

/** 韻候補・分析トークンとして明らかに無効な語 */
export function isLikelyInvalidRhymeWord(
  word: string,
  options?: RhymeWordValidityOptions | string,
): boolean {
  const opts: RhymeWordValidityOptions =
    typeof options === "string" ? { queryWord: options } : (options ?? {});

  const { queryWord, allowedWords = [] } = opts;
  let w = word.trim();

  if (allowedWords.includes(w)) return false;

  for (let depth = 0; depth < 4; depth++) {
    if (!w || w.length < 2) return true;
    if (queryWord && w === queryWord) return false;

    // カタカナ2〜3文字の断片（カジャ、ラジャ、ンジャ等）
    if (KATAKANA_ONLY.test(w) && w.length <= 3) return true;

    // カタカナのみ短語で末尾が「ジャ/ャ」→ ガンジャの韻断片（入力語は除外済み）
    if (
      KATAKANA_ONLY.test(w) &&
      w.length <= 4 &&
      /(?:ジャ|ャ)$/.test(w)
    ) {
      return true;
    }

    // クエリ語の末尾断片（ガンジャ → ンジャ）
    if (queryWord && w.length < queryWord.length && queryWord.endsWith(w)) {
      return true;
    }

    // ひらがな1〜2文字だけ（く、て、の等）
    if (/^[ぁ-ん]{1,2}$/.test(w)) return true;

    // 助詞が先頭に付いた断片（ぐカジャ、く夜明け）
    if (/^[ぁ-ん]{1,2}[ァ-ヴー一-龥]/.test(w) && w.length <= 5) {
      const stripped = w.replace(/^[ぁ-ん]{1,2}/, "");
      if (stripped.length >= 2 && stripped !== w) {
        w = stripped;
        continue;
      }
    }

    return false;
  }

  return true;
}

/** 韻候補リストから無効語を除去（同期のみ・サーバー/クライアント共用） */
export function filterInvalidRhymeWords(
  candidates: { word: string }[],
  queryWord: string,
): { word: string }[] {
  return candidates.filter(
    (c) => !isLikelyInvalidRhymeWord(c.word, { queryWord }),
  );
}

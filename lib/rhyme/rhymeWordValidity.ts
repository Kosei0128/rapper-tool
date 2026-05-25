const KATAKANA_ONLY = /^[ァ-ヴー・]+$/u;

/** 古典語・韻辞書の「仮定形＋ゃ」縮約（白々しきゃ、かんばしりゃ 等） */
const ARCHAIC_CONDITIONAL_SUFFIX =
  /(?:しきゃ|がましきゃ|たらしきゃ|ばしりゃ|齧りゃ|かじりゃ|わしきゃ|うわしきゃ|がまし|得りゃ)$/u;

/** 口語として許容する短い末尾（拝みゃ、生まれなきゃ 等） */
const NATURAL_COLLOQUIAL_END =
  /(?:なきゃ|なくちゃ|ないと|じゃ|ちゃ|よ|さ|ね|か|だ|わ)$/u;

const KNOWN_OBSCURE_RHYME_HACKS = new Set([
  "よだちゃ",
  "かんばしりゃ",
  "ひとがましきゃ",
  "烏滸がましきゃ",
  "厭わしきゃ",
  "聞き齧りゃ",
  "退かしゃ",
  "おどろかしゃ",
]);

const ALLOWED_COLLOQUIAL_RHYMES = new Set([
  "拝みゃ",
  "窄まりゃ",
  "伸ばしゃ",
  "殴りとばしゃ",
  "閉ざしゃ",
  "おどかしゃ",
]);

/** 韻APIが返す「韻は踏めるが現代口語では不自然」な語 */
export function isArchaicRhymeHackWord(word: string): boolean {
  const w = word.trim();
  if (!w || w.length < 3) return false;
  if (ALLOWED_COLLOQUIAL_RHYMES.has(w)) return false;
  if (KNOWN_OBSCURE_RHYME_HACKS.has(w)) return true;
  if (NATURAL_COLLOQUIAL_END.test(w)) return false;
  if (w.length <= 5 && /(?:みゃ|まりゃ|ばしゃ|とばしゃ)$/.test(w)) return false;
  if (ARCHAIC_CONDITIONAL_SUFFIX.test(w)) return true;
  // 長い漢語 + しゃ/しきゃ/りゃ（韻システムの古典縮約）
  if (w.length >= 5 && /[一-龥]{2,}(?:しきゃ|しゃ|りゃ)$/.test(w)) return true;
  return false;
}

export type RhymeWordValidityOptions = {
  /** 韻検索の入力語（これ自体は有効） */
  queryWord?: string;
  /** ユーザー入力語（歌詞分析で有効扱い） */
  allowedWords?: string[];
  /** true なら古典語ハック（白々しきゃ等）を候補に残す */
  allowArchaicRhymes?: boolean;
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
  if (!opts.allowArchaicRhymes && isArchaicRhymeHackWord(w)) return true;

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
  options?: Pick<RhymeWordValidityOptions, "allowArchaicRhymes">,
): { word: string }[] {
  return candidates.filter(
    (c) =>
      !isLikelyInvalidRhymeWord(c.word, {
        queryWord,
        allowArchaicRhymes: options?.allowArchaicRhymes,
      }),
  );
}

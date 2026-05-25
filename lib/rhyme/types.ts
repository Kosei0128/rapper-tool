/** 韻候補の取得元 */
export type RhymeSource =
  | "nwnwn"
  | "azrhymes"
  | "in-note"
  | "kujirahand"
  | "mock";

/** 韻候補1件分の型 */
export type RhymeCandidate = {
  word: string;
  reading?: string;
  vowels?: string;
  score?: number;
  source: RhymeSource;
  /** 入力語の読み（nwnwn 等が返す場合、先頭候補に付く） */
  inputReading?: string;
  /** 入力語の母音パターン（例: yoake → oae） */
  inputVowels?: string;
};

/** 利用可能な韻プロバイダー名 */
export type RhymeProviderName =
  | "nwnwn"
  | "azrhymes"
  | "in-note"
  | "kujirahand";

/** 雰囲気（ムード）の選択肢 */
export type Mood =
  | "street"
  | "emotional"
  | "battle"
  | "mellow"
  | "business";

/** 出力形式の選択肢 */
export type LyricFormat = "4bars" | "8bars" | "16bars" | "hook" | "punchline";

/** パンチラインのスタイル */
export type PunchlineStyle =
  | "default"
  | "metaphor"
  | "aggressive"
  | "witty"
  | "story";

/** 入力フレーズの解析結果（文章→韻キーワード） */
export type InputPhrasePlan = {
  original: string;
  isPhrase: boolean;
  rhymeKeywords: string[];
  primaryRhymeWord: string;
};

/** 歌詞生成APIへのリクエスト型 */
export type GenerateLyricsRequest = {
  inputWords: string[];
  mood: Mood;
  format: LyricFormat;
  rhymeCandidates?: Record<string, RhymeCandidate[]>;
  /** 入力解析プラン（API内部で生成、プロンプト用） */
  inputPlan?: InputPhrasePlan[];
  /** BPM（任意）。指定時はモーラ数目安をプロンプトに反映 */
  bpm?: number;
  /** 拍子（デフォルト 4/4） */
  beatsPerBar?: number;
  /** パンチライン生成時のスタイル */
  punchlineStyle?: PunchlineStyle;
  /** メモ帳の --hook / --verse 等から得た曲構成ヒント */
  structureHint?: string;
};

/** 韻検索APIのレスポンス（単語ごと） */
export type RhymeSearchResult = {
  word: string;
  candidates: RhymeCandidate[];
};

/** 外部韻APIプロバイダーのインターフェース（差し替え用） */
export type RhymeProvider = {
  getRhymes: (word: string) => Promise<RhymeCandidate[]>;
};

/** Supabase保存用の生成履歴型 */
export type LyricsGeneration = {
  id: string;
  input_words: string[];
  mood: Mood;
  format: LyricFormat;
  rhyme_candidates: Record<string, RhymeCandidate[]>;
  generated_lyrics: string;
  created_at: string;
};

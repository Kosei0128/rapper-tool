import type { InputPhrasePlan } from "@/lib/rhyme/types";

export type { InputPhrasePlan };

const PARTICLE_SPLIT =
  /(?:で|を|に|が|は|と|も|へ|から|まで|より|て|、|。|\s+)+/;

const PHRASE_MARKERS =
  /(?:で|を|に|が|は|と|も|へ|から|まで|より|て|た|だ|し|ない|ます|した|ている|てる)/;

/** 文章入力かどうか */
export function isPhraseInput(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/[\s、。！？]/.test(t)) return true;
  if (PHRASE_MARKERS.test(t)) return true;
  if (t.length > 12) return true;
  return false;
}

/** 末尾の内容語（カタカナ・漢字）を抽出 */
function extractTailContentWord(text: string): string | null {
  const katakana = text.match(/([ァ-ヴー]{2,})$/u);
  if (katakana) return katakana[1];

  const kanji = text.match(/([一-龥々〆ヵヶ]{2,5})$/u);
  if (kanji) return kanji[1];

  return null;
}

/** 助詞・助動詞を除いたセグメントからキーワードを抽出 */
function segmentsFromPhrase(text: string): string[] {
  return text
    .split(PARTICLE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

/** 韻の主軸語（末尾の内容語を優先） */
export function extractPrimaryRhymeWord(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const tail = extractTailContentWord(trimmed);
  if (tail) return tail;

  const segments = segmentsFromPhrase(trimmed);
  if (segments.length > 0) {
    return segments[segments.length - 1];
  }

  return trimmed;
}

/** 1入力から韻検索に使うキーワード（文章は韻軸1語のみ） */
export function extractRhymeKeywords(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return [extractPrimaryRhymeWord(trimmed)];
}

/** 複数入力を解析 */
export function parseInputPhrases(inputs: string[]): InputPhrasePlan[] {
  return inputs
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((original) => {
      const isPhrase = isPhraseInput(original);
      const rhymeKeywords = extractRhymeKeywords(original);
      const primaryRhymeWord = extractPrimaryRhymeWord(original);

      return {
        original,
        isPhrase,
        rhymeKeywords:
          rhymeKeywords.length > 0 ? rhymeKeywords : [primaryRhymeWord],
        primaryRhymeWord,
      };
    });
}

/** 韻API検索用のキーワード一覧（重複除去） */
export function collectRhymeLookupWords(plans: InputPhrasePlan[]): string[] {
  const words = new Set<string>();
  for (const plan of plans) {
    for (const kw of plan.rhymeKeywords) {
      words.add(kw);
    }
  }
  return [...words];
}

/** 入力原文一覧（分析・保存用） */
export function originalInputs(plans: InputPhrasePlan[]): string[] {
  return plans.map((p) => p.original);
}

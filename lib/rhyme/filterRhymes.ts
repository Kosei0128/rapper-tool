import type { RhymeCandidate } from "./types";
import {
  filterInvalidRhymeWords,
  isLikelyInvalidRhymeWord,
} from "./rhymeWordValidity";

export { isLikelyInvalidRhymeWord, filterInvalidRhymeWords };
export type { RhymeWordValidityOptions } from "./rhymeWordValidity";

/** 韻候補リストから無効語を除去 */
export async function filterRhymeCandidates(
  candidates: RhymeCandidate[],
  queryWord: string,
): Promise<RhymeCandidate[]> {
  return filterInvalidRhymeWords(candidates, queryWord) as RhymeCandidate[];
}

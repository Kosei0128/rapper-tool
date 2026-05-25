import type { RhymeCandidate } from "./types";
import {
  filterInvalidRhymeWords,
  isLikelyInvalidRhymeWord,
  isArchaicRhymeHackWord,
} from "./rhymeWordValidity";

export { isLikelyInvalidRhymeWord, filterInvalidRhymeWords, isArchaicRhymeHackWord };
export type { RhymeWordValidityOptions } from "./rhymeWordValidity";

/** 韻候補リストから無効語を除去 */
export async function filterRhymeCandidates(
  candidates: RhymeCandidate[],
  queryWord: string,
  options?: { allowArchaicRhymes?: boolean },
): Promise<RhymeCandidate[]> {
  return filterInvalidRhymeWords(candidates, queryWord, options) as RhymeCandidate[];
}

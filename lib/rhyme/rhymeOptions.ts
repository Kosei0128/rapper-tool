/** 韻取得・フィルタの実行時オプション */
export type RhymeFetchOptions = {
  /**
   * true = 古典語ハック（白々しきゃ 等）も候補に含める（ランキングでは下位）
   * false = デフォルト。口語として不自然な古典縮約は非表示
   */
  allowArchaicRhymes?: boolean;
};

/** リクエスト → 環境変数の順で古典韻を許可するか決める */
export function resolveAllowArchaicRhymes(
  requestFlag?: boolean,
): boolean {
  if (requestFlag === true) return true;
  if (requestFlag === false) return false;
  return process.env.RHYME_ALLOW_ARCHAIC === "true";
}

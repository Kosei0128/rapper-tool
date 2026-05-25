import { NextRequest, NextResponse } from "next/server";
import {
  collectRhymeLookupWords,
  parseInputPhrases,
} from "@/lib/input/parseInputPhrases";
import { getRhymesForWords } from "@/lib/rhyme/rhymeClient";

/**
 * POST /api/rhymes
 * 入力語から韻候補のみ取得（歌詞生成なし）
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      words?: string[];
      inputWords?: string[];
      allowArchaicRhymes?: boolean;
    };

    const inputWords = body.inputWords ?? body.words ?? [];

    if (!Array.isArray(inputWords) || inputWords.length === 0) {
      return NextResponse.json(
        { error: "inputWords を1つ以上指定してください" },
        { status: 400 },
      );
    }

    const inputPlan = parseInputPhrases(inputWords);
    const lookupWords = collectRhymeLookupWords(inputPlan);
    const allowArchaicRhymes = body.allowArchaicRhymes === true;

    const rhymeCandidates = await getRhymesForWords(lookupWords, {
      allowArchaicRhymes,
    });

    return NextResponse.json({ rhymeCandidates, inputPlan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "韻検索に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getRhymesForWords } from "@/lib/rhyme/rhymeClient";

/**
 * POST /api/rhymes
 * 複数単語の韻候補を取得する
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { words?: string[] };
    const words = body.words ?? [];

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "words 配列を指定してください" },
        { status: 400 },
      );
    }

    const rhymeCandidates = await getRhymesForWords(words);

    return NextResponse.json({ rhymeCandidates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "韻検索に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

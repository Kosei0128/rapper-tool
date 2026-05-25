import { NextRequest, NextResponse } from "next/server";
import { analyzeLyrics } from "@/lib/analysis/analyzeLyrics";
import { critiqueLyrics } from "@/lib/llm/critiqueLyrics";

type AnalyzeRequest = {
  lyrics: string;
  inputWords?: string[];
  bpm?: number;
  beatsPerBar?: number;
  withCritique?: boolean;
};

/**
 * POST /api/analyze-lyrics
 * 歌詞の母音解析・内部韻・フロー・韻密度 + 任意で AI 添削
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const lyrics = body.lyrics?.trim();

    if (!lyrics) {
      return NextResponse.json(
        { error: "lyrics を指定してください" },
        { status: 400 },
      );
    }

    const bpm =
      typeof body.bpm === "number" && body.bpm > 0 ? body.bpm : undefined;
    const beatsPerBar =
      typeof body.beatsPerBar === "number" && body.beatsPerBar > 0
        ? body.beatsPerBar
        : 4;

    const analysis = await analyzeLyrics(lyrics, {
      inputWords: body.inputWords ?? [],
      bpm,
      beatsPerBar,
    });

    let critique = null;
    if (body.withCritique) {
      try {
        critique = await critiqueLyrics(
          lyrics,
          analysis,
          body.inputWords ?? [],
        );
      } catch (err) {
        critique = {
          summary:
            err instanceof Error
              ? `AI添削をスキップ: ${err.message}`
              : "AI添削をスキップしました",
          strengths: [],
          improvements: [],
          suggestedLines: [],
        };
      }
    }

    return NextResponse.json({ analysis, critique });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "解析に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { analyzeLyrics } from "@/lib/analysis/analyzeLyrics";
import {
  collectRhymeLookupWords,
  originalInputs,
  parseInputPhrases,
} from "@/lib/input/parseInputPhrases";
import { generateLyrics } from "@/lib/llm/generateLyrics";
import { getRhymesForWords } from "@/lib/rhyme/rhymeClient";
import type {
  GenerateLyricsRequest,
  Mood,
  LyricFormat,
  PunchlineStyle,
} from "@/lib/rhyme/types";

const VALID_MOODS: Mood[] = [
  "street",
  "emotional",
  "battle",
  "mellow",
  "business",
];
const VALID_FORMATS: LyricFormat[] = [
  "4bars",
  "8bars",
  "16bars",
  "hook",
  "punchline",
];
const VALID_PUNCHLINE_STYLES: PunchlineStyle[] = [
  "default",
  "metaphor",
  "aggressive",
  "witty",
  "story",
];

/**
 * POST /api/generate-lyrics
 * 韻候補取得 → 歌詞生成 → 母音/韻/フロー分析
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<GenerateLyricsRequest>;
    const inputWords = body.inputWords ?? [];
    const mood = body.mood;
    const format = body.format;
    const bpm =
      typeof body.bpm === "number" && body.bpm > 0 ? body.bpm : undefined;
    const beatsPerBar =
      typeof body.beatsPerBar === "number" && body.beatsPerBar > 0
        ? body.beatsPerBar
        : 4;
    const punchlineStyle = body.punchlineStyle ?? "default";
    const structureHint =
      typeof body.structureHint === "string" && body.structureHint.trim()
        ? body.structureHint.trim()
        : undefined;

    if (!Array.isArray(inputWords) || inputWords.length === 0) {
      return NextResponse.json(
        { error: "inputWords を1つ以上指定してください" },
        { status: 400 },
      );
    }

    if (!mood || !VALID_MOODS.includes(mood)) {
      return NextResponse.json(
        { error: `mood は ${VALID_MOODS.join(", ")} のいずれかです` },
        { status: 400 },
      );
    }

    if (!format || !VALID_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `format は ${VALID_FORMATS.join(", ")} のいずれかです` },
        { status: 400 },
      );
    }

    if (!VALID_PUNCHLINE_STYLES.includes(punchlineStyle)) {
      return NextResponse.json(
        {
          error: `punchlineStyle は ${VALID_PUNCHLINE_STYLES.join(", ")} のいずれかです`,
        },
        { status: 400 },
      );
    }

    const rhymeCandidates =
      body.rhymeCandidates ??
      (await getRhymesForWords(
        collectRhymeLookupWords(parseInputPhrases(inputWords)),
      ));

    const inputPlan = parseInputPhrases(inputWords);

    const generatedLyrics = await generateLyrics({
      inputWords,
      inputPlan,
      mood,
      format,
      rhymeCandidates,
      bpm,
      beatsPerBar,
      punchlineStyle,
      structureHint,
    });

    const analysis = await analyzeLyrics(generatedLyrics, {
      inputWords: originalInputs(inputPlan),
      bpm,
      beatsPerBar,
    });

    return NextResponse.json({
      generatedLyrics,
      rhymeCandidates,
      inputPlan,
      analysis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "歌詞生成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

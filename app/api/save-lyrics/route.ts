import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Mood, LyricFormat, RhymeCandidate } from "@/lib/rhyme/types";

type SaveLyricsRequest = {
  inputWords: string[];
  mood: Mood;
  format: LyricFormat;
  rhymeCandidates: Record<string, RhymeCandidate[]>;
  generatedLyrics: string;
};

/**
 * POST /api/save-lyrics
 * 生成結果を Supabase に保存する
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase が未設定のため保存できません。.env を確認してください。" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as SaveLyricsRequest;

    if (!body.generatedLyrics?.trim()) {
      return NextResponse.json(
        { error: "保存する歌詞がありません" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("lyrics_generations")
      .insert({
        input_words: body.inputWords,
        mood: body.mood,
        format: body.format,
        rhyme_candidates: body.rhymeCandidates,
        generated_lyrics: body.generatedLyrics,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("[save-lyrics] Supabase error:", error);
      return NextResponse.json(
        { error: `保存に失敗しました: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      createdAt: data.created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import type { LyricAnalysis } from "@/lib/analysis/types";
import { deepseekChat } from "./deepseekChat";

/**
 * 解析結果を踏まえて AI 添削を行う
 */
export async function critiqueLyrics(
  lyrics: string,
  analysis: LyricAnalysis,
  inputWords: string[],
): Promise<{
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestedLines: string[];
}> {
  const { density, flow, rhymeMatches } = analysis;
  const endRhymes = rhymeMatches
    .filter((m) => m.type === "end")
    .slice(0, 5)
    .map((m) => `${m.wordA}↔${m.wordB}(${m.tail})`)
    .join("、");
  const internalRhymes = rhymeMatches
    .filter((m) => m.type === "internal")
    .slice(0, 5)
    .map((m) => `${m.wordA}↔${m.wordB}`)
    .join("、");

  const systemPrompt = `あなたは日本語ラップの作詞コーチです。
歌詞と韻・フローの数値分析をもとに、具体的で実用的な添削をしてください。

【出力形式】必ず json 形式のみ（説明不要）:
{
  "summary": "総評1〜2文",
  "strengths": ["良い点1", "良い点2"],
  "improvements": ["改善点1", "改善点2", "改善点3"],
  "suggestedLines": ["改善例の行1", "改善例の行2"]
}`;

  const userPrompt = `【歌詞】
${lyrics}

【指定語】${inputWords.join("、") || "なし"}

【韻密度スコア】総合 ${density.overall}/100
- 行末韻: ${density.endRhyme}
- 内部韻: ${density.internalRhyme}
- 指定語使用率: ${density.inputWordUsage}
- フロー均一性: ${density.flowUniformity}

【フロー】平均 ${flow.averageMoras} モーラ/行、ばらつき σ=${flow.stdDevMoras}${flow.targetMorasPerLine ? `、BPM目標 ${flow.targetMorasPerLine} モーラ/行` : ""}

【検出された韻】
行末: ${endRhymes || "なし"}
内部: ${internalRhymes || "なし"}`;

  const raw = await deepseekChat({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens: 800,
    thinking: false,
    temperature: 0.6,
    responseFormat: { type: "json_object" },
  });

  const parsed = JSON.parse(raw) as {
    summary?: string;
    strengths?: string[];
    improvements?: string[];
    suggestedLines?: string[];
  };

  return {
    summary: parsed.summary ?? "添削完了",
    strengths: parsed.strengths ?? [],
    improvements: parsed.improvements ?? [],
    suggestedLines: parsed.suggestedLines ?? [],
  };
}

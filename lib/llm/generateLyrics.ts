import type {
  GenerateLyricsRequest,
  InputPhrasePlan,
  PunchlineStyle,
  RhymeCandidate,
} from "@/lib/rhyme/types";
import { bpmFlowInstruction } from "@/lib/analysis/bpm";
import { isLikelyInvalidRhymeWord } from "@/lib/rhyme/rhymeWordValidity";
import { deepseekChat, maxTokensForFormat } from "./deepseekChat";

/** ムードごとの日本語ラベル */
const MOOD_LABELS: Record<GenerateLyricsRequest["mood"], string> = {
  street: "ストリート（リアルで生々しい）",
  emotional: "エモーショナル（内省的・感情的）",
  battle: "バトル（攻撃的・挑発的）",
  mellow: "メロウ（落ち着いた・しっとり）",
  business: "ビジネス（成功・野心・現実的）",
};

/** フォーマットごとの指示文（行数＝今回の生成量。曲構成とは別） */
const FORMAT_INSTRUCTIONS: Record<GenerateLyricsRequest["format"], string> = {
  "4bars": "約4行。短いたたき台として、後から続きを足せる1フレーズ",
  "8bars": "約8行。バース1本分の目安",
  "16bars": "約16行。長めのバースまたは複数パートが混ざった流れ",
  hook: "サビ（フック）部分。覚えやすくキャッチーに（レガシー）",
  punchline: "パンチライン1〜2行。1行目で状況を作り、2行目で強いオチ・比喩・逆転を入れる",
};

const PUNCHLINE_STYLE: Record<PunchlineStyle, string> = {
  default: "インパクトと記憶に残る締めを重視",
  metaphor: "比喩・暗喩を効かせた知的なオチ",
  aggressive: "攻撃的・挑発的でバトル向きの強い締め",
  witty: "言葉遊び・ダブルミーニング・ウィット重視",
  story: "短いストーリーの結末として刺さる締め",
};

function formatRhymeList(
  candidates: RhymeCandidate[],
  queryWord?: string,
  allowArchaicRhymes?: boolean,
): string {
  const valid = candidates.filter(
    (c) =>
      !isLikelyInvalidRhymeWord(c.word, {
        queryWord,
        allowArchaicRhymes,
      }),
  );
  if (valid.length === 0) return "（候補なし）";
  return valid
    .slice(0, 10)
    .map((c) => {
      const vowelInfo = c.vowels ? `{${c.vowels}}` : "";
      return c.word + (c.reading ? `(${c.reading})` : "") + vowelInfo;
    })
    .join("、");
}

function formatInputPlanSection(
  inputPlan: InputPhrasePlan[],
  rhymeCandidates: Record<string, RhymeCandidate[]> | undefined,
  allowArchaicRhymes?: boolean,
): string {
  if (!inputPlan.length) return "（入力なし）";

  return inputPlan
    .map((plan, i) => {
      const primaryRhymes =
        rhymeCandidates?.[plan.primaryRhymeWord] ?? [];
      const otherKeywords = plan.rhymeKeywords.filter(
        (k) => k !== plan.primaryRhymeWord,
      );

      if (plan.isPhrase) {
        const extraRhymes = otherKeywords
          .map((kw) => {
            const cands = rhymeCandidates?.[kw] ?? [];
            return cands.length > 0
              ? `「${kw}」韻: ${formatRhymeList(cands, kw, allowArchaicRhymes)}`
              : null;
          })
          .filter(Boolean)
          .join("\n   ");

        return [
          `${i + 1}. 【文章】「${plan.original}」`,
          `   → この一文を歌詞の1行として**そのまま**（または意味・語順を保って）含める`,
          `   → この行の**直後から**、韻軸「${plan.primaryRhymeWord}」の韻を踏む`,
          `   → 韻候補: ${formatRhymeList(primaryRhymes, plan.primaryRhymeWord, allowArchaicRhymes)}`,
          extraRhymes ? `   → ${extraRhymes}` : null,
        ]
          .filter(Boolean)
          .join("\n");
      }

      return [
        `${i + 1}. 【単語】「${plan.original}」`,
        `   → ストーリーに自然に織り込む`,
        `   → 韻軸「${plan.primaryRhymeWord}」の韻候補: ${formatRhymeList(primaryRhymes, plan.primaryRhymeWord, allowArchaicRhymes)}`,
      ].join("\n");
    })
    .join("\n\n");
}

/**
 * LLM（デフォルト: DeepSeek）でラップ歌詞を生成する。
 */
export async function generateLyrics(
  request: GenerateLyricsRequest,
): Promise<string> {
  const {
    inputWords,
    inputPlan,
    mood,
    format,
    rhymeCandidates,
    bpm,
    beatsPerBar = 4,
    punchlineStyle = "default",
    structureHint,
    allowArchaicRhymes,
  } = request;

  const moodLabel = MOOD_LABELS[mood];
  const formatInstruction = FORMAT_INSTRUCTIONS[format];
  const planSection = formatInputPlanSection(
    inputPlan ?? inputWords.map((w) => ({
      original: w,
      isPhrase: false,
      rhymeKeywords: [w],
      primaryRhymeWord: w,
    })),
    rhymeCandidates,
    allowArchaicRhymes,
  );

  const hasPhrases = (inputPlan ?? []).some((p) => p.isPhrase);

  const bpmSection =
    bpm && bpm > 0
      ? `\n【BPM / フロー】\n${bpmFlowInstruction(bpm, beatsPerBar)}`
      : "";

  const punchlineSection =
    format === "punchline"
      ? `\n【パンチラインスタイル】\n${PUNCHLINE_STYLE[punchlineStyle]}`
      : "";

  const structureSection = structureHint
    ? `\n【曲構成（メモ帳より — サビとバースは1曲の中で混ざった流れとして書く）】\n${structureHint}\n- 各パートは別曲ではなく、同じ1本の歌詞の区切り\n- サビは短くキャッチー、バースは語数多めでもよい\n- 既に書いてある行の流れ・世界観を壊さない`
    : "";

  const phraseRules = hasPhrases
    ? `
【文章入力の構成ルール（最優先）】
- ユーザーが文章で入力したフレーズは、歌詞の中にその文章を1行として必ず含める
- その文章行の直後の行から、抽出された韻キーワード（特に末尾語）の韻を踏む
- 文章の後続行は、前の文から自然につながるストーリー・情景で書く（いきなり別话题に飛ばない）
- 複数の文章/単語がある場合、入力順に登場させて全体を1つのラップにする`
    : "";

  const inputWordList = inputWords.map((w, i) => `${i + 1}. ${w}`).join("\n");

  const systemPrompt = `あなたは日本語ラップの作詞アシスタントです。
ユーザーが指定した言葉・文章と韻候補をもとに、自然で人間らしいラップ歌詞を書いてください。

【ルール】
- ユーザーが入力した言葉・文章を**すべて**意味のある文脈で使う（飾りの1語だけにしない）
- 文章入力は原文を1行として歌詞に入れ、その直後から韻を踏む
- 韻候補は**実在する日本語の語**として自然に織り込む。無理に全部使わない
- **禁止**: 存在しない単語・造語・韻辞書の断片（カジャ、ラジャ、ぐカジャ等）を使わない
- **禁止**: 入力と無関係な抽象フレーズだけで埋める（「心の影」「偽りの平和」等のテンプレ連発）
- 行末韻・内部韻を意識し、母音が響く語を選ぶ
- 1行ごとに**具体的な場所・人物・動作・時間**を入れ、情景が見えるように書く
- 入力ワード同士を1本のストーリーで繋ぐ（場所→出来事→夜→人物…の流れ）
- 日本語ラップらしく、話し言葉寄りのリズム感
- 韻を踏みすぎて不自然にならないようバランスを取る
- 犯罪や違法行為の推奨・美化はしない
- 違法・薬物等の話題は、過去の経験や葛藤として表現し、前向きに消化する方向へ
- 出力は歌詞本文のみ（説明や注釈は不要）
- 各行は改行で区切る
- BPM指定時は1行あたりのモーラ数（音節数）を揃える
- **脚韻品質**: 行末5モーラ前後の母音列が響く脚韻を優先（単語1つだけでなく複数語にまたがってもよい）
- **行長**: 1行8〜16モーラ目安、隣接行のモーラ差は4以内
- **禁止**: 韻辞書の古典語縮約（白々しきゃ、かんばしりゃ、よだちゃ 等）をそのまま行末に使わない${allowArchaicRhymes ? "（※古典韻モードONだが、意味が通じない語は避ける）" : ""}
- **口語OK**: なきゃ、拝みゃ、〜とばしゃ 等、話し言葉として通じる縮約のみ
- 行末は「〜せば/〜れば」や自然な口語（なきゃ、じゃ）を優先する
${phraseRules}`;

  const userPrompt = `以下の条件で歌詞を書いてください。

【入れたい言葉・文章（この順でストーリーに組み込む）】
${inputWordList}

【韻のつなぎ方・候補語】
${planSection}

【雰囲気】
${moodLabel}

【出力形式】
${formatInstruction}
${structureSection}
${punchlineSection}
${bpmSection}

【品質チェック（書き上げ前に自分で確認）】
- 入力の各ワードが「ただ1語出てくるだけ」になっていないか
- 造語や韻の断片語を使っていないか
- 隣接する行の意味がつながっているか
- ラップとして口に出して自然か`;

  return deepseekChat({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    maxTokens: maxTokensForFormat(format),
    thinking: false,
    temperature: format === "punchline" ? 0.9 : 0.85,
  });
}

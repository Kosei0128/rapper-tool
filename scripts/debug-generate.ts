import { parseInputPhrases } from "../lib/input/parseInputPhrases";
import { generateLyrics } from "../lib/llm/generateLyrics";

async function main() {
  console.log("step1 parseInputPhrases");
  const plan = parseInputPhrases(["町田", "みんなで炊いたガンジャ"]);
  console.log("plan", plan);

  console.log("step2 generateLyrics");
  try {
    const lyrics = await generateLyrics({
      inputWords: ["町田"],
      inputPlan: plan.slice(0, 1),
      mood: "street",
      format: "punchline",
      rhymeCandidates: {
        町田: [{ word: "真田", source: "mock", score: 0.9 }],
      },
      bpm: 90,
      beatsPerBar: 4,
      punchlineStyle: "default",
    });
    console.log("ok", lyrics.slice(0, 100));
  } catch (e) {
    const err = e as Error;
    console.error("ERR", err.message);
    console.error(err.stack?.split("\n").slice(0, 15).join("\n"));
  }
}

main();

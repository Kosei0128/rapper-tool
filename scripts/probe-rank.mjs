import { createCompositeProvider } from "../lib/rhyme/providers/compositeProvider.ts";
import { rankRhymeCandidates } from "../lib/rhyme/rankRhymes.ts";
import { getRhymesFromAzrhymes } from "../lib/rhyme/providers/azrhymesProvider.ts";
import { getRhymesFromNwnwn } from "../lib/rhyme/providers/nwnwnProvider.ts";

const word = "\u30ac\u30f3\u30b8\u30e3";

async function main() {
  process.env.RHYME_PROVIDERS = "nwnwn,azrhymes,in-note";

  const n = await getRhymesFromNwnwn(word);
  const a = await getRhymesFromAzrhymes(word);
  const merged = [...n, ...a.filter((x) => !n.some((y) => y.word === x.word))];
  console.log("merged count", merged.length, "has 患者", merged.some((c) => c.word === "患者"));

  const ranked = rankRhymeCandidates(word, merged, "ana");
  console.log(
    "top15 ranked",
    ranked.slice(0, 15).map((c) => `${c.word}[${c.source}] ${Math.round((c.score ?? 0) * 100)}%`),
  );
  console.log("患者 rank", ranked.findIndex((c) => c.word === "患者"));

  const composite = createCompositeProvider(["nwnwn", "azrhymes", "in-note"]);
  const result = await composite.getRhymes(word);
  console.log(
    "composite top15",
    result.slice(0, 15).map((c) => `${c.word}[${c.source}]`),
  );
  console.log("composite has 患者", result.some((c) => c.word === "患者"));
}

main();

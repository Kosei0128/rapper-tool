import { getRhymesFromNwnwn } from "../lib/rhyme/providers/nwnwnProvider";
import { getRhymesFromAzrhymes } from "../lib/rhyme/providers/azrhymesProvider";
import { getRhymesFromInNote } from "../lib/rhyme/providers/inNoteProvider";
import { getRhymes } from "../lib/rhyme/rhymeClient";

async function main() {
  const word = "町田";

  console.log("=== nwnwn ===");
  console.log((await getRhymesFromNwnwn(word)).slice(0, 3));

  console.log("\n=== azrhymes ===");
  console.log((await getRhymesFromAzrhymes("愛")).slice(0, 5));

  console.log("\n=== in-note ===");
  try {
    console.log((await getRhymesFromInNote(word)).slice(0, 3));
  } catch (e) {
    console.log("err:", e instanceof Error ? e.message : e);
  }

  process.env.RHYME_PROVIDERS = "nwnwn,azrhymes,in-note";
  process.env.RHYME_USE_MOCK = "false";
  console.log("\n=== composite ===");
  const merged = await getRhymes(word);
  const bySource = merged.reduce<Record<string, number>>((acc, c) => {
    acc[c.source] = (acc[c.source] ?? 0) + 1;
    return acc;
  }, {});
  console.log("by source:", bySource);
  console.log(merged.slice(0, 8).map((c) => `${c.word}[${c.source}]`));
}

main();

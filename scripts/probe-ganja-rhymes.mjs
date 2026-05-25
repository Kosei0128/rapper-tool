import { getRhymesFromNwnwn } from "../lib/rhyme/providers/nwnwnProvider.ts";
import { getRhymesFromAzrhymes } from "../lib/rhyme/providers/azrhymesProvider.ts";
import { getRhymesFromInNote } from "../lib/rhyme/providers/inNoteProvider.ts";
import { getRhymes } from "../lib/rhyme/rhymeClient.ts";

const word = "\u30ac\u30f3\u30b8\u30e3"; // ????
process.env.RHYME_PROVIDERS = "nwnwn,azrhymes,in-note";
process.env.RHYME_USE_MOCK = "false";

async function main() {
  console.log("word:", word);

  const n = await getRhymesFromNwnwn(word);
  console.log("\n=== nwnwn ===", n.length);
  console.log(n.slice(0, 15).map((c) => `${c.word} [${c.vowels}]`));

  const a = await getRhymesFromAzrhymes(word);
  console.log("\n=== azrhymes ===", a.length);
  console.log(a.slice(0, 15).map((c) => c.word));

  let i = [];
  try {
    i = await getRhymesFromInNote(word);
    console.log("\n=== in-note ===", i.length);
    console.log(
      i.slice(0, 15).map((c) => `${c.word} [${c.vowels ?? "?"}]`),
    );
  } catch (e) {
    console.log("\n=== in-note err ===", e instanceof Error ? e.message : e);
  }

  const m = await getRhymes(word);
  console.log("\n=== composite ===", m.length);
  console.log(m.map((c) => `${c.word}[${c.source}] ${c.vowels ?? ""}`));

  const expected = ["??", "??", "??????", "??", "??", "????", "????"];
  console.log("\n=== expected word index ===");
  for (const w of expected) {
    console.log(w, {
      nwnwn: n.findIndex((c) => c.word === w),
      azrhymes: a.findIndex((c) => c.word === w),
      inNote: i.findIndex((c) => c.word === w),
      composite: m.findIndex((c) => c.word === w),
    });
  }
}

main();

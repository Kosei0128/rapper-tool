/** 韻プロバイダー結合テスト */
import { getRhymesFromNwnwn } from "../lib/rhyme/providers/nwnwnProvider.js";
import { getRhymesFromAzrhymes } from "../lib/rhyme/providers/azrhymesProvider.js";
import { getRhymesFromInNote } from "../lib/rhyme/providers/inNoteProvider.js";
import { getRhymes } from "../lib/rhyme/rhymeClient.js";

const word = "町田";

console.log("=== nwnwn ===");
const nwnwn = await getRhymesFromNwnwn(word);
console.log(nwnwn.slice(0, 3));

console.log("\n=== azrhymes (愛) ===");
const az = await getRhymesFromAzrhymes("愛");
console.log(az.slice(0, 5));

console.log("\n=== in-note ===");
try {
  const inote = await getRhymesFromInNote(word);
  console.log(inote.slice(0, 3));
} catch (e) {
  console.log("in-note err:", e.message);
}

console.log("\n=== composite getRhymes ===");
process.env.RHYME_PROVIDERS = "nwnwn,azrhymes";
process.env.RHYME_USE_MOCK = "false";
const merged = await getRhymes(word);
console.log(`merged ${merged.length}:`, merged.slice(0, 5).map((c) => `${c.word}(${c.source})`));

/**
 * kuromoji 動作確認（ローカル）
 * node --import tsx scripts/test-kuromoji.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const kuromoji = require("kuromoji");

const samples = ["町田", "夜明け前", "白々しい"];

const dicPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");

kuromoji.builder({ dicPath }).build((err, tokenizer) => {
  if (err) {
    console.error("build failed:", err);
    process.exit(1);
  }

  for (const text of samples) {
    const tokens = tokenizer.tokenize(text);
    const reading = tokens.map((t) => t.reading).join("");
    console.log(`${text} → ${reading}`);
  }
});

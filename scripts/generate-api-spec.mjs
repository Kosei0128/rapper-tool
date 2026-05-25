#!/usr/bin/env node
/** browser-to-api discover.mjs のラッパー */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const discover = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".codex/skills/browser-to-api/scripts/discover.mjs",
);
const runDir = path.join(__dirname, "..", ".o11y", "rhyme-sites-capture");

const args = [
  discover,
  "--run", runDir,
  "--title", "Rhyme Sites API",
  "--origins", "in.nwnwn.com,ja.azrhymes.com,kujirahand.com,in-note.com",
  ...process.argv.slice(2),
];

const r = spawnSync(process.execPath, args, { stdio: "inherit" });
process.exit(r.status ?? 1);

/** キャプチャ済みレスポンス body から韻APIの実サンプルを抽出 */
import fs from "node:fs";
import path from "node:path";

const BODIES = path.join(process.cwd(), ".o11y", "rhyme-sites-capture", "cdp", "network", "bodies");
const REQUESTS = path.join(process.cwd(), ".o11y", "rhyme-sites-capture", "cdp", "network", "requests.jsonl");

const requests = fs.readFileSync(REQUESTS, "utf8").trim().split("\n").map(JSON.parse);

const KEY_PATTERNS = [
  /\/api\/rhyme/,
  /\/api\/examples/,
  /rhyme-game\/next-word/,
  /words\/autocomplete/,
  /words\/new_ajax/,
  /words\?q=/,
  /words\/api\.php/,
  /Words\.php\?key=/,
];

for (const ev of requests) {
  const url = ev.params.request.url;
  if (!KEY_PATTERNS.some((p) => p.test(url))) continue;
  const id = ev.params.requestId;
  const respPath = path.join(BODIES, id, "response.json");
  if (!fs.existsSync(respPath)) continue;
  const body = JSON.parse(fs.readFileSync(respPath, "utf8")).body;
  console.log(`\n=== ${ev.params.request.method} ${url} ===`);
  if (ev.params.request.postData) console.log("REQ:", ev.params.request.postData);
  console.log("RES:", typeof body === "string" ? body.slice(0, 600) : JSON.stringify(body)?.slice(0, 600));
}

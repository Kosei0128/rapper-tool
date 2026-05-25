/** キャプチャ結果から API っぽいリクエストを抽出 */
import fs from "node:fs";
import path from "node:path";

const RUN_DIR = path.join(process.cwd(), ".o11y", "rhyme-sites-capture");
const requestsPath = path.join(RUN_DIR, "cdp", "network", "requests.jsonl");
const responsesPath = path.join(RUN_DIR, "cdp", "network", "responses.jsonl");

const requests = fs.readFileSync(requestsPath, "utf8").trim().split("\n").map(JSON.parse);
const responses = fs.readFileSync(responsesPath, "utf8").trim().split("\n").map(JSON.parse);

const respMap = new Map(responses.map((r) => [r.params.requestId, r.params.response]));

const interesting = requests.filter((ev) => {
  const url = ev.params.request.url;
  const type = ev.params.type;
  if (type !== "Fetch" && type !== "XHR" && type !== "Document") return false;
  if (/google|doubleclick|cloudflare|facebook|analytics|ads|gpt|beacon/i.test(url)) return false;
  return true;
});

console.log(`Total requests: ${requests.length}`);
console.log(`Interesting: ${interesting.length}\n`);

const byHost = {};
for (const ev of interesting) {
  const url = ev.params.request.url;
  let host;
  try { host = new URL(url).host; } catch { host = "unknown"; }
  if (!byHost[host]) byHost[host] = [];
  byHost[host].push(ev);
}

for (const [host, evs] of Object.entries(byHost).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n## ${host} (${evs.length})`);
  const seen = new Set();
  for (const ev of evs) {
    const req = ev.params.request;
    const key = `${req.method} ${req.url.split("?")[0]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const resp = respMap.get(ev.params.requestId);
    const status = resp?.status ?? "?";
    console.log(`  ${status} ${req.method} ${req.url.slice(0, 120)}`);
    if (req.postData) console.log(`       body: ${req.postData.slice(0, 100)}`);
  }
}

/** nwnwn だけ追加キャプチャして既存 trace にマージ */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const RUN_DIR = path.join(process.cwd(), ".o11y", "rhyme-sites-capture");
const NETWORK_DIR = path.join(RUN_DIR, "cdp", "network");
const BODIES_DIR = path.join(NETWORK_DIR, "bodies");
const requestsPath = path.join(NETWORK_DIR, "requests.jsonl");
const responsesPath = path.join(NETWORK_DIR, "responses.jsonl");

function appendJsonl(p, o) { fs.appendFileSync(p, JSON.stringify(o) + "\n"); }

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
let reqCount = 0;

page.on("request", (req) => {
  const requestId = `nwnwn-${++reqCount}-${Date.now()}`;
  req.__captureId = requestId;
  const postData = req.postData() ?? undefined;
  appendJsonl(requestsPath, {
    method: "Network.requestWillBeSent",
    params: {
      requestId,
      type: "Fetch",
      request: { url: req.url(), method: req.method(), headers: req.headers(), postData },
    },
  });
  fs.mkdirSync(path.join(BODIES_DIR, requestId), { recursive: true });
  fs.writeFileSync(path.join(BODIES_DIR, requestId, "request.json"), JSON.stringify({ id: requestId, body: postData ?? null }));
});

page.on("response", async (res) => {
  const requestId = res.request().__captureId;
  if (!requestId) return;
  const headers = await res.allHeaders().catch(() => ({}));
  appendJsonl(responsesPath, {
    method: "Network.responseReceived",
    params: {
      requestId,
      response: { url: res.url(), status: res.status(), headers, mimeType: headers["content-type"] ?? "" },
    },
  });
  let body = null;
  try { body = await res.text(); } catch { /* */ }
  fs.writeFileSync(path.join(BODIES_DIR, requestId, "response.json"), JSON.stringify({ body }));
});

await page.goto("https://in.nwnwn.com/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
await page.getByPlaceholder("例: 韻システム").fill("町田");
await page.getByRole("button", { name: "検索" }).click();
await page.waitForTimeout(5000);

console.log("nwnwn capture appended");
await browser.close();

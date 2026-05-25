#!/usr/bin/env node
/**
 * 韻検索4サイトのネットワークキャプチャ（v2）
 * - 広告/トラッキングをブロックしてノイズ削減
 * - サイトごとに独立キャプチャ → マージ
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const RUN_ID = "rhyme-sites-capture";
const RUN_DIR = path.join(process.cwd(), ".o11y", RUN_ID);
const NETWORK_DIR = path.join(RUN_DIR, "cdp", "network");
const BODIES_DIR = path.join(NETWORK_DIR, "bodies");

/** 広告・トラッキングドメイン（ノイズ除去） */
const BLOCK_PATTERNS = [
  /doubleclick\.net/i,
  /googlesyndication/i,
  /google-analytics/i,
  /googleadservices/i,
  /facebook\.com/i,
  /rubiconproject/i,
  /criteo\.com/i,
  /openx\.net/i,
  /pubmatic\.com/i,
  /adform\.net/i,
  /media\.net/i,
  /taboola/i,
  /outbrain/i,
  /cloudflareinsights/i,
  /microad\.net/i,
  /zucks\.net/i,
  /setupad\.net/i,
  /prebid/i,
  /ads\./i,
  /analytics\./i,
];

const SITES = [
  {
    name: "nwnwn",
    origins: ["in.nwnwn.com"],
    url: "https://in.nwnwn.com/",
    async interact(page) {
      await page.getByPlaceholder(/韻システム|例:/).fill("町田");
      await page.getByRole("button", { name: "検索" }).click();
      await page.waitForTimeout(4000);
    },
  },
  {
    name: "azrhymes",
    origins: ["ja.azrhymes.com", "static1.azrhymes.com"],
    url: "https://ja.azrhymes.com/",
    async interact(page) {
      // ポップアップ閉じる
      await page.locator('button:has-text("OK"), button:has-text("キャンセル"), .popup-close, [aria-label="Close"]').first().click({ timeout: 3000 }).catch(() => {});
      const input = page.getByPlaceholder(/ことば|表現|入力/);
      await input.fill("愛");
      await input.press("Enter");
      await page.waitForURL(/rhymes=/, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
      // 結果クリックで追加 API を誘発
      await page.locator(".result, .search-result, a.link").first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2000);
    },
  },
  {
    name: "kujirahand",
    origins: ["kujirahand.com"],
    url: "https://kujirahand.com/web-tools/Words.php",
    async interact(page) {
      // 母音検索（2つ目のテキスト入力 = 母音検索欄）
      const inputs = page.locator('input[type="text"]');
      const count = await inputs.count();
      const vowelInput = count >= 2 ? inputs.nth(1) : inputs.first();
      await vowelInput.fill("まちだ");
      // 母音検索の submit（form 内）
      await page.locator('form').filter({ has: vowelInput }).locator('input[type="submit"], button').first().click({ timeout: 5000 }).catch(async () => {
        // fallback: URL 直叩き
        await page.goto("https://kujirahand.com/web-tools/Words.php?key=" + encodeURIComponent("まちだ") + "&m=boin-search", { waitUntil: "domcontentloaded" });
      });
      await page.waitForTimeout(3000);
      // random API も明示的に叩く
      await page.evaluate(() => fetch("/web-tools/words/api.php?m=random").catch(() => {}));
      await page.waitForTimeout(2000);
    },
  },
  {
    name: "in-note",
    origins: ["in-note.com", "133.242.179.106"],
    url: "https://in-note.com/",
    async interact(page) {
      const input = page.getByPlaceholder(/東京タワー|単語|入力/);
      await input.fill("町田");
      await page.getByRole("button", { name: "検索" }).click();
      await page.waitForTimeout(5000);
      // 結果ページ遷移を待つ
      await page.waitForURL(/words\/\d+|search|rhyme/i, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
    },
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function appendJsonl(filePath, obj) {
  fs.appendFileSync(filePath, JSON.stringify(obj) + "\n", "utf8");
}

function toCdpType(resourceType) {
  if (resourceType === "fetch" || resourceType === "xhr") return "Fetch";
  if (resourceType === "document") return "Document";
  return resourceType.toUpperCase();
}

function shouldBlock(url) {
  return BLOCK_PATTERNS.some((p) => p.test(url));
}

async function captureSite(browser, site) {
  console.log(`\n=== ${site.name}: ${site.url} ===`);
  const context = await browser.newContext({ locale: "ja-JP" });
  const page = await context.newPage();

  await page.route("**/*", (route) => {
    if (shouldBlock(route.request().url())) return route.abort();
    return route.continue();
  });

  const requestsPath = path.join(NETWORK_DIR, "requests.jsonl");
  const responsesPath = path.join(NETWORK_DIR, "responses.jsonl");
  let reqCount = 0;

  page.on("request", (req) => {
    const requestId = `${site.name}-${++reqCount}-${Date.now()}`;
    req.__captureId = requestId;
    const postData = req.postData() ?? undefined;
    appendJsonl(requestsPath, {
      method: "Network.requestWillBeSent",
      params: {
        requestId,
        type: toCdpType(req.resourceType()),
        request: {
          url: req.url(),
          method: req.method(),
          headers: req.headers(),
          postData,
        },
      },
    });
    ensureDir(path.join(BODIES_DIR, requestId));
    fs.writeFileSync(
      path.join(BODIES_DIR, requestId, "request.json"),
      JSON.stringify({ id: requestId, body: postData ?? null }),
      "utf8",
    );
  });

  page.on("response", async (res) => {
    const requestId = res.request().__captureId;
    if (!requestId) return;
    const headers = await res.allHeaders().catch(() => ({}));
    appendJsonl(responsesPath, {
      method: "Network.responseReceived",
      params: {
        requestId,
        response: {
          url: res.url(),
          status: res.status(),
          headers,
          mimeType: headers["content-type"] ?? "",
        },
      },
    });
    let body = null;
    try {
      const ct = headers["content-type"] ?? "";
      if (/json|text|html|javascript/.test(ct)) body = await res.text();
    } catch { /* ignore */ }
    fs.writeFileSync(
      path.join(BODIES_DIR, requestId, "response.json"),
      JSON.stringify({ body }),
      "utf8",
    );
  });

  try {
    await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);
    await site.interact(page);
    console.log(`  ✓ Done`);
    const shot = path.join(RUN_DIR, "screenshots", `${site.name}-ok.png`);
    ensureDir(path.dirname(shot));
    await page.screenshot({ path: shot, fullPage: false });
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    const shot = path.join(RUN_DIR, "screenshots", `${site.name}-error.png`);
    ensureDir(path.dirname(shot));
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
  }

  await context.close();
}

async function main() {
  ensureDir(NETWORK_DIR);
  ensureDir(BODIES_DIR);
  ensureDir(path.join(RUN_DIR, "screenshots"));

  // クリーンスタート
  for (const f of ["requests.jsonl", "responses.jsonl"]) {
    const p = path.join(NETWORK_DIR, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  if (fs.existsSync(BODIES_DIR)) {
    fs.rmSync(BODIES_DIR, { recursive: true, force: true });
    ensureDir(BODIES_DIR);
  }

  fs.writeFileSync(
    path.join(RUN_DIR, "manifest.json"),
    JSON.stringify({ run_id: RUN_ID, started_at: new Date().toISOString(), version: 2 }, null, 2),
  );

  const browser = await chromium.launch({ headless: true });
  for (const site of SITES) await captureSite(browser, site);
  await browser.close();

  const manifest = JSON.parse(fs.readFileSync(path.join(RUN_DIR, "manifest.json"), "utf8"));
  manifest.stopped_at = new Date().toISOString();
  fs.writeFileSync(path.join(RUN_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  const count = fs.existsSync(path.join(NETWORK_DIR, "requests.jsonl"))
    ? fs.readFileSync(path.join(NETWORK_DIR, "requests.jsonl"), "utf8").trim().split("\n").filter(Boolean).length
    : 0;
  console.log(`\nCaptured ${count} requests → ${RUN_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://in.nwnwn.com/", { waitUntil: "domcontentloaded" });
const inputs = await page.locator("input").evaluateAll((els) =>
  els.map((el) => ({ type: el.type, name: el.name, id: el.id, placeholder: el.placeholder })),
);
console.log("inputs:", inputs);
const buttons = await page.locator("button").evaluateAll((els) =>
  els.map((el) => el.textContent?.trim()),
);
console.log("buttons:", buttons);
await browser.close();

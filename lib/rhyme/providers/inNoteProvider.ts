import type { RhymeCandidate } from "../types";
import { fetchWithTimeout, stripTags } from "./fetchUtils";

const DEFAULT_BASE = "https://in-note.com";

/**
 * 韻ノート (in-note.com) プロバイダー
 *
 * フロー（キャプチャで確認）:
 * 1. GET /words/autocomplete?q={word}  → 単語 ID
 * 2. POST /words/new_ajax  body: id={id}  → 韻候補 HTML
 *
 * 長い複合語の韻に強い（200万語以上）が、HTML パースが必要。
 */
export async function getRhymesFromInNote(word: string): Promise<RhymeCandidate[]> {
  const baseUrl = process.env.RHYME_INNOTE_BASE_URL ?? DEFAULT_BASE;
  const wordId = await resolveWordId(baseUrl, word);
  if (!wordId) return [];

  const response = await fetchWithTimeout(`${baseUrl}/words/new_ajax`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${encodeURIComponent(wordId)}`,
  });

  if (!response.ok) {
    throw new Error(`in-note new_ajax HTTP ${response.status}`);
  }

  const html = await response.text();
  return parseRhymeHtml(html);
}

/** autocomplete または exact 検索ページから単語 ID を解決 */
async function resolveWordId(baseUrl: string, word: string): Promise<string | null> {
  // 1. exact 検索 → /words/new?hiragana=... にリダイレクト → data-id が HTML に含まれる
  const searchRes = await fetchWithTimeout(
    `${baseUrl}/words?q=${encodeURIComponent(word)}&exact=true`,
    { redirect: "follow" },
  );
  if (searchRes.ok) {
    const html = await searchRes.text();
    const id = extractAjaxDataId(html);
    if (id) return id;
  }

  // 2. /words/new?query= 直アクセス
  const newRes = await fetchWithTimeout(
    `${baseUrl}/words/new?query=${encodeURIComponent(word)}`,
  );
  if (newRes.ok) {
    const html = await newRes.text();
    const id = extractAjaxDataId(html);
    if (id) return id;
  }

  // 3. autocomplete の word_id（部分一致フォールバック）
  const acRes = await fetchWithTimeout(
    `${baseUrl}/words/autocomplete?q=${encodeURIComponent(word)}&_=${Date.now()}`,
    { headers: { Accept: "application/json" } },
  );
  if (acRes.ok) {
    const text = await acRes.text();
    if (text.trim()) {
      try {
        const data = JSON.parse(text) as unknown;
        const id = extractIdFromAutocomplete(data, word);
        if (id) return id;
      } catch {
        // 次へ
      }
    }
  }

  return null;
}

function extractAjaxDataId(html: string): string | null {
  const match =
    html.match(/class="ajax"\s+data-id="(\d+)"/) ??
    html.match(/data-id="(\d+)"/);
  return match?.[1] ?? null;
}

function extractIdFromAutocomplete(data: unknown, word: string): string | null {
  if (!Array.isArray(data)) return null;

  // 完全一致を優先
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;
    const name = String(obj.name ?? "");
    const wordId = obj.word_id ?? obj.id;
    if (wordId && name === word) return String(wordId);
  }

  // 部分一致
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;
    const name = String(obj.name ?? "");
    const wordId = obj.word_id ?? obj.id;
    if (wordId && name.includes(word)) return String(wordId);
  }

  return null;
}

/** new_ajax の HTML から韻候補を抽出 */
function parseRhymeHtml(html: string): RhymeCandidate[] {
  const candidates: RhymeCandidate[] = [];
  const pattern =
    /class="word-main">([^<]+)<\/span><span class="word-sub">（([^）]+)）/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    candidates.push({
      word: match[1].trim(),
      reading: match[2].trim(),
      source: "in-note",
    });
  }

  if (candidates.length > 0) return candidates;

  // フォールバック: li.rhymed_word 内テキスト
  const liPattern = /class="rhymed_word"[^>]*>([\s\S]*?)<\/li>/g;
  while ((match = liPattern.exec(html)) !== null) {
    const text = stripTags(match[1]).replace(/\s+/g, " ").trim();
    if (text.length > 0 && text.length < 80) {
      candidates.push({ word: text, source: "in-note" });
    }
  }

  return candidates;
}

/** 韻プロバイダー共通: タイムアウト付き fetch */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json, text/html, */*",
        "User-Agent": "RapperTool/1.0 (lyric-assistant)",
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** HTML からテキストノードをざっくり除去してパースしやすくする */
export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

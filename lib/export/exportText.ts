/** 歌詞をプレーンテキストでダウンロード */
export function downloadLyricsTxt(lyrics: string, filename = "lyrics.txt"): void {
  const blob = new Blob([lyrics.trim() + "\n"], {
    type: "text/plain;charset=utf-8",
  });
  triggerDownload(blob, filename);
}

/** 韻候補をプレーンテキストでダウンロード */
export function downloadRhymesTxt(
  rhymeCandidates: Record<string, { word: string; reading?: string; score?: number }[]>,
  filename = "rhymes.txt",
): void {
  const lines: string[] = [];
  for (const [query, list] of Object.entries(rhymeCandidates)) {
    lines.push(`# ${query}`);
    for (const c of list) {
      const score =
        c.score !== undefined ? ` (${Math.round(c.score * 100)}%)` : "";
      const reading = c.reading ? ` / ${c.reading}` : "";
      lines.push(`- ${c.word}${reading}${score}`);
    }
    lines.push("");
  }
  const blob = new Blob([lines.join("\n").trim() + "\n"], {
    type: "text/plain;charset=utf-8",
  });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

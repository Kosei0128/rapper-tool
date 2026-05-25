export type NotepadSectionType =
  | "verse"
  | "hook"
  | "bridge"
  | "intro"
  | "outro"
  | "bars";

export type NotepadSection = {
  type: NotepadSectionType;
  label: string;
  lines: string[];
};

const TAG_PATTERN =
  /^--(hook|verse|bridge|intro|outro|bars|サビ|Aメロ|Bメロ|16bars|8bars|4bars)\s*$/i;

const TAG_MAP: Record<string, NotepadSectionType> = {
  hook: "hook",
  サビ: "hook",
  verse: "verse",
  aメロ: "verse",
  bメロ: "verse",
  bridge: "bridge",
  intro: "intro",
  outro: "outro",
  bars: "bars",
  "16bars": "bars",
  "8bars": "bars",
  "4bars": "bars",
};

function normalizeTag(raw: string): NotepadSectionType {
  const key = raw.toLowerCase();
  return TAG_MAP[key] ?? TAG_MAP[raw] ?? "verse";
}

/** メモ帳テキストをセクションに分割（--hook 等のタグ行は歌詞に含めない） */
export function parseNotepadSections(text: string): NotepadSection[] {
  const sections: NotepadSection[] = [];
  let current: NotepadSection = { type: "verse", label: "verse", lines: [] };

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const tagMatch = line.match(TAG_PATTERN);
    if (tagMatch) {
      if (current.lines.length > 0) {
        sections.push(current);
      }
      const label = tagMatch[1];
      current = {
        type: normalizeTag(label),
        label: label.toLowerCase(),
        lines: [],
      };
      continue;
    }
    if (line) {
      current.lines.push(line);
    }
  }

  if (current.lines.length > 0) {
    sections.push(current);
  }

  return sections;
}

/** タグを除いた歌詞本文のみ */
export function notepadToLyrics(text: string): string {
  const sections = parseNotepadSections(text);
  if (sections.length === 0) {
    return text
      .split("\n")
      .filter((l) => !TAG_PATTERN.test(l.trim()) && l.trim())
      .join("\n")
      .trim();
  }
  return sections
    .flatMap((s) => s.lines)
    .join("\n")
    .trim();
}

/** LLM / 分析用の構造説明 */
export function notepadStructureHint(text: string): string | null {
  const sections = parseNotepadSections(text);
  if (sections.length <= 1 && sections[0]?.type === "verse") {
    return null;
  }

  return sections
    .map((s, i) => {
      const role =
        s.type === "hook"
          ? "サビ（フック）"
          : s.type === "verse"
            ? "Aメロ / バース"
            : s.type === "bridge"
              ? "ブリッジ"
              : s.type;
      return `${i + 1}. [${role}] ${s.lines.length}行\n${s.lines.map((l) => `   ${l}`).join("\n")}`;
    })
    .join("\n\n");
}

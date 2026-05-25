import type { LyricFormat, Mood, PunchlineStyle } from "@/lib/rhyme/types";

export type LyricFormData = {
  inputWords: string[];
  mood: Mood;
  format: LyricFormat;
  bpm?: number;
  beatsPerBar: number;
  punchlineStyle: PunchlineStyle;
  /** 古典語ハック韻（白々しきゃ等）を候補に含める */
  allowArchaicRhymes: boolean;
};

export type SetupDraft = {
  words: string[];
  mood: Mood;
  format: LyricFormat;
  bpmPreset: string;
  customBpm: string;
  beatsPerBar: string;
  punchlineStyle: PunchlineStyle;
  allowArchaicRhymes: boolean;
};

export const SETUP_STORAGE_KEY = "rapper-tool-setup";

export const DEFAULT_SETUP_DRAFT: SetupDraft = {
  words: ["", ""],
  mood: "street",
  format: "8bars",
  bpmPreset: "90",
  customBpm: "",
  beatsPerBar: "4",
  punchlineStyle: "default",
  allowArchaicRhymes: false,
};

export function loadSetupDraft(): SetupDraft {
  if (typeof window === "undefined") return DEFAULT_SETUP_DRAFT;
  try {
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) return DEFAULT_SETUP_DRAFT;
    const parsed = JSON.parse(raw) as Partial<SetupDraft>;
    return {
      ...DEFAULT_SETUP_DRAFT,
      ...parsed,
      format: parsed.format === "hook" ? "8bars" : (parsed.format ?? DEFAULT_SETUP_DRAFT.format),
      words:
        Array.isArray(parsed.words) && parsed.words.length > 0
          ? parsed.words
          : DEFAULT_SETUP_DRAFT.words,
    };
  } catch {
    return DEFAULT_SETUP_DRAFT;
  }
}

export function saveSetupDraft(draft: SetupDraft): void {
  try {
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

function resolveBpm(draft: SetupDraft): number | undefined {
  if (draft.bpmPreset === "custom") {
    const n = parseInt(draft.customBpm, 10);
    return n > 0 ? n : undefined;
  }
  if (draft.bpmPreset === "none") return undefined;
  return parseInt(draft.bpmPreset, 10);
}

export function setupDraftToFormData(draft: SetupDraft): LyricFormData {
  const inputWords = draft.words.map((w) => w.trim()).filter(Boolean);
  return {
    inputWords,
    mood: draft.mood,
    format: draft.format,
    bpm: resolveBpm(draft),
    beatsPerBar: parseInt(draft.beatsPerBar, 10) || 4,
    punchlineStyle: draft.punchlineStyle,
    allowArchaicRhymes: draft.allowArchaicRhymes,
  };
}

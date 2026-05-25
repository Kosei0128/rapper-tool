import type { LyricAnalysis, LyricCritique } from "@/lib/analysis/types";
import type { InputPhrasePlan, RhymeCandidate } from "@/lib/rhyme/types";
import type { SetupDraft } from "@/lib/setup-draft";
import type { LyricFormData } from "@/lib/setup-draft";

export type StudioProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  setupDraft: SetupDraft;
  formData: LyricFormData | null;
  generatedLyrics: string;
  rhymeCandidates: Record<string, RhymeCandidate[]>;
  inputPlan: InputPhrasePlan[];
  analysis: LyricAnalysis | null;
  notepadText: string;
};

const PROJECTS_KEY = "rapper-tool-projects";
const MAX_PROJECTS = 30;

export function listProjects(): StudioProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudioProject[];
    return Array.isArray(parsed)
      ? parsed.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Omit<StudioProject, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }): StudioProject {
  const now = new Date().toISOString();
  const existing = project.id
    ? listProjects().find((p) => p.id === project.id)
    : undefined;

  const saved: StudioProject = {
    id: project.id ?? crypto.randomUUID(),
    name: project.name.trim() || `プロジェクト ${new Date().toLocaleDateString("ja-JP")}`,
    createdAt: project.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now,
    setupDraft: project.setupDraft,
    formData: project.formData,
    generatedLyrics: project.generatedLyrics,
    rhymeCandidates: project.rhymeCandidates,
    inputPlan: project.inputPlan,
    analysis: project.analysis,
    notepadText: project.notepadText,
  };

  const others = listProjects().filter((p) => p.id !== saved.id);
  const next = [saved, ...others].slice(0, MAX_PROJECTS);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  return saved;
}

export function deleteProject(id: string): void {
  const next = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
}

export function loadProject(id: string): StudioProject | null {
  return listProjects().find((p) => p.id === id) ?? null;
}

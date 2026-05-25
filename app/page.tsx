"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LyricForm, type LyricFormData } from "@/components/lyric-form";
import { LyricNotepad } from "@/components/lyric-notepad";
import { RhymeResults } from "@/components/rhyme-results";
import { GeneratedLyrics } from "@/components/generated-lyrics";
import { LyricAnalysisPanel } from "@/components/lyric-analysis";
import { ProjectPanel } from "@/components/project-panel";
import { MobileNav, type MobileView } from "@/components/mobile-nav";
import {
  WorkspaceTabs,
  type WorkspaceTab,
} from "@/components/workspace-tabs";
import type { LyricAnalysis, LyricCritique } from "@/lib/analysis/types";
import { notepadToLyrics, notepadStructureHint } from "@/lib/notepad/parseNotepad";
import type { StudioProject } from "@/lib/project/projectStorage";
import type { InputPhrasePlan, RhymeCandidate } from "@/lib/rhyme/types";
import {
  DEFAULT_SETUP_DRAFT,
  loadSetupDraft,
  saveSetupDraft,
  type SetupDraft,
} from "@/lib/setup-draft";

const NOTEPAD_STORAGE_KEY = "rapper-tool-notepad";

const MOOD_LABELS: Record<string, string> = {
  street: "ストリート",
  emotional: "エモーショナル",
  battle: "バトル",
  mellow: "メロウ",
  business: "ビジネス",
};

const FORMAT_LABELS: Record<string, string> = {
  "4bars": "約4行",
  "8bars": "約8行",
  "16bars": "約16行",
  hook: "約8行",
  punchline: "パンチライン",
};

type LeftPanel = "setup" | "notepad";

function loadNotepadFromStorage(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(NOTEPAD_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function HomePage() {
  const [leftPanel, setLeftPanel] = useState<LeftPanel>("setup");
  const [notepadText, setNotepadText] = useState("");
  const [setupDraft, setSetupDraft] = useState<SetupDraft>(DEFAULT_SETUP_DRAFT);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("lyrics");
  const [mobileView, setMobileView] = useState<MobileView>("setup");
  const [rhymeCandidates, setRhymeCandidates] = useState<
    Record<string, RhymeCandidate[]>
  >({});
  const [inputPlan, setInputPlan] = useState<InputPhrasePlan[]>([]);
  const [generatedLyrics, setGeneratedLyrics] = useState("");
  const [analysis, setAnalysis] = useState<LyricAnalysis | null>(null);
  const [critique, setCritique] = useState<LyricCritique | null>(null);
  const [formData, setFormData] = useState<LyricFormData | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [lyricsDirty, setLyricsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotepadText(loadNotepadFromStorage());
    setSetupDraft(loadSetupDraft());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NOTEPAD_STORAGE_KEY, notepadText);
    } catch {
      // storage full / private mode
    }
  }, [notepadText]);

  useEffect(() => {
    saveSetupDraft(setupDraft);
  }, [setupDraft]);

  const runAnalysis = useCallback(
    async (lyrics: string, data: LyricFormData | null) => {
      if (!lyrics.trim()) {
        setAnalysis(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze-lyrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lyrics,
            inputWords: data?.inputWords ?? [],
            bpm: data?.bpm,
            beatsPerBar: data?.beatsPerBar ?? 4,
            withCritique: false,
          }),
        });

        const result = (await response.json()) as {
          analysis?: LyricAnalysis;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? "分析に失敗しました");
        }

        if (result.analysis) {
          setAnalysis(result.analysis);
          setLyricsDirty(false);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "分析に失敗しました";
        setError(message);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const handleOpenNotepad = useCallback(() => {
    setLeftPanel("notepad");
    setMobileView("setup");
    if (Object.keys(rhymeCandidates).length > 0) {
      setActiveTab("rhymes");
    }
  }, [rhymeCandidates]);

  const handleMobileNav = useCallback(
    (view: MobileView) => {
      setMobileView(view);
      if (view !== "setup") {
        setActiveTab(view);
      }
    },
    [],
  );

  const handleApplyNotepadToLyrics = useCallback(async () => {
    if (!notepadText.trim()) return;
    const lyrics = notepadToLyrics(notepadText);
    setGeneratedLyrics(lyrics);
    setCritique(null);
    setLyricsDirty(true);
    setActiveTab("analysis");
    setMobileView("analysis");
    await runAnalysis(lyrics, formData);
  }, [notepadText, formData, runAnalysis]);

  const handleLyricsChange = useCallback((lyrics: string) => {
    setGeneratedLyrics(lyrics);
    setCritique(null);
    setLyricsDirty(true);
  }, []);

  const handleReanalyze = useCallback(async () => {
    await runAnalysis(generatedLyrics, formData);
  }, [generatedLyrics, formData, runAnalysis]);

  const handleGenerate = async (data: LyricFormData) => {
    setIsLoading(true);
    setError(null);
    setSaveMessage(null);
    setCritique(null);
    setFormData(data);
    setActiveTab("lyrics");
    setMobileView("lyrics");

    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          structureHint: notepadStructureHint(notepadText) ?? undefined,
        }),
      });

      const result = (await response.json()) as {
        generatedLyrics?: string;
        rhymeCandidates?: Record<string, RhymeCandidate[]>;
        inputPlan?: InputPhrasePlan[];
        analysis?: LyricAnalysis;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "歌詞生成に失敗しました");
      }

      setGeneratedLyrics(result.generatedLyrics ?? "");
      setRhymeCandidates(result.rhymeCandidates ?? {});
      setInputPlan(result.inputPlan ?? []);
      setAnalysis(result.analysis ?? null);
      setLyricsDirty(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "エラーが発生しました";
      setError(message);
      setGeneratedLyrics("");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCritique = async () => {
    if (!generatedLyrics || !formData) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyrics: generatedLyrics,
          inputWords: formData.inputWords,
          bpm: formData.bpm,
          beatsPerBar: formData.beatsPerBar,
          withCritique: true,
        }),
      });

      const result = (await response.json()) as {
        analysis?: LyricAnalysis;
        critique?: LyricCritique;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "添削に失敗しました");
      }

      if (result.analysis) {
        setAnalysis(result.analysis);
        setLyricsDirty(false);
      }
      if (result.critique) setCritique(result.critique);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "添削に失敗しました";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!formData || !generatedLyrics) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/save-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputWords: formData.inputWords,
          mood: formData.mood,
          format: formData.format,
          rhymeCandidates,
          generatedLyrics,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "保存に失敗しました");
      }

      setSaveMessage("クラウド保存完了");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "保存に失敗しました";
      setSaveMessage(message.includes("Supabase") ? "ローカル保存は「プロジェクト」から" : message);
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentSnapshot = useCallback(
    (): Omit<StudioProject, "id" | "name" | "createdAt" | "updatedAt"> => ({
      setupDraft,
      formData,
      generatedLyrics,
      rhymeCandidates,
      inputPlan,
      analysis,
      notepadText,
    }),
    [
      setupDraft,
      formData,
      generatedLyrics,
      rhymeCandidates,
      inputPlan,
      analysis,
      notepadText,
    ],
  );

  const handleLoadProject = useCallback((project: StudioProject) => {
    setSetupDraft({
      ...DEFAULT_SETUP_DRAFT,
      ...project.setupDraft,
      words:
        Array.isArray(project.setupDraft?.words) &&
        project.setupDraft.words.length > 0
          ? project.setupDraft.words
          : DEFAULT_SETUP_DRAFT.words,
    });
    setFormData(project.formData);
    setGeneratedLyrics(project.generatedLyrics);
    setRhymeCandidates(project.rhymeCandidates);
    setInputPlan(project.inputPlan);
    setAnalysis(project.analysis);
    setNotepadText(project.notepadText);
    setCritique(null);
    setLyricsDirty(false);
    setError(null);
    setActiveTab(project.generatedLyrics ? "lyrics" : "rhymes");
    setMobileView(project.generatedLyrics ? "lyrics" : "setup");
  }, []);

  const hasLyrics = Boolean(generatedLyrics);
  const hasRhymes = Object.values(rhymeCandidates).some((list) => list.length > 0);

  return (
    <div className="studio-bg h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-md z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="size-7 sm:size-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <Zap className="size-3.5 sm:size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-xl font-bold tracking-wider uppercase leading-none truncate">
                Rapper Tool
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5 hidden sm:block">
                Lyric Studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formData && (
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 uppercase tracking-wide">
                  {MOOD_LABELS[formData.mood] ?? formData.mood}
                </span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  {FORMAT_LABELS[formData.format] ?? formData.format}
                </span>
                {formData.bpm && (
                  <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                    {formData.bpm} BPM
                  </span>
                )}
              </div>
            )}
            <ProjectPanel
              onLoad={handleLoadProject}
              getCurrentSnapshot={getCurrentSnapshot}
              currentProjectId={currentProjectId}
              onProjectIdChange={setCurrentProjectId}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col xl:flex-row min-h-0 overflow-hidden">
        <aside
          className={`studio-scrollbar shrink-0 xl:w-[340px] xl:border-r border-white/10 xl:overflow-y-auto xl:max-h-[calc(100dvh-3.5rem)] xl:sticky xl:top-14 p-3 sm:p-6 min-h-0 overflow-y-auto ${
            mobileView === "setup" ? "flex-1 flex flex-col" : "hidden xl:block"
          }`}
        >
          {leftPanel === "setup" ? (
            <LyricForm
              draft={setupDraft}
              onDraftChange={setSetupDraft}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              onOpenNotepad={handleOpenNotepad}
            />
          ) : (
            <LyricNotepad
              value={notepadText}
              onChange={setNotepadText}
              onBack={() => setLeftPanel("setup")}
              onApplyToLyrics={handleApplyNotepadToLyrics}
              hasRhymes={hasRhymes}
              isApplying={isAnalyzing}
            />
          )}
        </aside>

        <main
          className={`flex-1 flex flex-col min-h-0 min-w-0 p-3 sm:p-6 pt-2 sm:pt-6 xl:max-h-[calc(100dvh-3.5rem)] overflow-hidden ${
            mobileView !== "setup" ? "flex" : "hidden xl:flex"
          }`}
        >
          {error && (
            <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
              <AlertCircle className="size-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-3 sm:mb-4 shrink-0 hidden xl:block">
            <WorkspaceTabs
              active={activeTab}
              onChange={setActiveTab}
              hasLyrics={hasLyrics}
              densityScore={analysis?.density.overall}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto studio-scrollbar">
            {activeTab === "lyrics" && (
              <GeneratedLyrics
                lyrics={generatedLyrics}
                analysisLines={!lyricsDirty ? analysis?.lines : undefined}
                showReadings={!lyricsDirty}
                onChange={handleLyricsChange}
                onReanalyze={handleReanalyze}
                isReanalyzing={isAnalyzing}
                isDirty={lyricsDirty}
                onSave={handleSave}
                isSaving={isSaving}
                saveMessage={saveMessage}
                isLoading={isLoading}
              />
            )}
            {activeTab === "rhymes" && (
              <RhymeResults
                rhymeCandidates={rhymeCandidates}
                inputPlan={inputPlan}
                isLoading={isLoading}
                allowArchaicRhymes={setupDraft.allowArchaicRhymes}
              />
            )}
            {activeTab === "analysis" && (
              <LyricAnalysisPanel
                analysis={analysis}
                critique={critique}
                inputWords={formData?.inputWords ?? setupDraft.words.filter(Boolean)}
                isAnalyzing={isAnalyzing}
                onRequestCritique={handleRequestCritique}
              />
            )}
          </div>
        </main>
      </div>

      <MobileNav
        active={mobileView}
        onChange={handleMobileNav}
        hasLyrics={hasLyrics}
      />
    </div>
  );
}

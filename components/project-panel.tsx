"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Save, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteProject,
  listProjects,
  loadProject,
  saveProject,
  type StudioProject,
} from "@/lib/project/projectStorage";

type Props = {
  onLoad: (project: StudioProject) => void;
  getCurrentSnapshot: () => Omit<
    StudioProject,
    "id" | "name" | "createdAt" | "updatedAt"
  >;
  currentProjectId?: string | null;
  onProjectIdChange?: (id: string | null) => void;
};

export function ProjectPanel({
  onLoad,
  getCurrentSnapshot,
  currentProjectId,
  onProjectIdChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => setProjects(listProjects());

  const handleOpen = () => {
    refresh();
    setOpen((v) => !v);
    setMessage(null);
  };

  const handleSave = () => {
    const snapshot = getCurrentSnapshot();
    if (!snapshot.generatedLyrics.trim() && !snapshot.setupDraft.words.some((w) => w.trim())) {
      setMessage("保存する内容がありません");
      return;
    }
    const saved = saveProject({
      id: currentProjectId ?? undefined,
      name: name.trim(),
      ...snapshot,
    });
    onProjectIdChange?.(saved.id);
    setName(saved.name);
    refresh();
    setMessage("保存しました（このブラウザ内）");
  };

  const handleLoad = (id: string) => {
    const project = loadProject(id);
    if (!project) return;
    onLoad(project);
    onProjectIdChange?.(project.id);
    setName(project.name);
    setMessage(`「${project.name}」を読み込みました`);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    if (currentProjectId === id) onProjectIdChange?.(null);
    refresh();
    setMessage("削除しました");
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="border-white/10 bg-white/5 hover:bg-white/10 text-xs h-8 gap-1.5"
      >
        <FolderOpen className="size-3.5" />
        プロジェクト
        <ChevronDown className="size-3 opacity-60" />
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            aria-label="閉じる"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-3 right-3 top-[calc(3.5rem+env(safe-area-inset-top))] z-50 max-h-[min(70dvh,520px)] overflow-y-auto studio-scrollbar rounded-xl border border-white/10 bg-popover shadow-xl p-4 space-y-3 xl:absolute xl:left-auto xl:right-0 xl:top-full xl:mt-2 xl:w-72 xl:max-h-none">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              歌詞・韻候補・セットアップをまとめて保存（ローカル）
            </p>
            <Input
              placeholder="プロジェクト名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs bg-black/30 border-white/10"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="w-full h-8 text-xs gap-1.5"
            >
              <Save className="size-3.5" />
              現在のページを保存
            </Button>
          </div>

          {projects.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto studio-scrollbar">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-1">
                保存済み
              </p>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1 rounded-lg hover:bg-white/5 px-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => handleLoad(p.id)}
                    className="flex-1 text-left text-xs truncate"
                  >
                    {p.name}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(p.id)}
                    aria-label="削除"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {message && (
            <p className="text-[10px] text-primary px-1">{message}</p>
          )}
          <p className="text-[10px] text-muted-foreground/70 px-1 leading-relaxed">
            ※ Googleログイン連携は今後対応予定
          </p>
          </div>
        </>
      )}
    </div>
  );
}

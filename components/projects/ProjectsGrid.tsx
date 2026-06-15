"use client";

import { useState } from "react";
import { Search, Grid3X3, List, Trash2, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { Project } from "@/lib/types";

interface ProjectsGridProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  viewMode: "grid" | "list";
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onProjectClick: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => Promise<void> | void;
}

const CARD_STYLES = [
  { bg: "bg-slate-100 dark:bg-slate-800/60", icon: "bg-slate-200 dark:bg-slate-700", emoji: "📘" },
  { bg: "bg-stone-100 dark:bg-stone-800/60", icon: "bg-stone-200 dark:bg-stone-700", emoji: "📗" },
  { bg: "bg-zinc-100 dark:bg-zinc-800/60", icon: "bg-zinc-200 dark:bg-zinc-700", emoji: "📙" },
  { bg: "bg-neutral-100 dark:bg-neutral-800/60", icon: "bg-neutral-200 dark:bg-neutral-700", emoji: "📔" },
  { bg: "bg-gray-100 dark:bg-gray-800/60", icon: "bg-gray-200 dark:bg-gray-700", emoji: "📕" },
  { bg: "bg-slate-100 dark:bg-slate-800/60", icon: "bg-slate-200 dark:bg-slate-700", emoji: "📓" },
];

function getCardStyle(index: number) {
  return CARD_STYLES[index % CARD_STYLES.length];
}

export function ProjectsGrid({
  projects,
  loading,
  error,
  searchQuery,
  viewMode,
  onSearchChange,
  onViewModeChange,
  onProjectClick,
  onCreateProject,
  onDeleteProject,
}: ProjectsGridProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      setIsDeleting(true);
      await onDeleteProject(deleteConfirmId);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Delete project?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5 ml-12">
              This action cannot be undone. The project and all of its data will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs text-destructive-foreground bg-destructive/80 hover:bg-destructive rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
              >
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">My projects</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex items-center bg-muted border border-border rounded-lg p-1 gap-0.5">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-1.5 rounded transition-colors ${viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-1.5 rounded transition-colors ${viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-5">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
            <span className="text-destructive text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-7">
        {projects.length === 0 ? (
          <div className="text-center py-24">
            {searchQuery ? (
              <div className="max-w-xs mx-auto">
                <div className="w-14 h-14 bg-muted rounded-2xl mx-auto mb-5 flex items-center justify-center">
                  <Search size={20} className="text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground text-sm mb-5">Try different search terms</p>
                <button
                  onClick={() => onSearchChange("")}
                  className="text-sm text-foreground underline underline-offset-4"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="max-w-xs mx-auto">
                <div className="text-5xl mb-5">📚</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Create your first project
                </h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Organise your documents and start chatting with your AI study companion.
                </p>
                <button
                  onClick={onCreateProject}
                  className="bg-foreground hover:bg-foreground/90 text-background px-5 py-2.5 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={14} />
                  Create project
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent projects
            </h2>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Create new card */}
                <button
                  onClick={onCreateProject}
                  className="group h-[180px] border-2 border-dashed border-border hover:border-foreground/30 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:bg-muted/40 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-muted/80 flex items-center justify-center transition-colors">
                    <Plus size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                    Create new notebook
                  </span>
                </button>

                {projects.map((project, index) => {
                  const style = getCardStyle(index);
                  return (
                    <div
                      key={project.id}
                      onClick={() => onProjectClick(project.id)}
                      className={`group relative h-[180px] ${style.bg} rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm`}
                    >
                      <div className={`w-11 h-11 ${style.icon} rounded-xl mb-4 flex items-center justify-center text-xl`}>
                        {style.emoji}
                      </div>
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug mb-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }}
                        className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                {projects.map((project, index) => {
                  const style = getCardStyle(index);
                  return (
                    <div
                      key={project.id}
                      onClick={() => onProjectClick(project.id)}
                      className="group flex items-center gap-4 bg-card hover:bg-muted border border-border rounded-xl p-4 cursor-pointer transition-all"
                    >
                      <div className={`w-9 h-9 ${style.icon} rounded-lg flex items-center justify-center text-base flex-shrink-0`}>
                        {style.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">{project.name}</h3>
                        {project.description && (
                          <p className="text-muted-foreground text-xs truncate mt-0.5">{project.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
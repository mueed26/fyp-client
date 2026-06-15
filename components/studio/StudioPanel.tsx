"use client";

import {
    FileText,
    Sparkles,
    GitBranch,
    Loader2,
    Layers,
    ClipboardList,
    Star,
    Trash2,
    Check,
} from "lucide-react";
import { ProjectDocument, GeneratedSource } from "@/lib/types";

// NOTE: feature `type` values stay as the backend expects (practice_questions).
// Only the user-facing label changes ("Quizzes").
const FEATURE_BUTTONS = [
    {
        type: "summary",
        label: "Summary",
        icon: FileText,
        className:
            "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
    },
    {
        type: "flashcards",
        label: "Flashcards",
        icon: Layers,
        className:
            "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
    },
    {
        type: "practice_questions",
        label: "Quizzes",
        icon: ClipboardList,
        className:
            "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
    },
    {
        type: "mind_map",
        label: "Mind Map",
        icon: GitBranch,
        className:
            "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20",
    },
];

function getSourceIcon(sourceType: string) {
    switch (sourceType) {
        case "summary": return <FileText size={13} className="text-blue-500" />;
        case "flashcards": return <Layers size={13} className="text-green-500" />;
        case "practice_questions": return <ClipboardList size={13} className="text-purple-500" />;
        case "mind_map": return <GitBranch size={13} className="text-orange-500" />;
        default: return <FileText size={13} className="text-muted-foreground" />;
    }
}

// "practice_questions" -> "Quiz" on the frontend; everything else title-cased.
function formatSourceType(type: string) {
    if (type === "practice_questions") return "Quiz";
    return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface StudioPanelProps {
    projectDocuments: ProjectDocument[];
    selectedDocIds: string[];
    onToggleDocSelection: (docId: string) => void;
    onSelectAllDocs: () => void;
    onDeselectAllDocs: () => void;
    generatedSources: GeneratedSource[];
    onGenerateFeature: (docIds: string[], featureType: string) => Promise<void>;
    onMergeFeature: (docIds: string[], sourceType: string) => Promise<void>;
    onViewSource: (source: GeneratedSource) => void;
    onTagDocument: (docId: string, tag: string) => Promise<void>;
    isGenerating: boolean;
    generatingType: string | null;
    onDeleteSource: (sourceId: string) => void;
}

// Clearly visible checkbox that works on dark + light themes.
function Checkbox({ checked }: { checked: boolean }) {
    return (
        <div
            className={`w-4 h-4 rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-all ${checked
                    ? "bg-primary border-primary"
                    : "bg-muted border-muted-foreground/50 hover:border-muted-foreground"
                }`}
        >
            {checked && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
        </div>
    );
}

export function StudioPanel({
    projectDocuments,
    selectedDocIds,
    onToggleDocSelection,
    onSelectAllDocs,
    onDeselectAllDocs,
    generatedSources,
    onGenerateFeature,
    onMergeFeature,
    onViewSource,
    onTagDocument,
    isGenerating,
    generatingType,
    onDeleteSource,
}: StudioPanelProps) {
    const completedDocs = projectDocuments.filter(
        (doc) => doc.processing_status === "completed"
    );
    const allSelected =
        completedDocs.length > 0 &&
        completedDocs.every((doc) => selectedDocIds.includes(doc.id));

    const hasPastYear = completedDocs.some(
        (doc) =>
            selectedDocIds.includes(doc.id) &&
            (doc as any).source_tag === "past_year_paper"
    );

    const handleGenerate = async (featureType: string) => {
        if (selectedDocIds.length === 0) return;
        await onGenerateFeature(selectedDocIds, featureType);
        await onMergeFeature(selectedDocIds, featureType);
    };

    return (
        <div className="p-4 space-y-5 h-full overflow-y-auto bg-card">

            {/* Source Selection */}
            <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Select sources
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {selectedDocIds.length}/{completedDocs.length}
                    </span>
                </div>

                {completedDocs.length === 0 ? (
                    <div className="text-center py-6">
                        <FileText size={16} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No processed documents yet</p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        <button
                            onClick={allSelected ? onDeselectAllDocs : onSelectAllDocs}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Checkbox checked={allSelected} />
                            <span className="text-xs text-muted-foreground">
                                {allSelected ? "Deselect all" : "Select all"}
                            </span>
                        </button>

                        {completedDocs.map((doc) => {
                            const isSelected = selectedDocIds.includes(doc.id);
                            const isPastYear = (doc as any).source_tag === "past_year_paper";
                            return (
                                <div
                                    key={doc.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${isSelected ? "bg-muted" : "hover:bg-muted/60"
                                        }`}
                                    onClick={() => onToggleDocSelection(doc.id)}
                                >
                                    <Checkbox checked={isSelected} />
                                    <FileText size={12} className="text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-foreground truncate flex-1">
                                        {doc.filename}
                                    </span>
                                    <select
                                        value={(doc as any).source_tag || "lecture_notes"}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onTagDocument(doc.id, e.target.value);
                                        }}
                                        className={`text-xs px-1.5 py-1 rounded-lg border bg-background cursor-pointer flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring/40 ${isPastYear
                                                ? "border-destructive/40 text-destructive"
                                                : "border-border text-muted-foreground"
                                            }`}
                                    >
                                        <option value="lecture_notes">Notes</option>
                                        <option value="past_year_paper">Past Year</option>
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasPastYear && (
                    <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <Star size={12} className="text-destructive flex-shrink-0" />
                        <span className="text-xs text-destructive leading-tight">
                            Past year selected — exam-aware generation enabled
                        </span>
                    </div>
                )}
            </section>

            <hr className="border-border" />

            {/* Generate */}
            <section className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Generate
                </h3>

                {selectedDocIds.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                        Select sources above to generate
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {FEATURE_BUTTONS.map((btn) => {
                            const Icon = btn.icon;
                            const isCurrentlyGenerating = isGenerating && generatingType === btn.type;
                            return (
                                <button
                                    key={btn.type}
                                    onClick={() => handleGenerate(btn.type)}
                                    disabled={isGenerating}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-colors text-xs font-medium ${btn.className} ${isGenerating ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                        }`}
                                >
                                    {isCurrentlyGenerating ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Icon size={15} />
                                    )}
                                    {isCurrentlyGenerating ? "Generating…" : btn.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            <hr className="border-border" />

            {/* Generated Sources */}
            <section className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Generated
                    </h3>
                    {generatedSources.length > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {generatedSources.length}
                        </span>
                    )}
                </div>

                {generatedSources.length === 0 ? (
                    <div className="text-center py-6">
                        <Sparkles size={16} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Nothing generated yet</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {generatedSources.map((source) => (
                            <div
                                key={source.id}
                                onClick={() => onViewSource(source)}
                                className="w-full flex items-center gap-2.5 p-2.5 bg-muted/60 hover:bg-muted border border-border hover:border-border/80 rounded-xl transition-colors text-left group cursor-pointer"
                            >
                                <div className="w-7 h-7 bg-background border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                                    {getSourceIcon(source.source_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {source.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatSourceType(source.source_type)} · {source.total_sources} src
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSource(source.id);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                    title="Delete"
                                >
                                    <Trash2 size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
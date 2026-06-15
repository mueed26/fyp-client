"use client";

import { Sparkles, Settings, Info, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { ProjectDocument, GeneratedSource, ProjectSettings } from "@/lib/types";
import { useState } from "react";
import { StudioPanel } from "@/components/studio/StudioPanel";

const STRATEGY_OPTIONS = [
    { value: "basic", label: "Vector Search", description: "Semantic similarity matching" },
    { value: "hybrid", label: "Hybrid Search", description: "Semantic + keyword matching" },
    { value: "multi-query-vector", label: "Multi-Query Vector", description: "Multiple semantic queries" },
    { value: "multi-query-hybrid", label: "Multi-Query Hybrid", description: "Multiple hybrid queries" },
];

const AGENT_MODE_OPTIONS = [
    { value: "simple", label: "Simple RAG", description: "Documents-only search" },
    { value: "agentic", label: "Agentic RAG", description: "Smart tool selection with web search" },
];

const RERANKING_MODELS = [{ value: "rerank-english-v3.0", label: "rerank-english-v3.0" }];
const EMBEDDING_MODELS = [{ value: "text-embedding-3-large", label: "text-embedding-3-large" }];

function SliderField({ label, value, min, max, step = 1, onChange, disabled, info }: {
    label: string; value: number; min: number; max: number; step?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled: boolean; info?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground">{label}</label>
                <span className="text-xs font-medium text-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
                    {value}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={onChange} disabled={disabled}
                className="w-full h-1 rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-foreground"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{min}</span><span>{max}</span>
            </div>
            {info && <p className="text-xs text-muted-foreground mt-0.5">{info}</p>}
        </div>
    );
}

interface RightPanelProps {
    projectId: string;
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
    onDeleteSource: (sourceId: string) => Promise<void>;
    isGenerating: boolean;
    generatingType: string | null;
    projectSettings: ProjectSettings | null;
    settingsError: string | null;
    settingsLoading: boolean;
    onUpdateSettings: (updates: Partial<ProjectSettings>) => void;
    onApplySettings: () => void;
}

type Tab = "studio" | "settings";

// Helper to get a human-readable label for source type
function getSourceTypeLabel(sourceType: string) {
    const labels: Record<string, string> = {
        summary: "Summary",
        faq: "FAQ",
        study_guide: "Study Guide",
        briefing_doc: "Briefing Doc",
        mind_map: "Mind Map",
        flashcards: "Flashcards",
        practice_questions: "Practice Questions",
    };
    return labels[sourceType] ?? sourceType.replace(/_/g, " ");
}

export function RightPanel({
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
    onDeleteSource,
    isGenerating,
    generatingType,
    projectSettings,
    settingsError,
    settingsLoading,
    onUpdateSettings,
    onApplySettings,
}: RightPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>("studio");

    // Delete modal state for generated studio sources
    const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);
    const [isDeletingSource, setIsDeletingSource] = useState(false);

    const handleDeleteSource = async () => {
        if (!deleteSourceId) return;
        try {
            setIsDeletingSource(true);
            await onDeleteSource(deleteSourceId);
        } finally {
            setIsDeletingSource(false);
            setDeleteSourceId(null);
        }
    };

    const pendingSource = deleteSourceId
        ? generatedSources.find((s) => s.id === deleteSourceId)
        : null;

    const isMultiQuery = projectSettings?.rag_strategy?.includes("multi-query");
    const isHybrid = projectSettings?.rag_strategy?.includes("hybrid");
    const isEmbeddingLocked = projectDocuments.length > 0;

    const getPerformanceMetrics = () => {
        if (!projectSettings) return { totalChunks: 0, latency: 0 };
        const latencyMap: Record<string, number> = {
            basic: 400, hybrid: 600,
            "multi-query-vector": 800, "multi-query-hybrid": 1000,
        };
        const isMulti = projectSettings.rag_strategy.includes("multi-query");
        const totalChunks = projectSettings.chunks_per_search * (isMulti ? projectSettings.number_of_queries : 1);
        const latency =
            (latencyMap[projectSettings.rag_strategy] ?? 400) +
            (isMulti ? projectSettings.number_of_queries * 200 : 0) +
            (projectSettings.reranking_enabled ? 200 : 0);
        return { totalChunks, latency };
    };

    const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
        { id: "studio", label: "Studio", icon: Sparkles },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    // Wrap onDeleteSource to intercept and show modal instead
    const handleDeleteSourceRequest = (sourceId: string) => {
        setDeleteSourceId(sourceId);
    };

    return (
        <div className="w-80 flex-shrink-0 bg-card border-l border-border flex flex-col h-full">

            {/* DELETE STUDIO SOURCE CONFIRMATION MODAL */}
            {deleteSourceId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={16} className="text-destructive" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Delete generated source?</h3>
                        </div>
                        {pendingSource && (
                            <>
                                <p className="text-xs font-medium text-foreground/70 mb-0.5 ml-12 truncate">
                                    {pendingSource.title}
                                </p>
                                <p className="text-xs text-muted-foreground mb-1 ml-12">
                                    {getSourceTypeLabel(pendingSource.source_type)}
                                </p>
                            </>
                        )}
                        <p className="text-xs text-muted-foreground mb-5 ml-12">
                            This action cannot be undone. The generated content will be permanently deleted.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeleteSourceId(null)}
                                disabled={isDeletingSource}
                                className="px-4 py-2 text-xs text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors disabled:opacity-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSource}
                                disabled={isDeletingSource}
                                className="px-4 py-2 text-xs text-destructive-foreground bg-destructive/80 hover:bg-destructive rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
                            >
                                {isDeletingSource ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab bar */}
            <div className="flex border-b border-border flex-shrink-0">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${activeTab === id
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Icon size={13} />
                        {label}
                        {id === "studio" && generatedSources.length > 0 && (
                            <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">
                                {generatedSources.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">

                {activeTab === "studio" && (
                    <StudioPanel
                        projectDocuments={projectDocuments}
                        selectedDocIds={selectedDocIds}
                        onToggleDocSelection={onToggleDocSelection}
                        onSelectAllDocs={onSelectAllDocs}
                        onDeselectAllDocs={onDeselectAllDocs}
                        generatedSources={generatedSources}
                        onGenerateFeature={onGenerateFeature}
                        onMergeFeature={onMergeFeature}
                        onViewSource={onViewSource}
                        onTagDocument={onTagDocument}
                        onDeleteSource={handleDeleteSourceRequest}
                        isGenerating={isGenerating}
                        generatingType={generatingType}
                    />
                )}

                {activeTab === "settings" && (
                    <div className="h-full overflow-y-auto p-4 space-y-6">

                        {settingsError && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2">
                                <Info size={13} className="text-destructive flex-shrink-0" />
                                <span className="text-xs text-destructive">{settingsError}</span>
                            </div>
                        )}

                        {settingsLoading && (
                            <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2">
                                <Loader2 size={13} className="text-muted-foreground animate-spin flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">Applying settings...</span>
                            </div>
                        )}

                        {!projectSettings ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="text-sm">Loading settings...</span>
                                </div>
                            </div>
                        ) : (
                            <div className={`space-y-6 ${settingsLoading ? "opacity-50 pointer-events-none" : ""}`}>

                                {/* Embedding model */}
                                <section className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                            Embedding Model
                                        </h3>
                                        <div
                                            className="w-4 h-4 bg-destructive/10 border border-destructive/30 rounded-full flex items-center justify-center flex-shrink-0"
                                            title={isEmbeddingLocked ? "Locked — documents already uploaded" : "Locks after first upload"}
                                        >
                                            <Info size={9} className="text-destructive" />
                                        </div>
                                    </div>
                                    <select
                                        value={projectSettings.embedding_model}
                                        onChange={(e) => onUpdateSettings({ embedding_model: e.target.value })}
                                        disabled={isEmbeddingLocked || settingsLoading}
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-all"
                                    >
                                        {EMBEDDING_MODELS.map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-destructive/80">
                                        {isEmbeddingLocked
                                            ? "Locked — documents already uploaded"
                                            : "Locks after first document upload"}
                                    </p>
                                </section>

                                <hr className="border-border" />

                                {/* Search strategy */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                        Search Strategy
                                    </h3>
                                    <div className="space-y-1.5">
                                        {STRATEGY_OPTIONS.map((s) => (
                                            <label
                                                key={s.value}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${projectSettings.rag_strategy === s.value
                                                    ? "border-foreground/30 bg-secondary"
                                                    : "border-border bg-muted/40 hover:bg-muted"
                                                    }`}
                                            >
                                                <input
                                                    type="radio" name="ragStrategy" value={s.value}
                                                    checked={projectSettings.rag_strategy === s.value}
                                                    onChange={(e) => onUpdateSettings({ rag_strategy: e.target.value })}
                                                    disabled={settingsLoading}
                                                    className="w-3.5 h-3.5 accent-foreground flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-foreground">{s.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </section>

                                <hr className="border-border" />

                                {/* Search parameters */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                        Search Parameters
                                    </h3>
                                    <SliderField
                                        label="Chunks per search"
                                        value={projectSettings.chunks_per_search} min={5} max={30}
                                        onChange={(e) => onUpdateSettings({ chunks_per_search: parseInt(e.target.value) })}
                                        disabled={settingsLoading}
                                    />
                                    <SliderField
                                        label="Final context size"
                                        value={projectSettings.final_context_size} min={3} max={10}
                                        onChange={(e) => onUpdateSettings({ final_context_size: parseInt(e.target.value) })}
                                        disabled={settingsLoading}
                                    />
                                    <SliderField
                                        label="Similarity threshold"
                                        value={projectSettings.similarity_threshold} min={0.1} max={0.9} step={0.1}
                                        onChange={(e) => onUpdateSettings({ similarity_threshold: parseFloat(e.target.value) })}
                                        disabled={settingsLoading}
                                    />
                                    {isMultiQuery && (
                                        <SliderField
                                            label="Number of queries"
                                            value={projectSettings.number_of_queries} min={3} max={7}
                                            onChange={(e) => onUpdateSettings({ number_of_queries: parseInt(e.target.value) })}
                                            disabled={settingsLoading}
                                        />
                                    )}
                                </section>

                                {isHybrid && (
                                    <>
                                        <hr className="border-border" />
                                        <section className="space-y-4">
                                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                                Search Weights
                                            </h3>
                                            <SliderField
                                                label="Vector weight"
                                                value={projectSettings.vector_weight} min={0.1} max={0.9} step={0.1}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value);
                                                    onUpdateSettings({
                                                        vector_weight: v,
                                                        keyword_weight: parseFloat((1 - v).toFixed(1)),
                                                    });
                                                }}
                                                disabled={settingsLoading}
                                                info={`Keyword weight: ${projectSettings.keyword_weight.toFixed(1)} (auto-calculated)`}
                                            />
                                        </section>
                                    </>
                                )}

                                <hr className="border-border" />

                                {/* Reranking */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                        Reranking
                                    </h3>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={projectSettings.reranking_enabled}
                                            onChange={(e) => onUpdateSettings({ reranking_enabled: e.target.checked })}
                                            disabled={settingsLoading}
                                            className="w-3.5 h-3.5 rounded accent-foreground"
                                        />
                                        <span className="text-xs text-foreground">Enable reranking</span>
                                    </label>
                                    {projectSettings.reranking_enabled && (
                                        <select
                                            value={projectSettings.reranking_model}
                                            onChange={(e) => onUpdateSettings({ reranking_model: e.target.value })}
                                            disabled={settingsLoading}
                                            className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-all"
                                        >
                                            {RERANKING_MODELS.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    )}
                                </section>

                                <hr className="border-border" />

                                {/* Agent mode */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                        Agent Mode
                                    </h3>
                                    <div className="space-y-1.5">
                                        {AGENT_MODE_OPTIONS.map((m) => (
                                            <label
                                                key={m.value}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${projectSettings.agent_type === m.value
                                                    ? "border-foreground/30 bg-secondary"
                                                    : "border-border bg-muted/40 hover:bg-muted"
                                                    }`}
                                            >
                                                <input
                                                    type="radio" name="agentMode" value={m.value}
                                                    checked={projectSettings.agent_type === m.value}
                                                    onChange={(e) => onUpdateSettings({ agent_type: e.target.value })}
                                                    disabled={settingsLoading}
                                                    className="w-3.5 h-3.5 accent-foreground flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-foreground">{m.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </section>

                                <hr className="border-border" />

                                {/* Performance impact */}
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                        Performance Impact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted border border-border rounded-xl p-3 text-center">
                                            <p className="text-base font-semibold text-foreground">
                                                ~{getPerformanceMetrics().totalChunks}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Total chunks</p>
                                        </div>
                                        <div className="bg-muted border border-border rounded-xl p-3 text-center">
                                            <p className="text-base font-semibold text-foreground">
                                                ~{getPerformanceMetrics().latency}ms
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Est. latency</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Apply */}
                                <button
                                    onClick={onApplySettings}
                                    disabled={settingsLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background py-2.5 rounded-xl text-sm font-medium transition-colors"
                                >
                                    {settingsLoading
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Settings size={14} />
                                    }
                                    {settingsLoading ? "Applying..." : "Apply Settings"}
                                </button>

                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
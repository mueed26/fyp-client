"use client";

import { useState } from "react";
import {
    FileText,
    Sparkles,
    GitBranch,
    Loader2,
    Layers,
    ClipboardList,
    Star,
    Tag,
    Trash2,
} from "lucide-react";
import { ProjectDocument, GeneratedSource } from "@/lib/types";

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
    onDeleteSource: (sourceId: string) => Promise<void>;
}

const FEATURE_BUTTONS = [
    {
        type: "summary",
        label: "Summary",
        icon: FileText,
        color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        hoverColor: "hover:bg-blue-500/20",
    },
    {
        type: "flashcards",
        label: "Flashcards",
        icon: Layers,
        color: "bg-green-500/10 border-green-500/20 text-green-400",
        hoverColor: "hover:bg-green-500/20",
    },
    {
        type: "practice_questions",
        label: "Practice Questions",
        icon: ClipboardList,
        color: "bg-purple-500/10 border-purple-500/20 text-purple-400",
        hoverColor: "hover:bg-purple-500/20",
    },
    {
        type: "mind_map",
        label: "Mind Map",
        icon: GitBranch,
        color: "bg-orange-500/10 border-orange-500/20 text-orange-400",
        hoverColor: "hover:bg-orange-500/20",
    },
];

function getSourceIcon(sourceType: string) {
    switch (sourceType) {
        case "summary":
            return <FileText size={14} className="text-blue-400" />;
        case "flashcards":
            return <Layers size={14} className="text-green-400" />;
        case "practice_questions":
            return <ClipboardList size={14} className="text-purple-400" />;
        case "mind_map":
            return <GitBranch size={14} className="text-orange-400" />;
        default:
            return <FileText size={14} className="text-gray-400" />;
    }
}

function formatSourceType(type: string) {
    return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
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

        // Step 1: Generate features
        await onGenerateFeature(selectedDocIds, featureType);

        // Step 2: Merge into a generated source
        await onMergeFeature(selectedDocIds, featureType);
    };

    function onDeleteSource(id: string) {
        throw new Error("Function not implemented.");
    }

    return (
        <div className="p-6 space-y-6 bg-[#1a1a1a] text-white h-full overflow-y-auto">
            {/* Source Selection */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-200">Select Sources</h3>
                    <span className="text-xs text-gray-400 bg-[#252525] px-2 py-1 rounded">
                        {selectedDocIds.length}/{completedDocs.length}
                    </span>
                </div>

                {completedDocs.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 bg-[#252525] border border-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                            <FileText size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">No processed documents</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Upload and process documents first
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Select All */}
                        <button
                            onClick={allSelected ? onDeselectAllDocs : onSelectAllDocs}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors text-sm"
                        >
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allSelected
                                    ? "bg-white border-white"
                                    : "border-gray-600 hover:border-gray-500"
                                    }`}
                            >
                                {allSelected && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path
                                            d="M1 4L3.5 6.5L9 1"
                                            stroke="#000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </div>
                            <span className="text-gray-300">Select all sources</span>
                        </button>

                        {/* Document List with Tag */}
                        {completedDocs.map((doc) => {
                            const isSelected = selectedDocIds.includes(doc.id);
                            const isPastYear = (doc as any).source_tag === "past_year_paper";

                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#252525] transition-colors"
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => onToggleDocSelection(doc.id)}
                                        className="flex-shrink-0"
                                    >
                                        <div
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                                ? "bg-white border-white"
                                                : "border-gray-600 hover:border-gray-500"
                                                }`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    width="10"
                                                    height="8"
                                                    viewBox="0 0 10 8"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M1 4L3.5 6.5L9 1"
                                                        stroke="#000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>

                                    {/* Doc info */}
                                    <FileText
                                        size={14}
                                        className="text-gray-400 flex-shrink-0"
                                    />
                                    <span className="text-sm text-gray-300 truncate flex-1">
                                        {doc.filename}
                                    </span>

                                    {/* Tag dropdown */}
                                    <select
                                        value={(doc as any).source_tag || "lecture_notes"}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onTagDocument(doc.id, e.target.value);
                                        }}
                                        className={`text-xs px-1.5 py-0.5 rounded border bg-transparent cursor-pointer flex-shrink-0 ${isPastYear
                                            ? "border-amber-500/30 text-amber-400"
                                            : "border-gray-700 text-gray-400"
                                            }`}
                                    >
                                        <option value="lecture_notes" className="bg-[#1a1a1a]">
                                            Notes
                                        </option>
                                        <option value="past_year_paper" className="bg-[#1a1a1a]">
                                            Past Year
                                        </option>
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Past year info */}
                {hasPastYear && (
                    <div className="flex items-center gap-2 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                        <Star size={12} className="text-amber-400" />
                        <span className="text-xs text-amber-300">
                            Past year paper selected — RAG cross-referencing will be used
                        </span>
                    </div>
                )}
            </section>

            <hr className="border-gray-800" />

            {/* Generation Actions */}
            <section className="space-y-4">
                <h3 className="text-sm font-medium text-gray-200">Generate</h3>

                {selectedDocIds.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">
                        Select documents above to generate features
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {FEATURE_BUTTONS.map((btn) => {
                            const Icon = btn.icon;
                            const isCurrentlyGenerating =
                                isGenerating && generatingType === btn.type;

                            return (
                                <button
                                    key={btn.type}
                                    onClick={() => handleGenerate(btn.type)}
                                    disabled={isGenerating}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${btn.color
                                        } ${isGenerating
                                            ? "opacity-50 cursor-not-allowed"
                                            : btn.hoverColor + " cursor-pointer"
                                        }`}
                                >
                                    {isCurrentlyGenerating ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Icon size={18} />
                                    )}
                                    <span className="mt-2 text-xs font-medium">
                                        {isCurrentlyGenerating ? "Generating..." : btn.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            <hr className="border-gray-800" />

            {/* Generated Sources */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-200">
                        Generated Sources
                    </h3>
                    {generatedSources.length > 0 && (
                        <span className="text-xs text-gray-400 bg-[#252525] px-2 py-1 rounded">
                            {generatedSources.length}
                        </span>
                    )}
                </div>

                {generatedSources.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 bg-[#252525] border border-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                            <Sparkles size={16} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">No sources generated yet</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Select documents and generate features above
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {generatedSources.map((source) => (
                            <button
                                key={source.id}
                                onClick={() => onViewSource(source)}
                                className="w-full flex items-center gap-3 p-3 bg-[#202020] hover:bg-[#252525] border border-gray-800 hover:border-gray-700 rounded-lg transition-colors text-left group"
                            >
                                <div className="w-7 h-7 bg-[#252525] border border-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                                    {getSourceIcon(source.source_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 truncate">
                                        {source.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {formatSourceType(source.source_type)} •{" "}
                                        {source.total_sources} source
                                        {source.total_sources !== 1 ? "s" : ""}
                           
                           
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSource(source.id);
                                    }}
                                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                    title="Delete source"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
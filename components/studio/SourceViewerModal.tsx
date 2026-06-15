"use client";

import { X, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { GeneratedSource } from "@/lib/types";

interface SourceViewerModalProps {
    source: GeneratedSource | null;
    onClose: () => void;
}

function formatSourceType(type: string) {
    if (type === "practice_questions") return "Quiz";
    return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * The LLM sometimes returns markdown where every line is indented (because the
 * prompt template was indented). Indented markdown is rendered as a CODE BLOCK,
 * which is why summaries showed up monospaced with grey backgrounds and literal
 * "#" characters. We strip a surrounding code fence and remove the common
 * leading indentation so it renders as real markdown.
 */
function normalizeMarkdown(raw: string): string {
    if (!raw) return "";
    let s = raw.replace(/\r\n/g, "\n");

    // Strip a single surrounding ``` / ```markdown fence if present
    const fence = s.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
    if (fence) s = fence[1];

    // Convert tabs to spaces, then dedent by the smallest common indent
    s = s.replace(/\t/g, "    ");
    const lines = s.split("\n");
    const indents = lines
        .filter((l) => l.trim().length > 0)
        .map((l) => (l.match(/^ */)?.[0].length ?? 0));
    const minIndent = indents.length ? Math.min(...indents) : 0;
    if (minIndent > 0) {
        s = lines.map((l) => l.slice(minIndent)).join("\n");
    }
    return s;
}

export function SourceViewerModal({ source, onClose }: SourceViewerModalProps) {
    if (!source) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const markdown = normalizeMarkdown(source.content);

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleOverlayClick}
        >
            {/*
              🔥 KEY FIXES:
              - h-[90vh] (was max-h-[88vh]) - force fixed height so flex children compute right
              - min-h-[500px] floor for very tall screens
              - max-h-[800px] ceiling so it doesn't get TOO huge on big monitors
              - my-auto centers it vertically
            */}
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden my-auto">

                {/* Header — fixed at top */}
                <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText size={17} className="text-blue-500" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-foreground truncate">{source.title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {formatSourceType(source.source_type)} · {source.total_sources} source
                                {source.total_sources !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/*
                  🔥 CRITICAL FIX:
                  - flex-1 with min-h-0 (otherwise nested flex child won't shrink
                    below its content size — same bug as FlashcardViewer)
                  - overflow-y-auto enables scroll on THIS container, not the modal
                */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                    <div className="max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-xl font-bold text-foreground mt-6 mb-3 first:mt-0">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold text-foreground mt-5 mb-2">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-base font-semibold text-foreground/90 mt-4 mb-2">{children}</h3>
                                ),
                                p: ({ children }) => (
                                    <p className="text-sm text-foreground/80 leading-relaxed mb-3">{children}</p>
                                ),
                                ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-sm text-foreground/80 leading-relaxed">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">
                                        {children}
                                    </a>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-border pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
                                ),
                                code: ({ children }) => (
                                    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                ),
                                hr: () => <hr className="border-border my-4" />,
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-4">
                                        <table className="w-full border-collapse border border-border text-sm">{children}</table>
                                    </div>
                                ),
                                th: ({ children }) => (
                                    <th className="border border-border bg-muted px-3 py-2 text-left text-foreground font-medium">{children}</th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-border px-3 py-2 text-foreground/80">{children}</td>
                                ),
                            }}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Footer — fixed at bottom */}
                <div className="p-4 border-t border-border flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-muted hover:bg-muted/70 border border-border text-foreground rounded-lg transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
"use client";
import "mind-elixir/style.css";
import { useEffect, useRef, useState } from "react";
import { X, GitBranch } from "lucide-react";

interface MindMapViewerModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

export function MindMapViewerModal({ title, content, onClose }: MindMapViewerModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    useEffect(() => {
        if (!containerRef.current || !content) return;

        let mind: any = null;
        let timer: NodeJS.Timeout;

        const initMindMap = async () => {
            try {
                const MindElixir = (await import("mind-elixir")).default;
                timer = setTimeout(() => {
                    if (!containerRef.current) return;
                    // `as any` keeps us safe across mind-elixir versions whose
                    // Options type may or may not include every flag below.
                    mind = new MindElixir({
                        el: containerRef.current,
                        direction: MindElixir.SIDE,
                        draggable: true,
                        editable: false,
                        contextMenu: false,
                        toolBar: false,
                    } as any);
                    const data = JSON.parse(content);
                    mind.init(data);
                    setTimeout(() => {
                        if (mind && mind.toCenter) mind.toCenter();
                    }, 200);
                }, 400);
            } catch (err) {
                console.error("Failed to initialize mind map:", err);
                setError("Failed to render mind map");
            }
        };

        initMindMap();
        return () => {
            clearTimeout(timer);
            if (containerRef.current) containerRef.current.innerHTML = "";
        };
    }, [content]);

    return (
        <>
            {/* Theme the mind-elixir canvas with the app's design tokens so it
                matches light/dark mode instead of hardcoded colours. */}
            <style>{`
                .mind-elixir { background: hsl(var(--background)) !important; }
                me-tpc {
                    background: hsl(var(--muted)) !important;
                    color: hsl(var(--foreground)) !important;
                    border: 1px solid hsl(var(--border)) !important;
                    border-radius: 8px !important;
                    padding: 8px 16px !important;
                    font-size: 13px !important;
                    white-space: nowrap !important;
                }
                me-root > me-tpc {
                    background: hsl(var(--primary)) !important;
                    color: hsl(var(--primary-foreground)) !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    padding: 12px 24px !important;
                    border: none !important;
                }
            `}</style>

            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={handleOverlayClick}
            >
                <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[90vw] h-[85vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <GitBranch size={17} className="text-orange-500" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
                                <p className="text-xs text-muted-foreground">Mind Map · Drag to pan, scroll to zoom</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg flex-shrink-0"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-hidden relative bg-background">
                        {error ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-destructive text-sm">{error}</p>
                            </div>
                        ) : (
                            <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
                        )}
                    </div>

                    {/* Footer */}
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
        </>
    );
}
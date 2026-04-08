"use client";
import "mind-elixir/style.css";
import { useEffect, useRef, useState } from "react";
import { X, GitBranch } from "lucide-react";

interface MindMapViewerModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

export function MindMapViewerModal({
    title,
    content,
    onClose,
}: MindMapViewerModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        if (!containerRef.current || !content) return;

        let mind: any = null;
        let timer: NodeJS.Timeout;

        const initMindMap = async () => {
            try {
                const MindElixir = (await import("mind-elixir")).default;

                // Wait for the container to be fully laid out
                timer = setTimeout(() => {
                    if (!containerRef.current) return;

                    const options = {
                        el: containerRef.current,
                        direction: MindElixir.SIDE,
                        draggable: true,
                        editable: false,
                        contextMenu: false,
                        toolBar: false,
                        nodeMenu: false,
                    };

                    mind = new MindElixir(options);

                    const data = JSON.parse(content);
                    mind.init(data);

                    // Center the map after init
                    setTimeout(() => {
                        if (mind && mind.toCenter) {
                            mind.toCenter();
                        }
                    }, 200);
                }, 500);
            } catch (err) {
                console.error("Failed to initialize mind map:", err);
                setError("Failed to render mind map");
            }
        };

        initMindMap();

        return () => {
            clearTimeout(timer);
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [content]);

    return (
        <>
            <style>{`
        .mind-elixir {
          background: #252525 !important;
        }
        me-tpc {
          background: #333 !important;
          color: #e5e7eb !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-size: 13px !important;
          border: 1px solid #444 !important;
          white-space: nowrap !important;
        }
        me-root > me-tpc {
          background: #3b82f6 !important;
          color: white !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          padding: 12px 24px !important;
          border: none !important;
        }
      `}</style>

            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={handleOverlayClick}
            >
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-[90vw] h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
                                <GitBranch size={18} className="text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-200">{title}</h2>
                                <p className="text-sm text-gray-400">
                                    Mind Map • Drag to pan, scroll to zoom
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-[#252525] rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Mind Map Container */}
                    <div className="flex-1 overflow-hidden relative">
                        {error ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-red-400">{error}</p>
                            </div>
                        ) : (
                            <div
                                ref={containerRef}
                                style={{
                                    height: "100%",
                                    width: "100%",
                                }}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800 flex justify-end flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
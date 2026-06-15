import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

interface DetailInspectorProps {
  selectedChunk: any;
  isProcessingComplete: boolean;
}

export function DetailInspector({ selectedChunk, isProcessingComplete }: DetailInspectorProps) {
  const [detailTab, setDetailTab] = useState<"summary" | "original">("summary");

  useEffect(() => {
    setDetailTab("summary");
  }, [selectedChunk]);

  const hasExtras =
    selectedChunk?.type?.includes("table") || selectedChunk?.type?.includes("image");

  return (
    <div className="w-[40%] bg-[#1a1a1a] border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Detail Inspector
        </h4>
      </div>

      {selectedChunk ? (
        <div className="flex-1 overflow-y-auto">
          {hasExtras && (
            <div className="p-4 border-b border-gray-800">
              <div className="flex gap-1.5">
                {(["summary", "original"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${detailTab === tab
                        ? "bg-white text-black border-white"
                        : "bg-[#252525] text-gray-400 border-gray-700 hover:text-gray-200"
                      }`}
                  >
                    {tab === "summary" ? "Summary" : "Original"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            {detailTab === "summary" && (
              <>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.isArray(selectedChunk.type) &&
                    selectedChunk.type.map((type: string) => (
                      <span
                        key={type}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold border uppercase tracking-wider ${type === "text" ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : type === "image" ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          }`}
                      >
                        {type}
                      </span>
                    ))}
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Content</h5>
                  <div className="text-xs text-gray-300 bg-[#252525] border border-gray-700 p-3 rounded-xl leading-relaxed">
                    {selectedChunk.content}
                  </div>
                </div>
              </>
            )}

            {detailTab === "original" && (
              <>
                {selectedChunk.original_content?.text && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Original Text</h5>
                    <div className="text-xs text-gray-300 bg-[#252525] border border-gray-700 p-3 rounded-xl max-h-40 overflow-y-auto leading-relaxed">
                      {selectedChunk.original_content.text}
                    </div>
                  </div>
                )}
                {selectedChunk.original_content?.tables?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Tables ({selectedChunk.original_content.tables.length})
                    </h5>
                    {selectedChunk.original_content.tables.map((table: string, i: number) => (
                      <div
                        key={i}
                        className="bg-[#252525] border border-gray-700 rounded-xl p-3 overflow-auto max-h-96 mb-2 text-xs text-gray-300"
                        dangerouslySetInnerHTML={{ __html: table || "No table data available" }}
                      />
                    ))}
                  </div>
                )}
                {selectedChunk.original_content?.images?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Images ({selectedChunk.original_content.images.length})
                    </h5>
                    {selectedChunk.original_content.images.map((image: string, i: number) => (
                      <div key={i} className="bg-[#252525] border border-gray-700 rounded-xl p-3 mb-2">
                        <img
                          src={`data:image/jpeg;base64,${image}`}
                          alt={`Document image ${i + 1}`}
                          className="max-w-full h-auto rounded-lg"
                          style={{ maxHeight: "300px" }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#252525] border border-gray-700 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <Eye size={18} className="text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isProcessingComplete
                ? "Select a chunk to inspect details"
                : "Chunks will be available when processing completes"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
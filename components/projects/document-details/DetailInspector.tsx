import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

interface DetailInspectorProps {
  selectedChunk: any;
  isProcessingComplete: boolean;
}

export function DetailInspector({
  selectedChunk,
  isProcessingComplete,
}: DetailInspectorProps) {
  const [detailTab, setDetailTab] = useState<"summary" | "original">("summary");

  // Reset to summary when chunk changes
  useEffect(() => {
    setDetailTab("summary");
  }, [selectedChunk]);

  return (
    <div className="w-[40%] bg-[#1e1e1e] border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h4 className="font-medium text-gray-100">Detail Inspector</h4>
      </div>

      {selectedChunk ? (
        <div className="flex-1 overflow-y-auto">
          {/* Tab Buttons for table and image chunks */}
          {(selectedChunk?.type?.includes("table") ||
            selectedChunk?.type?.includes("image")) && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-1">
                <button
                  onClick={() => setDetailTab("summary")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    detailTab === "summary"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a]"
                  }`}
                >
                  📄 Summary
                </button>
                <button
                  onClick={() => setDetailTab("original")}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    detailTab === "original"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a]"
                  }`}
                >
                  📊 Original
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="p-4">
            {detailTab === "summary" && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {Array.isArray(selectedChunk.type) &&
                    selectedChunk.type.map((type: string) => (
                      <span
                        key={type}
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          type === "text"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : type === "image"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        }`}
                      >
                        {type.toUpperCase()}
                      </span>
                    ))}
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">
                    Content
                  </h5>
                  <div className="text-sm text-gray-400 bg-[#2a2a2a] p-3 rounded-lg border border-gray-600">
                    {selectedChunk.content}
                  </div>
                </div>
              </div>
            )}

            {detailTab === "original" && (
              <div className="space-y-4">
                {/* Display original content */}
                {selectedChunk.original_content?.text && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">
                      Original Text
                    </h5>
                    <div className="text-sm text-gray-400 bg-[#2a2a2a] p-3 rounded-lg border border-gray-600 max-h-40 overflow-y-auto">
                      {selectedChunk.original_content.text}
                    </div>
                  </div>
                )}

                {/* Display tables */}
                {selectedChunk.original_content?.tables &&
                  selectedChunk.original_content.tables.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">
                        Tables ({selectedChunk.original_content.tables.length})
                      </h5>
                      {selectedChunk.original_content.tables.map(
                        (table: string, index: number) => (
                          <div
                            key={index}
                            className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-4 overflow-auto max-h-96 mb-2 text-xs text-gray-300"
                            dangerouslySetInnerHTML={{
                              __html: table || "No table data available",
                            }}
                          />
                        )
                      )}
                    </div>
                  )}

                {/* Display images */}
                {selectedChunk.original_content?.images &&
                  selectedChunk.original_content.images.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">
                        Images ({selectedChunk.original_content.images.length})
                      </h5>
                      {selectedChunk.original_content.images.map(
                        (image: string, index: number) => (
                          <div
                            key={index}
                            className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-4 mb-2"
                          >
                            <img
                              src={`data:image/jpeg;base64,${image}`}
                              alt={`Document image ${index + 1}`}
                              className="max-w-full h-auto rounded"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-[#2a2a2a] border border-gray-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <Eye size={24} className="text-gray-400" />
            </div>
            <p className="text-sm">
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

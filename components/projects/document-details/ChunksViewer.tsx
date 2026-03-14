import { useState } from "react";
import { Search, FileText, Loader2 } from "lucide-react";

interface ChunksViewerProps {
  chunks: any[];
  chunksLoading: boolean;
  selectedChunk: any;
  onSelectChunk: (chunk: any) => void;
}

export function ChunksViewer({
  chunks,
  chunksLoading,
  selectedChunk,
  onSelectChunk,
}: ChunksViewerProps) {
  const [chunksFilter, setChunksFilter] = useState<
    "all" | "text" | "image" | "table"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChunks = chunks.filter((chunk) => {
    const matchesFilter =
      chunksFilter === "all" ||
      (Array.isArray(chunk.type) && chunk.type.includes(chunksFilter));
    const matchesSearch = chunk.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Chunks Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-100">Content Chunks</h3>
          <div className="text-sm text-gray-400">
            {filteredChunks.length} of {chunks.length} chunks
            {chunksLoading && (
              <span className="text-blue-400"> (Loading...)</span>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4">
          <div className="flex gap-2">
            {["all", "text", "image", "table"].map((filter) => (
              <button
                key={filter}
                onClick={() => setChunksFilter(filter as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  chunksFilter === filter
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-[#2a2a2a] text-gray-400 border border-gray-600 hover:bg-[#2e2e2e] hover:text-gray-300"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chunks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-[#2a2a2a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-gray-100 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Chunks List */}
      <div className="flex-1 overflow-y-auto p-6">
        {chunksLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-gray-400">Loading chunks...</span>
            </div>
          </div>
        ) : filteredChunks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No chunks found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                onClick={() => onSelectChunk(chunk)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedChunk?.id === chunk.id
                    ? "border-blue-400/50 bg-blue-500/5"
                    : "border-gray-600 bg-[#2a2a2a] hover:border-gray-500 hover:bg-[#2e2e2e]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {Array.isArray(chunk.type) &&
                      chunk.type.map((type: string) => (
                        <span
                          key={type}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            type === "text"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : type === "image"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          }`}
                        >
                          {type}
                        </span>
                      ))}
                    <span className="text-sm text-gray-400">
                      Page {chunk.page}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {chunk.chars} chars
                  </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

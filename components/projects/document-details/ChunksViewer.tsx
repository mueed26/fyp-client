import { useState } from "react";
import { Search, FileText, Loader2 } from "lucide-react";

interface ChunksViewerProps {
  chunks: any[];
  chunksLoading: boolean;
  selectedChunk: any;
  onSelectChunk: (chunk: any) => void;
}

const FILTERS = ["all", "text", "image", "table"] as const;
type Filter = (typeof FILTERS)[number];

const TYPE_BADGE: Record<string, string> = {
  text: "bg-green-500/20 text-green-400 border-green-500/30",
  image: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  table: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function ChunksViewer({ chunks, chunksLoading, selectedChunk, onSelectChunk }: ChunksViewerProps) {
  const [chunksFilter, setChunksFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChunks = chunks.filter((chunk) => {
    const matchesFilter =
      chunksFilter === "all" ||
      (Array.isArray(chunk.type) && chunk.type.includes(chunksFilter));
    const matchesSearch = chunk.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[#141414]">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-100">Content Chunks</h3>
          <span className="text-xs text-gray-400 bg-[#252525] border border-gray-700 px-2 py-0.5 rounded-full">
            {filteredChunks.length} / {chunks.length}
            {chunksLoading && " (loading…)"}
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setChunksFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${chunksFilter === f
                    ? "bg-white text-black border-white"
                    : "bg-[#252525] text-gray-400 border-gray-700 hover:text-gray-200 hover:bg-[#2e2e2e]"
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[160px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search chunks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-full bg-[#252525] border border-gray-700 rounded-lg text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {chunksLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Loading chunks...</span>
            </div>
          </div>
        ) : filteredChunks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-500">No chunks found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                onClick={() => onSelectChunk(chunk)}
                className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedChunk?.id === chunk.id
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "border-gray-700 bg-[#1e1e1e] hover:border-gray-600 hover:bg-[#252525]"
                  }`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.isArray(chunk.type) &&
                      chunk.type.map((type: string) => (
                        <span
                          key={type}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium border ${TYPE_BADGE[type] ?? "bg-gray-700 text-gray-300 border-gray-600"
                            }`}
                        >
                          {type}
                        </span>
                      ))}
                    <span className="text-xs text-gray-500">Page {chunk.page}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{chunk.chars} chars</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{chunk.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
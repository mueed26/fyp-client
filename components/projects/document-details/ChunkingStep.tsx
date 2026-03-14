import { CheckCircle } from "lucide-react";
import { GenericStep } from "./GenericStep";

interface ChunkingStepProps {
  status: "completed" | "processing" | "failed" | "pending";
  chunkingData?: {
    total_chunks: number;
  };
  chunks: any[];
  partitioningData?: {
    elements_found?: Record<string, number>;
  };
}

export function ChunkingStep({
  status,
  chunkingData,
  chunks,
  partitioningData,
}: ChunkingStepProps) {
  if (!chunkingData || status !== "completed") {
    return (
      <GenericStep
        stepName="Chunking"
        description="Creating semantic chunks"
        status={status}
      />
    );
  }

  // Calculate values
  const sourceElements = partitioningData?.elements_found
    ? Object.values(partitioningData.elements_found).reduce(
        (sum, count) => sum + count,
        0
      )
    : 0;

  const avgChars =
    chunks.length > 0
      ? Math.round(
          chunks.reduce((sum, chunk) => sum + chunk.chars, 0) / chunks.length
        )
      : 0;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-xl font-medium text-gray-100 mb-2">Chunking</h3>
        <p className="text-gray-400 mb-6">Creating semantic chunks</p>

        <div className="mb-6 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <h4 className="font-medium text-green-300 mb-3">Chunking Results</h4>

          {/* Main chunking flow */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4 border border-gray-600">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-2xl text-gray-100">
                  {sourceElements}
                </div>
                <div className="text-gray-400">atomic elements</div>
              </div>

              <div className="text-green-400 text-xl">→</div>

              <div className="text-center">
                <div className="font-bold text-2xl text-green-400">
                  {chunkingData.total_chunks}
                </div>
                <div className="text-gray-400">chunks created</div>
              </div>
            </div>
          </div>

          {/* Chunk statistics */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between bg-[#2a2a2a] rounded px-3 py-2 border border-gray-600">
              <span className="text-gray-300">Average chunk size</span>
              <span className="font-medium text-gray-100">
                {avgChars.toLocaleString()} characters
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-green-300">
            {sourceElements} atomic elements have been chunked by title to
            produce {chunkingData.total_chunks} chunks
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">
              Step completed successfully
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

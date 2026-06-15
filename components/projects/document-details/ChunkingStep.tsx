import { CheckCircle } from "lucide-react";
import { GenericStep } from "./GenericStep";

interface ChunkingStepProps {
  status: "completed" | "processing" | "failed" | "pending";
  chunkingData?: { total_chunks: number };
  chunks: any[];
  partitioningData?: { elements_found?: Record<string, number> };
}

export function ChunkingStep({ status, chunkingData, chunks, partitioningData }: ChunkingStepProps) {
  if (!chunkingData || status !== "completed") {
    return (
      <GenericStep stepName="Chunking" description="Creating semantic chunks" status={status} />
    );
  }

  const sourceElements = partitioningData?.elements_found
    ? Object.values(partitioningData.elements_found).reduce((sum, count) => sum + count, 0)
    : 0;

  const avgChars =
    chunks.length > 0
      ? Math.round(chunks.reduce((sum, c) => sum + c.chars, 0) / chunks.length)
      : 0;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Chunking</h3>
        <p className="text-sm text-gray-400 mb-6">Creating semantic chunks</p>

        <div className="mb-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3">
            Chunking Results
          </h4>

          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-100">{sourceElements}</div>
                <div className="text-xs text-gray-400 mt-0.5">atomic elements</div>
              </div>
              <div className="text-gray-500 text-lg">→</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{chunkingData.total_chunks}</div>
                <div className="text-xs text-gray-400 mt-0.5">chunks created</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm mb-3">
            <span className="text-gray-300">Average chunk size</span>
            <span className="font-medium text-gray-100">{avgChars.toLocaleString()} characters</span>
          </div>

          <p className="text-xs text-green-300/70">
            {sourceElements} atomic elements chunked by title → {chunkingData.total_chunks} chunks
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Step completed successfully</span>
          </div>
        </div>
      </div>
    </div>
  );
}
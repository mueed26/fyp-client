import { CheckCircle, Loader2 } from "lucide-react";
import { GenericStep } from "./GenericStep";

interface SummarisingStepProps {
  status: "completed" | "processing" | "failed" | "pending";
  summarisingData?: {
    current_chunk: number;
    total_chunks: number;
  };
}

export function SummarisingStep({ status, summarisingData }: SummarisingStepProps) {
  if (!summarisingData) {
    return (
      <GenericStep
        stepName="Summarisation"
        description="Enhancing content with AI summaries for images and tables"
        status={status}
      />
    );
  }

  if (status === "processing") {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Summarisation</h3>
          <p className="text-sm text-gray-400 mb-6">Enhancing content with AI summaries for images and tables</p>

          <div className="mb-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
              AI Summarising Progress
            </h4>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {summarisingData.current_chunk} / {summarisingData.total_chunks}
              </div>
              <div className="text-xs text-gray-400">chunks processed</div>
            </div>
            <p className="text-xs text-blue-300/70 mt-3">
              Processing chunks and creating AI summaries for images and tables
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Summarisation</h3>
          <p className="text-sm text-gray-400 mb-6">Enhancing content with AI summaries for images and tables</p>

          <div className="mb-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-3">
              AI Enhancement Complete
            </h4>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {summarisingData.total_chunks}
              </div>
              <div className="text-xs text-gray-400">chunks enhanced with AI summaries</div>
            </div>
            <p className="text-xs text-green-300/70 mt-3">
              All chunks processed and enhanced with AI summaries for images and tables
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

  return (
    <GenericStep
      stepName="Summarisation"
      description="Enhancing content with AI summaries for images and tables"
      status={status}
    />
  );
}
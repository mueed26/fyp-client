import { CheckCircle } from "lucide-react";
import { GenericStep } from "./GenericStep";

interface PartitioningStepProps {
  status: "completed" | "processing" | "failed" | "pending";
  elementsFound?: {
    text: number;
    tables: number;
    images: number;
    titles: number;
    other: number;
  };
}

const ELEMENT_LABELS: Record<string, string> = {
  text: "Text sections",
  tables: "Tables",
  images: "Images",
  titles: "Titles / Headers",
  other: "Other elements",
};

export function PartitioningStep({ status, elementsFound }: PartitioningStepProps) {
  if (!elementsFound || status !== "completed") {
    return (
      <GenericStep
        stepName="Partitioning"
        description="Processing and extracting text, images, and tables"
        status={status}
      />
    );
  }

  const visibleEntries = Object.entries(elementsFound).filter(([, v]) => v > 0);

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Partitioning</h3>
        <p className="text-sm text-gray-400 mb-6">Processing and extracting text, images, and tables</p>

        <div className="mb-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            Elements Discovered
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {visibleEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-gray-300">{ELEMENT_LABELS[key] ?? key}</span>
                <span className="font-semibold text-gray-100">{value}</span>
              </div>
            ))}
          </div>
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
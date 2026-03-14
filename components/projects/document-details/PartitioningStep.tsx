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

export function PartitioningStep({
  status,
  elementsFound,
}: PartitioningStepProps) {
  if (!elementsFound || status !== "completed") {
    return (
      <GenericStep
        stepName="Partitioning"
        description="Processing and extracting text, images, and tables"
        status={status}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-400" />
        </div> */}
        <h3 className="text-xl font-medium text-gray-100 mb-2">Partitioning</h3>
        <p className="text-gray-400 mb-6">
          Processing and extracting text, images, and tables
        </p>

        <div className="mb-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <h4 className="font-medium text-blue-300 mb-3">
            📊 Elements Discovered
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(elementsFound)
              .filter(([key, value]) => value > 0)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-[#2a2a2a] rounded px-3 py-2 border border-gray-600"
                >
                  <span className="text-gray-300">
                    {key === "text"
                      ? " Text sections"
                      : key === "tables"
                      ? " Tables"
                      : key === "images"
                      ? " Images"
                      : key === "titles"
                      ? " Titles/Headers"
                      : " Other elements"}
                  </span>
                  <span className="font-medium text-gray-100">{value}</span>
                </div>
              ))}
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

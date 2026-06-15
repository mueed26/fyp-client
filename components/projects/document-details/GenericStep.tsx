import { CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";

interface GenericStepProps {
  stepName: string;
  description: string;
  status: "completed" | "processing" | "failed" | "pending";
}

export function GenericStep({ stepName, description, status }: GenericStepProps) {
  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case "processing":
        return <Loader2 className="w-8 h-8 animate-spin text-blue-400" />;
      case "failed":
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusBanner = () => {
    switch (status) {
      case "processing":
        return (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Processing...</span>
            </div>
          </div>
        );
      case "completed":
        return (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Step completed successfully</span>
            </div>
          </div>
        );
      case "failed":
        return (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Processing failed at this step</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center border ${
          status === "completed" ? "bg-green-500/10 border-green-500/20"
          : status === "processing" ? "bg-blue-500/10 border-blue-500/20"
          : status === "failed" ? "bg-red-500/10 border-red-500/20"
          : "bg-[#2a2a2a] border-gray-700"
        }`}>
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">{stepName}</h3>
        <p className="text-sm text-gray-400 mb-6">{description}</p>
        {getStatusBanner()}
      </div>
    </div>
  );
}
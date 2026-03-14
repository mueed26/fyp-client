import { X, FileText, Globe } from "lucide-react";
import { ProjectDocument } from "@/lib/types";

interface ModalHeaderProps {
  document: ProjectDocument;
  onClose: () => void;
}

export function ModalHeader({ document, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
          {document.source_url ? <Globe size={20} /> : <FileText size={20} />}
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-100">
            {document.filename}
          </h2>
          <p className="text-sm text-gray-400">Processing Pipeline</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-[#2a2a2a] rounded-lg"
      >
        <X size={20} />
      </button>
    </div>
  );
}

import { X, FileText, Globe } from "lucide-react";
import { ProjectDocument } from "@/lib/types";

interface ModalHeaderProps {
  document: ProjectDocument;
  onClose: () => void;
}

export function ModalHeader({ document, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#252525] border border-gray-700 rounded-lg flex items-center justify-center">
          {document.source_url
            ? <Globe size={15} className="text-gray-400" />
            : <FileText size={15} className="text-gray-400" />
          }
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-100">{document.filename}</h2>
          <p className="text-xs text-gray-400">Processing Pipeline</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#252525] rounded-lg transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
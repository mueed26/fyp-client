"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-4">
      <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-500/10 border border-red-500/20 rounded-md flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-red-400" size={12} />
          </div>
          <span className="text-red-300 text-sm">{error}</span>
        </div>

        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded-md"
          title="Dismiss error"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

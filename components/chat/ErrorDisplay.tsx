"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-4">
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-destructive flex-shrink-0" size={13} />
          <span className="text-destructive text-sm">{error}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-destructive/70 hover:text-destructive transition-colors p-1 hover:bg-destructive/10 rounded-md"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
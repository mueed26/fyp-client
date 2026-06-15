"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      await onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-background px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-end bg-muted border border-border rounded-xl hover:border-border/80 focus-within:ring-2 focus-within:ring-ring/30 transition-all">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your documents..."
              disabled={disabled}
              rows={1}
              className="flex-1 resize-none border-0 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50 min-h-[48px] max-h-32 overflow-y-auto text-sm"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />
            <div className="flex items-end p-2">
              <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="flex items-center justify-center w-8 h-8 bg-foreground hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed text-background rounded-lg transition-colors"
              >
                {disabled ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs">Enter</kbd>{" "}
              to send,{" "}
              <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs">Shift+Enter</kbd>{" "}
              for new line
            </p>
            {message.length > 0 && (
              <p className="text-xs text-muted-foreground">{message.length} chars</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
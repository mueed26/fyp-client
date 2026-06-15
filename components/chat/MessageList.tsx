import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { FileText, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  chat_id: string;
  clerk_id: string;
  citations?: Array<{ filename: string; page: number }>;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage?: string;
  isStreaming?: boolean;
  agentStatus?: string;
  onFeedback?: (messageId: string, type: "like" | "dislike") => void;
}

export function MessageList({
  messages = [],
  isLoading,
  streamingMessage = "",
  isStreaming = false,
  agentStatus = "",
  onFeedback,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {messages.length === 0 && !isStreaming && !isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-12 h-12 bg-muted border border-border rounded-xl mx-auto mb-5 flex items-center justify-center">
              <FileText size={18} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask me anything about your documents and I'll help you find answers.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <MessageItem message={message} onFeedback={onFeedback} />

                {/* Citations */}
                {message.role === "assistant" &&
                  message.citations &&
                  message.citations.length > 0 && (
                    <div className="mt-4 ml-10">
                      <div className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText size={12} className="text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Sources ({message.citations.length})
                          </span>
                        </div>
                        <div className="grid gap-1.5">
                          {message.citations.map((citation, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-muted/60 hover:bg-muted rounded-lg px-3 py-2 border border-border transition-colors"
                            >
                              <div className="flex-shrink-0 w-6 h-6 bg-background border border-border rounded-md flex items-center justify-center">
                                <FileText size={11} className="text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {citation.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">Page {citation.page}</p>
                              </div>
                              <span className="text-xs text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5 flex-shrink-0">
                                p.{citation.page}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {/* Streaming */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-xl p-4 max-w-[85%]">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed text-sm">
                    {streamingMessage}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      {[0, 0.1, 0.2].map((delay, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <Loader2 size={14} className="text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {agentStatus || "Thinking..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
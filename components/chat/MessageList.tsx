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
  citations?: Array<{
    filename: string;
    page: number;
  }>;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1a1a]">
      {messages.length === 0 && !isStreaming && !isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400 max-w-md mx-auto px-6">
            <div className="w-12 h-12 bg-[#252525] border border-gray-700 rounded-lg mx-auto mb-6 flex items-center justify-center">
              <FileText size={18} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-3">
              Start a conversation
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Ask me anything about your documents and I'll help you find the
              answers.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <MessageItem message={message} onFeedback={onFeedback} />

                {/* Citations UI */}
                {message.role === "assistant" &&
                  message.citations &&
                  message.citations.length > 0 && (
                    <div className="mt-6 ml-0">
                      <div className="bg-[#202020] border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-5 h-5 bg-[#252525] border border-gray-700 rounded-md flex items-center justify-center">
                            <FileText size={12} className="text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">
                            Sources ({message.citations.length})
                          </span>
                        </div>

                        <div className="grid gap-2">
                          {message.citations.map((citation, citationIndex) => (
                            <div
                              key={citationIndex}
                              className="flex items-center gap-3 bg-[#252525] hover:bg-[#2a2a2a] rounded-lg px-3 py-2 border border-gray-700 hover:border-gray-600 transition-colors"
                            >
                              {/* Document Icon */}
                              <div className="flex-shrink-0 w-7 h-7 bg-[#2a2a2a] border border-gray-600 rounded-md flex items-center justify-center">
                                <FileText size={12} className="text-gray-400" />
                              </div>

                              {/* Citation Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate">
                                  {citation.filename}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Page {citation.page}
                                </p>
                              </div>

                              {/* Page Number Badge */}
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-[#2a2a2a] border border-gray-600 rounded-md flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-400">
                                    {citation.page}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="group">
                <div className="flex justify-start">
                  <div className="bg-[#202020] border border-gray-800 rounded-lg p-4 max-w-[85%]">
                    <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">
                      {streamingMessage}
                    </p>

                    {/* Typing Indicator */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-800">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State - with dynamic status */}
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="bg-[#202020] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-300">
                      {agentStatus || "Thinking..."}
                    </span>
                  </div>
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

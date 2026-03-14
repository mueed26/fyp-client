"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ErrorDisplay } from "./ErrorDisplay";
import { MessageSquare, Plus } from "lucide-react";

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

interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  messages: Message[];
  created_at: string;
  clerk_id: string;
}

interface ChatInterfaceProps {
  chat?: Chat;
  projectId?: string;
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onDismissError: () => void;
  onCreateNewChat?: () => void;
  streamingMessage?: string;
  isStreaming?: boolean;
  agentStatus?: string;
  onFeedback?: (messageId: string, type: "like" | "dislike") => void;
}

export function ChatInterface({
  chat,
  projectId,
  onSendMessage,
  isLoading,
  error,
  onDismissError,
  onCreateNewChat,
  streamingMessage,
  isStreaming,
  agentStatus,
  onFeedback,
}: ChatInterfaceProps) {
  const handleSendMessage = async (content: string) => {
    await onSendMessage(content);
  };

  return (
    <div className="h-screen bg-[#0d1117] p-4">
      <div className="flex flex-col h-full bg-[#1a1a1a] text-white rounded-xl overflow-hidden">
        {/* Header */}
        {projectId && (
          <div className="border-b border-gray-800 bg-[#1a1a1a] sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center gap-3">
                {/* Chat Icon */}
                <div className="w-7 h-7 bg-[#252525] border border-gray-700 rounded-lg flex items-center justify-center">
                  <MessageSquare size={14} className="text-gray-400" />
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="font-medium text-gray-200 text-sm truncate">
                    {chat?.title || "New Chat"}
                  </h1>
                  <p className="text-xs text-gray-400">Project Chat</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorDisplay error={error} onDismiss={onDismissError} />}

        {/* Chat Content */}
        {chat ? (
          <>
            <MessageList
              messages={chat.messages}
              isLoading={isLoading}
              streamingMessage={streamingMessage}
              isStreaming={isStreaming}
              agentStatus={agentStatus}
              onFeedback={onFeedback}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading || (isStreaming ?? false)}
            />
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              {/* Hero Icon */}
              <div className="w-16 h-16 bg-[#252525] border border-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={24} className="text-gray-400" />
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-medium text-gray-200 mb-3">
                Ready to start?
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                I can help you analyze your documents, answer questions, and
                provide insights based on your project's knowledge base.
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-8 text-left">
                {[
                  "Analyze uploaded documents",
                  "Search through your knowledge base",
                  "Get AI-powered insights",
                  "Work with tables and images",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm text-gray-300 bg-[#202020] rounded-lg p-3 border border-gray-800"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              {onCreateNewChat && (
                <button
                  onClick={onCreateNewChat}
                  disabled={isLoading}
                  className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Start conversation
                    </>
                  )}
                </button>
              )}

              {/* Helper Text */}
              <p className="text-xs text-gray-500 mt-6">
                You can upload documents in the Sources panel to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

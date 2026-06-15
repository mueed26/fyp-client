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
  citations?: Array<{ filename: string; page: number }>;
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
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      {projectId && (
        <div className="border-b border-border bg-background sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-muted border border-border rounded-lg flex items-center justify-center">
                <MessageSquare size={13} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-medium text-foreground text-sm truncate">
                  {chat?.title || "New Chat"}
                </h1>
                <p className="text-xs text-muted-foreground">Project Chat</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <ErrorDisplay error={error} onDismiss={onDismissError} />}

      {/* Content */}
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
            onSendMessage={onSendMessage}
            disabled={isLoading || (isStreaming ?? false)}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MessageSquare size={22} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Ready to start?
            </h2>
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              I can help you analyse your documents, answer questions, and
              provide insights based on your project's knowledge base.
            </p>
            <div className="space-y-2 mb-7 text-left">
              {[
                "Analyse uploaded documents",
                "Search through your knowledge base",
                "Get AI-powered insights",
                "Work with tables and images",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-foreground bg-muted/60 rounded-xl p-3 border border-border"
                >
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
            {onCreateNewChat && (
              <button
                onClick={onCreateNewChat}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Start conversation
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-5">
              Upload documents in the Sources panel to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
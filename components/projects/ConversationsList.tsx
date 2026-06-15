"use client";

import { MessageSquare, Plus, AlertCircle, Trash2, NotebookPen, AlertTriangle, Loader2 } from "lucide-react";
import { Project, Chat } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ConversationsListProps {
  project: Project;
  conversations: Chat[];
  projectId: string;
  error: string | null;
  loading: boolean;
  onCreateNewChat: () => void;
  onChatClick: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ConversationsList({
  project,
  conversations,
  projectId,
  error,
  loading,
  onCreateNewChat,
  onChatClick,
  onDeleteChat,
}: ConversationsListProps) {
  const router = useRouter();
  const hasConversations = conversations.length > 0;

  const [isNavigatingToNotes, setIsNavigatingToNotes] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  const handleNotesClick = () => {
    setIsNavigatingToNotes(true);
    router.push(`/projects/${projectId}/notes`);
  };

  const handleDeleteChat = async () => {
    if (!deleteChatId) return;
    try {
      setIsDeletingChat(true);
      await onDeleteChat(deleteChatId);
    } finally {
      setIsDeletingChat(false);
      setDeleteChatId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">

      {/* DELETE CHAT CONFIRMATION MODAL */}
      {deleteChatId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Delete conversation?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5 ml-12">
              This action cannot be undone. The conversation and all its messages will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteChatId(null)}
                disabled={isDeletingChat}
                className="px-4 py-2 text-xs text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={isDeletingChat}
                className="px-4 py-2 text-xs text-destructive-foreground bg-destructive/80 hover:bg-destructive rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
              >
                {isDeletingChat ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-5 pt-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle size={13} className="text-destructive flex-shrink-0" />
            <span className="text-destructive text-xs">{error}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notes button — mirrors the New Chat button pattern */}
              <button
                onClick={handleNotesClick}
                disabled={isNavigatingToNotes}
                className="flex items-center gap-2 bg-muted hover:bg-muted/80 disabled:opacity-70 text-foreground px-3 py-2 rounded-xl text-sm font-medium transition-colors border border-border"
              >
                {isNavigatingToNotes ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    <span className="hidden sm:inline">Opening...</span>
                  </>
                ) : (
                  <>
                    <NotebookPen size={13} />
                    <span className="hidden sm:inline">Notes</span>
                  </>
                )}
              </button>

              {/* New Chat button */}
              <button
                onClick={onCreateNewChat}
                disabled={loading}
                className="flex items-center gap-2 bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                    <span className="hidden sm:inline">Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span className="hidden sm:inline">New chat</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Conversations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Conversations
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
            </div>

            {!hasConversations ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 bg-muted border border-border rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare size={18} className="text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  No conversations yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
                  Start a conversation to analyse your documents and get insights.
                </p>
                <button
                  onClick={onCreateNewChat}
                  disabled={loading}
                  className="bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background px-5 py-2.5 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Start first conversation
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onChatClick(chat.id)}
                    className="group flex items-center gap-3 bg-card hover:bg-muted border border-border hover:border-border/80 rounded-xl p-3.5 cursor-pointer transition-all"
                  >
                    <div className="w-8 h-8 bg-muted border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={13} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {chat.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteChatId(chat.id);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
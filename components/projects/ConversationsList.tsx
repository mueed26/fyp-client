import { MessageSquare, Plus, AlertCircle, Trash2 } from "lucide-react";
import { Project, Chat } from "@/lib/types";

interface ConversationsListProps {
  project: Project;
  conversations: Chat[];
  error: string | null;
  loading: boolean;
  onCreateNewChat: () => void;
  onChatClick: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ConversationsList({
  project,
  conversations,
  error,
  loading,
  onCreateNewChat,
  onChatClick,
  onDeleteChat,
}: ConversationsListProps) {
  const hasConversations = conversations.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] rounded-xl overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="p-6 pb-0">
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-medium text-gray-100 mb-1">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-400">{project.description}</p>
              )}
            </div>

            <button
              onClick={onCreateNewChat}
              disabled={loading}
              className="bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 text-black px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  New conversation
                </>
              )}
            </button>
          </div>

          {/* Conversations Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-200">
                Conversations
              </h2>
              <span className="text-xs text-gray-400 bg-[#252525] px-2 py-1 rounded">
                {conversations.length}
              </span>
            </div>

            {!hasConversations ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-[#252525] border border-gray-700 rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <MessageSquare size={18} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200 mb-3">
                  No conversations yet
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Start your first conversation in this project to analyze
                  documents and get insights from your AI assistant.
                </p>
                <button
                  onClick={onCreateNewChat}
                  disabled={loading}
                  className="bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 text-black px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus size={16} />
                      Start first conversation
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onChatClick(chat.id)}
                    className="group bg-[#202020] hover:bg-[#252525] border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Chat Icon */}
                      <div className="w-8 h-8 bg-[#252525] border border-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#2a2a2a] transition-colors">
                        <MessageSquare
                          size={14}
                          className="text-gray-400 group-hover:text-gray-300"
                        />
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-200 group-hover:text-white truncate transition-colors">
                          {chat.title}
                        </h3>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110"
                        title="Delete chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

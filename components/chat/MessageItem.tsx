"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  chat_id: string;
  clerk_id: string;
  citations?: Array<{ filename: string; page: number }>;
}

interface MessageItemProps {
  message: Message;
  onFeedback?: (messageId: string, type: "like" | "dislike") => void;
}

export function MessageItem({ message, onFeedback }: MessageItemProps) {
  const isUser = message.role === "user";
  const [feedbackGiven, setFeedbackGiven] = useState<"like" | "dislike" | null>(null);

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleFeedback = (type: "like" | "dislike") => {
    if (feedbackGiven) return;
    setFeedbackGiven(type);
    onFeedback?.(message.id, type);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className={`max-w-[85%] ${isUser ? "ml-12" : "mr-12"} relative`}>

        {/* Avatar + Bubble */}
        <div className="flex items-start gap-3">

          {/* Assistant avatar */}
          {!isUser && (
            <div className="flex-shrink-0 w-7 h-7 bg-muted border border-border rounded-lg flex items-center justify-center mt-1">
              <Bot size={13} className="text-muted-foreground" />
            </div>
          )}

          {/* Bubble */}
          <div
            className={`rounded-xl border transition-colors ${isUser
              ? "bg-secondary text-foreground border-border px-4 py-3"
              : "bg-card text-foreground border-border hover:border-border/70 px-4 py-3"
              }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {message.content}
              </p>
            ) : (
              <div className="text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="text-foreground leading-relaxed mb-3 last:mb-0">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm font-semibold text-foreground mt-3 mb-1.5">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-medium text-foreground mt-2 mb-1">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-foreground text-sm leading-relaxed">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-muted-foreground">{children}</em>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      return isBlock ? (
                        <code className="block bg-muted border border-border text-green-600 dark:text-green-400 px-3 py-2 rounded-lg text-xs font-mono my-2 overflow-x-auto whitespace-pre">
                          {children}
                        </code>
                      ) : (
                        <code className="bg-muted text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-border pl-3 my-2 text-muted-foreground italic text-sm">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="w-full border-collapse border border-border text-xs">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border bg-muted px-2 py-1.5 text-left text-foreground font-medium">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border px-2 py-1.5 text-foreground">{children}</td>
                    ),
                    hr: () => <hr className="border-border my-3" />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* User avatar */}
          {isUser && (
            <div className="flex-shrink-0 w-7 h-7 bg-muted border border-border rounded-lg flex items-center justify-center mt-1">
              <User size={13} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Feedback — assistant only */}
        {!isUser && (
          <div className="absolute -bottom-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-sm">
            <button
              onClick={() => handleFeedback("like")}
              disabled={!!feedbackGiven}
              className={`p-1.5 rounded-md transition-colors ${feedbackGiven === "like"
                ? "text-green-500"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              title="Like"
            >
              <ThumbsUp size={11} />
            </button>
            <button
              onClick={() => handleFeedback("dislike")}
              disabled={!!feedbackGiven}
              className={`p-1.5 rounded-md transition-colors ${feedbackGiven === "dislike"
                ? "text-destructive"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              title="Dislike"
            >
              <ThumbsDown size={11} />
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className={`flex mt-2 px-1 ${isUser ? "justify-end" : "justify-start ml-10"}`}>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
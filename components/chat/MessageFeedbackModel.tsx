"use client";

import { useState } from "react";
import { X, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

interface FeedbackData {
  rating: "like" | "dislike";
  comment?: string;
  category?: string;
}

interface MessageFeedbackModalProps {
  isOpen: boolean;
  feedbackType?: "like" | "dislike";
  onSubmit: (feedback: FeedbackData) => Promise<void>;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = {
  like: [
    { value: "helpful", label: "Helpful" },
    { value: "accurate", label: "Accurate" },
    { value: "well-formatted", label: "Well formatted" },
    { value: "comprehensive", label: "Comprehensive" },
  ],
  dislike: [
    { value: "unhelpful", label: "Not helpful" },
    { value: "inaccurate", label: "Inaccurate" },
    { value: "incomplete", label: "Incomplete" },
    { value: "irrelevant", label: "Off topic" },
  ],
};

export function MessageFeedbackModal({ isOpen, feedbackType, onSubmit, onClose }: MessageFeedbackModalProps) {
  const [comment, setComment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        rating: feedbackType,
        comment: comment.trim() || undefined,
        category: selectedCategory || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !feedbackType) return null;

  const categories = FEEDBACK_CATEGORIES[feedbackType];
  const isLike = feedbackType === "like";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted border border-border rounded-lg flex items-center justify-center">
              {isLike
                ? <ThumbsUp size={14} className="text-muted-foreground" />
                : <ThumbsDown size={14} className="text-muted-foreground" />
              }
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {isLike ? "What did you like?" : "What went wrong?"}
              </h2>
              <p className="text-xs text-muted-foreground">Your feedback helps improve responses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">
              What specifically {isLike ? "did you like" : "went wrong"}?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  disabled={isSubmitting}
                  className={`p-2.5 text-xs font-medium rounded-xl border transition-colors disabled:opacity-50 ${selectedCategory === category.value
                      ? "border-foreground/30 bg-secondary text-foreground"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">
              Additional feedback (optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute top-3 left-3 text-muted-foreground" size={13} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={4}
                disabled={isSubmitting}
                maxLength={500}
                className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none disabled:opacity-50 transition-all"
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-muted-foreground">Help us understand what happened</p>
              <p className="text-xs text-muted-foreground">{comment.length}/500</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 border border-border rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-xs font-medium bg-foreground hover:bg-foreground/90 disabled:opacity-50 text-background rounded-xl transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
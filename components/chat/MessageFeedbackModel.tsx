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

export function MessageFeedbackModal({
  isOpen,
  feedbackType,
  onSubmit,
  onClose,
}: MessageFeedbackModalProps) {
  // Modal manages its own form state
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

  // Don't render if modal is not open
  if (!isOpen || !feedbackType) return null;

  const categories = FEEDBACK_CATEGORIES[feedbackType];
  const isLike = feedbackType === "like";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#252525] border border-gray-700 rounded-lg flex items-center justify-center">
              {isLike ? (
                <ThumbsUp size={16} className="text-gray-400" />
              ) : (
                <ThumbsDown size={16} className="text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-200">
                {isLike ? "What did you like?" : "What went wrong?"}
              </h2>
              <p className="text-sm text-gray-400">
                Your feedback helps improve responses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-[#252525] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              What specifically {isLike ? "did you like" : "went wrong"}?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  disabled={isSubmitting}
                  className={`p-3 text-sm rounded-lg border transition-colors disabled:opacity-50 ${
                    selectedCategory === category.value
                      ? "border-white/20 bg-white/10 text-white shadow-sm"
                      : "border-gray-700 bg-[#202020] text-gray-400 hover:border-gray-600 hover:bg-[#252525] hover:text-gray-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Additional feedback (optional)
            </label>
            <div className="relative">
              <MessageSquare
                className="absolute top-3 left-3 text-gray-400"
                size={14}
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={4}
                disabled={isSubmitting}
                maxLength={500}
                className="w-full pl-10 pr-4 py-3 bg-[#252525] border border-gray-700 rounded-lg focus:outline-none focus:border-gray-600 resize-none disabled:opacity-50 placeholder:text-gray-400 text-gray-200 transition-colors"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Help us understand what happened
              </p>
              <p className="text-xs text-gray-500">{comment.length}/500</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-gray-300 bg-[#252525] hover:bg-[#2a2a2a] disabled:bg-[#202020] disabled:text-gray-500 disabled:cursor-not-allowed border border-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-black rounded-lg transition-colors font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                  Submitting...
                </div>
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

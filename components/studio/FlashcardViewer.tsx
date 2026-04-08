"use client";

import { useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Star,
    RotateCcw,
    Layers,
} from "lucide-react";

interface Flashcard {
    id: number;
    front: string;
    back: string;
    topic: string;
    is_past_year: boolean;
    difficulty: string;
}

interface FlashcardData {
    flashcards: Flashcard[];
    total: number;
    exam_relevant_count: number;
}

interface FlashcardViewerProps {
    title: string;
    content: string; // JSON string
    onClose: () => void;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const colors: Record<string, string> = {
        easy: "bg-green-500/10 text-green-400 border-green-500/20",
        medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        hard: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
        <span
            className={`text-xs px-2 py-0.5 rounded-full border ${colors[difficulty] || colors.medium
                }`}
        >
            {difficulty}
        </span>
    );
}

export function FlashcardViewer({
    title,
    content,
    onClose,
}: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [filter, setFilter] = useState<"all" | "exam">("all");

    let data: FlashcardData;
    try {
        data = JSON.parse(content);
    } catch {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] p-8 rounded-xl text-gray-300">
                    Failed to load flashcards.
                    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-white">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const filteredCards =
        filter === "exam"
            ? data.flashcards.filter((c) => c.is_past_year)
            : data.flashcards;

    const currentCard = filteredCards[currentIndex];
    const totalCards = filteredCards.length;

    const goNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % totalCards);
    };

    const goPrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!currentCard) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] p-8 rounded-xl text-center">
                    <p className="text-gray-300 mb-4">
                        No {filter === "exam" ? "exam-relevant " : ""}flashcards available.
                    </p>
                    {filter === "exam" && (
                        <button
                            onClick={() => {
                                setFilter("all");
                                setCurrentIndex(0);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                            Show all flashcards
                        </button>
                    )}
                    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-white text-sm">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                            <Layers size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-200">{title}</h2>
                            <p className="text-sm text-gray-400">
                                {data.total} cards • {data.exam_relevant_count} exam-relevant
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300 p-2 hover:bg-[#252525] rounded-lg"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 px-5 pt-4">
                    <button
                        onClick={() => {
                            setFilter("all");
                            setCurrentIndex(0);
                            setIsFlipped(false);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filter === "all"
                            ? "bg-white/10 border-white/20 text-white"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                            }`}
                    >
                        All ({data.total})
                    </button>
                    <button
                        onClick={() => {
                            setFilter("exam");
                            setCurrentIndex(0);
                            setIsFlipped(false);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1 ${filter === "exam"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                            }`}
                    >
                        <Star size={10} /> Exam ({data.exam_relevant_count})
                    </button>
                </div>

                {/* Card */}
                <div className="flex-1 p-5">
                    <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="relative w-full min-h-[280px] cursor-pointer group"
                        style={{ perspective: "1000px" }}
                    >
                        <div
                            className="relative w-full h-full transition-transform duration-500"
                            style={{
                                transformStyle: "preserve-3d",
                                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            }}
                        >
                            {/* Front */}
                            <div
                                className="absolute inset-0 bg-[#202020] border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center"
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    {currentCard.is_past_year && (
                                        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                            <Star size={10} /> Past Year
                                        </span>
                                    )}
                                    <DifficultyBadge difficulty={currentCard.difficulty} />
                                </div>
                                <p className="text-lg text-gray-200 text-center leading-relaxed">
                                    {currentCard.front}
                                </p>
                                <p className="text-xs text-gray-500 mt-4">
                                    Click to reveal answer
                                </p>
                            </div>

                            {/* Back */}
                            <div
                                className="absolute inset-0 bg-[#252525] border border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center"
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">
                                    Answer
                                </p>
                                <p className="text-base text-gray-200 text-center leading-relaxed">
                                    {currentCard.back}
                                </p>
                                <p className="text-xs text-gray-500 mt-4">
                                    Topic: {currentCard.topic}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-5 pb-5">
                    <button
                        onClick={goPrev}
                        className="p-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                            {currentIndex + 1} / {totalCards}
                        </span>
                        <button
                            onClick={() => {
                                setCurrentIndex(0);
                                setIsFlipped(false);
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-400 transition-colors"
                            title="Restart"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>

                    <button
                        onClick={goNext}
                        className="p-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-5 pb-4">
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
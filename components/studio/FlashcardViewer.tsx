"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Star, RotateCcw, Layers, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

interface Flashcard {
    id: number;
    front: string;
    back: string;
    topic: string;
    is_past_year: boolean;
    exam_similarity?: number;
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
    sourceId: string;
    projectId: string;
    expandCount: number;
    onClose: () => void;
    onContentUpdate?: (newContent: string, newExpandCount?: number) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const colors: Record<string, string> = {
        easy: "bg-green-500/10 text-green-500 border-green-500/20",
        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        hard: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[difficulty] || colors.medium}`}>
            {difficulty}
        </span>
    );
}

export function FlashcardViewer({
    title,
    content,
    sourceId,
    projectId,
    expandCount: initialExpandCount,
    onClose,
    onContentUpdate,
}: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [filter, setFilter] = useState<"all" | "exam">("all");
    const [currentContent, setCurrentContent] = useState(content);
    const [isGeneratingMore, setIsGeneratingMore] = useState(false);
    const [expandCount, setExpandCount] = useState(initialExpandCount);

    const { getToken } = useAuth();

    let data: FlashcardData;
    try {
        data = JSON.parse(currentContent);
    } catch {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border p-8 rounded-2xl text-foreground">
                    Failed to load flashcards.
                    <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const filteredCards =
        filter === "exam" ? data.flashcards.filter((c) => c.is_past_year) : data.flashcards;
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

    const switchFilter = (f: "all" | "exam") => {
        setFilter(f);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleGenerateMore = async () => {
        if (expandCount >= 1) {
            toast.error("You've reached the limit for generating more flashcards. Upgrade your plan to continue.");
            return;
        }
        try {
            setIsGeneratingMore(true);
            const token = await getToken();
            const result = await apiClient.post(
                `/api/projects/${projectId}/sources/${sourceId}/expand`,
                {},
                token
            );
            const newContent = result.content as string;
            const newExpandCount = result.expand_count as number;
            setCurrentContent(newContent);
            setExpandCount(newExpandCount);
            const prevTotal = data.flashcards.length;
            const added = result.added_count as number;
            if (filter === "all") {
                setCurrentIndex(prevTotal);
            }
            setIsFlipped(false);
            onContentUpdate?.(newContent, newExpandCount);
            toast.success(`${added} new flashcards added!`);
        } catch (err: any) {
            if (err.response?.status === 402) {
                toast.error("Limit reached. Upgrade your plan to generate more.");
            } else {
                toast.error("Failed to generate more flashcards");
            }
        } finally {
            setIsGeneratingMore(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            {/*
              🔥 KEY FIX:
              - Removed h-[620px] (forced height that didn't fit small screens)
              - Used h-[90vh] (always fills 90% of viewport height)
              - Added min-h-[500px] as a floor for very tall screens
              - This guarantees the card area always has enough room
            */}
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl h-[90vh] min-h-[500px] max-h-[720px] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Layers size={17} className="text-green-500" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {data.total} cards · {data.exam_relevant_count} exam-relevant
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Filter chips + Generate More */}
                <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 border-b border-border/50">
                    <button
                        onClick={() => switchFilter("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filter === "all"
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                    >
                        All ({data.total})
                    </button>
                    <button
                        onClick={() => switchFilter("exam")}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1 ${filter === "exam"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                    >
                        <Star size={10} /> Exam ({data.exam_relevant_count})
                    </button>

                    <div className="flex-1" />

                    <button
                        onClick={handleGenerateMore}
                        disabled={isGeneratingMore || expandCount >= 1}
                        title={expandCount >= 1 ? "You have reached the limit for generating more flashcards" : ""}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${expandCount >= 1
                            ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 opacity-50 cursor-not-allowed"
                            : "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                            } disabled:opacity-50`}
                    >
                        {isGeneratingMore
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Plus size={11} />
                        }
                        {isGeneratingMore
                            ? "Generating…"
                            : expandCount >= 1
                                ? "Limit Reached"
                                : "Generate More (1 left)"
                        }
                    </button>
                </div>

                {/*
                  🔥 CARD AREA — flex-1 with min-h-0 (CRUCIAL for nested flex)
                  Without min-h-0, the flex item won't actually shrink to fit,
                  and content overflows or collapses. This is the #1 flex gotcha.
                */}
                <div className="flex-1 min-h-0 p-4 flex flex-col">
                    {currentCard ? (
                        <div
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="relative flex-1 min-h-0 w-full cursor-pointer"
                            style={{ perspective: "1500px" }}
                        >
                            <div
                                className="absolute inset-0 transition-transform duration-500"
                                style={{
                                    transformStyle: "preserve-3d",
                                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                }}
                            >
                                {/* Front of card */}
                                <div
                                    className="absolute inset-0 bg-muted/50 border border-border rounded-2xl flex flex-col overflow-hidden"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    {/* Badges at TOP */}
                                    <div className="flex items-center justify-center gap-2 pt-6 pb-2 flex-shrink-0">
                                        {currentCard.is_past_year && (
                                            <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                                <Star size={10} /> Past Year
                                            </span>
                                        )}
                                        <DifficultyBadge difficulty={currentCard.difficulty} />
                                    </div>

                                    {/* Question — centered, takes remaining space, scrolls if needed */}
                                    <div className="flex-1 min-h-0 flex items-center justify-center px-6 overflow-y-auto">
                                        <p className="text-lg sm:text-xl text-foreground leading-relaxed font-medium text-center">
                                            {currentCard.front}
                                        </p>
                                    </div>

                                    {/* "Click to reveal" pinned to BOTTOM */}
                                    <p className="text-xs text-muted-foreground text-center pb-4 flex-shrink-0">
                                        Click to reveal answer
                                    </p>
                                </div>

                                {/* Back of card */}
                                <div
                                    className="absolute inset-0 bg-secondary border border-border rounded-2xl flex flex-col overflow-hidden"
                                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                >
                                    <p className="text-xs text-muted-foreground text-center pt-6 pb-2 uppercase tracking-wide flex-shrink-0">
                                        Answer
                                    </p>

                                    <div className="flex-1 min-h-0 flex items-center justify-center px-6 overflow-y-auto">
                                        <p className="text-base text-foreground leading-relaxed text-center">
                                            {currentCard.back}
                                        </p>
                                    </div>

                                    <p className="text-xs text-muted-foreground text-center pb-4 flex-shrink-0">
                                        Topic: {currentCard.topic}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                                No {filter === "exam" ? "exam-relevant " : ""}flashcards available.
                            </p>
                            {filter === "exam" && (
                                <button
                                    onClick={() => switchFilter("all")}
                                    className="text-primary hover:underline text-sm"
                                >
                                    Show all flashcards
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation + progress */}
                {currentCard && (
                    <div className="px-4 pb-4 pt-2 flex-shrink-0 space-y-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={goPrev}
                                className="p-2 bg-muted hover:bg-muted/70 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {currentIndex + 1} / {totalCards}
                                </span>
                                <button
                                    onClick={() => {
                                        setCurrentIndex(0);
                                        setIsFlipped(false);
                                    }}
                                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Restart"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                            <button
                                onClick={goNext}
                                className="p-2 bg-muted hover:bg-muted/70 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
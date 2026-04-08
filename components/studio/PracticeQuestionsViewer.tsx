"use client";

import { useState } from "react";
import {
    X,
    Star,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Eye,
    Trophy,
} from "lucide-react";

interface MCQ {
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    topic: string;
    is_past_year: boolean;
    difficulty: string;
}

interface ShortAnswer {
    id: number;
    question: string;
    model_answer: string;
    topic: string;
    is_past_year: boolean;
    difficulty: string;
}

interface Paragraph {
    id: number;
    question: string;
    model_answer: string;
    marks: number;
    topic: string;
    is_past_year: boolean;
    difficulty: string;
}

interface PracticeData {
    mcq: MCQ[];
    short_answer: ShortAnswer[];
    paragraph: Paragraph[];
    total: number;
    exam_relevant_count: number;
    breakdown: {
        mcq: number;
        short_answer: number;
        paragraph: number;
    };
}

interface PracticeQuestionsViewerProps {
    title: string;
    content: string;
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

function PastYearBadge() {
    return (
        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Star size={10} /> Past Year
        </span>
    );
}

export function PracticeQuestionsViewer({
    title,
    content,
    onClose,
}: PracticeQuestionsViewerProps) {
    const [activeTab, setActiveTab] = useState<"mcq" | "short" | "paragraph">(
        "mcq"
    );
    const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
    const [mcqChecked, setMcqChecked] = useState<Record<number, boolean>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
    const [showScore, setShowScore] = useState(false);

    let data: PracticeData;
    try {
        data = JSON.parse(content);
    } catch {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] p-8 rounded-xl text-gray-300">
                    Failed to load practice questions.
                    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-white">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const handleMcqSelect = (questionId: number, answer: string) => {
        if (mcqChecked[questionId]) return; // Already checked
        setMcqAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleMcqCheck = (questionId: number) => {
        setMcqChecked((prev) => ({ ...prev, [questionId]: true }));
    };

    const toggleReveal = (key: string) => {
        setRevealedAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Calculate MCQ score
    const mcqScore = data.mcq.reduce((score, q) => {
        if (mcqChecked[q.id] && mcqAnswers[q.id] === q.correct_answer) {
            return score + 1;
        }
        return score;
    }, 0);

    const allMcqChecked =
        data.mcq.length > 0 &&
        data.mcq.every((q) => mcqChecked[q.id]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                            <ClipboardList size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-200">{title}</h2>
                            <p className="text-sm text-gray-400">
                                {data.total} questions • {data.exam_relevant_count} exam-relevant
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

                {/* Tabs */}
                <div className="flex border-b border-gray-800 px-5 flex-shrink-0">
                    {[
                        { id: "mcq", label: "MCQ", count: data.breakdown?.mcq || 0 },
                        {
                            id: "short",
                            label: "Short Answer",
                            count: data.breakdown?.short_answer || 0,
                        },
                        {
                            id: "paragraph",
                            label: "Paragraph",
                            count: data.breakdown?.paragraph || 0,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-purple-400 text-purple-400"
                                : "border-transparent text-gray-400 hover:text-gray-300"
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* MCQ Tab */}
                    {activeTab === "mcq" && (
                        <>
                            {/* Score banner */}
                            {allMcqChecked && (
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Trophy size={20} className="text-purple-400" />
                                        <span className="text-purple-300 font-medium">
                                            Score: {mcqScore}/{data.mcq.length} (
                                            {Math.round((mcqScore / data.mcq.length) * 100)}%)
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMcqAnswers({});
                                            setMcqChecked({});
                                        }}
                                        className="text-xs text-purple-400 hover:text-purple-300 px-3 py-1 border border-purple-500/20 rounded-lg"
                                    >
                                        Retry All
                                    </button>
                                </div>
                            )}

                            {data.mcq.map((q) => {
                                const isChecked = mcqChecked[q.id];
                                const selectedAnswer = mcqAnswers[q.id];
                                const isCorrect = selectedAnswer === q.correct_answer;

                                return (
                                    <div
                                        key={`mcq-${q.id}`}
                                        className={`bg-[#202020] border rounded-lg p-5 ${isChecked
                                            ? isCorrect
                                                ? "border-green-500/30"
                                                : "border-red-500/30"
                                            : "border-gray-800"
                                            }`}
                                    >
                                        {/* Question header */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-start gap-2 flex-1">
                                                <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                                                    Q{q.id}
                                                </span>
                                                <p className="text-gray-200 text-sm leading-relaxed">
                                                    {q.question}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {q.is_past_year && <PastYearBadge />}
                                                <DifficultyBadge difficulty={q.difficulty} />
                                            </div>
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-2 mb-4">
                                            {q.options.map((option) => {
                                                const optionLetter = option.charAt(0);
                                                const isSelected = selectedAnswer === optionLetter;
                                                const isCorrectOption =
                                                    optionLetter === q.correct_answer;

                                                let optionStyle =
                                                    "border-gray-700 hover:border-gray-600 bg-[#252525]";
                                                if (isChecked) {
                                                    if (isCorrectOption) {
                                                        optionStyle =
                                                            "border-green-500/40 bg-green-500/10";
                                                    } else if (isSelected && !isCorrectOption) {
                                                        optionStyle = "border-red-500/40 bg-red-500/10";
                                                    } else {
                                                        optionStyle = "border-gray-800 bg-[#1a1a1a] opacity-50";
                                                    }
                                                } else if (isSelected) {
                                                    optionStyle =
                                                        "border-purple-500/40 bg-purple-500/10";
                                                }

                                                return (
                                                    <button
                                                        key={option}
                                                        onClick={() =>
                                                            handleMcqSelect(q.id, optionLetter)
                                                        }
                                                        disabled={isChecked}
                                                        className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-center gap-3 ${optionStyle} ${isChecked ? "cursor-default" : "cursor-pointer"
                                                            }`}
                                                    >
                                                        {isChecked && isCorrectOption && (
                                                            <CheckCircle
                                                                size={14}
                                                                className="text-green-400 flex-shrink-0"
                                                            />
                                                        )}
                                                        {isChecked &&
                                                            isSelected &&
                                                            !isCorrectOption && (
                                                                <XCircle
                                                                    size={14}
                                                                    className="text-red-400 flex-shrink-0"
                                                                />
                                                            )}
                                                        <span className="text-gray-300">{option}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Check / Explanation */}
                                        {!isChecked && selectedAnswer && (
                                            <button
                                                onClick={() => handleMcqCheck(q.id)}
                                                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors"
                                            >
                                                Check Answer
                                            </button>
                                        )}
                                        {isChecked && (
                                            <div
                                                className={`mt-3 p-3 rounded-lg text-sm ${isCorrect
                                                    ? "bg-green-500/5 border border-green-500/20 text-green-300"
                                                    : "bg-red-500/5 border border-red-500/20 text-red-300"
                                                    }`}
                                            >
                                                <p className="font-medium mb-1">
                                                    {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                                                </p>
                                                <p className="text-gray-400">{q.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Short Answer Tab */}
                    {activeTab === "short" &&
                        data.short_answer.map((q) => {
                            const key = `short-${q.id}`;
                            const isRevealed = revealedAnswers[key];

                            return (
                                <div
                                    key={key}
                                    className="bg-[#202020] border border-gray-800 rounded-lg p-5"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-2 flex-1">
                                            <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                                                Q{q.id}
                                            </span>
                                            <p className="text-gray-200 text-sm leading-relaxed">
                                                {q.question}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {q.is_past_year && <PastYearBadge />}
                                            <DifficultyBadge difficulty={q.difficulty} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleReveal(key)}
                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Eye size={14} />
                                        {isRevealed ? "Hide" : "Show"} Model Answer
                                        {isRevealed ? (
                                            <ChevronUp size={14} />
                                        ) : (
                                            <ChevronDown size={14} />
                                        )}
                                    </button>

                                    {isRevealed && (
                                        <div className="mt-3 p-3 bg-[#252525] border border-gray-700 rounded-lg">
                                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                                                Model Answer
                                            </p>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {q.model_answer}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Topic: {q.topic}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    {/* Paragraph Tab */}
                    {activeTab === "paragraph" &&
                        data.paragraph.map((q) => {
                            const key = `para-${q.id}`;
                            const isRevealed = revealedAnswers[key];

                            return (
                                <div
                                    key={key}
                                    className="bg-[#202020] border border-gray-800 rounded-lg p-5"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-2 flex-1">
                                            <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                                                Q{q.id}
                                            </span>
                                            <p className="text-gray-200 text-sm leading-relaxed">
                                                {q.question}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {q.is_past_year && <PastYearBadge />}
                                            <DifficultyBadge difficulty={q.difficulty} />
                                            <span className="text-xs text-gray-500 bg-[#252525] px-2 py-0.5 rounded border border-gray-700">
                                                {q.marks} marks
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleReveal(key)}
                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Eye size={14} />
                                        {isRevealed ? "Hide" : "Show"} Model Answer
                                        {isRevealed ? (
                                            <ChevronUp size={14} />
                                        ) : (
                                            <ChevronDown size={14} />
                                        )}
                                    </button>

                                    {isRevealed && (
                                        <div className="mt-3 p-3 bg-[#252525] border border-gray-700 rounded-lg">
                                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                                                Model Answer ({q.marks} marks)
                                            </p>
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {q.model_answer}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Topic: {q.topic}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
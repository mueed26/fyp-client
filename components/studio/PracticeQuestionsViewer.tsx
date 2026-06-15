"use client";

import { useState } from "react";
import {
    X, Star, CheckCircle, XCircle, ChevronDown, ChevronUp,
    ClipboardList, Eye, Trophy, Loader2, Sparkles, Plus,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

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
interface WrittenQ {
    id: number;
    question: string;
    model_answer: string;
    marks?: number;
    topic: string;
    is_past_year: boolean;
    difficulty: string;
}
interface PracticeData {
    mcq: MCQ[];
    short_answer: WrittenQ[];
    paragraph: WrittenQ[];
    total: number;
    exam_relevant_count: number;
    breakdown: { mcq: number; short_answer: number; paragraph: number };
}

export interface EvaluationResult {
    awarded_marks: number;
    max_marks: number;
    verdict: "correct" | "partial" | "incorrect";
    feedback: string;
    strengths: string[];
    improvements: string[];
}

interface PracticeQuestionsViewerProps {
    title: string;
    content: string;
    sourceId: string;
    projectId: string;
    expandCount: number;
    onClose: () => void;
    onContentUpdate?: (newContent: string, newExpandCount?: number) => void;
    onEvaluate: (params: {
        question: string;
        model_answer: string;
        user_answer: string;
        question_type: "short_answer" | "paragraph";
        max_marks: number;
    }) => Promise<EvaluationResult>;
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

function PastYearBadge() {
    return (
        <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Star size={10} /> Past Year
        </span>
    );
}

const verdictStyle: Record<string, { ring: string; text: string; label: string }> = {
    correct: { ring: "border-green-500/30 bg-green-500/5", text: "text-green-500", label: "Strong answer" },
    partial: { ring: "border-amber-500/30 bg-amber-500/5", text: "text-amber-500", label: "Partially correct" },
    incorrect: { ring: "border-red-500/30 bg-red-500/5", text: "text-red-500", label: "Needs work" },
};

// ── A single written (short/paragraph) question with grading ──────────────
function WrittenQuestion({
    q,
    type,
    onEvaluate,
}: {
    q: WrittenQ;
    type: "short_answer" | "paragraph";
    onEvaluate: PracticeQuestionsViewerProps["onEvaluate"];
}) {
    const [answer, setAnswer] = useState("");
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [showModel, setShowModel] = useState(false);

    const maxMarks = type === "paragraph" ? q.marks || 10 : 5;

    const submit = async () => {
        if (!answer.trim() || evaluating) return;
        try {
            setEvaluating(true);
            const res = await onEvaluate({
                question: q.question,
                model_answer: q.model_answer,
                user_answer: answer,
                question_type: type,
                max_marks: maxMarks,
            });
            setResult(res);
        } catch {
            // surfaced via toast upstream
        } finally {
            setEvaluating(false);
        }
    };

    const vs = result ? verdictStyle[result.verdict] || verdictStyle.partial : null;

    return (
        <div className="bg-muted/40 border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2 flex-1">
                    <span className="text-xs text-muted-foreground mt-1 flex-shrink-0">Q{q.id}</span>
                    <p className="text-foreground text-sm leading-relaxed">{q.question}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {q.is_past_year && <PastYearBadge />}
                    <DifficultyBadge difficulty={q.difficulty} />
                    {type === "paragraph" && (
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                            {q.marks} marks
                        </span>
                    )}
                </div>
            </div>

            {/* Answer input */}
            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={evaluating}
                placeholder="Type your answer here…"
                rows={type === "paragraph" ? 5 : 3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-all resize-y"
            />

            <div className="flex items-center gap-2 mt-3">
                <button
                    onClick={submit}
                    disabled={evaluating || !answer.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-lg text-xs font-medium transition-colors"
                >
                    {evaluating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {evaluating ? "Grading…" : result ? "Re-grade" : "Submit for grading"}
                </button>
                <button
                    onClick={() => setShowModel((s) => !s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Eye size={13} />
                    {showModel ? "Hide" : "Show"} model answer
                    {showModel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
            </div>

            {/* Grading result */}
            {result && vs && (
                <div className={`mt-3 p-4 rounded-lg border ${vs.ring}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${vs.text}`}>{vs.label}</span>
                        <span className={`text-sm font-bold ${vs.text}`}>
                            {result.awarded_marks} / {result.max_marks}
                        </span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed mb-3">{result.feedback}</p>
                    {result.strengths.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-medium text-green-500 mb-1">What went well</p>
                            <ul className="space-y-0.5">
                                {result.strengths.map((s, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                                        <span className="text-green-500">+</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {result.improvements.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-amber-500 mb-1">To improve</p>
                            <ul className="space-y-0.5">
                                {result.improvements.map((s, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                                        <span className="text-amber-500">→</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Model answer */}
            {showModel && (
                <div className="mt-3 p-3 bg-background border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                        Model Answer{type === "paragraph" ? ` (${q.marks} marks)` : ""}
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {q.model_answer}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Topic: {q.topic}</p>
                </div>
            )}
        </div>
    );
}

export function PracticeQuestionsViewer({
    title,
    content,
    sourceId,
    projectId,
    expandCount: initialExpandCount,
    onClose,
    onContentUpdate,
    onEvaluate,
}: PracticeQuestionsViewerProps) {
    const [activeTab, setActiveTab] = useState<"mcq" | "short" | "paragraph">("mcq");
    const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
    const [mcqChecked, setMcqChecked] = useState<Record<number, boolean>>({});
    const [currentContent, setCurrentContent] = useState(content);
    const [isGeneratingMore, setIsGeneratingMore] = useState(false);
    const [expandCount, setExpandCount] = useState(initialExpandCount);

    const { getToken } = useAuth();

    let data: PracticeData;
    try {
        data = JSON.parse(currentContent);
    } catch {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border p-8 rounded-2xl text-foreground">
                    Failed to load quiz.
                    <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const handleMcqSelect = (qid: number, ans: string) => {
        if (mcqChecked[qid]) return;
        setMcqAnswers((p) => ({ ...p, [qid]: ans }));
    };
    const handleMcqCheck = (qid: number) => setMcqChecked((p) => ({ ...p, [qid]: true }));

    const mcqScore = data.mcq.reduce(
        (s, q) => (mcqChecked[q.id] && mcqAnswers[q.id] === q.correct_answer ? s + 1 : s),
        0
    );
    const checkedCount = data.mcq.filter((q) => mcqChecked[q.id]).length;
    const allMcqChecked = data.mcq.length > 0 && data.mcq.every((q) => mcqChecked[q.id]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleGenerateMore = async () => {
        if (expandCount >= 1) {
            toast.error("You've reached the limit for generating more questions. Upgrade your plan to continue.");
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
            onContentUpdate?.(newContent, newExpandCount);
            toast.success(`${result.added_count} new questions added!`);
        } catch (err: any) {
            if (err.response?.status === 402) {
                toast.error("Limit reached. Upgrade your plan to generate more.");
            } else {
                toast.error("Failed to generate more questions");
            }
        } finally {
            setIsGeneratingMore(false);
        }
    };

    const tabs = [
        { id: "mcq" as const, label: "MCQ", count: data.breakdown?.mcq || 0 },
        { id: "short" as const, label: "Short Answer", count: data.breakdown?.short_answer || 0 },
        { id: "paragraph" as const, label: "Long Answer", count: data.breakdown?.paragraph || 0 },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ClipboardList size={17} className="text-purple-500" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {data.total} questions · {data.exam_relevant_count} exam-relevant
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Generate More button */}
                        <button
                            onClick={handleGenerateMore}
                            disabled={isGeneratingMore || expandCount >= 1}
                            title={expandCount >= 1 ? "You have reached the limit for generating more questions" : ""}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${expandCount >= 1
                                    ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 opacity-50 cursor-not-allowed"
                                    : "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
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
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border px-5 flex-shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-purple-500 text-purple-500"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* MCQ */}
                    {activeTab === "mcq" && (
                        <>
                            {/* Score banner — shown once any MCQ has been checked */}
                            {checkedCount > 0 && (
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Trophy size={20} className="text-purple-500" />
                                        <span className="text-foreground font-medium text-sm">
                                            Score: {mcqScore}/{checkedCount} checked
                                            {allMcqChecked && ` (${Math.round((mcqScore / data.mcq.length) * 100)}%)`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMcqAnswers({});
                                            setMcqChecked({});
                                        }}
                                        className="text-xs text-purple-500 hover:text-purple-400 px-3 py-1 border border-purple-500/20 rounded-lg"
                                    >
                                        Reset All
                                    </button>
                                </div>
                            )}

                            {data.mcq.map((q) => {
                                const isChecked = mcqChecked[q.id];
                                const selected = mcqAnswers[q.id];
                                const isCorrect = selected === q.correct_answer;
                                return (
                                    <div
                                        key={`mcq-${q.id}`}
                                        className={`bg-muted/40 border rounded-xl p-5 ${isChecked
                                            ? isCorrect
                                                ? "border-green-500/30"
                                                : "border-red-500/30"
                                            : "border-border"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-start gap-2 flex-1">
                                                <span className="text-xs text-muted-foreground mt-1 flex-shrink-0">
                                                    Q{q.id}
                                                </span>
                                                <p className="text-foreground text-sm leading-relaxed">
                                                    {q.question}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {q.is_past_year && <PastYearBadge />}
                                                <DifficultyBadge difficulty={q.difficulty} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {q.options.map((option) => {
                                                const letter = option.charAt(0);
                                                const isSelected = selected === letter;
                                                const isCorrectOption = letter === q.correct_answer;
                                                let style = "border-border hover:border-muted-foreground bg-background";
                                                if (isChecked) {
                                                    if (isCorrectOption) style = "border-green-500/40 bg-green-500/10";
                                                    else if (isSelected) style = "border-red-500/40 bg-red-500/10";
                                                    else style = "border-border bg-background opacity-50";
                                                } else if (isSelected) {
                                                    style = "border-purple-500/40 bg-purple-500/10";
                                                }
                                                return (
                                                    <button
                                                        key={option}
                                                        onClick={() => handleMcqSelect(q.id, letter)}
                                                        disabled={isChecked}
                                                        className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex items-center gap-3 ${style} ${isChecked ? "cursor-default" : "cursor-pointer"
                                                            }`}
                                                    >
                                                        {isChecked && isCorrectOption && (
                                                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                                        )}
                                                        {isChecked && isSelected && !isCorrectOption && (
                                                            <XCircle size={14} className="text-red-500 flex-shrink-0" />
                                                        )}
                                                        <span className="text-foreground/90">{option}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {!isChecked && selected && (
                                            <button
                                                onClick={() => handleMcqCheck(q.id)}
                                                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-500 rounded-lg text-sm transition-colors"
                                            >
                                                Check Answer
                                            </button>
                                        )}
                                        {isChecked && (
                                            <div
                                                className={`mt-3 p-3 rounded-lg text-sm border ${isCorrect
                                                    ? "bg-green-500/5 border-green-500/20"
                                                    : "bg-red-500/5 border-red-500/20"
                                                    }`}
                                            >
                                                <p className={`font-medium mb-1 ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                                                    {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                                                </p>
                                                <p className="text-muted-foreground">{q.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Short Answer */}
                    {activeTab === "short" &&
                        data.short_answer.map((q) => (
                            <WrittenQuestion key={`short-${q.id}`} q={q} type="short_answer" onEvaluate={onEvaluate} />
                        ))}

                    {/* Long Answer */}
                    {activeTab === "paragraph" &&
                        data.paragraph.map((q) => (
                            <WrittenQuestion key={`para-${q.id}`} q={q} type="paragraph" onEvaluate={onEvaluate} />
                        ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-muted hover:bg-muted/70 border border-border text-foreground rounded-lg transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect, use, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
    Plus, Trash2, Send, Loader2,
    Search, ArrowLeft, FileText, Sparkles, AlertTriangle, RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";

interface Note {
    id: string;
    text: string;
    created_at: string;
    updated_at: string;
}

interface ConversationMessage {
    id?: string;
    role: "user" | "assistant";
    content: string;
    created_at?: string;
}

interface NotesPageProps {
    params: Promise<{ projectId: string }>;
}

export default function NotesPage({ params }: NotesPageProps) {
    const { projectId } = use(params);
    const { getToken } = useAuth();
    const router = useRouter();

    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [noteText, setNoteText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [question, setQuestion] = useState("");
    const [isAskingAI, setIsAskingAI] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isClearingHistory, setIsClearingHistory] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const chatBottomRef = useRef<HTMLDivElement>(null);

    // ── Scroll chat to bottom whenever history updates ──────────────────
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationHistory, isAskingAI]);

    // ── Initial load ─────────────────────────────────────────────────────
    useEffect(() => {
        loadNotes();
    }, [projectId]);

    // ── Autosave ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!selectedNote) return;
        const timeout = setTimeout(() => {
            saveNote();
        }, 1500);
        return () => clearTimeout(timeout);
    }, [noteText]);

    // ── Load conversation history whenever selected note changes ─────────
    useEffect(() => {
        if (!selectedNote) {
            setConversationHistory([]);
            return;
        }
        loadConversationHistory(selectedNote.id);
    }, [selectedNote?.id]);

    // ── API helpers ───────────────────────────────────────────────────────

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const res = await apiClient.get(`/api/projects/${projectId}/notes`, token);
            const data: Note[] = res ?? [];
            setNotes(data);
            if (data.length > 0) {
                setSelectedNote(data[0]);
                setNoteText(data[0].text);
            }
        } catch {
            toast.error("Failed to load notes");
        } finally {
            setIsLoading(false);
        }
    };

    const loadConversationHistory = async (noteId: string) => {
        try {
            setIsLoadingHistory(true);
            const token = await getToken();
            const res = await apiClient.get(
                `/api/projects/${projectId}/notes/${noteId}/conversation`,
                token
            );
            setConversationHistory(res ?? []);
        } catch {
            // Non-fatal — just show empty history
            setConversationHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const createNote = async () => {
        try {
            setIsCreating(true);
            const token = await getToken();
            const newNote: Note = await apiClient.post(
                `/api/projects/${projectId}/notes`,
                { text: "" },
                token
            );
            setNotes((prev) => [newNote, ...prev]);
            setSelectedNote(newNote);
            setNoteText("");
        } catch {
            toast.error("Failed to create note");
        } finally {
            setIsCreating(false);
        }
    };

    const saveNote = async () => {
        if (!selectedNote) return;
        try {
            setIsSaving(true);
            const token = await getToken();
            await apiClient.put(
                `/api/projects/${projectId}/notes/${selectedNote.id}`,
                { text: noteText },
                token
            );
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === selectedNote.id ? { ...n, text: noteText } : n
                )
            );
        } catch {
            // silent fail on autosave
        } finally {
            setIsSaving(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            setIsDeleting(true);
            const token = await getToken();
            await apiClient.delete(
                `/api/projects/${projectId}/notes/${noteId}`,
                token
            );
            const remaining = notes.filter((n) => n.id !== noteId);
            setNotes(remaining);
            if (selectedNote?.id === noteId) {
                setSelectedNote(remaining[0] ?? null);
                setNoteText(remaining[0]?.text ?? "");
            }
            toast.success("Note deleted");
        } catch {
            toast.error("Failed to delete note");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmId(null);
        }
    };

    const askAI = async () => {
        if (!question.trim() || !selectedNote) return;
        const userMessage = question.trim();

        // Optimistically add user message to UI
        setConversationHistory((prev) => [
            ...prev,
            { role: "user", content: userMessage },
        ]);
        setQuestion("");

        try {
            setIsAskingAI(true);
            const token = await getToken();
            const res = await apiClient.post(
                `/api/projects/${projectId}/notes/${selectedNote.id}/ask`,
                { question: userMessage },
                token
            );
            setConversationHistory((prev) => [
                ...prev,
                { role: "assistant", content: res.response },
            ]);
        } catch {
            toast.error("Failed to get AI response");
            // Remove the optimistic user message on failure
            setConversationHistory((prev) => prev.slice(0, -1));
            setQuestion(userMessage);
        } finally {
            setIsAskingAI(false);
        }
    };

    const clearHistory = async () => {
        if (!selectedNote) return;
        try {
            setIsClearingHistory(true);
            const token = await getToken();
            await apiClient.delete(
                `/api/projects/${projectId}/notes/${selectedNote.id}/conversation`,
                token
            );
            setConversationHistory([]);
            toast.success("Conversation cleared");
        } catch {
            toast.error("Failed to clear conversation");
        } finally {
            setIsClearingHistory(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────

    const filteredNotes = notes.filter((n) =>
        n.text.toLowerCase().includes(searchText.toLowerCase())
    );

    const getPreview = (text: string) =>
        text.trim().substring(0, 45) || "Empty note";

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle size={16} className="text-destructive" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">Delete note?</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-5 ml-12">
                            This action cannot be undone. The note and its conversation history will be permanently deleted.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors disabled:opacity-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteNote(deleteConfirmId)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs text-destructive-foreground bg-destructive/80 hover:bg-destructive rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
                            >
                                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR */}
            <div className="w-72 bg-card border-r border-border flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => router.push(`/projects/${projectId}`)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h2 className="text-sm font-semibold text-foreground flex-1">Notes</h2>
                        <button
                            onClick={createNote}
                            disabled={isCreating}
                            className="p-1.5 bg-foreground hover:bg-foreground/90 text-background rounded-lg transition-colors disabled:opacity-50"
                            title="New note"
                        >
                            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={16} className="animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-10 h-10 bg-muted border border-border rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <FileText size={16} className="text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {searchText ? "No notes match your search" : "No notes yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => {
                                        setSelectedNote(note);
                                        setNoteText(note.text);
                                    }}
                                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${selectedNote?.id === note.id
                                        ? "bg-primary/10 border border-primary/30"
                                        : "hover:bg-muted border border-transparent"
                                        }`}
                                >
                                    <p className="text-sm font-medium text-foreground truncate pr-6">
                                        {selectedNote?.id === note.id
                                            ? getPreview(noteText)
                                            : getPreview(note.text)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(note.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmId(note.id);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN AREA */}
            {selectedNote ? (
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Editor */}
                    <div className="flex-1 flex flex-col p-6 border-b border-border min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-muted-foreground">
                                {new Date(selectedNote.created_at).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                            {isSaving && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Loader2 size={10} className="animate-spin" /> Saving...
                                </span>
                            )}
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Start writing your note..."
                            className="flex-1 w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed font-sans"
                        />
                    </div>

                    {/* AI Chat */}
                    <div className="h-72 flex flex-col p-4 bg-muted/30 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-primary/10 border border-primary/20 rounded flex items-center justify-center">
                                    <Sparkles size={12} className="text-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                    Ask AI about your note
                                </span>
                            </div>
                            {conversationHistory.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    disabled={isClearingHistory}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                                    title="Clear conversation"
                                >
                                    {isClearingHistory
                                        ? <Loader2 size={12} className="animate-spin" />
                                        : <RotateCcw size={12} />
                                    }
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                                </div>
                            ) : conversationHistory.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Ask a question about this note to get started...
                                </p>
                            ) : (
                                conversationHistory.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-card border border-border text-foreground"
                                                }`}
                                        >
                                            {msg.role === "assistant" ? (
                                                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                            ) : (
                                                <p>{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isAskingAI && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border px-3 py-2 rounded-lg flex items-center gap-2">
                                        <Loader2 size={11} className="animate-spin text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            {/* Scroll anchor */}
                            <div ref={chatBottomRef} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!isAskingAI && question.trim()) {
                                                askAI();
                                            }
                                        }
                                    }}
                                    onInput={(e) => {
                                        const t = e.target as HTMLTextAreaElement;
                                        t.style.height = "auto";
                                        t.style.height = Math.min(t.scrollHeight, 128) + "px";
                                    }}
                                    placeholder="Ask a question..."
                                    disabled={isAskingAI}
                                    rows={1}
                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-all resize-none min-h-[34px] max-h-32 overflow-y-auto"
                                />
                                <button
                                    onClick={askAI}
                                    disabled={isAskingAI || !question.trim()}
                                    className="px-3 py-2 bg-foreground hover:bg-foreground/90 disabled:opacity-40 text-background rounded-lg transition-colors flex items-center justify-center min-h-[34px]"
                                >
                                    {isAskingAI ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Send size={14} />
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[10px] text-muted-foreground">
                                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">Enter</kbd>{" "}
                                    to send,{" "}
                                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">Shift+Enter</kbd>{" "}
                                    for new line
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-muted border border-border rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <FileText size={22} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">No notes yet</p>
                        <button
                            onClick={createNote}
                            disabled={isCreating}
                            className="px-4 py-2 bg-foreground hover:bg-foreground/90 text-background text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {isCreating ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Plus size={14} />
                            )}
                            Create Note
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
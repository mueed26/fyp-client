"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
    Plus, Trash2, Send, Loader2,
    Search, ArrowLeft, FileText, Sparkles, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface Note {
    id: string;
    text: string;
    created_at: string;
    updated_at: string;
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
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [question, setQuestion] = useState("");
    const [isAskingAI, setIsAskingAI] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadNotes();
    }, [projectId]);

    useEffect(() => {
        if (!selectedNote) return;
        const timeout = setTimeout(() => {
            saveNote();
        }, 1500);
        return () => clearTimeout(timeout);
    }, [noteText]);

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

    const createNote = async () => {
        try {
            setIsCreating(true);
            const token = await getToken();
            const newNote: Note = await apiClient.post(`/api/projects/${projectId}/notes`, { text: "" }, token);
            setNotes((prev) => [newNote, ...prev]);
            setSelectedNote(newNote);
            setNoteText("");
            setConversationHistory([]);
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
                prev.map((n) => n.id === selectedNote.id ? { ...n, text: noteText } : n)
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
            await apiClient.delete(`/api/projects/${projectId}/notes/${noteId}`, token);
            const remaining = notes.filter((n) => n.id !== noteId);
            setNotes(remaining);
            if (selectedNote?.id === noteId) {
                setSelectedNote(remaining[0] ?? null);
                setNoteText(remaining[0]?.text ?? "");
                setConversationHistory([]);
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
        if (!question.trim()) return;
        try {
            setIsAskingAI(true);
            const token = await getToken();
            const newHistory = [...conversationHistory, { role: "user" as const, content: question }];
            const allQuestions = newHistory.filter((h) => h.role === "user").map((h) => h.content);
            const res = await apiClient.post(
                `/api/projects/${projectId}/notes/ask`,
                { questions: allQuestions },
                token
            );
            setConversationHistory([...newHistory, { role: "assistant", content: res.response }]);
            setQuestion("");
        } catch {
            toast.error("Failed to get AI response");
        } finally {
            setIsAskingAI(false);
        }
    };

    const filteredNotes = notes.filter((n) =>
        n.text.toLowerCase().includes(searchText.toLowerCase())
    );

    const getPreview = (text: string) => text.trim().substring(0, 45) || "Empty note";

    return (
        <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden">

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle size={16} className="text-red-400" />
                            </div>
                            <h3 className="text-sm font-medium text-white">Delete note?</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-5 ml-12">
                            This action cannot be undone. The note will be permanently deleted.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs text-gray-300 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteNote(deleteConfirmId)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-xs text-white bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR */}
            <div className="w-72 bg-[#1a1a1a] border-r border-gray-800 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => router.push(`/projects/${projectId}`)}
                            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#252525] rounded-md transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h2 className="text-sm font-medium text-gray-200 flex-1">Notes</h2>
                        <button
                            onClick={createNote}
                            disabled={isCreating}
                            className="p-1.5 bg-white hover:bg-gray-100 text-black rounded-md transition-colors disabled:opacity-50"
                            title="New note"
                        >
                            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-[#252525] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={16} className="animate-spin text-gray-500" />
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-10 h-10 bg-[#252525] border border-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <FileText size={16} className="text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-500">
                                {searchText ? "No notes match your search" : "No notes yet. Create one!"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => {
                                        setSelectedNote(note);
                                        setNoteText(note.text);
                                        setConversationHistory([]);
                                    }}
                                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${selectedNote?.id === note.id
                                        ? "bg-[#252525] border border-gray-600"
                                        : "hover:bg-[#202020] border border-transparent"
                                        }`}
                                >
                                    <p className="text-sm text-gray-200 truncate pr-6">
                                        {selectedNote?.id === note.id ? getPreview(noteText) : getPreview(note.text)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(note.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmId(note.id);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all"
                                    >
                                        <Trash2 size={12} className="text-red-400" />
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
                    <div className="flex-1 flex flex-col p-6 border-b border-gray-800 min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-500">
                                {new Date(selectedNote.created_at).toLocaleDateString("en-US", {
                                    weekday: "long", month: "long", day: "numeric", year: "numeric",
                                })}
                            </span>
                            {isSaving && (
                                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <Loader2 size={10} className="animate-spin" /> Saving...
                                </span>
                            )}
                        </div>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Start writing your note..."
                            className="flex-1 w-full bg-transparent text-gray-200 placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
                        />
                    </div>

                    {/* AI Chat */}
                    <div className="h-72 flex flex-col p-4 bg-[#111519]">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={13} className="text-blue-400" />
                            <span className="text-xs font-medium text-gray-400">Ask AI about your notes</span>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1">
                            {conversationHistory.length === 0 ? (
                                <p className="text-xs text-gray-600">Ask anything about your notes...</p>
                            ) : (
                                conversationHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-[#1a1a1a] border border-gray-800 text-gray-300"
                                            }`}>
                                            {msg.role === "assistant" ? (
                                                <div dangerouslySetInnerHTML={{ __html: msg.content }} className="text-xs leading-relaxed" />
                                            ) : (
                                                <p className="text-xs">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isAskingAI && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1a1a1a] border border-gray-800 px-3 py-2 rounded-lg flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin text-gray-400" />
                                        <span className="text-xs text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !isAskingAI && askAI()}
                                placeholder="Ask a question about your notes..."
                                disabled={isAskingAI}
                                className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 disabled:opacity-50 transition-colors"
                            />
                            <button
                                onClick={askAI}
                                disabled={isAskingAI || !question.trim()}
                                className="px-3 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-lg transition-colors"
                            >
                                {isAskingAI ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-[#1a1a1a] border border-gray-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <FileText size={22} className="text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Select a note or create a new one</p>
                        <button
                            onClick={createNote}
                            disabled={isCreating}
                            className="px-4 py-2 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            New Note
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
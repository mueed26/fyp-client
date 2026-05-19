"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2, Send, Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";

interface Note {
    id: string;
    text: string;
    created_at: string;
    updated_at: string;
}

interface NotesPanelProps {
    projectId: string;
}

export function NotesPanel({ projectId }: NotesPanelProps) {
    const { getToken } = useAuth();

    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [noteText, setNoteText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [question, setQuestion] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isAskingAI, setIsAskingAI] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

    useEffect(() => {
        loadNotes();
    }, [projectId]);

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
        } catch (error) {
            toast.error("Failed to load notes");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewNote = async () => {
        try {
            const token = await getToken();
            const newNote: Note = await apiClient.post(
                `/api/projects/${projectId}/notes`,
                { text: "" },
                token
            );
            if (!newNote?.id) {
                toast.error("Invalid note response from server");
                return;
            }
            setNotes((prev) => [newNote, ...prev]);
            setSelectedNote(newNote);
            setNoteText("");
            setConversationHistory([]);
            setAiResponse("");
            toast.success("Note created");
        } catch (error) {
            toast.error("Failed to create note");
            console.error(error);
        }
    };

    const updateNote = async () => {
        if (!selectedNote) return;
        try {
            setIsSaving(true);
            const token = await getToken();
            await apiClient.put(
                `/api/projects/${projectId}/notes/${selectedNote.id}`,
                { text: noteText },
                token
            );
            toast.success("Note saved");
        } catch (error) {
            toast.error("Failed to save note");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            const token = await getToken();
            await apiClient.delete(
                `/api/projects/${projectId}/notes/${noteId}`,
                token
            );
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
                setNoteText("");
                setConversationHistory([]);
                setAiResponse("");
            }
            toast.success("Note deleted");
        } catch (error) {
            toast.error("Failed to delete note");
            console.error(error);
        }
    };

    const askAI = async () => {
        if (!question.trim()) return;
        try {
            setIsAskingAI(true);
            const token = await getToken();

            const newHistory = [...conversationHistory, { role: "user" as const, content: question }];
            const allQuestions = newHistory.filter(h => h.role === "user").map(h => h.content);

            const res = await apiClient.post(
                `/api/projects/${projectId}/notes/ask`,
                { questions: allQuestions },
                token
            );

            setConversationHistory([...newHistory, { role: "assistant", content: res.response }]);
            setAiResponse(res.response);
            setQuestion("");
        } catch (error) {
            toast.error("Failed to get AI response");
            console.error(error);
        } finally {
            setIsAskingAI(false);
        }
    };

    return (
        <div className="flex gap-4 h-full p-4 bg-[#1a1a1a]">
            {/* Notes List Sidebar */}
            <div className="w-64 border-r border-gray-700 pr-4 overflow-y-auto">
                <Button
                    onClick={createNewNote}
                    className="w-full mb-4 gap-2 bg-white hover:bg-gray-100 text-black font-medium"
                    disabled={isLoading}
                >
                    <Plus size={16} /> New Note
                </Button>

                <div className="space-y-2">
                    {isLoading ? (
                        <p className="text-xs text-gray-500 text-center py-4">Loading notes...</p>
                    ) : notes.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No notes yet</p>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className={`p-3 rounded-lg cursor-pointer border transition-all group ${selectedNote?.id === note.id
                                    ? "bg-blue-500/20 border-blue-500"
                                    : "bg-[#252525] border-gray-700 hover:border-gray-600"
                                    }`}
                                onClick={() => {
                                    setSelectedNote(note);
                                    setNoteText(note.text);
                                    setConversationHistory([]);
                                    setAiResponse("");
                                }}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 truncate">
                                            {note.text.substring(0, 40) || "Untitled"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNote(note.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Note Editor & AI Chat */}
            <div className="flex-1 flex flex-col">
                {selectedNote ? (
                    <>
                        {/* Editor Section */}
                        <div className="flex-1 p-4 border-b border-gray-700 mb-4 rounded-lg bg-[#252525]">
                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-xs text-gray-400 font-medium">Note Content</label>
                                {isSaving && <span className="text-xs text-blue-400">Saving...</span>}
                            </div>
                            <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onBlur={updateNote}
                                placeholder="Type your notes here... (auto-saves when you stop typing)"
                                className="w-full h-full bg-[#1a1a1a] border-gray-700 text-gray-200 placeholder-gray-500 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>

                        {/* AI Chat Section */}
                        <div className="flex-1 flex flex-col bg-[#252525] rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare size={14} className="text-blue-400" />
                                <h3 className="text-xs text-gray-400 font-medium">Ask AI About Your Notes</h3>
                            </div>

                            {/* Response Area */}
                            <div className="flex-1 overflow-y-auto mb-4 bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
                                {conversationHistory.length === 0 ? (
                                    <p className="text-xs text-gray-500">Start asking questions about your notes...</p>
                                ) : (
                                    <div className="space-y-4">
                                        {conversationHistory.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user"
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-[#252525] border border-gray-700 text-gray-200"
                                                        }`}
                                                >
                                                    {msg.role === "assistant" ? (
                                                        <div
                                                            dangerouslySetInnerHTML={{ __html: msg.content }}
                                                            className="bot-response text-sm"
                                                        />
                                                    ) : (
                                                        <p className="text-sm">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isAskingAI && (
                                            <div className="flex justify-start">
                                                <div className="bg-[#252525] border border-gray-700 text-gray-300 p-3 rounded-lg text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Thinking...
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !isAskingAI && askAI()}
                                    placeholder="Ask a question..."
                                    disabled={isAskingAI}
                                    className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 disabled:opacity-50 text-sm"
                                />
                                <Button
                                    onClick={askAI}
                                    disabled={isAskingAI || !question.trim()}
                                    className="gap-2 bg-white hover:bg-gray-100 text-black disabled:bg-gray-600 disabled:text-gray-400"
                                >
                                    {isAskingAI ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Create or select a note to start</p>
                    </div>
                )}
            </div>
        </div>
    );
}
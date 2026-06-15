"use client";

import { useDropzone } from "react-dropzone";
import {
    FileText,
    Plus,
    Upload,
    Globe,
    File,
    Presentation,
    CheckCircle,
    AlertCircle,
    Loader2,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import { ProjectDocument } from "@/lib/types";
import { JSX, useState } from "react";

const documentUtils = {
    formatFileSize: (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    },
    formatTimeAgo: (dateString: string) => {
        const diffH = Math.floor(
            (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60)
        );
        if (diffH < 1) return "Just now";
        if (diffH < 24) return `${diffH}h ago`;
        const diffD = Math.floor(diffH / 24);
        return diffD < 7
            ? `${diffD}d ago`
            : new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
    },
    getIcon: (doc: ProjectDocument): JSX.Element => {
        if (doc.source_url)
            return <Globe size={13} className="text-muted-foreground" />;
        const type = doc.file_type?.toLowerCase() || "";
        if (type.includes("pdf"))
            return <FileText size={13} className="text-muted-foreground" />;
        if (type.includes("ppt") || type.includes("presentation"))
            return <Presentation size={13} className="text-muted-foreground" />;
        if (type.includes("word") || type.includes("document"))
            return <File size={13} className="text-muted-foreground" />;
        return <FileText size={13} className="text-muted-foreground" />;
    },
    getDisplayName: (doc: ProjectDocument) => {
        if (!doc.source_url) return doc.filename;
        try {
            const u = new URL(doc.source_url);
            return u.hostname + u.pathname;
        } catch {
            return doc.source_url;
        }
    },
    getSize: (doc: ProjectDocument) =>
        doc.source_url
            ? "Website"
            : documentUtils.formatFileSize(doc.file_size),
    getStatusIcon: (status: string): JSX.Element => {
        if (status === "completed")
            return <CheckCircle size={11} className="text-green-500" />;
        if (status === "failed")
            return <AlertCircle size={11} className="text-destructive" />;
        return <Loader2 size={11} className="text-primary animate-spin" />;
    },
    getStatusText: (status: string) => {
        const texts: Record<string, string> = {
            uploading: "Uploading",
            queued: "Queued",
            partitioning: "Processing",
            chunking: "Chunking",
            summarising: "Summarising",
            vectorization: "Vectorising",
            completed: "Ready",
            failed: "Failed",
        };
        return texts[status] || "Unknown";
    },
};

interface LeftPanelProps {
    projectId: string;
    projectDocuments: ProjectDocument[];
    onDocumentUpload: (files: File[]) => Promise<void>;
    onDocumentDelete: (docId: string) => Promise<void>;
    onOpenDocument: (docId: string) => void;
    onUrlAdd: (url: string) => Promise<void>;
}

export function LeftPanel({
    projectId,
    projectDocuments,
    onDocumentUpload,
    onDocumentDelete,
    onOpenDocument,
    onUrlAdd,
}: LeftPanelProps) {
    const [urlInput, setUrlInput] = useState("");
    const [isAddingUrl, setIsAddingUrl] = useState(false);
    const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
    const [isDeletingDoc, setIsDeletingDoc] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDocumentUpload,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                [".pptx"],
            "text/plain": [".txt"],
            "text/markdown": [".md"],
        },
        maxSize: 50 * 1024 * 1024,
    });

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput.trim() || isAddingUrl) return;
        setIsAddingUrl(true);
        try {
            await onUrlAdd(urlInput.trim());
            setUrlInput("");
        } catch {
            // handled upstream
        } finally {
            setIsAddingUrl(false);
        }
    };

    const handleDeleteDoc = async () => {
        if (!deleteDocId) return;
        try {
            setIsDeletingDoc(true);
            await onDocumentDelete(deleteDocId);
        } finally {
            setIsDeletingDoc(false);
            setDeleteDocId(null);
        }
    };

    const pendingDoc = deleteDocId
        ? projectDocuments.find((d) => d.id === deleteDocId)
        : null;
    const isWebsite = !!pendingDoc?.source_url;

    return (
        <div className="w-72 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">

            {/* DELETE SOURCE CONFIRMATION MODAL */}
            {deleteDocId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={16} className="text-destructive" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Delete {isWebsite ? "website" : "document"}?
                            </h3>
                        </div>
                        {pendingDoc && (
                            <p className="text-xs text-muted-foreground mb-1 ml-12 truncate font-medium text-foreground/70">
                                {documentUtils.getDisplayName(pendingDoc)}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mb-5 ml-12">
                            This action cannot be undone. The source and all its indexed content will be permanently removed.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeleteDocId(null)}
                                disabled={isDeletingDoc}
                                className="px-4 py-2 text-xs text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors disabled:opacity-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteDoc}
                                disabled={isDeletingDoc}
                                className="px-4 py-2 text-xs text-destructive-foreground bg-destructive/80 hover:bg-destructive rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 font-medium"
                            >
                                {isDeletingDoc ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Sources
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Upload zone */}
                <div
                    {...getRootProps()}
                    className={`
              border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer
              ${isDragActive
                            ? "border-primary/60 bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/60"
                        }
            `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                            <Upload size={16} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {isDragActive ? "Drop files here" : "Upload files"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                PDF, DOCX, PPT, MD, TXT · Max 50 MB
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                </div>

                <form onSubmit={handleUrlSubmit} className="space-y-2">
                    <div className="relative">
                        <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Paste website URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isAddingUrl}
                            className="w-full pl-9 pr-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!urlInput.trim() || isAddingUrl}
                        className="w-full py-2.5 bg-foreground hover:bg-foreground/90 disabled:opacity-40 text-background rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isAddingUrl ? (
                            <><Loader2 size={13} className="animate-spin" /> Adding...</>
                        ) : (
                            <><Plus size={13} /> Add website</>
                        )}
                    </button>
                </form>

                <hr className="border-border" />

                {/* Sources list */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Documents
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {projectDocuments.length}
                        </span>
                    </div>

                    {projectDocuments.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText size={20} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No sources yet</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {[...projectDocuments]
                                .sort(
                                    (a, b) =>
                                        new Date(b.created_at).getTime() -
                                        new Date(a.created_at).getTime()
                                )
                                .map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => onOpenDocument(doc.id)}
                                        className="group flex items-center gap-2.5 p-2.5 bg-muted/40 hover:bg-muted border border-border hover:border-border/80 rounded-xl cursor-pointer transition-all"
                                    >
                                        <div className="w-7 h-7 bg-background border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                                            {documentUtils.getIcon(doc)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {documentUtils.getDisplayName(doc)}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {documentUtils.getSize(doc)}
                                                </span>
                                                <span className="text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {documentUtils.formatTimeAgo(doc.created_at)}
                                                </span>
                                                {doc.processing_status &&
                                                    doc.processing_status !== "completed" && (
                                                        <div className="flex items-center gap-1 ml-auto">
                                                            {documentUtils.getStatusIcon(doc.processing_status)}
                                                            <span className="text-xs text-muted-foreground">
                                                                {documentUtils.getStatusText(doc.processing_status)}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteDocId(doc.id);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                            title="Delete source"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
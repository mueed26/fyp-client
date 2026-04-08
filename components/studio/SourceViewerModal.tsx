"use client";

import { X, FileText, HelpCircle, BookOpen, ClipboardList } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { GeneratedSource } from "@/lib/types";

interface SourceViewerModalProps {
    source: GeneratedSource | null;
    onClose: () => void;
}

function getSourceIcon(sourceType: string) {
    switch (sourceType) {
        case "summary":
            return <FileText size={18} className="text-blue-400" />;
        case "faq":
            return <HelpCircle size={18} className="text-purple-400" />;
        case "study_guide":
            return <BookOpen size={18} className="text-green-400" />;
        case "briefing_doc":
            return <ClipboardList size={18} className="text-amber-400" />;
        default:
            return <FileText size={18} className="text-gray-400" />;
    }
}

function formatSourceType(type: string) {
    return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export function SourceViewerModal({ source, onClose }: SourceViewerModalProps) {
    if (!source) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={handleOverlayClick}
        >
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#252525] border border-gray-700 rounded-lg flex items-center justify-center">
                            {getSourceIcon(source.source_type)}
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-200">
                                {source.title}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {formatSourceType(source.source_type)} •{" "}
                                {source.total_sources} source
                                {source.total_sources !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-[#252525] rounded-lg"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-xl font-bold text-gray-100 mt-6 mb-3 first:mt-0">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold text-gray-200 mt-5 mb-2">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-base font-semibold text-gray-300 mt-4 mb-2">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }) => (
                                    <p className="text-gray-300 leading-relaxed mb-3">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc ml-5 mb-3 space-y-1">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal ml-5 mb-3 space-y-1">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="text-gray-300">{children}</li>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-100">
                                        {children}
                                    </strong>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        className="text-blue-400 underline hover:text-blue-300"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {children}
                                    </a>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-gray-600 pl-4 my-3 text-gray-400 italic">
                                        {children}
                                    </blockquote>
                                ),
                                code: ({ children }) => (
                                    <code className="bg-[#252525] text-gray-300 px-1.5 py-0.5 rounded text-xs">
                                        {children}
                                    </code>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-4">
                                        <table className="w-full border-collapse border border-gray-700 text-sm">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                th: ({ children }) => (
                                    <th className="border border-gray-700 bg-[#252525] px-3 py-2 text-left text-gray-200 font-medium">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-gray-700 px-3 py-2 text-gray-300">
                                        {children}
                                    </td>
                                ),
                            }}
                        >
                            {source.content}
                        </ReactMarkdown>
                    </div>
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
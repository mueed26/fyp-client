"use client";

import React, { use, useEffect, useState } from "react";
import { ConversationsList } from "@/components/projects/ConversationsList";
import { KnowledgeBaseSidebar } from "@/components/projects/KnowledgeBaseSidebar";
import { FileDetailsModal } from "@/components/projects/FileDetailsModal";
import { SourceViewerModal } from "@/components/studio/SourceViewerModal";
import { MindMapViewerModal } from "@/components/studio/MindMapViewerModal";
import { FlashcardViewer } from "@/components/studio/FlashcardViewer";
import { PracticeQuestionsViewer } from "@/components/studio/PracticeQuestionsViewer";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NotFound } from "@/components/ui/NotFound";
import toast from "react-hot-toast";
import {
    Project,
    Chat,
    ProjectDocument,
    ProjectSettings,
    GeneratedSource,
} from "@/lib/types";
import { useRouter } from "next/navigation";

interface ProjectPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

interface ProjectData {
    project: Project | null;
    chats: Chat[];
    documents: ProjectDocument[];
    settings: ProjectSettings | null;
}

function ProjectPage({ params }: ProjectPageProps) {
    const { projectId } = use(params);
    const { getToken, userId } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<ProjectData>({
        project: null,
        chats: [],
        documents: [],
        settings: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const [activeTab, setActiveTab] = useState<"documents" | "settings" | "studio">("documents");
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

    // Studio states
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [generatedSources, setGeneratedSources] = useState<GeneratedSource[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingType, setGeneratingType] = useState<string | null>(null);

    // Modal states
    const [viewingSource, setViewingSource] = useState<GeneratedSource | null>(null);
    const [viewingMindMap, setViewingMindMap] = useState<{ title: string; content: string } | null>(null);
    const [viewingFlashcards, setViewingFlashcards] = useState<{ title: string; content: string } | null>(null);
    const [viewingPracticeQuestions, setViewingPracticeQuestions] = useState<{ title: string; content: string } | null>(null);

    // Load all data
    useEffect(() => {
        const loadAllData = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                const [projectRes, chatsRes, documentsRes, settingsRes, sourcesRes] = await Promise.all([
                    apiClient.get(`/api/projects/${projectId}`, token),
                    apiClient.get(`/api/projects/${projectId}/chats`, token),
                    apiClient.get(`/api/projects/${projectId}/files`, token),
                    apiClient.get(`/api/projects/${projectId}/settings`, token),
                    apiClient.get(`/api/projects/${projectId}/sources`, token),
                ]);
                setData({
                    project: projectRes.data,
                    chats: chatsRes.data,
                    documents: documentsRes.data,
                    settings: settingsRes.data,
                });
                setGeneratedSources(sourcesRes.data || []);
            } catch (err) {
                setError("Failed to fetch data");
                toast.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [userId, projectId]);

    // Polling for processing documents
    useEffect(() => {
        const hasProcessing = data.documents.some(
            (doc) => doc.processing_status && !["completed", "failed"].includes(doc.processing_status)
        );
        if (!hasProcessing) return;
        const poll = setInterval(async () => {
            try {
                const token = await getToken();
                const res = await apiClient.get(`/api/projects/${projectId}/files`, token);
                setData((prev) => ({ ...prev, documents: res.data }));
            } catch { }
        }, 2000);
        return () => clearInterval(poll);
    }, [data.documents, projectId, getToken]);

    // ===== CHAT METHODS =====
    const handleCreateNewChat = async () => {
        if (!userId) return;
        try {
            setIsCreatingChat(true);
            const token = await getToken();
            const result = await apiClient.post("/api/chats", { title: `Chat #${Date.now() % 10000}`, project_id: projectId }, token);
            const savedChat = result.data;
            router.push(`/projects/${projectId}/chats/${savedChat.id}`);
            setData((prev) => ({ ...prev, chats: [savedChat, ...prev.chats] }));
            toast.success("Chat Created successfully");
        } catch { toast.error("Failed to create chat"); }
        finally { setIsCreatingChat(false); }
    };

    const handleDeleteChat = async (chatId: string) => {
        if (!userId) return;
        try {
            const token = await getToken();
            await apiClient.delete(`/api/chats/${chatId}`, token);
            setData((prev) => ({ ...prev, chats: prev.chats.filter((c) => c.id !== chatId) }));
            toast.success("Chat deleted successfully");
        } catch { toast.error("Failed to delete chat"); }
    };

    const handleChatClick = (chatId: string) => router.push(`/projects/${projectId}/chats/${chatId}`);



    // ===== DOCUMENT METHODS =====
    const handleDocumentUpload = async (files: File[]) => {
        if (!userId) return;
        const token = await getToken();
        const uploaded: ProjectDocument[] = [];
        await Promise.allSettled(files.map(async (file) => {
            try {
                const uploadData = await apiClient.post(`/api/projects/${projectId}/files/upload-url`, { filename: file.name, file_size: file.size, file_type: file.type }, token);
                await apiClient.uploadToS3(uploadData.data.upload_url, file);
                const confirmed = await apiClient.post(`/api/projects/${projectId}/files/confirm`, { s3_key: uploadData.data.s3_key }, token);
                uploaded.push(confirmed.data);
            } catch { toast.error(`Failed to upload ${file.name}`); }
        }));
        if (uploaded.length > 0) {
            setData((prev) => ({ ...prev, documents: [...uploaded, ...prev.documents] }));
            toast.success(`${uploaded.length} file(s) uploaded`);
        }
    };

    const handleDocumentDelete = async (documentId: string) => {
        if (!userId) return;
        try {
            const token = await getToken();
            await apiClient.delete(`/api/projects/${projectId}/files/${documentId}`, token);
            setData((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== documentId) }));
            toast.success("Document deleted successfully!");
        } catch { toast.error("Document deletion failed"); }
    };

    const handleUrlAdd = async (url: string) => {
        if (!userId) return;
        try {
            const token = await getToken();
            const result = await apiClient.post(`/api/projects/${projectId}/urls`, { url }, token);
            setData((prev) => ({ ...prev, documents: [result.data, ...prev.documents] }));
            toast.success("Website added successfully!");
        } catch { toast.error("Failed to add website"); }
    };

    const handleOpenDocument = (documentId: string) => setSelectedDocumentId(documentId);

    // ===== SETTINGS METHODS =====
    const handleDraftSettings = (updates: any) => {
        setData((prev) => {
            if (!prev.settings) return prev;
            return { ...prev, settings: { ...prev.settings, ...updates } };
        });
    };

    const handlePublishSettings = async () => {
        if (!userId || !data.settings) { toast.error("Cannot save settings"); return; }
        try {
            const token = await getToken();
            const result = await apiClient.put(`/api/projects/${projectId}/settings`, data.settings, token);
            setData((prev) => ({ ...prev, settings: result.data }));
            toast.success("Settings saved successfully!");
        } catch { toast.error("Failed to save settings!"); }
    };

    // ===== STUDIO METHODS =====
    const handleToggleDocSelection = (docId: string) => {
        setSelectedDocIds((prev) => prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]);
    };

    const handleSelectAllDocs = () => {
        setSelectedDocIds(data.documents.filter((d) => d.processing_status === "completed").map((d) => d.id));
    };

    const handleDeselectAllDocs = () => setSelectedDocIds([]);

    const handleTagDocument = async (docId: string, tag: string) => {
        try {
            const token = await getToken();
            await apiClient.put(`/api/projects/${projectId}/files/${docId}/tag`, { source_tag: tag }, token);
            // Update local state
            setData((prev) => ({
                ...prev,
                documents: prev.documents.map((d) =>
                    d.id === docId ? { ...d, source_tag: tag } as any : d
                ),
            }));
            toast.success(`Document tagged as ${tag === "past_year_paper" ? "Past Year Paper" : "Lecture Notes"}`);
        } catch {
            toast.error("Failed to tag document");
        }
    };

    const handleGenerateFeature = async (docIds: string[], featureType: string) => {
        try {
            setIsGenerating(true);
            setGeneratingType(featureType);
            const token = await getToken();
            await apiClient.post(`/api/projects/${projectId}/features/generate`, { doc_ids: docIds, feature_type: featureType }, token);
        } catch (err) {
            toast.error(`Failed to generate ${featureType}`);
            setIsGenerating(false);
            setGeneratingType(null);
            throw err;
        }
    };

    const handleMergeFeature = async (docIds: string[], sourceType: string) => {
        try {
            const token = await getToken();
            const result = await apiClient.post(`/api/projects/${projectId}/features/merge`, { doc_ids: docIds, source_type: sourceType }, token);
            setGeneratedSources((prev) => [result.data, ...prev]);
            toast.success(`${sourceType.replace(/_/g, " ")} generated successfully!`);
        } catch {
            toast.error(`Failed to merge ${sourceType}`);
        } finally {
            setIsGenerating(false);
            setGeneratingType(null);
        }
    };

    const handleViewSource = (source: GeneratedSource) => {
        if (source.source_type === "mind_map") {
            setViewingMindMap({ title: source.title, content: source.content });
        } else if (source.source_type === "flashcards") {
            setViewingFlashcards({ title: source.title, content: source.content });
        } else if (source.source_type === "practice_questions") {
            setViewingPracticeQuestions({ title: source.title, content: source.content });
        } else {
            setViewingSource(source);
        }
    };
    const handleDeleteSource = async (sourceId: string) => {
        try {
            const token = await getToken();
            await apiClient.delete(`/api/projects/${projectId}/sources/${sourceId}`, token);
            setGeneratedSources((prev) => prev.filter((s) => s.id !== sourceId));
            toast.success("Source deleted successfully");
        } catch {
            toast.error("Failed to delete source");
        }
    };

    // ===== RENDER =====
    if (loading) return <LoadingSpinner message="Loading project..." />;
    if (!data.project) return <NotFound message="Project not found" />;

    const selectedDocument = selectedDocumentId ? data.documents.find((d) => d.id === selectedDocumentId) : null;

    return (
        <>
            <div className="flex h-screen bg-[#0d1117] gap-4 p-4">
                <ConversationsList
                    project={data.project}
                    conversations={data.chats}
                    error={error}
                    loading={isCreatingChat}
                    onCreateNewChat={handleCreateNewChat}
                    onChatClick={handleChatClick}
                    onDeleteChat={handleDeleteChat}
                />
                <KnowledgeBaseSidebar
                    activeTab={activeTab}
                    onSetActiveTab={setActiveTab}
                    projectDocuments={data.documents}
                    projectId={projectId}
                    onDocumentUpload={handleDocumentUpload}
                    onDocumentDelete={handleDocumentDelete}
                    onOpenDocument={handleOpenDocument}
                    onUrlAdd={handleUrlAdd}
                    projectSettings={data.settings}
                    settingsError={null}
                    settingsLoading={false}
                    onUpdateSettings={handleDraftSettings}
                    onApplySettings={handlePublishSettings}
                    selectedDocIds={selectedDocIds}
                    onToggleDocSelection={handleToggleDocSelection}
                    onSelectAllDocs={handleSelectAllDocs}
                    onDeselectAllDocs={handleDeselectAllDocs}
                    generatedSources={generatedSources}
                    onGenerateFeature={handleGenerateFeature}
                    onMergeFeature={handleMergeFeature}
                    onViewSource={handleViewSource}
                    onTagDocument={handleTagDocument}
                    onDeleteSource={handleDeleteSource}
                    isGenerating={isGenerating}
                    generatingType={generatingType}
                />
            </div>

            {selectedDocument && <FileDetailsModal document={selectedDocument} onClose={() => setSelectedDocumentId(null)} />}
            {viewingSource && <SourceViewerModal source={viewingSource} onClose={() => setViewingSource(null)} />}
            {viewingMindMap && <MindMapViewerModal title={viewingMindMap.title} content={viewingMindMap.content} onClose={() => setViewingMindMap(null)} />}
            {viewingFlashcards && <FlashcardViewer title={viewingFlashcards.title} content={viewingFlashcards.content} onClose={() => setViewingFlashcards(null)} />}
            {viewingPracticeQuestions && <PracticeQuestionsViewer title={viewingPracticeQuestions.title} content={viewingPracticeQuestions.content} onClose={() => setViewingPracticeQuestions(null)} />}
        </>
    );
}

export default ProjectPage;
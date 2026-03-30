"use client";

import React, { use, useEffect, useState } from "react";
import { ConversationsList } from "@/components/projects/ConversationsList";
import { KnowledgeBaseSidebar } from "@/components/projects/KnowledgeBaseSidebar";
import { FileDetailsModal } from "@/components/projects/FileDetailsModal";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NotFound } from "@/components/ui/NotFound";
import toast from "react-hot-toast";
import { Project, Chat, ProjectDocument, ProjectSettings } from "@/lib/types";

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
    // Data state
    const [data, setData] = useState<ProjectData>({
        project: null,
        chats: [],
        documents: [],
        settings: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreatingChat, setIsCreatingChat] = useState(false);

    // UI states
    const [activeTab, setActiveTab] = useState<"documents" | "settings">(
        "documents"
    );

    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null
    );

    // Load all data
    useEffect(() => {
        const loadAllData = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                setError(null);

                const token = await getToken();

                const [projectRes, chatsRes, documentsRes, settingsRes] =
                    await Promise.all([
                        apiClient.get(`/api/projects/${projectId}`, token),
                        apiClient.get(`/api/projects/${projectId}/chats`, token),
                        apiClient.get(`/api/projects/${projectId}/files`, token),
                        apiClient.get(`/api/projects/${projectId}/settings`, token),
                    ]);

                setData({
                    project: projectRes.data,
                    chats: chatsRes.data,
                    documents: documentsRes.data,
                    settings: settingsRes.data,
                });
            } catch (err) {
                setError("Failed to fetch data");
                toast.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [userId, projectId]);

    useEffect(() => {
        const hasProcessingDocuments = data.documents.some(
            (doc) =>
                doc.processing_status &&
                !["completed", "failed"].includes(doc.processing_status)
        );

        if (!hasProcessingDocuments) {
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const token = await getToken();
                const documentsRes = await apiClient.get(
                    `/api/projects/${projectId}/files`,
                    token
                );

                setData((prev) => ({
                    ...prev,
                    documents: documentsRes.data,
                }));
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [data.documents, projectId, getToken]);

    // Chat-related methods
    const handleCreateNewChat = async () => {
        if (!userId) return;

        try {
            setIsCreatingChat(true);

            const token = await getToken();

            const chatNumber = Date.now() % 10000;

            const result = await apiClient.post(
                "/api/chats",
                {
                    title: `Chat #${chatNumber}`,
                    project_id: projectId,
                },
                token
            );

            const savedChat = result.data;
            router.push(`/projects/${projectId}/chats/${savedChat.id}`)

            // Update local state
            setData((prev) => ({
                ...prev,
                chats: [savedChat, ...prev.chats],
            }));

            toast.success("Chat Created successfully");
        } catch (err) {
            toast.error("Failed to create chat");
        } finally {
            setIsCreatingChat(false);
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        if (!userId) return;

        try {
            const token = await getToken();

            await apiClient.delete(`/api/chats/${chatId}`, token);

            // Update local state
            setData((prev) => ({
                ...prev,
                chats: prev.chats.filter((chat) => chat.id !== chatId),
            }));

            toast.success("Chat deleted successfully");
        } catch (err) {
            toast.error("Failed to delete chat");
        }
    };

    const handleChatClick = (chatId: string) => {
        router.push(`/projects/${projectId}/chats/${chatId}`)
    };

    // Document-related methods
    const handleDocumentUpload = async (files: File[]) => {
        if (!userId) return;

        const token = await getToken();
        const uploadedDocuments: ProjectDocument[] = [];

        // Process all files in parallel

        const uploadPromises = files.map(async (file) => {
            try {
                // Step 1: Get presigned URL
                const uploadData = await apiClient.post(
                    `/api/projects/${projectId}/files/upload-url`,
                    {
                        filename: file.name,
                        file_size: file.size,
                        file_type: file.type,
                    },
                    token
                );

                const { upload_url, s3_key } = uploadData.data;

                // Step 2: Upload file to S3
                await apiClient.uploadToS3(upload_url, file);

                // Step 3: Confirm upload to the server (starts background processing)
                const updatedDocument = await apiClient.post(
                    `/api/projects/${projectId}/files/confirm`,
                    {
                        s3_key,
                    },
                    token
                );

                uploadedDocuments.push(updatedDocument.data);
            } catch (err) {
                toast.error(`Failed to upload ${file.name}`);
            }
        });

        await Promise.allSettled(uploadPromises);

        // Update local state with successfully uploaded docuemnts

        if (uploadedDocuments.length > 0) {
            setData((prev) => ({
                ...prev,
                documents: [...uploadedDocuments, ...prev.documents],
            }));

            toast.success(`${uploadedDocuments.length} file(s) uploaded`);
        }
    };

    const handleDocumentDelete = async (documentId: string) => {
        if (!userId) return;

        try {
            const token = await getToken();

            await apiClient.delete(
                `/api/projects/${projectId}/files/${documentId}`,
                token
            );

            // Update local state - remove the deleted document
            setData((prev) => ({
                ...prev,
                documents: prev.documents.filter((doc) => doc.id !== documentId),
            }));

            toast.success("Document deleted successfully!");
        } catch (err) {
            toast.error("Document deletion failed");
        }
    };

    const handleUrlAdd = async (url: string) => {
        if (!userId) return;

        try {
            const token = await getToken();

            const result = await apiClient.post(
                `/api/projects/${projectId}/urls`,
                {
                    url,
                },
                token
            );

            const newDocument = result.data;

            // Update local state
            setData((prev) => ({
                ...prev,
                documents: [newDocument, ...prev.documents],
            }));

            toast.success("Website added successfully!");
        } catch (err) {
            toast.error("Failed to add website");
        }
    };

    const handleOpenDocument = (documentId: string) => {
        console.log("Open document", documentId);
        setSelectedDocumentId(documentId);
    };

    // Project settings
    const handleDraftSettings = (updates: any) => {
        setData((prev) => {
            // If no settings exist yet, we can't update them
            if (!prev.settings) {
                console.warn("Cannot update settings: not loaded yet");
                return prev;
            }

            // Merge the updates into existing settings
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    ...updates,
                },
            };
        });
    };

    const handlePublishSettings = async () => {
        if (!userId || !data.settings) {
            toast.error("Cannot save settings");
            return;
        }

        try {
            const token = await getToken();

            const result = await apiClient.put(
                `/api/projects/${projectId}/settings`,
                data.settings,
                token
            );

            setData((prev) => ({
                ...prev,
                settings: result.data,
            }));

            toast.success("Settings saved successfully!");
        } catch (err) {
            toast.error("Failed to save settings!");
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading project..." />;
    }

    if (!data.project) {
        return <NotFound message="Project not found" />;
    }

    const selectedDocument = selectedDocumentId
        ? data.documents.find((doc) => doc.id == selectedDocumentId)
        : null;

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

                {/* KnowledgeBase Sidebar */}
                <KnowledgeBaseSidebar
                    activeTab={activeTab}
                    onSetActiveTab={setActiveTab}
                    projectDocuments={data.documents}
                    onDocumentUpload={handleDocumentUpload}
                    onDocumentDelete={handleDocumentDelete}
                    onOpenDocument={handleOpenDocument}
                    onUrlAdd={handleUrlAdd}
                    projectSettings={data.settings}
                    settingsError={null}
                    settingsLoading={false}
                    onUpdateSettings={handleDraftSettings}
                    onApplySettings={handlePublishSettings}
                />
            </div>
            {selectedDocument && (
                <FileDetailsModal
                    document={selectedDocument}
                    onClose={() => setSelectedDocumentId(null)}
                />
            )}
        </>
    );
}

export default ProjectPage;

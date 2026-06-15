"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { use } from "react";
import { ConversationsList } from "@/components/projects/ConversationsList";
import { LeftPanel } from "@/components/projects/LeftPanel";
import { RightPanel } from "@/components/projects/RightPanel";
import { FileDetailsModal } from "@/components/projects/FileDetailsModal";
import { SourceViewerModal } from "@/components/studio/SourceViewerModal";
import { MindMapViewerModal } from "@/components/studio/MindMapViewerModal";
import { FlashcardViewer } from "@/components/studio/FlashcardViewer";
import {
  PracticeQuestionsViewer,
  EvaluationResult,
} from "@/components/studio/PracticeQuestionsViewer";
import { NotFound } from "@/components/ui/NotFound";
import {
  Project,
  Chat,
  ProjectDocument,
  ProjectSettings,
  GeneratedSource,
} from "@/lib/types";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

interface ProjectData {
  project: Project | null;
  chats: Chat[];
  documents: ProjectDocument[];
  settings: ProjectSettings | null;
}

// Friendly labels for toasts (backend type -> display)
function featureLabel(type: string) {
  if (type === "practice_questions") return "Quiz";
  return type.replace(/_/g, " ");
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

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Studio states
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [generatedSources, setGeneratedSources] = useState<GeneratedSource[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Modal states — now with sourceId and expandCount
  const [viewingSource, setViewingSource] = useState<GeneratedSource | null>(null);
  const [viewingMindMap, setViewingMindMap] = useState<{ title: string; content: string } | null>(null);
  const [viewingFlashcards, setViewingFlashcards] = useState<{
    title: string;
    content: string;
    sourceId: string;
    expandCount: number;
  } | null>(null);
  const [viewingPracticeQuestions, setViewingPracticeQuestions] = useState<{
    title: string;
    content: string;
    sourceId: string;
    expandCount: number;
  } | null>(null);

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      if (!userId) return;
      // Guard: never fire requests with a missing/invalid project id
      if (!projectId || projectId === "undefined") {
        setError("Invalid project");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const [projectRes, chatsRes, documentsRes, settingsRes, sourcesRes] =
          await Promise.all([
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
      } catch {
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
    if (!projectId || projectId === "undefined") return;
    const hasProcessing = data.documents.some(
      (doc) =>
        doc.processing_status &&
        !["completed", "failed"].includes(doc.processing_status)
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

  // ─── CHAT METHODS ────────────────────────────────────────────────────────
  const handleCreateNewChat = async () => {
    if (!userId) return;
    try {
      setIsCreatingChat(true);
      const token = await getToken();
      const result = await apiClient.post(
        "/api/chats",
        { title: `Chat #${Date.now() % 10000}`, project_id: projectId },
        token
      );
      const savedChat = result.data;
      router.push(`/projects/${projectId}/chats/${savedChat.id}`);
      setData((prev) => ({ ...prev, chats: [savedChat, ...prev.chats] }));
      toast.success("Chat created");
    } catch {
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
      setData((prev) => ({ ...prev, chats: prev.chats.filter((c) => c.id !== chatId) }));
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleChatClick = (chatId: string) =>
    router.push(`/projects/${projectId}/chats/${chatId}`);

  // ─── DOCUMENT METHODS ────────────────────────────────────────────────────
  const handleDocumentUpload = async (files: File[]) => {
    if (!userId) return;
    const token = await getToken();
    const uploaded: ProjectDocument[] = [];
    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const uploadData = await apiClient.post(
            `/api/projects/${projectId}/files/upload-url`,
            { filename: file.name, file_size: file.size, file_type: file.type },
            token
          );
          await apiClient.uploadToS3(uploadData.data.upload_url, file);
          const confirmed = await apiClient.post(
            `/api/projects/${projectId}/files/confirm`,
            { s3_key: uploadData.data.s3_key },
            token
          );
          uploaded.push(confirmed.data);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      })
    );
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
      setData((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d.id !== documentId),
      }));
      toast.success("Document deleted");
    } catch {
      toast.error("Document deletion failed");
    }
  };

  const handleUrlAdd = async (url: string) => {
    if (!userId) return;
    try {
      const token = await getToken();
      const result = await apiClient.post(
        `/api/projects/${projectId}/urls`,
        { url },
        token
      );
      setData((prev) => ({
        ...prev,
        documents: [result.data, ...prev.documents],
      }));
      toast.success("Website added!");
    } catch {
      toast.error("Failed to add website");
    }
  };

  // ─── SETTINGS METHODS ────────────────────────────────────────────────────
  const handleDraftSettings = (updates: Partial<ProjectSettings>) => {
    setData((prev) => {
      if (!prev.settings) return prev;
      return { ...prev, settings: { ...prev.settings, ...updates } };
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
      setData((prev) => ({ ...prev, settings: result.data }));
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  // ─── STUDIO METHODS ──────────────────────────────────────────────────────
  const handleToggleDocSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };
  const handleSelectAllDocs = () => {
    setSelectedDocIds(
      data.documents
        .filter((d) => d.processing_status === "completed")
        .map((d) => d.id)
    );
  };
  const handleDeselectAllDocs = () => setSelectedDocIds([]);

  const handleTagDocument = async (docId: string, tag: string) => {
    try {
      const token = await getToken();
      await apiClient.put(
        `/api/projects/${projectId}/files/${docId}/tag`,
        { source_tag: tag },
        token
      );
      setData((prev) => ({
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === docId ? { ...d, source_tag: tag } as any : d
        ),
      }));
      toast.success(`Tagged as ${tag === "past_year_paper" ? "Past Year" : "Lecture Notes"}`);
    } catch {
      toast.error("Failed to tag document");
    }
  };

  const handleGenerateFeature = async (docIds: string[], featureType: string) => {
    try {
      setIsGenerating(true);
      setGeneratingType(featureType);
      const token = await getToken();
      await apiClient.post(
        `/api/projects/${projectId}/features/generate`,
        { doc_ids: docIds, feature_type: featureType },
        token
      );
    } catch {
      toast.error(`Failed to generate ${featureLabel(featureType)}`);
      setIsGenerating(false);
      setGeneratingType(null);
      throw new Error(`Failed to generate ${featureType}`);
    }
  };

  const handleMergeFeature = async (docIds: string[], sourceType: string) => {
    try {
      const token = await getToken();
      const result = await apiClient.post(
        `/api/projects/${projectId}/features/merge`,
        { doc_ids: docIds, source_type: sourceType },
        token
      );
      setGeneratedSources((prev) => [result.data, ...prev]);
      toast.success(`${featureLabel(sourceType)} generated!`);
    } catch {
      toast.error(`Failed to merge ${featureLabel(sourceType)}`);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleViewSource = (source: GeneratedSource) => {
    if (source.source_type === "mind_map") {
      setViewingMindMap({ title: source.title, content: source.content });
    } else if (source.source_type === "flashcards") {
      setViewingFlashcards({
        title: source.title,
        content: source.content,
        sourceId: source.id,
        expandCount: (source as any).expand_count || 0,
      });
    } else if (source.source_type === "practice_questions") {
      setViewingPracticeQuestions({
        title: source.title,
        content: source.content,
        sourceId: source.id,
        expandCount: (source as any).expand_count || 0,
      });
    } else {
      setViewingSource(source);
    }
  };

  const handleSourceContentUpdate = (sourceId: string, newContent: string, newExpandCount?: number) => {
    setGeneratedSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? { ...s, content: newContent, expand_count: newExpandCount !== undefined ? newExpandCount : (s as any).expand_count }
          : s
      )
    );
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const token = await getToken();
      await apiClient.delete(`/api/projects/${projectId}/sources/${sourceId}`, token);
      setGeneratedSources((prev) => prev.filter((s) => s.id !== sourceId));
      toast.success("Source deleted");
    } catch {
      toast.error("Failed to delete source");
    }
  };

  // Grade a written quiz answer via the backend (stateless)
  const handleEvaluateAnswer = async (params: {
    question: string;
    model_answer: string;
    user_answer: string;
    question_type: "short_answer" | "paragraph";
    max_marks: number;
  }): Promise<EvaluationResult> => {
    const token = await getToken();
    const res = await apiClient.post(
      `/api/projects/${projectId}/quiz/evaluate`,
      params,
      token
    );
    return res as EvaluationResult;
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner message="Loading project..." />;
  if (!data.project) return <NotFound message="Project not found" />;

  const selectedDocument = selectedDocumentId
    ? data.documents.find((d) => d.id === selectedDocumentId)
    : null;

  return (
    <>
      {/* 3-panel layout */}
      <div className="flex h-full bg-background overflow-hidden">
        {/* LEFT — Sources */}
        <LeftPanel
          projectId={projectId}
          projectDocuments={data.documents}
          onDocumentUpload={handleDocumentUpload}
          onDocumentDelete={handleDocumentDelete}
          onOpenDocument={(id) => setSelectedDocumentId(id)}
          onUrlAdd={handleUrlAdd}
        />

        {/* MIDDLE — Conversations */}
        <ConversationsList
          projectId={projectId}
          project={data.project}
          conversations={data.chats}
          error={error}
          loading={isCreatingChat}
          onCreateNewChat={handleCreateNewChat}
          onChatClick={handleChatClick}
          onDeleteChat={handleDeleteChat}
        />

        {/* RIGHT — Studio + Settings */}
        <RightPanel
          projectId={projectId}
          projectDocuments={data.documents}
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
          projectSettings={data.settings}
          settingsError={error}
          settingsLoading={false}
          onUpdateSettings={handleDraftSettings}
          onApplySettings={handlePublishSettings}
        />
      </div>

      {/* Modals */}
      {selectedDocument && (
        <FileDetailsModal
          document={selectedDocument}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
      {viewingSource && (
        <SourceViewerModal
          source={viewingSource}
          onClose={() => setViewingSource(null)}
        />
      )}
      {viewingMindMap && (
        <MindMapViewerModal
          title={viewingMindMap.title}
          content={viewingMindMap.content}
          onClose={() => setViewingMindMap(null)}
        />
      )}
      {viewingFlashcards && (
        <FlashcardViewer
          title={viewingFlashcards.title}
          content={viewingFlashcards.content}
          sourceId={viewingFlashcards.sourceId}
          projectId={projectId}
          expandCount={viewingFlashcards.expandCount}
          onClose={() => setViewingFlashcards(null)}
          onContentUpdate={(newContent, newExpandCount) =>
            handleSourceContentUpdate(viewingFlashcards.sourceId, newContent, newExpandCount)
          }
        />
      )}
      {viewingPracticeQuestions && (
        <PracticeQuestionsViewer
          title={viewingPracticeQuestions.title}
          content={viewingPracticeQuestions.content}
          sourceId={viewingPracticeQuestions.sourceId}
          projectId={projectId}
          expandCount={viewingPracticeQuestions.expandCount}
          onClose={() => setViewingPracticeQuestions(null)}
          onContentUpdate={(newContent, newExpandCount) =>
            handleSourceContentUpdate(viewingPracticeQuestions.sourceId, newContent, newExpandCount)
          }
          onEvaluate={handleEvaluateAnswer}
        />
      )}
    </>
  );
}

export default ProjectPage;
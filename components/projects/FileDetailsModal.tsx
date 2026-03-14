"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { ProjectDocument } from "@/lib/types";
import { GenericStep } from "./document-details/GenericStep";
import { PartitioningStep } from "./document-details/PartitioningStep";
import { ChunkingStep } from "./document-details/ChunkingStep";
import { SummarisingStep } from "./document-details/SummarisingStep";
import { ChunksViewer } from "./document-details/ChunksViewer";
import { PipelineTabs } from "./document-details/PipelineTabs";
import { DetailInspector } from "./document-details/DetailInspector";
import { ModalHeader } from "./document-details/ModalHeader";
import { Modal } from "./document-details/Modal";

interface FileDetailsModalProps {
  document: ProjectDocument;
  onClose: () => void;
}

const PIPELINE_STEPS = [
  {
    id: "uploading",
    name: "Upload to S3",
    description: "Uploading file to secure cloud storage",
  },
  {
    id: "queued",
    name: "Queued",
    description: "File queued for processing",
  },
  {
    id: "partitioning",
    name: "Partitioning",
    description: "Processing and extracting text, images, and tables",
  },
  {
    id: "chunking",
    name: "Chunking",
    description: "Creating semantic chunks",
  },
  {
    id: "summarising",
    name: "Summarisation",
    description: "Enhancing content with AI summaries for images and tables",
  },
  {
    id: "vectorization",
    name: "Vectorization & Storage",
    description: "Generating embeddings and storing in vector database",
  },
  {
    id: "completed",
    name: "View Chunks",
    description: "View processed document chunks",
  },
];

export function FileDetailsModal({ document, onClose }: FileDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<string>("uploading");
  const { getToken, userId } = useAuth();

  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);

  const currentStatus = document.processing_status || "uploading";
  const isProcessingComplete = currentStatus === "completed";
  const processingDetails = document?.processing_details as any;
  const currentStep = PIPELINE_STEPS.find((s) => s.id === activeTab);

  const getStepStatus = (stepId: string) => {
    const currentPos = PIPELINE_STEPS.findIndex(
      (step) => step.id === currentStatus
    );
    const stepPos = PIPELINE_STEPS.findIndex((step) => step.id === stepId);

    if (stepPos < currentPos) return "completed";
    if (stepPos === currentPos) return "processing";
    return "pending";
  };

  // Load chunks when document processing is complete
  const loadChunks = async () => {
    if (!document?.project_id || !document?.id || !userId) return;

    const token = await getToken();

    try {
      setChunksLoading(true);
      const result = await apiClient.get(
        `/api/projects/${document.project_id}/files/${document.id}/chunks`,
        token
      );

      const chunks = result.data.map((chunk: any) => ({
        id: chunk.id,
        type: chunk.type,
        content: chunk.content,
        original_content: chunk.original_content,
        page: chunk.page_number,
        chunkIndex: chunk.chunk_index,
        chars: chunk.char_count,
      }));

      setChunks(chunks);
    } catch (error) {
      console.error("Error loading chunks:", error);
      setChunks([]);
    } finally {
      setChunksLoading(false);
    }
  };

  useEffect(() => {
    if (isProcessingComplete) {
      loadChunks();
    }
  }, [isProcessingComplete, document?.id]);

  useEffect(() => {
    if (document) {
      setActiveTab(currentStatus);
      setSelectedChunk(null);
      setChunks([]);
    }
  }, [document?.id]);

  return (
    <Modal onClose={onClose}>
      <ModalHeader document={document} onClose={onClose} />

      <PipelineTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={PIPELINE_STEPS.map((step) => ({
          id: step.id,
          name: step.name,
          enabled:
            step.id === "completed"
              ? isProcessingComplete
              : getStepStatus(step.id) !== "pending",
          icon: <div></div>,
        }))}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          {/* Show Chunks Viewer if completed */}
          {activeTab === "completed" && isProcessingComplete && (
            <ChunksViewer
              chunks={chunks}
              chunksLoading={chunksLoading}
              selectedChunk={selectedChunk}
              onSelectChunk={setSelectedChunk}
            />
          )}

          {/* Show Partitioning Step */}
          {activeTab === "partitioning" && (
            <PartitioningStep
              status={getStepStatus("partitioning")}
              elementsFound={processingDetails?.partitioning?.elements_found}
            />
          )}

          {/* Show Chunking Step */}
          {activeTab === "chunking" && (
            <ChunkingStep
              status={getStepStatus("chunking")}
              chunkingData={processingDetails?.chunking}
              chunks={chunks}
              partitioningData={processingDetails?.partitioning}
            />
          )}

          {/* Show Summarising Step */}
          {activeTab === "summarising" && (
            <SummarisingStep
              status={getStepStatus("summarising")}
              summarisingData={processingDetails?.summarising}
            />
          )}

          {/* Show Generic Steps for other steps */}
          {!["completed", "partitioning", "chunking", "summarising"].includes(
            activeTab
          ) && (
            <GenericStep
              stepName={currentStep?.name || "Processing"}
              description={currentStep?.description || "Processing step"}
              status={getStepStatus(activeTab)}
            />
          )}
        </div>

        {/* Detail Inspector */}
        <DetailInspector
          selectedChunk={selectedChunk}
          isProcessingComplete={isProcessingComplete}
        />
      </div>
    </Modal>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatWithMessages, Message } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { MessageFeedbackModal } from "@/components/chat/MessageFeedbackModel";
import toast from "react-hot-toast";
import { NotFound } from "@/components/ui/NotFound";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProjectChatPageProps {
    params: Promise<{
        projectId: string;
        chatId: string;
    }>;
}

export default function ProjectChatPage({ params }: ProjectChatPageProps) {
    const { projectId, chatId } = use(params);

    const [currentChatData, setCurrentChatData] =
        useState<ChatWithMessages | null>(null);

    const [isLoadingChatData, setIsLoadingChatData] = useState(true);

    const [sendMessageError, setSendMessageError] = useState<string | null>(null);
    const [isMessageSending, setIsMessageSending] = useState(false);

    const [feedbackModal, setFeedbackModal] = useState<{
        messageId: string;
        type: "like" | "dislike";
    } | null>(null);

    const { getToken, userId } = useAuth();

    // Send message function
    const handleSendMessage = async (content: string) => {
        try {
            setSendMessageError(null);
            setIsMessageSending(true);

            if (!currentChatData || !userId) {
                setSendMessageError("Chat or user not found");
                setIsMessageSending(false);
                return;
            }

            // Create optimistic user message to show immediately
            const optimisticUserMessage: Message = {
                id: `temp-${Date.now()}`,
                chat_id: currentChatData.id,
                content: content,
                role: "user",
                clerk_id: userId,
                created_at: new Date().toISOString(),
                citations: [],
            };

            // Add user message to UI immediately
            setCurrentChatData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: [...prev.messages, optimisticUserMessage],
                };
            });

            // Send POST request to create message
            const token = await getToken();
            const response = await apiClient.post(
                `/api/projects/${projectId}/chats/${currentChatData.id}/messages`,
                { content },
                token
            );

            // Replace optimistic message with real messages from server
            const { userMessage, aiMessage } = response.data;

            setCurrentChatData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: [
                        ...prev.messages.filter(
                            (msg) => msg.id !== optimisticUserMessage.id
                        ),
                        userMessage,
                        aiMessage,
                    ],
                };
            });

            toast.success("Message sent");
        } catch (err) {
            setSendMessageError("Failed to send message");
            toast.error("Failed to send message");

            // Remove optimistic message on error
            setCurrentChatData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    messages: prev.messages.filter((msg) => !msg.id.startsWith("temp-")),
                };
            });
        } finally {
            setIsMessageSending(false);
        }
    };

    const handleFeedbackOpen = (messageId: string, type: "like" | "dislike") => {
        setFeedbackModal({ messageId, type });
    };

    const handleFeedbackSubmit = async (feedback: {
        rating: "like" | "dislike";
        comment?: string;
        category?: string;
    }) => {
        if (!userId || !feedbackModal) return;

        try {
            const token = await getToken();

            await apiClient.post(
                "/api/feedback",
                {
                    message_id: feedbackModal.messageId,
                    rating: feedback.rating,
                    comment: feedback.comment,
                    category: feedback.category,
                },
                token
            );

            toast.success("Thanks for your feedback!");
        } catch (error) {
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setFeedbackModal(null);
        }
    };

    useEffect(() => {
        const loadChat = async () => {
            if (!userId) return;

            setIsLoadingChatData(true);

            try {
                const token = await getToken();
                const result = await apiClient.get(`/api/chats/${chatId}`, token);
                const chatData = result.data;

                setCurrentChatData(chatData);
                toast.success("Chat loaded");
            } catch (err) {
                toast.error("Failed to load chat. Please try again.");
            } finally {
                setIsLoadingChatData(false);
            }
        };

        loadChat();
    }, [userId, chatId]);

    if (isLoadingChatData) {
        return <LoadingSpinner message="Loading chat..." />;
    }

    if (!currentChatData) {
        return <NotFound message="Chat not found" />;
    }

    return (
        <>
            <ChatInterface
                chat={currentChatData}
                projectId={projectId}
                onSendMessage={handleSendMessage}
                onFeedback={handleFeedbackOpen}
                isLoading={isMessageSending}
                error={sendMessageError}
                onDismissError={() => setSendMessageError(null)}
            />
            <MessageFeedbackModal
                isOpen={!!feedbackModal}
                feedbackType={feedbackModal?.type}
                onSubmit={handleFeedbackSubmit}
                onClose={() => setFeedbackModal(null)}
            />
        </>
    );
}

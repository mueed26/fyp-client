"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";

export type PlanId = "free" | "pro" | "elite";

export interface PlanLimits {
    max_projects: number;
    max_docs_per_project: number;
    max_pages_per_doc: number;
    max_chats_per_project: number;
    max_messages_per_chat: number;
    feature_generations_per_doc: number;
    feature_expand_per_source: number;
}

export interface PlanData {
    plan: PlanId;
    credits: number;
    limits: PlanLimits;
    plan_purchased_at: string | null;
}

/**
 * Returns the current user's plan, credits, and the limits attached to that plan.
 * Returns `null` while loading or when signed out.
 */
export function usePlan() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [data, setData] = useState<PlanData | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!isLoaded || !isSignedIn) {
            setData(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const token = await getToken();
            const result = await apiClient.get("/api/payments/me", token);
            setData(result as PlanData);
        } catch {
            // On any failure, fall back to free-plan defaults so the UI still works.
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, getToken]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { data, loading, refresh };
}
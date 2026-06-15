"use client";

import { useState } from "react";
import { X, Check, CreditCard, Loader2, Star } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

type PlanId = "free" | "pro" | "elite";

interface Plan {
    id: PlanId;
    name: string;
    price: string;
    priceNote: string;
    originalPrice?: string;
    bonusTag?: string;
    tagline: string;
    badge?: string;
    cardClass: string;
    badgeClass: string;
    priceClass: string;
    buttonClass: string;
    perks: string[];
}

const PLANS: Plan[] = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        priceNote: "forever free",
        tagline: "For individuals exploring AI study tools.",
        cardClass: "border-border bg-card",
        badgeClass: "",
        priceClass: "text-foreground",
        buttonClass:
            "bg-muted text-muted-foreground border border-border cursor-default",
        perks: [
            "3 projects",
            "5 documents per project",
            "Up to 20 pages per doc",
            "2 chats per project",
            "10 messages per chat",
            "1 feature generation per doc",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$5",
        priceNote: "one-time top-up",
        tagline: "For students organizing study material.",
        cardClass: "border-border bg-card",
        badgeClass: "",
        priceClass: "text-blue-600 dark:text-blue-400",
        buttonClass:
            "bg-background hover:bg-muted text-foreground border border-border",
        perks: [
            "15 projects",
            "20 documents per project",
            "Up to 100 pages per doc",
            "10 chats per project",
            "Unlimited messages",
            "Feature generation + 1× expand",
            "50 credits included",
        ],
    },
    {
        id: "elite",
        name: "Elite",
        price: "$20",
        priceNote: "one-time top-up",
        originalPrice: "$22",
        bonusTag: "50 credits bonus",
        tagline: "For power users creating exam-ready content.",
        badge: "Most Popular",
        cardClass:
            "border-2 border-violet-500 dark:border-violet-400 bg-gradient-to-b from-violet-50/50 to-card dark:from-violet-500/10 dark:to-card",
        badgeClass:
            "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40",
        priceClass: "text-violet-600 dark:text-violet-400",
        buttonClass: "bg-violet-600 hover:bg-violet-700 text-white shadow-sm",
        perks: [
            "100 projects",
            "50 documents per project",
            "300+ pages per doc",
            "Unlimited chats & messages",
            "Unlimited feature generation",
            "Unlimited feature expand",
            "250 credits (200 + 50 bonus)",
            "Priority support",
        ],
    },
];

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan?: PlanId;
}

export function PricingModal({
    isOpen,
    onClose,
    currentPlan = "free",
}: PricingModalProps) {
    const { getToken } = useAuth();
    const [purchasingPlan, setPurchasingPlan] = useState<PlanId | null>(null);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handlePurchase = async (planId: PlanId) => {
        try {
            setPurchasingPlan(planId);
            const token = await getToken();
            const result = await apiClient.post(
                "/api/payments/create-checkout-session",
                { plan_id: planId },
                token
            );
            const url = result?.url as string | undefined;
            if (!url) {
                toast.error("Couldn't start checkout. Try again.");
                return;
            }
            window.location.href = url;
        } catch (e) {
            toast.error("Failed to start checkout.");
            console.error(e);
        } finally {
            setPurchasingPlan(null);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleOverlayClick}
        >
            {/*
              🔥 FIXED:
              - Added `relative` so the absolute close button anchors here
              - Removed `overflow-hidden` so content can scroll if needed
              - Added `max-h-[90vh]` so modal never exceeds viewport
              - Inner scrollable area gets `overflow-y-auto`
            */}
            <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col my-auto">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Header — fixed at top */}
                <div className="text-center pt-8 pb-6 px-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        Choose Your Plan
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                        Unlock more AI-powered research and study capabilities.
                    </p>
                </div>

                {/* Plans — scrollable middle section */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                    {/*
                      🔥 KEY FIX: grid-cols-3 with no responsive prefix
                      = ALWAYS 3 columns. Cards stay side by side
                      no matter the viewport.
                    */}
                    <div className="grid grid-cols-3 gap-4">
                        {PLANS.map((plan) => {
                            const isCurrent = plan.id === currentPlan;
                            const isPurchasing = purchasingPlan === plan.id;

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl p-5 flex flex-col min-w-0 ${plan.cardClass}`}
                                >
                                    {plan.badge && (
                                        <div
                                            className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${plan.badgeClass}`}
                                        >
                                            <Star size={11} fill="currentColor" />
                                            {plan.badge}
                                        </div>
                                    )}

                                    {/* Plan name */}
                                    <h3 className="text-base font-semibold text-foreground mb-3">
                                        {plan.name}
                                    </h3>

                                    {/* Price block */}
                                    <div className="mb-3">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            {plan.originalPrice && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {plan.originalPrice}
                                                </span>
                                            )}
                                            <span className={`text-3xl font-bold ${plan.priceClass}`}>
                                                {plan.price}
                                            </span>
                                        </div>
                                        {plan.bonusTag && (
                                            <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-1">
                                                {plan.bonusTag}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {plan.priceNote}
                                        </p>
                                    </div>

                                    {/* Tagline */}
                                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                        {plan.tagline}
                                    </p>

                                    {/* Perks list */}
                                    <ul className="space-y-2 mb-5 flex-1">
                                        {plan.perks.map((perk) => (
                                            <li
                                                key={perk}
                                                className="flex items-start gap-2 text-xs text-foreground/85"
                                            >
                                                <Check
                                                    size={13}
                                                    className="text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0"
                                                    strokeWidth={2.5}
                                                />
                                                <span>{perk}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    {isCurrent ? (
                                        <button
                                            disabled
                                            className="w-full py-2 text-xs font-medium rounded-xl bg-muted text-muted-foreground border border-border cursor-default"
                                        >
                                            Current Plan
                                        </button>
                                    ) : plan.id === "free" ? (
                                        <button
                                            disabled
                                            className="w-full py-2 text-xs font-medium rounded-xl bg-muted text-muted-foreground border border-border cursor-default"
                                        >
                                            Always Available
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(plan.id)}
                                            disabled={isPurchasing}
                                            className={`w-full py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${plan.buttonClass}`}
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Loading…
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={12} />
                                                    Subscribe
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer hint */}
                    <p className="text-center text-xs text-muted-foreground mt-5">
                        Test mode • Use card{" "}
                        <span className="font-mono text-foreground">4242 4242 4242 4242</span>{" "}
                        with any future expiry &amp; any CVC.
                    </p>
                </div>
            </div>
        </div>
    );
}
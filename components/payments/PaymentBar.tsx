"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap, Crown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PricingModal } from "@/components/payments/PricingModal";
import { usePlan, PlanId } from "@/lib/hooks/usePlan";

const PLAN_VISUALS: Record<
    PlanId,
    { label: string; icon: React.ReactNode; chipClass: string }
> = {
    free: {
        label: "Free",
        icon: <Sparkles size={11} />,
        chipClass:
            "bg-muted text-muted-foreground border-border hover:bg-muted/80",
    },
    pro: {
        label: "Pro",
        icon: <Zap size={11} />,
        chipClass:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
    },
    elite: {
        label: "Elite",
        icon: <Crown size={11} />,
        chipClass:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    },
};

/**
 * Floating widget in the top-right of every page.
 * Shows the current plan + an "Upgrade" CTA. Clicking opens the PricingModal.
 *
 * Also watches for ?upgrade=success in the URL (Stripe redirects back here)
 * and refetches plan data + shows a toast on return.
 */
export function PaymentBar() {
    const { data, loading, refresh } = usePlan();
    const [showPricing, setShowPricing] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Handle Stripe Checkout return.
    useEffect(() => {
        const upgrade = searchParams.get("upgrade");
        const plan = searchParams.get("plan");
        if (upgrade === "success") {
            toast.success(`Welcome to ${plan ? plan.toUpperCase() : "your new"} plan! 🎉`);
            refresh();
            router.replace(window.location.pathname); // strip query params
        } else if (upgrade === "cancel") {
            toast("Checkout cancelled", { icon: "ℹ️" });
            router.replace(window.location.pathname);
        }
    }, [searchParams, refresh, router]);

    if (loading || !data) return null;

    const plan: PlanId = data.plan;
    const visual = PLAN_VISUALS[plan];
    const isPaid = plan !== "free";

    return (
        <>
            <div className="fixed top-3 right-4 z-40 flex items-center gap-2">
                {/* Plan chip */}
                <button
                    onClick={() => setShowPricing(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors shadow-sm ${visual.chipClass}`}
                    title="View plans"
                >
                    {visual.icon}
                    <span>{visual.label}</span>
                    {isPaid && (
                        <>
                            <span className="opacity-50">·</span>
                            <span>{data.credits} credits</span>
                        </>
                    )}
                </button>

                {/* Upgrade CTA — only for free users */}
                {!isPaid && (
                    <button
                        onClick={() => setShowPricing(true)}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
                    >
                        <Zap size={11} />
                        Upgrade
                    </button>
                )}
            </div>

            <PricingModal
                isOpen={showPricing}
                currentPlan={plan}
                onClose={() => setShowPricing(false)}
            />
        </>
    );
}
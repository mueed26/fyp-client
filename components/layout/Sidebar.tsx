"use client";

import { BookOpen, PanelLeftClose, PanelLeftOpen, Sun, Moon, LayoutGrid, Zap, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { usePlan, PlanId } from "@/lib/hooks/usePlan";
import { PricingModal } from "@/components/payments/PricingModal";

const PLAN_VISUALS: Record<PlanId, { label: string; icon: React.ReactNode; textClass: string; chipClass: string }> = {
  free: {
    label: "Free",
    icon: <Sparkles size={11} />,
    textClass: "text-muted-foreground",
    chipClass: "bg-muted border-border",
  },
  pro: {
    label: "Pro",
    icon: <Zap size={11} />,
    textClass: "text-blue-600 dark:text-blue-400",
    chipClass: "bg-blue-500/10 border-blue-500/30",
  },
  elite: {
    label: "Elite",
    icon: <Crown size={11} />,
    textClass: "text-amber-600 dark:text-amber-400",
    chipClass: "bg-amber-500/10 border-amber-500/30",
  },
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const { data: planData } = usePlan();
  const plan: PlanId = planData?.plan ?? "free";
  const credits = planData?.credits ?? 0;
  const visual = PLAN_VISUALS[plan];
  const isPaid = plan !== "free";

  return (
    <>
      <div
        className={`
          bg-card border-r border-border flex flex-col transition-all duration-300 flex-shrink-0
          ${isCollapsed ? "w-14" : "w-52"}
        `}
      >
        {/* Brand + collapse */}
        <div className="p-3 flex items-center justify-between h-14 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen size={14} className="text-background" />
              </div>
              <span className="text-xs font-semibold text-foreground truncate">
                Study AI Companion
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center mx-auto">
              <BookOpen size={14} className="text-background" />
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <PanelLeftClose size={14} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 pt-3">
          <button
            onClick={() => router.push("/projects")}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors
              ${pathname === "/projects"
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
          >
            <LayoutGrid size={15} />
            {!isCollapsed && <span>Projects</span>}
          </button>
        </nav>

        {/* Bottom */}
        <div className="p-2 pb-3 space-y-1 border-t border-border">
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <PanelLeftOpen size={14} />
            </button>
          )}

          {/* ── Plan / Upgrade button ─────────────────────────────────── */}
          {isCollapsed ? (
            <button
              onClick={() => setShowPricing(true)}
              className={`w-full flex items-center justify-center p-2 rounded-lg border transition-colors ${visual.chipClass} ${visual.textClass} hover:opacity-80`}
              title={`${visual.label}${isPaid ? ` · ${credits} credits` : " — Upgrade"}`}
            >
              {visual.icon}
            </button>
          ) : isPaid ? (
            // Paid users: just show plan + credits, click opens modal
            <button
              onClick={() => setShowPricing(true)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors ${visual.chipClass} ${visual.textClass} hover:opacity-80`}
            >
              {visual.icon}
              <span className="font-semibold">{visual.label}</span>
              <span className="opacity-60">·</span>
              <span>{credits} credits</span>
            </button>
          ) : (
            // Free users: prominent "Upgrade" CTA
            <button
              onClick={() => setShowPricing(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              <Zap size={13} />
              <span>Upgrade</span>
              <span className="ml-auto opacity-60 font-normal">Free</span>
            </button>
          )}

          {/* Theme */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${isCollapsed ? "justify-center" : ""}`}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {!isCollapsed && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
          </button>

          {/* User */}
          <div className={`flex items-center gap-2.5 px-3 py-2 ${isCollapsed ? "justify-center" : ""}`}>
            <UserButton appearance={{ elements: { avatarBox: "w-6 h-6" } }} />
            {!isCollapsed && <span className="text-sm text-muted-foreground">Profile</span>}
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={showPricing}
        currentPlan={plan}
        onClose={() => setShowPricing(false)}
      />
    </>
  );
}
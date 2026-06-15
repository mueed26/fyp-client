"use client";

// ── Shimmer base ──────────────────────────────────────────────────────────────
// Uses a keyframe defined once via a style tag injected into the document.
// All skeleton blocks share the same `.sk` class for the shimmer effect.

function ShimmerStyle() {
    return (
        <style>{`
            @keyframes sk-shimmer {
                0%   { background-position: -600px 0; }
                100% { background-position: 600px 0; }
            }
            .sk {
                background: linear-gradient(
                    90deg,
                    hsl(var(--muted) / 0.8) 25%,
                    hsl(var(--muted) / 0.4) 50%,
                    hsl(var(--muted) / 0.8) 75%
                );
                background-size: 600px 100%;
                animation: sk-shimmer 1.6s ease-in-out infinite;
                border-radius: 6px;
            }
            .sk-card {
                background: linear-gradient(
                    90deg,
                    hsl(var(--card) / 0.9) 25%,
                    hsl(var(--muted) / 0.35) 50%,
                    hsl(var(--card) / 0.9) 75%
                );
                background-size: 600px 100%;
                animation: sk-shimmer 1.6s ease-in-out infinite;
                border-radius: 6px;
            }
        `}</style>
    );
}

// ── Chat Page Skeleton ────────────────────────────────────────────────────────

export function ChatPageSkeleton() {
    return (
        <div className="flex h-full bg-background overflow-hidden">
            <ShimmerStyle />

            {/* MESSAGES AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="border-b border-border bg-background sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="sk w-7 h-7 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="sk h-4 w-36" />
                                <div className="sk h-3 w-24" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message bubbles */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
                    {[
                        { userW: "w-56", aiLines: ["w-full", "w-4/5", "w-3/5"] },
                        { userW: "w-72", aiLines: ["w-full", "w-11/12"] },
                        { userW: "w-48", aiLines: ["w-full", "w-4/5", "w-2/3", "w-1/2"] },
                    ].map((pair, i) => (
                        <div key={i} className="space-y-4">
                            {/* User bubble */}
                            <div className="flex justify-end">
                                <div className={`sk h-10 rounded-2xl ${pair.userW}`} />
                            </div>
                            {/* AI bubble */}
                            <div className="flex items-start gap-3">
                                <div className="sk w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
                                <div className="space-y-2 flex-1 max-w-lg pt-1">
                                    {pair.aiLines.map((w, j) => (
                                        <div key={j} className={`sk h-3.5 ${w}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input bar */}
                <div className="border-t border-border bg-background px-6 py-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="sk h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Notes Page Skeleton ───────────────────────────────────────────────────────

export function NotesPageSkeleton() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <ShimmerStyle />

            {/* LEFT SIDEBAR */}
            <div className="w-72 bg-card border-r border-border flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-border space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="sk-card w-7 h-7 rounded-lg" />
                        <div className="sk-card h-4 w-14 flex-1" />
                        <div className="sk-card w-8 h-8 rounded-lg ml-auto" />
                    </div>
                    <div className="sk-card h-9 w-full rounded-lg" />
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="sk-card h-16 rounded-lg" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
            </div>

            {/* MAIN EDITOR AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col p-6 border-b border-border min-h-0">
                    <div className="sk h-3 w-52 mb-6" />
                    <div className="space-y-3">
                        {["w-full", "w-full", "w-5/6", "w-full", "w-4/5", "w-3/4"].map((w, i) => (
                            <div key={i} className={`sk h-3.5 ${w}`} style={{ animationDelay: `${i * 60}ms` }} />
                        ))}
                    </div>
                </div>

                {/* AI Chat panel */}
                <div className="h-72 flex flex-col p-4 bg-muted/30 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="sk w-5 h-5 rounded" />
                        <div className="sk h-3 w-36" />
                    </div>
                    <div className="flex-1 mb-3 space-y-3">
                        <div className="flex justify-start">
                            <div className="sk h-8 w-48 rounded-lg" />
                        </div>
                        <div className="flex justify-end">
                            <div className="sk h-8 w-56 rounded-lg" />
                        </div>
                        <div className="flex justify-start">
                            <div className="sk h-8 w-64 rounded-lg" />
                        </div>
                    </div>
                    <div className="sk h-10 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// ── Projects Grid Skeleton ────────────────────────────────────────────────────

export function ProjectsGridSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <ShimmerStyle />

            {/* Header */}
            <div className="border-b border-border bg-background/95">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="space-y-2">
                            <div className="sk h-6 w-36" />
                            <div className="sk h-3.5 w-28" />
                        </div>
                        <div className="sk h-10 w-36 rounded-xl" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="sk h-10 w-80 rounded-xl" />
                        <div className="sk h-10 w-24 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-6 py-7">
                <div className="sk h-3.5 w-32 mb-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="sk h-48 rounded-2xl"
                            style={{ animationDelay: `${(i - 1) * 60}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
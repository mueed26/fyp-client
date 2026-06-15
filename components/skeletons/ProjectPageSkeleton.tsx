"use client";

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

export function ProjectPageSkeleton() {
    return (
        <div className="flex h-full bg-background overflow-hidden">
            <ShimmerStyle />

            {/* LEFT PANEL */}
            <div className="w-72 flex-shrink-0 bg-card border-r border-border flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="sk-card h-3.5 w-16" />
                        <div className="sk-card h-7 w-7 rounded-lg" />
                    </div>
                    <div className="sk-card h-9 w-full rounded-lg" />
                    <div className="flex gap-2">
                        <div className="sk-card h-8 flex-1 rounded-lg" />
                        <div className="sk-card h-8 flex-1 rounded-lg" />
                    </div>
                </div>

                {/* Upload zone placeholder */}
                <div className="p-4 border-b border-border">
                    <div className="sk-card h-20 w-full rounded-xl" />
                </div>

                {/* File list */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                    <div className="sk-card h-3 w-20 mb-3" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="sk-card h-12 w-full rounded-xl" style={{ animationDelay: `${i * 70}ms` }} />
                    ))}
                </div>
            </div>

            {/* MIDDLE PANEL */}
            <div className="flex-1 flex flex-col bg-background overflow-hidden">
                {/* Project header */}
                <div className="px-6 py-5 border-b border-border">
                    <div className="flex items-center justify-between mb-1">
                        <div className="sk h-5 w-44" />
                        <div className="sk h-8 w-28 rounded-lg" />
                    </div>
                    <div className="sk h-3.5 w-32 mt-2" />
                </div>

                {/* Chat list */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                    <div className="sk h-3.5 w-24 mb-4" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="sk h-14 w-full rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-80 flex-shrink-0 bg-card border-l border-border flex flex-col">
                {/* Tab bar */}
                <div className="p-4 border-b border-border">
                    <div className="flex gap-2">
                        <div className="sk-card h-8 flex-1 rounded-lg" />
                        <div className="sk-card h-8 flex-1 rounded-lg" />
                    </div>
                </div>

                {/* Studio controls */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="sk-card h-3 w-24 mb-1" />

                    {/* Doc selection chips */}
                    <div className="flex gap-2 flex-wrap">
                        {["w-16", "w-20", "w-14", "w-18"].map((w, i) => (
                            <div key={i} className={`sk-card h-7 ${w} rounded-full`} style={{ animationDelay: `${i * 50}ms` }} />
                        ))}
                    </div>

                    {/* Feature buttons */}
                    <div className="space-y-2 pt-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="sk-card h-11 w-full rounded-xl" style={{ animationDelay: `${i * 50}ms` }} />
                        ))}
                    </div>

                    {/* Generated sources */}
                    <div className="sk-card h-3 w-28 mt-4 mb-1" />
                    {[1, 2].map((i) => (
                        <div key={i} className="sk-card h-14 w-full rounded-xl" style={{ animationDelay: `${i * 70}ms` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
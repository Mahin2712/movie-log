import React from "react";

export default function ViewToggle({ viewMode, setViewMode }) {
    return (
        <div className="flex bg-zinc-900 rounded-lg p-1 gap-1 border border-zinc-800">
            {/* List Button - Square Icon Box */}
            <button
                onClick={() => setViewMode("list")}
                className={`
          w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200
          ${viewMode === "list"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }
        `}
                title="List View"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="9" y1="6" x2="20" y2="6" />
                    <line x1="9" y1="12" x2="20" y2="12" />
                    <line x1="9" y1="18" x2="20" y2="18" />
                    <path d="M5 6v.01" strokeWidth="3.5" />
                    <path d="M5 12v.01" strokeWidth="3.5" />
                    <path d="M5 18v.01" strokeWidth="3.5" />
                </svg>
            </button>

            {/* Grid Button - Pill Shape with Text */}
            <button
                onClick={() => setViewMode("grid")}
                className={`
          flex items-center gap-2 px-4 h-10 rounded-md transition-all duration-200 font-medium text-sm
          ${viewMode === "grid"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }
        `}
                title="Grid View"
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="opacity-90"
                >
                    <rect x="3" y="3" width="7" height="7" rx="2" />
                    <rect x="14" y="3" width="7" height="7" rx="2" />
                    <rect x="3" y="14" width="7" height="7" rx="2" />
                    <rect x="14" y="14" width="7" height="7" rx="2" />
                </svg>
                Grid
            </button>
        </div>
    );
}

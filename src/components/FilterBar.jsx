import React from "react";

export default function FilterBar({
    mediaFilter,
    setMediaFilter,
    search,
    setSearch,
    genre,
    setGenre,
    genresMap,
    sortBy,
    setSortBy,
    sortOptions = [],
    asc,
    setAsc,
    placeholder = "Search..."
}) {
    return (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 w-full animate-in fade-in slide-in-from-top-2 duration-500">
            {/* Left Group: Filters & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1 lg:flex-initial">
                {/* Genre Dropdown */}
                <div className="relative group flex-1 sm:flex-none sm:min-w-[140px] active:scale-[0.98] transition-transform">
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="
                            appearance-none w-full h-[48px] md:h-[44px] bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl
                            pl-4 pr-10 text-base md:text-sm text-zinc-300 font-bold outline-none cursor-pointer
                            hover:bg-zinc-800/60 hover:text-white hover:border-zinc-700 transition-all
                            focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50
                        "
                    >
                        <option value="all">Genres</option>
                        {Object.entries(genresMap).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 group-hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative group flex-1 sm:flex-none sm:min-w-[160px] active:scale-[0.98] transition-transform">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="
                            appearance-none w-full h-[48px] md:h-[44px] bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl
                            pl-4 pr-10 text-base md:text-sm text-zinc-300 font-bold outline-none cursor-pointer
                            hover:bg-zinc-800/60 hover:text-white hover:border-zinc-700 transition-all
                            focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50
                        "
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 group-hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Asc/Desc Toggle */}
                {setAsc && (
                    <button
                        onClick={() => setAsc(!asc)}
                        className="
                            flex items-center justify-center h-[48px] md:h-[44px] px-5 rounded-2xl shrink-0
                            bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 text-zinc-400
                            hover:bg-zinc-800/60 hover:text-blue-400 hover:border-blue-500/30
                            focus:ring-1 focus:ring-blue-500/50 active:scale-95
                            transition-all outline-none
                        "
                        title={asc ? "Ascending" : "Descending"}
                    >
                        {asc ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h9m1-4l4 4m0 0l4-4m-4 4v12" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Right Group: Media Type Dropdown + Search Input */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Media Type Dropdown */}
                <div className="relative group shrink-0 w-[110px] sm:w-[130px] active:scale-[0.98] transition-transform">
                    <select
                        value={mediaFilter}
                        onChange={(e) => setMediaFilter(e.target.value)}
                        className="
                            appearance-none w-full h-[48px] md:h-[44px] bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl
                            pl-4 pr-10 text-base md:text-sm text-zinc-300 font-black uppercase tracking-tighter outline-none cursor-pointer
                            hover:bg-zinc-800/60 hover:text-white hover:border-zinc-700 transition-all
                            focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50
                        "
                    >
                        <option value="all">All</option>
                        <option value="movie">Movies</option>
                        <option value="tv">TV</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 group-hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Compact Search Input */}
                <div className="relative group flex-1 lg:min-w-[280px] lg:max-w-md">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                        className="
                            w-full h-[48px] md:h-[44px] bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl py-2 pl-12 pr-4
                            text-base md:text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all
                            focus:border-blue-500/50 focus:bg-zinc-900/80 focus:ring-1 focus:ring-blue-500/50 hover:border-zinc-700
                        "
                    />
                </div>
            </div>
        </div>
    );
}

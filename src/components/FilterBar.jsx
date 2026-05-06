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
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 mb-6 p-1 w-full">
            {/* Left Group: Filters & Sort */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-hidden pb-1 flex-wrap sm:flex-nowrap shrink-0">
                {/* Genre Dropdown */}
                <div className="relative group shrink-0 flex-1 min-w-[90px] max-w-[140px] sm:max-w-none">
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="
                            appearance-none w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-full
                            pl-3 pr-8 text-[13px] sm:text-sm text-zinc-300 font-medium outline-none cursor-pointer
                            hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700 transition-all
                            focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500/50
                        "
                    >
                        <option value="all">Genre</option>
                        {Object.entries(genresMap).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative group shrink-0 flex-1 min-w-[120px] max-w-[160px] sm:max-w-none">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="
                            appearance-none w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-full
                            pl-3 pr-8 text-[13px] sm:text-sm text-zinc-300 font-medium outline-none cursor-pointer
                            hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700 transition-all
                            focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500/50
                        "
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Asc/Desc Toggle */}
                {setAsc && (
                    <button
                        onClick={() => setAsc(!asc)}
                        className="
                            flex items-center justify-center w-10 h-10 rounded-full shrink-0
                            bg-zinc-900/50 border border-zinc-800 text-zinc-400
                            hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700
                            focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500/50
                            transition-all outline-none
                        "
                        title={asc ? "Ascending" : "Descending"}
                    >
                        {asc ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h9m1-4l4 4m0 0l4-4m-4 4v12" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Right Group: Media Type Dropdown + Search Input */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-hidden pb-1 flex-wrap sm:flex-nowrap">
                {/* Media Type Dropdown */}
                <div className="relative group shrink-0 w-[90px] sm:w-[120px]">
                    <select
                        value={mediaFilter}
                        onChange={(e) => setMediaFilter(e.target.value)}
                        className="
                            appearance-none w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-full
                            pl-3 pr-8 text-[13px] sm:text-sm text-zinc-300 font-medium outline-none cursor-pointer
                            hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700 transition-all
                            focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500/50
                        "
                    >
                        <option value="all">All</option>
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                    </select>
                    <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center pointer-events-none text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Compact Search Input */}
                <div className="relative group flex-1 min-w-[140px] max-w-sm">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                        className="
                            w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-full py-2 pl-10 pr-4
                            text-[13px] sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-all
                            focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500/50 hover:border-zinc-700
                        "
                    />
                </div>
            </div>
        </div>
    );
}

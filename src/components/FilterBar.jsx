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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-1">
            {/* Left Group: Media Pills + Search */}
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                {/* Compact Pills */}
                <div className="flex bg-zinc-900/80 p-1 rounded-full border border-zinc-800/60 shadow-inner">
                    {["all", "movie", "tv"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setMediaFilter(type)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                                ${mediaFilter === type
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-500/50"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }
                            `}
                        >
                            {type === "all" ? "All" : type === "movie" ? "Movies" : "TV"}
                        </button>
                    ))}
                </div>

                {/* Compact Search Input */}
                <div className="relative group flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-all
                            focus:border-blue-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-blue-500/50
                        "
                    />
                </div>
            </div>

            {/* Right Group: Filters & Sort */}
            <div className="flex items-center gap-3">
                {/* Genre Dropdown */}
                <div className="relative group">
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="
                            appearance-none h-10 bg-zinc-900/80 border border-zinc-800 rounded-lg
                            pl-3 pr-8 text-sm text-zinc-400 font-medium outline-none cursor-pointer
                            hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-colors
                            focus:border-blue-500/50 focus:text-white
                        "
                    >
                        <option value="all">All Genres</option>
                        {Object.entries(genresMap).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-zinc-600 group-hover:text-zinc-400">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative group">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="
                            appearance-none h-10 bg-zinc-900/80 border border-zinc-800 rounded-lg
                            pl-3 pr-8 text-sm text-zinc-400 font-medium outline-none cursor-pointer
                            hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-colors
                            focus:border-blue-500/50 focus:text-white
                        "
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-zinc-600 group-hover:text-zinc-400">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Asc/Desc Toggle */}
                {setAsc && (
                    <button
                        onClick={() => setAsc(!asc)}
                        className="
                            flex items-center justify-center w-10 h-10 rounded-lg
                            bg-zinc-900/80 border border-zinc-800 text-zinc-400
                            hover:bg-zinc-800 hover:text-white hover:border-zinc-700
                            transition-all active:scale-95
                        "
                        title={asc ? "Ascending" : "Descending"}
                    >
                        {asc ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m1-4l4 4m0 0l4-4m-4 4v12" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

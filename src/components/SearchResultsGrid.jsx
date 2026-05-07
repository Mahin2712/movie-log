import React from "react";
import SearchResultCard from "./SearchResultCard";
import { IMG_BASE } from "../utils/constants";
import { getTMDBLink } from "../utils/tmdb";

export default function SearchResultsGrid({
    results,
    isInWatchlist,
    isInWishlist,
    onAddWatchlist,
    onAddWishlist,
    onOpenDetail,
    viewMode = "grid"
}) {
    const fallback = "https://via.placeholder.com/300x450?text=No+Poster";

    if (viewMode === "list") {
        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-4 w-full">
                {results.map((item) => {
                    const inWatchlist = isInWatchlist(item);
                    const inWishlist = isInWishlist(item);

                    return (
                        <div
                            key={`${item.media_type}-${item.tmdb_id}`}
                            className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 gap-4"
                        >
                            <img
                                src={item.poster_path ? IMG_BASE + item.poster_path : fallback}
                                alt={item.title}
                                className="w-16 h-24 object-cover rounded-lg shrink-0"
                                loading="lazy"
                            />

                            <div className="flex-1 flex flex-col justify-center gap-1">
                                <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                        <div className="text-sm text-zinc-400">
                                            {item.year || "Unknown"}
                                            {item.media_type && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-zinc-800 border border-zinc-700">{item.media_type === "tv" ? "TV" : "Movie"}</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${inWatchlist
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-blue-600 text-white hover:bg-blue-500 shadow-md active:scale-95"
                                                }`}
                                            disabled={inWatchlist}
                                            onClick={() => !inWatchlist && onAddWatchlist(item)}
                                        >
                                            {inWatchlist ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Watched
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-base font-bold">+</span> Watched
                                                </>
                                            )}
                                        </button>

                                        <button
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition ${inWatchlist
                                                ? "opacity-30 cursor-not-allowed bg-zinc-800 border-zinc-700 text-zinc-600"
                                                : inWishlist
                                                    ? "bg-red-900/20 border-red-800 text-red-500"
                                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                                }`}
                                            disabled={inWatchlist}
                                            onClick={() => !inWatchlist && onAddWishlist(item)}
                                            title={inWatchlist ? "Already watched" : inWishlist ? "In Wishlist" : "Add to Wishlist"}
                                        >
                                            {inWishlist ? "♥" : "♡"}
                                        </button>

                                        <a
                                            href={getTMDBLink(item)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700 transition"
                                        >
                                            Open
                                        </a>
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-500 line-clamp-2 mt-1 pr-4">
                                    {item.overview || "No description available."}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(clamp(140px,15vw,240px),1fr))] gap-4 sm:gap-6">
            {results.map((item) => (
                <SearchResultCard
                    key={`${item.media_type}-${item.tmdb_id}`}
                    item={item}
                    inWatchlist={isInWatchlist(item)}
                    inWishlist={isInWishlist(item)}
                    onAddWatchlist={onAddWatchlist}
                    onAddWishlist={onAddWishlist}
                    onOpenDetail={onOpenDetail}
                />
            ))}
        </div>
    );
}

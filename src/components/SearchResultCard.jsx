import React from "react";
import { IMG_BASE } from "../utils/constants";

export default function SearchResultCard({
    item,
    inWatchlist,
    inWishlist,
    onAddWatchlist,
    onAddWishlist,
    onOpenDetail,
}) {
    const fallback = "https://via.placeholder.com/300x450?text=No+Poster";

    return (
        <div className="carousel-card w-full h-auto cursor-pointer" onClick={() => onOpenDetail?.(item)}>
            <img
                src={item.poster_path ? IMG_BASE + item.poster_path : fallback}
                alt={item.title}
                loading="lazy"
                className="rounded-t-xl w-full aspect-[2/3] object-cover"
            />

            <div className="carousel-card-body">
                <div className="carousel-card-title">
                    {item.title}
                </div>

                <div className="carousel-rating text-xs text-zinc-400 mb-2">
                    {item.year || "Unknown"} · {item.media_type === "tv" ? "TV" : "Movie"}
                </div>

                <div className="carousel-actions">
                    {/* ADD TO WATCHED */}
                    <button
                        className={`btn ${inWatchlist ? "btn-filled !bg-green-700 !border-green-600" : ""}`}
                        disabled={inWatchlist}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!inWatchlist) onAddWatchlist(item);
                        }}
                    >
                        {inWatchlist ? "✓" : "+ Watched"}
                    </button>

                    {/* ADD TO WISHLIST */}
                    <button
                        className={`btn ${inWishlist ? "btn-filled !bg-red-700 !border-red-600" : ""}`}
                        disabled={inWatchlist} // Cannot wishlist if watched
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!inWatchlist) onAddWishlist(item);
                        }}
                    >
                        {inWishlist ? "♥" : "♡"}
                    </button>
                </div>
            </div>
        </div>
    );
}

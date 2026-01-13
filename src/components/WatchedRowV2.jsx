import { useState } from "react";
import { IMG_BASE } from "../utils/constants";

export default function WatchedRow({
    item,
    onRemove,
    onMoveToWishlist,
    rating,
    onSetRating
}) {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(null);

    const displayRating = hover ?? rating;
    const starClass = (i) => {
        const v = i + 1;
        if (displayRating >= v) return "full";
        if (displayRating >= v - 0.5) return "half";
        return "";
    };

    // Calculate days ago for list view logic if needed
    const daysAgo = item.dateAdded
        ? Math.floor((Date.now() - new Date(item.dateAdded).getTime()) / 86400000)
        : null;

    return (
        <div className="movie-card wishlist-row group relative">
            {/* Poster container with tag */}
            <div className="relative shrink-0">
                <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-bold ${item.media_type === "movie" || !item.media_type ? "bg-blue-700/80" : "bg-purple-700/80"} text-white`}>
                    {item.media_type === "movie" || !item.media_type ? "Movie" : "TV"}
                </span>
                <img
                    className="movie-poster"
                    src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
                    alt={item.title}
                />
            </div>

            <div className="movie-info" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
                        <div className="flex items-center gap-4 text-xs mt-1 w-full">
                            <span className="text-zinc-400 year">
                                {item.release_date ? item.release_date.slice(0, 4) : "—"}
                            </span>

                            {/* Days Ago Tag (Aligned Right in Flow or kept here? User asked to Realign days count tags on both paging to right side as the release year in the left side) */}
                            {/* In list view, usually we want them spaced out. */}
                            {daysAgo !== null && (
                                daysAgo < 1 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">New</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-200">{daysAgo}d ago</span>
                                )
                            )}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {/* RATING DISPLAY */}
                        <div className="rating-display" onClick={() => setOpen(!open)}>
                            {rating ? (
                                <span
                                    style={{
                                        background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: 600,
                                        display: "inline-block"
                                    }}
                                >
                                    ★ {rating?.toFixed(1)}
                                </span>
                            ) : (
                                <span className="star-icon muted">★</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ⭐ STAR PANEL */}
                {/* ... existing star panel ... */}
                {open && (
                    <div
                        className="star-panel"
                        onMouseLeave={() => setHover(null)}
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="star-slot">
                                <span className={`star-visual ${starClass(i)}`}>
                                    ★
                                </span>

                                {/* HALF */}
                                <div
                                    className="star-hit left"
                                    onMouseEnter={() => setHover(i + 0.5)}
                                    onClick={() => {
                                        onSetRating(i + 0.5);
                                        setOpen(false);
                                    }}
                                />

                                {/* FULL */}
                                <div
                                    className="star-hit right"
                                    onMouseEnter={() => setHover(i + 1)}
                                    onClick={() => {
                                        onSetRating(i + 1);
                                        setOpen(false);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <p style={{ marginTop: 10, color: "var(--text-muted)" }}>{item.overview || "No description saved."}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="btn" onClick={() => onRemove(item.id)}>
                        Remove
                    </button>

                    <button className="btn" onClick={() => onMoveToWishlist(item.id)}>
                        Wishlist
                    </button>

                    <a
                        className="btn btn-ghost"
                        href={`https://www.themoviedb.org/movie/${item.tmdb_id}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open
                    </a>
                </div>
            </div>
        </div>
    );
}

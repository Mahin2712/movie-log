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

    // Prefer hover value if active, otherwise saved rating, defaulting to 0
    const displayRating = hover !== null ? hover : (rating || 0);

    const starClass = (i) => {
        const v = i + 1;
        if (displayRating >= v) return "full";
        // 4.5 >= 4.5 -> half? No. 
        // If displayRating is 4.5. v=5.
        // rating >= 5? False.
        // rating >= 4.5? True. Return "half".
        if (displayRating >= v - 0.5) return "half";
        return "";
    };

    return (
        <div className="movie-card card group relative">
            <img
                className="movie-poster"
                src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
                alt={item.title}
            />

            <div className="movie-info flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                        <h3 className="truncate pr-2 font-bold text-(length:--fs-base)">{item.title}</h3>
                        <div className="year text-(length:--fs-xs) text-zinc-400">
                            {item.release_date ? item.release_date.slice(0, 4) : "—"}
                        </div>
                    </div>

                    {/* RATING DISPLAY */}
                    <div className="rating-display cursor-pointer shrink-0" onClick={() => setOpen(!open)}>
                        {displayRating > 0 ? (
                            <span
                                style={{
                                    background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    fontWeight: 600,
                                    display: "inline-block"
                                }}
                                className="text-sm"
                            >
                                ★ {displayRating.toFixed(1)}
                            </span>
                        ) : (
                            <span className="star-icon muted text-zinc-600">★</span>
                        )}
                    </div>
                </div>

                {/* ⭐ STAR PANEL */}
                {open && (
                    <div
                        className="star-panel absolute z-50 bg-zinc-900 border border-zinc-700 p-2 rounded-lg shadow-xl right-2 top-8 flex gap-1"
                        onMouseLeave={() => setHover(null)}
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="star-slot relative w-4 h-4 cursor-pointer">
                                <span className={`star-visual text-zinc-600 text-lg leading-none absolute inset-0 flex items-center justify-center ${starClass(i)}`}>
                                    ★
                                </span>

                                {/* HALF STAR HITBOX (Left 50%) */}
                                <div
                                    className="star-hit left absolute left-0 top-0 w-1/2 h-full z-10"
                                    onMouseEnter={() => setHover(i + 0.5)}
                                    onClick={() => {
                                        onSetRating(i + 0.5);
                                        setOpen(false);
                                        setHover(null);
                                    }}
                                />

                                {/* FULL STAR HITBOX (Right 50%) */}
                                <div
                                    className="star-hit right absolute right-0 top-0 w-1/2 h-full left-1/2 z-10"
                                    onMouseEnter={() => setHover(i + 1)}
                                    onClick={() => {
                                        onSetRating(i + 1);
                                        setOpen(false);
                                        setHover(null);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <p className="mt-2 text-(length:--fs-sm) text-zinc-400 line-clamp-2 md:line-clamp-3">
                    {item.overview || "No details available."}
                </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2 mt-3">
                <button className="btn text-xs py-1.5 px-3" onClick={() => onRemove(item.id)}>
                    Remove
                </button>

                <button className="btn text-xs py-1.5 px-3" onClick={() => onMoveToWishlist(item.id)}>
                    Move to Wishlist
                </button>

                <a
                    className="btn btn-ghost text-xs py-1.5 px-3"
                    href={`https://www.themoviedb.org/movie/${item.tmdb_id}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    Open
                </a>
            </div>
        </div>
    );
}

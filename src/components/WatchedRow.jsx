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
        <div className="movie-card card">
            <img
                className="movie-poster"
                src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
                alt={item.title}
            />

            <div style={{ flex: 1 }}>
                {/* HEADER */}
                <div className="flex-between">
                    <div>
                        <h3>{item.title}</h3>
                        <div className="year">
                            {item.release_date?.slice(0, 4) || "—"}
                        </div>
                    </div>

                    {/* RATING DISPLAY */}
                    <div className="rating-display" onClick={() => setOpen(!open)}>
                        {displayRating > 0 ? (
                            <span
                                style={{
                                    background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    fontWeight: 600,
                                    display: "inline-block"
                                }}
                            >
                                ★ {displayRating.toFixed(1)}
                            </span>
                        ) : (
                            <span className="star-icon muted">★</span>
                        )}
                    </div>
                </div>

                {/* ⭐ STAR PANEL */}
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

                                {/* HALF STAR HITBOX (Left 50%) */}
                                <div
                                    className="star-hit left"
                                    onMouseEnter={() => setHover(i + 0.5)}
                                    onClick={() => {
                                        onSetRating(i + 0.5);
                                        setOpen(false);
                                        setHover(null);
                                    }}
                                />

                                {/* FULL STAR HITBOX (Right 50%) */}
                                <div
                                    className="star-hit right"
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

                {/* OVERVIEW */}
                <p className="mt-8">{item.overview || "No description saved."}</p>

                {/* ACTIONS */}
                <div className="flex-gap-8 mt-8">
                    <button className="btn" onClick={() => onRemove(item.id)}>
                        Remove
                    </button>

                    <button className="btn" onClick={() => onMoveToWishlist(item.id)}>
                        Move to Wishlist
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

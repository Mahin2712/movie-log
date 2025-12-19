// src/components/WatchedRow.jsx
import { IMG_BASE } from "../utils/constants";

// src/components/WatchedRow.jsx
export default function WatchedRow({ item, onRemove, onMoveToWishlist, rating, onSetRating }) {
    return (
        <div className="movie-card card">
            <img className="movie-poster" src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : placeholderPoster(item)} alt={item.title} />
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <h3 style={{ margin: 0 }}>{item.title}</h3>
                        <div className="year">{item.release_date ? item.release_date.slice(0, 4) : "—"}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Rating</div>
                        <select value={rating || ""} onChange={(e) => onSetRating && onSetRating(e.target.value)} className="rating-select">
                            <option value="">--</option>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <p style={{ color: "var(--text-muted)", marginTop: 10 }}>{item.overview || "No description saved."}</p>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn" onClick={() => onRemove && onRemove(item.id)}>Remove</button>
                    <button className="btn" onClick={() => onMoveToWishlist && onMoveToWishlist(item.id)}>(re)moved? use Wishlist tab</button>
                    <a className="btn btn-ghost" href={`https://www.themoviedb.org/movie/${item.tmdb_id}`} target="_blank" rel="noreferrer">Open</a>
                </div>
            </div>
        </div>
    );
}

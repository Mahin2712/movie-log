// src/components/WishlistRow.jsx
import { IMG_BASE } from "../utils/constants.js";

export default function WishlistRow({
  item,
  onRemove,
  onMoveToWatched
}) {
  return (
    <div className="movie-card wishlist-row">
      <img
        className="movie-poster"
        src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : ""}
        alt={item.title}
      />

      <div className="movie-info" style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
            <div className="year">
              {item.release_date ? item.release_date.slice(0, 4) : "—"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn"
              onClick={() => onMoveToWatched(item.id)}
            >
              Move to watched
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => onRemove(item.id)}
            >
              Remove
            </button>
          </div>
        </div>

        <p style={{ marginTop: 10, color: "var(--text-muted)" }}>
          {item.overview || "No details available."}
        </p>
      </div>
    </div>
  );
}

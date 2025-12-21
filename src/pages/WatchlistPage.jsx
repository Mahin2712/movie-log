import { useState, useMemo, useEffect } from "react";
import WatchedRow from "../components/WatchedRow";

const ITEMS_PER_PAGE = 15; // tweak: 10 / 12 / 15

export default function WatchlistPage({
    watched,
    genresMap,
    ratings,
    onRemove,
    onRate,
    onMoveToWishlist
}) {
    // 🔹 local controls (watchlist-only)
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("all");
    const [sortBy, setSortBy] = useState("dateAdded");
    const [asc, setAsc] = useState(false);

    // 🔹 pagination
    const [page, setPage] = useState(1);

    /* ----------------------------------------
       FILTER + SORT (FAST, MEMOIZED)
    ---------------------------------------- */
    const filteredWatched = useMemo(() => {
        let list = [...watched];

        // 🔍 search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                (m.title || "").toLowerCase().includes(q)
            );
        }

        // 🎭 genre
        if (genre !== "all") {
            const gid = Number(genre);
            list = list.filter(m =>
                Array.isArray(m.genre_ids) && m.genre_ids.includes(gid)
            );
        }

        // 🔃 sort
        list.sort((a, b) => {
            if (sortBy === "rating") {
                return asc
                    ? (ratings[a.id] || 0) - (ratings[b.id] || 0)
                    : (ratings[b.id] || 0) - (ratings[a.id] || 0);
            }

            if (sortBy === "title") {
                return asc
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }

            // default: dateAdded
            return asc
                ? new Date(a.dateAdded) - new Date(b.dateAdded)
                : new Date(b.dateAdded) - new Date(a.dateAdded);
        });

        return list;
    }, [watched, search, genre, sortBy, asc, ratings]);

    /* ----------------------------------------
       PAGINATION LOGIC
    ---------------------------------------- */
    const totalPages = Math.max(
        1,
        Math.ceil(filteredWatched.length / ITEMS_PER_PAGE)
    );

    const paginatedWatched = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredWatched.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredWatched, page]);

    // 🔄 reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [search, genre, sortBy, asc]);

    /* ----------------------------------------
       RENDER
    ---------------------------------------- */
    return (
        <div className="container-max watchlist-page">
            {/* 🔍 FILTER BAR */}
            <div className="filter-bar" style={{ marginBottom: 18 }}>
                <input
                    className="search-bar"
                    placeholder="Search watchlist..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                    <option value="all">All genres</option>
                    {Object.entries(genresMap).map(([id, name]) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="dateAdded">Date added</option>
                    <option value="rating">Rating</option>
                    <option value="title">Title</option>
                </select>

                <button className="btn" onClick={() => setAsc(a => !a)}>
                    {asc ? "↑ Asc" : "↓ Desc"}
                </button>
            </div>

            {/* 🎬 MOVIES */}
            {paginatedWatched.length === 0 && (
                <div className="empty-state">No movies found</div>
            )}

            {paginatedWatched.map(w => (
                <WatchedRow
                    key={w.id}
                    item={w}
                    genresMap={genresMap}
                    rating={ratings[w.id] || ""}
                    onSetRating={(v) => onRate(w.id, v)}
                    onRemove={() => onRemove(w.id)}
                    onMoveToWishlist={() => onMoveToWishlist(w)}
                />
            ))}

            {/* 📄 PAGINATION */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        ◀
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1
                        )
                        .map((p, i, arr) => (
                            <span key={p}>
                                {i > 0 && p - arr[i - 1] > 1 && <span className="dots">…</span>}
                                <button
                                    className={`page-btn ${p === page ? "active" : ""}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            </span>
                        ))}

                    <button
                        className="page-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}

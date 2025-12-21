import { useState, useMemo } from "react";
import WatchedRow from "../components/WatchedRow";

export default function WatchlistPage({
    watched,
    genresMap,
    ratings,
    onRemove,
    onRate,
    onMoveToWishlist
}) {
    // 🔹 LOCAL state (does NOT affect other pages)
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("all");
    const [sortBy, setSortBy] = useState("dateAdded");
    const [asc, setAsc] = useState(false);

    // 🔹 LOCAL filtering & sorting
    const filteredWatched = useMemo(() => {
        let list = [...watched];

        // search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                (m.title || "").toLowerCase().includes(q)
            );
        }

        // genre
        if (genre !== "all") {
            const gid = Number(genre);
            list = list.filter(m =>
                Array.isArray(m.genre_ids) && m.genre_ids.includes(gid)
            );
        }

        // sorting
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
                ? a.dateAdded.localeCompare(b.dateAdded)
                : b.dateAdded.localeCompare(a.dateAdded);
        });

        return list;
    }, [watched, search, genre, sortBy, asc, ratings]);

    return (
        <div className="container-max watchlist-page">
        <div className="container-max">
            {/* 🔍 Watchlist-only controls */}
            <div className="filter-bar">
                <div className="flex-gap-8 flex-center" style={{ marginBottom: 14 }}>
                    <input
                        className="search-bar"
                        placeholder="Search watchlist..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                        <option value="all">All genres</option>
                        {Object.entries(genresMap).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="dateAdded">Date added</option>
                        <option value="rating">Rating</option>
                        <option value="title">Title</option>
                    </select>

                    <button className="btn" onClick={() => setAsc(a => !a)}>
                        {asc ? "Asc" : "Desc"}
                    </button>
                </div>
            </div>

            {/* 🎬 Watchlist items */}
            {filteredWatched.map(w => (
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
        </div>
    </div>
    );
}

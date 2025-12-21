import { useState, useMemo, useEffect } from "react";
import WishlistRow from "../components/WishlistRow";

const PAGE_SIZE = 12; // 🔧 change to 10 / 16 if you want

export default function WishlistPage({
    wishlist,
    genresMap,
    onRemove,
    onMoveToWatched
}) {
    // 🔹 Wishlist-only UI state
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // 🔹 Pagination state
    const [page, setPage] = useState(1);

    // 🔁 Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [search, genre, sortBy]);

    // 🔹 Filter + sort wishlist
    const filteredWishlist = useMemo(() => {
        let list = [...wishlist];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                (m.title || "").toLowerCase().includes(q)
            );
        }

        // Genre filter
        if (genre !== "all") {
            const gid = Number(genre);
            list = list.filter(m =>
                Array.isArray(m.genre_ids) && m.genre_ids.includes(gid)
            );
        }

        // Sorting
        switch (sortBy) {
            case "oldest":
                list.sort((a, b) =>
                    a.dateAdded.localeCompare(b.dateAdded)
                );
                break;

            case "az":
                list.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
                break;

            case "za":
                list.sort((a, b) =>
                    b.title.localeCompare(a.title)
                );
                break;

            default: // newest
                list.sort((a, b) =>
                    b.dateAdded.localeCompare(a.dateAdded)
                );
        }

        return list;
    }, [wishlist, search, genre, sortBy]);

    // 🔹 Pagination math
    const totalPages = Math.max(
        1,
        Math.ceil(filteredWishlist.length / PAGE_SIZE)
    );

    const pagedWishlist = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredWishlist.slice(start, start + PAGE_SIZE);
    }, [filteredWishlist, page]);

    return (
        <div className="container-max">
            {/* 🔍 Wishlist controls */}
            <div className="filter-bar" style={{ marginBottom: 14 }}>
                <div className="flex-gap-8 flex-center">
                    <input
                        className="search-bar"
                        placeholder="Search wishlist..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    >
                        <option value="all">All genres</option>
                        {Object.entries(genresMap).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="az">A → Z</option>
                        <option value="za">Z → A</option>
                    </select>
                </div>
            </div>

            {/* 📌 Wishlist items */}
            {pagedWishlist.map(item => (
                <WishlistRow
                    key={item.id}
                    item={item}
                    genresMap={genresMap}
                    onRemove={() => onRemove(item.id)}
                    onMoveToWatched={() => onMoveToWatched(item)}
                />
            ))}

            {/* 📄 Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1
                        )
                        .map(p => (
                            <button
                                key={p}
                                className={`page-btn ${p === page ? "active" : ""}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}

                    <button
                        className="page-btn"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage(p => Math.min(totalPages, p + 1))
                        }
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}

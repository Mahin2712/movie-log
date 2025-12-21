import { useState, useMemo } from "react";
import WishlistRow from "../components/WishlistRow";

export default function WishlistPage({
    wishlist,
    genresMap,
    onRemove,
    onMoveToWatched
}) {
    // 🔹 Local UI state (wishlist-only)
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // 🔹 Filter + sort logic
    const filteredWishlist = useMemo(() => {
        let list = [...wishlist];

        // Search by title
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

    return (
        <div className="container-max">
            {/* 🔍 Wishlist-only controls */}
            <div className="filter-bar">
                <div className="flex-gap-8 flex-center" style={{ marginBottom: 14 }}>
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
            {filteredWishlist.map(item => (
                <WishlistRow
                    key={item.id}
                    item={item}
                    genresMap={genresMap}
                    onRemove={() => onRemove(item.id)}
                    onMoveToWatched={() => onMoveToWatched(item)}
                />
            ))}
        </div>
    );
}

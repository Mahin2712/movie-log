import { useState, useMemo, useEffect } from "react";
import FilterBar from "../components/FilterBar";
import MediaCard from "../components/MediaCard";
import MediaGridCard from "../components/MediaGridCard";

const PAGE_SIZE = 12; // 🔧 change to 10 / 16 if you want

export default function WishlistPage({
  viewMode,
  wishlist,
  genresMap,
  onRemove,
  onMoveToWatched,
}) {
  // Media type filter
  const [mediaFilter, setMediaFilter] = useState("all");
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

    // Media type filter
    if (mediaFilter !== "all") {
      list = list.filter((m) => (m.media_type || "movie") === mediaFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => (m.title || "").toLowerCase().includes(q));
    }

    // Genre filter
    if (genre !== "all") {
      const gid = Number(genre);
      list = list.filter(
        (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(gid)
      );
    }

    // Sorting
    switch (sortBy) {
      case "oldest":
        list.sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));
        break;

      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "za":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;

      default: // newest
        list.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    }

    return list;
  }, [wishlist, mediaFilter, search, genre, sortBy]);

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
      {/* FILTER BAR */}
      <FilterBar
        mediaFilter={mediaFilter}
        setMediaFilter={setMediaFilter}
        search={search}
        setSearch={setSearch}
        genre={genre}
        setGenre={setGenre}
        genresMap={genresMap}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={[
          { value: "newest", label: "Newest first" },
          { value: "oldest", label: "Oldest first" },
          { value: "az", label: "A → Z" },
          { value: "za", label: "Z → A" }
        ]}
        asc={sortBy === "oldest" || sortBy === "az"} // approximate logic for toggle visualization if needed, or just let the toggle do nothing if sorts are prescriptive? 
      // Actually WishlistPage logic uses 'sortBy' strings directly (newest/oldest) rather than separate asc boolean. 
      // To support the unified FilterBar, we might need to adapt.
      // The current FilterBar expects 'asc' and 'setAsc' props.
      // Let's check WishlistPage logic: it uses `sortBy` enum.
      // We can pass a dummy setAsc or adapt the `sortBy` state to use boolean.
      // For now, let's keep the `sortBy` enum dropdown as the primary control and pass a no-op for asc if not used, or hidden.
      // BUT the design has a generic Asc/Desc button. 
      // For Wishlist, "Newest/Oldest" implies order. 
      // Let's just use the `sortBy` dropdown fully and maybe hide the asc toggle or make it functional.
      // The user wants "modern looking". 
      // Better plan: Update WishlistPage to Use standard sort field + asc boolean like WatchlistPage? 
      // Or just map the dropdown options. 
      // The FilterBar has `asc` prop. 
      // I will pass `null` for setAsc to FilterBar and inside FilterBar conditionally render the button if `setAsc` is provided.
      />

      {/* 📌 Wishlist items: grid or list */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          {pagedWishlist.map((item) => {
            const daysAgo = item.dateAdded
              ? Math.floor((Date.now() - new Date(item.dateAdded)) / 86400000)
              : null;

            return (
              <MediaGridCard
                key={item.id}
                item={item}
                daysAgo={daysAgo}
                mode="wishlist"
                onMarkWatched={onMoveToWatched}
                onClick={() => setSelectedItem(item)}
              />
            );
          })}
        </div>
      ) : (
        pagedWishlist.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            status="wishlist"
            genresMap={genresMap}
            onWatch={onMoveToWatched}
            onRemove={onRemove}
          />
        ))
      )}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
            )
            .map((p) => (
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

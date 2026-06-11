import { useState, useMemo, useEffect } from "react";
import FilterBar from "../components/FilterBar";
import MediaCard from "../components/MediaCard";
import MediaGridCard from "../components/MediaGridCard";
import { CardSkeleton, ListRowSkeleton } from "../components/Skeleton";

const LIST_PAGE_SIZE = 12;
const GRID_PAGE_SIZE = 24; // Double the list size

export default function WishlistPage({
  viewMode,
  wishlist,
  genresMap,
  onRemove,
  onMoveToWatched,
  onSelect,
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
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;

      case "za":
        list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;

      default: // newest
        list.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    }

    return list;
  }, [wishlist, mediaFilter, search, genre, sortBy]);

  // 🔹 Pagination math
  // 🔹 Pagination math
  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWishlist.length / pageSize)
  );

  const pagedWishlist = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredWishlist.slice(start, start + pageSize);
  }, [filteredWishlist, page, pageSize]);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* HEADER */}
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-[0.8] mb-1">
          Wishlist <span className="text-blue-500">.</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Movies you're dreaming of watching.</p>
      </header>

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
      {pagedWishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900/50 flex items-center justify-center text-4xl border border-white/5 backdrop-blur-xl">
                🍿
            </div>
            <div className="flex flex-col gap-2 max-w-xs">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Your wishlist is empty</h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">Found something interesting? Add it to your wishlist!</p>
            </div>
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'all' }))}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:bg-blue-500 active:scale-95 shadow-xl shadow-blue-900/20"
            >
                Discover Movies
            </button>
        </div>
      ) : (
        viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-6">
          {pagedWishlist.map((item) => {
            const isHydrated = Boolean(item.title && item.poster_path !== undefined);
            if (!isHydrated) {
              return <CardSkeleton key={item.id} />;
            }
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
                onOpenDetail={() => onSelect?.(item)}
              />
            );
          })}
        </div>
      ) : (
        pagedWishlist.map((item) => {
          const isHydrated = Boolean(item.title && item.poster_path !== undefined);
          if (!isHydrated) {
            return <ListRowSkeleton key={item.id} />;
          }
          return (
            <MediaCard
              key={item.id}
              item={item}
              status="wishlist"
              genresMap={genresMap}
              onWatch={onMoveToWatched}
              onRemove={onRemove}
            />
          );
        })
      ))}

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

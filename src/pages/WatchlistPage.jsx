import { useState, useMemo, useEffect } from "react";
import FilterBar from "../components/FilterBar";
import MediaGridCard from "../components/MediaGridCard";
import WatchedRow from "../components/WatchedRowV2";
import { CardSkeleton, ListRowSkeleton } from "../components/Skeleton";

const LIST_PAGE_SIZE = 15;
const GRID_PAGE_SIZE = 30; // Double the list size

export default function WatchlistPage({
  watched,
  viewMode,
  genresMap,
  ratings,
  onRemove,
  onSetRating,
  onMoveToWishlist,
  onSelect,
}) {
  // Media type filter
  const [mediaFilter, setMediaFilter] = useState("all");
  // local controls (watchlist-only)
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [asc, setAsc] = useState(false);

  // pagination
  const [page, setPage] = useState(1);

  /* ----------------------------------------
       FILTER + SORT (FAST, MEMOIZED)
    ---------------------------------------- */
  const filteredWatched = useMemo(() => {
    let list = [...watched];

    // Media type filter
    if (mediaFilter !== "all") {
      list = list.filter((m) => (m.media_type || "movie") === mediaFilter);
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => (m.title || "").toLowerCase().includes(q));
    }

    // genre
    if (genre !== "all") {
      const gid = Number(genre);
      list = list.filter(
        (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(gid)
      );
    }

    // sort
    list.sort((a, b) => {
      if (sortBy === "rating") {
        return asc
          ? (ratings[a.id] || 0) - (ratings[b.id] || 0)
          : (ratings[b.id] || 0) - (ratings[a.id] || 0);
      }

      if (sortBy === "title") {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return asc
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }

      // default: dateAdded
      return asc
        ? new Date(a.dateAdded) - new Date(b.dateAdded)
        : new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    return list;
  }, [watched, mediaFilter, search, genre, sortBy, asc, ratings]);

  /* ----------------------------------------
       PAGINATION LOGIC
    ---------------------------------------- */
  /* ----------------------------------------
       PAGINATION LOGIC
    ---------------------------------------- */
  const itemsPerPage = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWatched.length / itemsPerPage)
  );

  const paginatedWatched = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredWatched.slice(start, start + itemsPerPage);
  }, [filteredWatched, page, itemsPerPage]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, genre, sortBy, asc]);

  /* ----------------------------------------
       RENDER
    ---------------------------------------- */
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* HEADER */}
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-[0.8] mb-1">
          My Collection <span className="text-blue-500">.</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Your curated library of cinematic tracking.</p>
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
          { value: "dateAdded", label: "Date added" },
          { value: "rating", label: "Rating" },
          { value: "title", label: "Title" },
        ]}
        asc={asc}
        setAsc={setAsc}
        placeholder="Search watchlist..."
      />

      {/* MOVIES: grid or list view */}
      {paginatedWatched.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900/50 flex items-center justify-center text-4xl border border-white/5 backdrop-blur-xl">
                🎬
            </div>
            <div className="flex flex-col gap-2 max-w-xs">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Your list is empty</h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">Start exploring and save movies or shows for later.</p>
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
          {paginatedWatched.map((item) => {
            const isHydrated = Boolean(item.title && item.poster_path !== undefined);
            if (!isHydrated) {
              return <CardSkeleton key={`${item.id}-${item.media_type}`} />;
            }
            const daysAgo = item.dateAdded
              ? Math.floor((Date.now() - new Date(item.dateAdded)) / 86400000)
              : null;
            return (
              <MediaGridCard
                key={`${item.id}-${item.media_type}`}
                item={item}
                mode="watchlist"
                rating={ratings[item.id]}
                daysAgo={daysAgo}
                onSetRating={onSetRating}
                onRemove={() => onRemove(item)}
                onMoveToWishlist={() => onMoveToWishlist(item)}
                onOpenDetail={() => onSelect?.(item)}
              />
            );
          })}
        </div>
      ) : (
        <>
          {paginatedWatched.map((item) => {
            const isHydrated = Boolean(item.title && item.poster_path !== undefined);
            if (!isHydrated) {
              return <ListRowSkeleton key={item.id} />;
            }
            return (
              <WatchedRow
                key={item.id}
                item={item}
                rating={ratings[item.id]}
                genresMap={genresMap}
                onSetRating={(value) => onSetRating(item.id, value)}
                onRemove={onRemove}
                onMoveToWishlist={() => onMoveToWishlist(item)}
                onSelect={() => onSelect?.(item)}
              />
            );
          })}
        </>
      ))}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ◀
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
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
            onClick={() => setPage((p) => p + 1)}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

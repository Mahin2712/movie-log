import { useState, useMemo, useEffect } from "react";
import FilterBar from "../components/FilterBar";
import MediaGridCard from "../components/MediaGridCard";
import WatchedRow from "../components/WatchedRowV2";

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
    <div className="container-max watchlist-page">
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
      {paginatedWatched.length === 0 && (
        <div className="empty-state">No movies found</div>
      )}

      {viewMode === "grid" ? (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          {paginatedWatched.map((item) => {
            const daysAgo = item.dateAdded
              ? Math.floor((Date.now() - new Date(item.dateAdded)) / 86400000)
              : null;
            return (
              <MediaGridCard
                key={item.id}
                item={item}
                daysAgo={daysAgo}
                mode="watchlist"
              />
            );
          })}
        </div>
      ) : (
        <>
          {paginatedWatched.map((item) => (
            <WatchedRow
              key={item.id}
              item={item}
              rating={ratings[item.id]}
              genresMap={genresMap}
              onSetRating={(value) => onSetRating(item.id, value)}
              onRemove={onRemove}
              onMoveToWishlist={() => onMoveToWishlist(item)}
            />
          ))}
        </>
      )}

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

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMediaStore } from "./state/useMediaStore";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MediaGridCard from "./components/MediaGridCard";
import PageWrapper from "./components/PageWrapper";

/* ------------------------ MovieRow ------------------------ */
import MovieRow from "./components/MovieRow.jsx";

/* ------------------------ WatchedRow ------------------------ */
import WatchedRow from "./components/WatchedRow.jsx";

/* ------------------------ WishlistRow ------------------------ */
import WishlistRow from "./components/WishlistRow.jsx";

/* ------------------------ SettingsModal ------------------------ */
import SettingsModal from "./components/SettingsModal.jsx";
import SearchResultsGrid from "./components/SearchResultsGrid.jsx";

/* ---------- import/export helpers ------------------------ */
import {
  handleImportFile,
  exportWatched,
  exportWishlist,
} from "./utils/ImportExport";

/* ---------- All Page ------------------------ */
import AllPage from "./pages/AllPage.jsx";

/* ---------- Watchlist Page ------------------------ */
import WatchlistPage from "./pages/WatchlistPage.jsx";

/* ---------- Wishlist Page ------------------------ */
import WishlistPage from "./pages/WishlistPage.jsx";

/* ---------- insights ------------------------ */
import { getWatchStats } from "./utils/stats.js";
import InsightsPage from "./pages/InsightsPage.jsx";

/**
 * Full App.jsx replacement
 * - Replaces the app UI and fixes:
 *   1) no-bright-white boxes / colors
 *   2) working genre dropdowns (watchlist & wishlist)
 *   3) rating system
 *   4) settings modal/button
 *   5) dropdowns & buttons working
 * - Persisted data in localStorage keys:
 *   movieApp_apiKey, movieApp_watched, movieApp_wishlist, movieApp_ratings, movieApp_refreshMins
 */

import { TMDB_BASE } from "./utils/constants.js";
import { IMG_BASE } from "./utils/constants.js";

export default function App() {
  // --- Universal Media Model Normalizer ---
  const normalizeMedia = useCallback((item) => {
    // Prevent double-normalization
    if (item.tmdb_id && item.media_type && typeof item.id === "string" && item.id.includes("_")) {
      return item;
    }

    // Accepts TMDB movie or TV object, returns universal media object
    const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
    const yearRaw = item.release_date || item.first_air_date || null;
    let year = null;
    if (yearRaw) {
      year = Number(yearRaw.slice(0, 4));
      if (!Number.isFinite(year)) year = null;
    }
    return {
      id: `${item.id}_${mediaType}`,
      tmdb_id: item.id,
      media_type: mediaType,
      title: item.title || item.name || "",
      original_title: item.original_title || item.original_name || undefined,
      year,
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      genres: item.genre_ids || item.genres || [],
      overview: item.overview || "",
      dateAdded: new Date().toISOString(),
      rating: item.rating ?? null,
      seasons: item.number_of_seasons || undefined,
      episodes: item.number_of_episodes || undefined,
    };
  }, []);

  // Settings / Keys
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("movieApp_apiKey") || ""
  );

  // --- Global Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState("all"); // all | movie | tv

  // Search effect with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      if (!apiKey) return;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
            searchQuery
          )}`,
          { signal: controller.signal }
        );

        const data = await res.json();
        const normalized = (data.results || [])
          .filter((item) => item.media_type !== "person")
          .map(normalizeMedia);

        setSearchResults(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setSearchResults([]);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery, apiKey, normalizeMedia]);

  // Exit search function
  const exitSearchMode = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };
  // Media Store
  const { media, addMedia, updateStatus, rateMedia, removeMedia, importMedia } =
    useMediaStore();
  console.log("Media v2:", media);

  // Discovery / main content
  const [popular, setPopular] = useState([]);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [mainSearch, setMainSearch] = useState("");
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  const [headerSearch, setHeaderSearch] = useState("");
  const [mediaType, setMediaType] = useState("all"); // all | movie | tv
  const [viewMode, setViewMode] = useState("list"); // list | grid

  // Top genres from watched
  const getTopGenres = () => {
    const counts = {};

    watched.forEach((m) => {
      (m.genre_ids || []).forEach((gid) => {
        counts[gid] = (counts[gid] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([gid]) => Number(gid));
  };

  // Recommended movies based on top genres
  const [recommended, setRecommended] = useState([]);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Import option from JSON/CSV

  // Genres (map id -> name) and keep also an array for selects
  const [genresMap, setGenresMap] = useState({});
  const [genresArray, setGenresArray] = useState([]); // [{id, name}, ...]

  // Watched/wishlist/ratings (unified media model)
  const [watched, setWatched] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movieApp_watched") || "[]");
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movieApp_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("movieApp_ratings") || "{}");
    } catch {
      return {};
    }
  });



  // Watchlist UI: tab/search/filter/sort
  const [activeTab, setActiveTab] = useState("all"); // "all" | "watchlist" | "wishlist"
  const [watchSearch, setWatchSearch] = useState("");
  const [watchFilterGenre, setWatchFilterGenre] = useState("all"); // "all" or genre id (number)
  const [sortField, setSortField] = useState("dateAdded"); // title | rating | dateAdded | releaseDate
  const [sortAsc, setSortAsc] = useState(false);
  const isWatched = (movieId) => {
    return watched.some((w) => w.id === movieId);
  };
  const isWishlisted = (movieId) => {
    return wishlist.some((w) => w.id === movieId);
  };
  const [wishSort, setWishSort] = useState("newest");

  const getSortedWishlist = React.useMemo(() => {
    let list = [...wishlist];

    switch (wishSort) {
      case "oldest":
        list.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        break;

      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "za":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;

      default: // newest
        list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    return list;
  }, [wishlist, wishSort]);

  // Carousel ref
  const carouselRef = useRef(null);

  // Auto-refresh setting
  const [refreshMins, setRefreshMins] = useState(() =>
    Number(localStorage.getItem("movieApp_refreshMins") || "30")
  );
  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("movieApp_apiKey", apiKey || "");
  }, [apiKey]);
  useEffect(() => {
    localStorage.setItem("movieApp_watched", JSON.stringify(watched));
  }, [watched]);
  useEffect(() => {
    localStorage.setItem("movieApp_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    localStorage.setItem("movieApp_ratings", JSON.stringify(ratings));
  }, [ratings]);
  useEffect(() => {
    localStorage.setItem("movieApp_refreshMins", String(refreshMins));
  }, [refreshMins]);

  // Fetch genres (map + array)
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${TMDB_BASE}/genre/movie/list?api_key=${apiKey}`)
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        const arr = (data.genres || []).map((g) => ({
          id: g.id,
          name: g.name,
        }));
        (data.genres || []).forEach((g) => (map[g.id] = g.name));
        setGenresMap(map);
        setGenresArray(arr);
      })
      .catch(() => {
        setGenresMap({});
        setGenresArray([]);
      });
  }, [apiKey]);

  // Fetch popular for carousel
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}&page=1`)
      .then((r) => r.json())
      .then((data) => setPopular(data.results || []))
      .catch(() => setPopular([]));
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey || watched.length === 0) {
      setRecommended([]);
      return;
    }

    const fetchRecommendations = async () => {
      const topGenres = getTopGenres();
      if (topGenres.length === 0) return;

      try {
        const url = `${TMDB_BASE}/discover/movie?api_key=${apiKey}&with_genres=${topGenres.join(
          ","
        )}&sort_by=popularity.desc&page=1`;
        const res = await fetch(url);
        const data = await res.json();

        const filtered = (data.results || []).filter(
          (m) =>
            !watched.some((w) => w.id === m.id) &&
            !wishlist.some((w) => w.id === m.id)
        );

        setRecommended(filtered.slice(0, 8));
      } catch {
        setRecommended([]);
      }
    };

    fetchRecommendations();
  }, [apiKey, watched, wishlist]);

  // main search (discovery)
  const runMainSearch = async (q) => {
    if (!apiKey) return;
    if (!q || q.trim().length === 0) {
      setDiscoverResults([]);
      return;
    }
    setLoadingDiscover(true);
    try {
      const url = `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        q
      )}&page=1`;
      const r = await fetch(url);
      const data = await r.json();
      setDiscoverResults(data.results || []);
    } catch (e) {
      console.error(e);
      setDiscoverResults([]);
    } finally {
      setLoadingDiscover(false);
    }
  };

  // ---------- helpers: watched/wishlist/ratings ----------

  // --- Add to Watchlist/Wishlist using universal model ---
  const addToWatchlist = (item) => {
    const norm = normalizeMedia(item);
    if (!watched.some((w) => w.tmdb_id === norm.tmdb_id && w.media_type === norm.media_type)) {
      setWatched((prev) => [norm, ...prev.filter((w) => !(w.tmdb_id === norm.tmdb_id && w.media_type === norm.media_type))]);
      setWishlist((prev) => prev.filter((w) => !(w.tmdb_id === norm.tmdb_id && w.media_type === norm.media_type)));
    }
  };

  const addToWishlist = (item) => {
    const norm = normalizeMedia(item);
    if (!wishlist.some((w) => w.tmdb_id === norm.tmdb_id && w.media_type === norm.media_type)) {
      setWishlist((prev) => [norm, ...prev.filter((w) => !(w.tmdb_id === norm.tmdb_id && w.media_type === norm.media_type))]);
      setWatched((prev) => prev.filter((w) => !(w.tmdb_id === norm.tmdb_id && w.media_type === norm.media_type)));
    }
  };

  const removeFromWatched = (id) =>
    setWatched((p) => p.filter((x) => x.id !== id));
  const removeFromWishlist = (id) =>
    setWishlist((p) => p.filter((x) => x.id !== id));

  // rating setter
  const setRating = (mediaId, value) => {
    setRatings((r) => ({
      ...r,
      [mediaId]: value === "" ? null : Number(value),
    }));
  };

  // watchlist build: filter/search/sort
  const buildDisplayedWatchlist = () => {
    let list = [...watched];

    // genre filter (works because we now store genre_ids in watched items)
    if (watchFilterGenre && watchFilterGenre !== "all") {
      const gid = Number(watchFilterGenre);
      list = list.filter(
        (m) => Array.isArray(m.genre_ids) && m.genre_ids.indexOf(gid) !== -1
      );
    }

    // text search
    if (watchSearch && watchSearch.trim()) {
      const q = watchSearch.toLowerCase();
      list = list.filter((m) => (m.title || "").toLowerCase().includes(q));
    }

    // sort
    list.sort((a, b) => {
      let av, bv;
      if (sortField === "title") {
        av = (a.title || "").toLowerCase();
        bv = (b.title || "").toLowerCase();
        const cmp = av.localeCompare(bv);
        return sortAsc ? cmp : -cmp;
      }
      if (sortField === "rating") {
        av = ratings[a.id] || 0;
        bv = ratings[b.id] || 0;
        return sortAsc ? av - bv : bv - av;
      }
      if (sortField === "releaseDate") {
        av = a.release_date || "";
        bv = b.release_date || "";
        if (!av) return sortAsc ? -1 : 1;
        if (!bv) return sortAsc ? 1 : -1;
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      // default: dateAdded
      av = a.dateAdded || "";
      bv = b.dateAdded || "";
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  };

  // carousel scroll
  const scrollCarousel = (dir = "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7);
    const next =
      dir === "right" ? el.scrollLeft + amount : el.scrollLeft - amount;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  const isSearchingMain = mainSearch && mainSearch.trim().length > 0;
  const displayedWatchlist = buildDisplayedWatchlist();
  const displayedWishlist = wishlist.filter((w) => {
    if (watchFilterGenre !== "all") {
      const gid = Number(watchFilterGenre);
      if (!Array.isArray(w.genre_ids) || !w.genre_ids.includes(gid)) {
        return false;
      }
    }

    if (watchSearch.trim()) {
      return (w.title || "")
        .toLowerCase()
        .includes(watchSearch.toLowerCase());
    }

    return true;
  });

  const watchStats = React.useMemo(() => {
    return getWatchStats(watched);
  }, [watched]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          exitSearchMode();
        }}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header: global search bar */}
        <Header
          title="Movie-Log v2"
          search={searchQuery}
          setSearch={setSearchQuery}
          mediaType={searchFilter}
          setMediaType={setSearchFilter}
          onOpenSettings={() => setShowSettings(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Search Results Page (grid only) */}
        {isSearching && (
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-xl font-bold">Search Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm transition ${searchFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSearchFilter("movie")}
                  className={`px-3 py-1 rounded-full text-sm transition ${searchFilter === "movie"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setSearchFilter("tv")}
                  className={`px-3 py-1 rounded-full text-sm transition ${searchFilter === "tv"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    }`}
                >
                  TV Shows
                </button>
              </div>
            </div>

            <SearchResultsGrid
              viewMode={viewMode}
              results={searchResults.filter((item) =>
                searchFilter === "all" ? true : item.media_type === searchFilter
              )}
              isInWatchlist={(item) =>
                watched.some((w) => {
                  // V2 Exact match
                  if (w.tmdb_id === item.tmdb_id && w.media_type === item.media_type) return true;
                  // V2 ID fallback
                  if (w.id === item.id) return true;
                  // V1 Legacy match (w.id is number/string TMDB ID, item.media_type must be movie or undefined/implied)
                  // Casting w.id to number/string loosely
                  if (w.id == item.tmdb_id && (item.media_type === "movie" || !item.media_type)) return true;

                  return false;
                })
              }
              isInWishlist={(item) =>
                wishlist.some((w) => {
                  if (w.tmdb_id === item.tmdb_id && w.media_type === item.media_type) return true;
                  if (w.id === item.id) return true;
                  if (w.id == item.tmdb_id && (item.media_type === "movie" || !item.media_type)) return true;
                  return false;
                })
              }
              onAddWatchlist={addToWatchlist}
              onAddWishlist={addToWishlist}
            />
          </main>
        )}

        {/* Main app pages (hidden when searching) */}
        {!isSearching && (
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === "all" && (
              <PageWrapper title="Discover">
                <AllPage
                  viewMode={viewMode}
                  popular={popular}
                  carouselRef={carouselRef}
                  scrollCarousel={scrollCarousel}
                  isWatched={isWatched}
                  isWishlisted={isWishlisted}
                  onAddWatched={addToWatchlist}
                  onToggleWishlist={addToWishlist}
                />
              </PageWrapper>
            )}

            {activeTab === "watchlist" && (
              <PageWrapper title="Your Watchlist">
                <WatchlistPage
                  viewMode={viewMode}
                  watched={displayedWatchlist}
                  genresMap={genresMap}
                  ratings={ratings}
                  onRemove={removeFromWatched}
                  onSetRating={setRating}
                  onMoveToWishlist={addToWishlist}
                />
              </PageWrapper>
            )}

            {activeTab === "wishlist" && (
              <PageWrapper title="Your Wishlist">
                <WishlistPage
                  viewMode={viewMode}
                  wishlist={displayedWishlist}
                  genresMap={genresMap}
                  onRemove={removeFromWishlist}
                  onMoveToWatched={addToWatchlist}
                />
              </PageWrapper>
            )}

            {activeTab === "insights" && (
              <PageWrapper title="Insights">
                <InsightsPage stats={watchStats} />
              </PageWrapper>
            )}
            {showSettings && (
              <SettingsModal
                apiKey={apiKey}
                setApiKey={setApiKey}
                autoRefresh={refreshMins}
                setAutoRefresh={setRefreshMins}
                onImport={(file) =>
                  handleImportFile({
                    file,
                    apiKey,
                    watched,
                    setWatched,
                    TMDB_BASE,
                  })
                }
                onExportWatched={() => exportWatched({ watched, ratings })}
                onExportWishlist={() => exportWishlist({ wishlist })}
                onClose={() => setShowSettings(false)}
              />
            )}
          </main>
        )}
      </div>
    </div>
  );
}

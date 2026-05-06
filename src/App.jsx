import React, { useEffect, useRef, useState, useCallback } from "react";
import { libraryService } from "./sync/libraryService";
import { useAuth } from "./context/AuthContext";
import { useMediaStore } from "./state/useMediaStore";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MediaGridCard from "./components/MediaGridCard";
import PageWrapper from "./components/PageWrapper";
import { useGlobalSearch } from "./hooks/useGlobalSearch";

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
import ShowDetailPage from "./components/ShowDetailPage.jsx";

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
      id: `${mediaType}_${item.id}`,
      tmdb_id: item.id,
      media_type: mediaType,
      title: item.title || item.name || "",
      original_title: item.original_title || item.original_name || null,
      year,
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      genres: item.genre_ids || item.genres || [],
      genre_ids: item.genre_ids || [], // Keep IDs for filtering
      release_date: item.release_date || null,
      first_air_date: item.first_air_date || null,
      overview: item.overview || "",
      dateAdded: new Date().toISOString(),
      rating: item.rating ?? null,
      seasons: item.number_of_seasons || null,
      episodes: item.number_of_episodes || null,
    };
  }, []);

  // --- Global Search ---
  const {
    search: searchQuery,
    setSearch: setSearchQuery,
    searchResults,
    isSearching,
    mediaType: searchFilter,
    setMediaType: setSearchFilter,
    clearSearch: exitSearchMode
  } = useGlobalSearch();
  // Media Store
  const { media, addMedia, updateStatus, rateMedia, removeMedia, importMedia } =
    useMediaStore();

  // Discovery / main content
  const [popular, setPopular] = useState([]);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("movieApp_viewMode") || "list";
  }); // list | grid

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

  // Library State (Single Source of Truth)
  const [library, setLibrary] = useState({});
  const [libraryLoading, setLibraryLoading] = useState(true);
  const { authUser, authLoading } = useAuth();

  // Load/Sync Library on Auth Change
  useEffect(() => {
    if (authLoading) return;

    const initLibrary = async () => {
      // 1. Instant Bootstrap from Local Cache
      const { readLocalLibrary } = await import("./storage/localStore");
      const local = readLocalLibrary();
      if (Object.keys(local).length > 0) {
        setLibrary(local);
      }

      // 2. Determine if we should show "Blocking" loader
      // We block ONLY on first login (no sync timestamp) or if migration is happening
      const lastSyncAt = localStorage.getItem(`lastSyncAt_${authUser?.uid}`);
      const isFirstLogin = authUser && !lastSyncAt;

      if (isFirstLogin) {
        setLibraryLoading(true);
      }

      try {
        const lib = await libraryService.sync();
        setLibrary(lib || {});
      } catch (error) {
        console.error("Library sync failed:", error);
      } finally {
        setLibraryLoading(false);
      }
    };

    initLibrary();
  }, [authUser, authLoading]);

  // Derived States
  const watched = React.useMemo(() =>
    Object.values(library).filter(item =>
      ['watched', 'completed', 'watching'].includes(item.status)
    ), [library]);

  const wishlist = React.useMemo(() =>
    Object.values(library).filter(item =>
      item.status === 'wishlist'
    ), [library]);

  const ratings = React.useMemo(() => {
    const map = {};
    Object.values(library).forEach(item => {
      if (item.rating) map[item.id] = item.rating;
    });
    return map;
  }, [library]);

  // Selected media for Detail View (TV Shows)
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleUpdateMedia = async (updatedItem) => {
    // Update LibraryService
    // status is required. If updatedItem comes from detail page, it might have it?
    // Usually DetailPage updates progress or status.
    // We assume updatedItem is the full item object.
    const saved = await libraryService.saveItem(updatedItem);
    setLibrary(prev => ({
      ...prev,
      [saved.id]: saved
    }));

    // Also update selectedMedia if it's the one being updated
    if (selectedMedia && selectedMedia.id === updatedItem.id) {
      setSelectedMedia(saved);
    }
  };



  // Watchlist UI: tab/search/filter/sort
  const [activeTab, setActiveTab] = useState("all"); // "all" | "watchlist" | "wishlist"
  const [watchSearch, setWatchSearch] = useState("");
  const [watchFilterGenre, setWatchFilterGenre] = useState("all"); // "all" or genre id (number)
  const [sortField, setSortField] = useState("dateAdded"); // title | rating | dateAdded | releaseDate
  const [sortAsc, setSortAsc] = useState(false);
  const isWatched = (movieId) => {
    return watched.some((w) => w.id === movieId || w.tmdb_id == movieId);
  };
  const isWishlisted = (movieId) => {
    return wishlist.some((w) => w.id === movieId || w.tmdb_id == movieId);
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
  // Dev Helper for Firestore Cleanup
  useEffect(() => {
    if (authUser) {
      window.cleanupFirestore = async () => {
        const { cleanupFirestoreTypes } = await import("./sync/migration");
        await cleanupFirestoreTypes(authUser);
        alert("Cleanup Complete. Refresh page.");
      };
    }
  }, [authUser]);
  // Removed manual localStorage effects for library - handled by LibraryService/Adapters
  useEffect(() => {
    localStorage.setItem("movieApp_refreshMins", String(refreshMins));
  }, [refreshMins]);

  // Persist View Mode
  useEffect(() => {
    localStorage.setItem("movieApp_viewMode", viewMode);
  }, [viewMode]);

  // Fetch genres (map + array)
  useEffect(() => {
    import("./services/tmdbClient").then(({ fetchFromTMDB }) => {
      fetchFromTMDB("/genre/movie/list")
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
    });
  }, []);

  // Fetch popular for carousel
  useEffect(() => {
    import("./services/tmdbClient").then(({ fetchFromTMDB }) => {
      fetchFromTMDB("/movie/popular", { page: 1 })
        .then((data) => setPopular(data.results || []))
        .catch(() => setPopular([]));
    });
  }, []);

  useEffect(() => {
    if (watched.length === 0) {
      setRecommended([]);
      return;
    }

    const fetchRecommendations = async () => {
      const topGenres = getTopGenres();
      if (topGenres.length === 0) return;

      try {
        const { fetchFromTMDB } = await import("./services/tmdbClient");
        const data = await fetchFromTMDB("/discover/movie", {
          with_genres: topGenres.join(","),
          sort_by: "popularity.desc",
          page: 1
        });

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
  }, [watched, wishlist]);

  // main search (discovery)
  const runMainSearch = async (q) => {
    if (!q || q.trim().length === 0) {
      setDiscoverResults([]);
      return;
    }
    setLoadingDiscover(true);
    try {
      const { fetchFromTMDB } = await import("./services/tmdbClient");
      const data = await fetchFromTMDB("/search/movie", {
        query: q,
        page: 1
      });
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
  // --- Add to Watchlist/Wishlist using universal model ---
  const addToWatchlist = async (item) => {
    const norm = normalizeMedia(item);
    // Move to 'watched' (or 'watching' if it was that? For simplicity force 'watched' for now unless we track 'watching' explicitly in UI)
    // Actually, distinct between movie/tv is handled in mergeRules, but here we can set default.
    // Use 'watched' for all adds to watched row.
    const newItem = {
      ...norm,
      status: norm.media_type === 'tv' ? 'watching' : 'watched', // Default status
      updatedAt: new Date().toISOString()
    };

    const saved = await libraryService.saveItem(newItem);
    setLibrary(prev => ({ ...prev, [saved.id]: saved }));
  };

  const addToWishlist = async (item) => {
    const norm = normalizeMedia(item);
    const newItem = {
      ...norm,
      status: 'wishlist',
      updatedAt: new Date().toISOString()
    };

    const saved = await libraryService.saveItem(newItem);
    setLibrary(prev => ({ ...prev, [saved.id]: saved }));
  };

  const removeFromWatched = async (id) => {
    // Actually remove from library or set status to removed?
    // Since we derived lists from library, we can just "delete" from local lib and call service.
    const item = library[id];
    if (item) {
      // If we want to fully delete:
      await libraryService.removeItem(item.media_type, item.tmdb_id);
      setLibrary(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const removeFromWishlist = async (id) => {
    const item = library[id];
    if (item) {
      await libraryService.removeItem(item.media_type, item.tmdb_id);
      setLibrary(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // rating setter
  // rating setter
  const setRating = async (mediaId, value) => {
    const item = library[mediaId];
    if (!item) return;

    const newItem = {
      ...item,
      rating: value === "" ? null : Number(value),
      updatedAt: new Date().toISOString()
    };

    const saved = await libraryService.saveItem(newItem);
    setLibrary(prev => ({ ...prev, [saved.id]: saved }));
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

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false); // Close on selection
          exitSearchMode();
        }}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {/* Loading Overlay */}
        {(authLoading || libraryLoading) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-400 font-medium animate-pulse">Syncing Library...</p>
            </div>
          </div>
        )}
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
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
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
              onOpenDetail={(item) => {
                if (item.media_type === 'tv' || item.id.endsWith('_tv')) {
                  setSelectedMedia(item);
                }
              }}
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
                  onOpenDetail={(item) => {
                    if (item.media_type === 'tv' || item.id.endsWith('_tv')) {
                      setSelectedMedia(item);
                    }
                  }}
                />
              </PageWrapper>
            )}

            {activeTab === "watchlist" && (
              <PageWrapper title="Watchlist">
                <WatchlistPage
                  viewMode={viewMode}
                  watched={displayedWatchlist}
                  genresMap={genresMap}
                  ratings={ratings}
                  onRemove={removeFromWatched}
                  onSetRating={setRating}
                  onMoveToWishlist={addToWishlist}
                  onSelect={(item) => {
                    if (item.media_type === 'tv' || item.id.endsWith('_tv')) {
                      setSelectedMedia(item);
                    }
                  }}
                />
              </PageWrapper>
            )}

            {activeTab === "wishlist" && (
              <PageWrapper title="Wishlist">
                <WishlistPage
                  viewMode={viewMode}
                  wishlist={displayedWishlist}
                  genresMap={genresMap}
                  onRemove={removeFromWishlist}
                  onMoveToWatched={addToWatchlist}
                  onSelect={(item) => {
                    if (item.media_type === 'tv' || item.id.endsWith('_tv')) {
                      setSelectedMedia(item);
                    }
                  }}
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
                autoRefresh={refreshMins}
                setAutoRefresh={setRefreshMins}
                onImport={(file, onProgress) =>
                  handleImportFile({
                    file,
                    watched,
                    wishlist,
                    TMDB_BASE,
                    onProgress
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

      {/* Detail View Overlay */}
      {selectedMedia && (
        <ShowDetailPage
          show={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onUpdateShow={handleUpdateMedia}
        />
      )}
    </div>
  );
}

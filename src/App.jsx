import React, { useEffect, useRef, useState } from "react";
import { useMediaStore } from "./state/useMediaStore";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PageWrapper from "./components/PageWrapper";


/* ------------------------ MovieRow ------------------------ */
import MovieRow from "./components/MovieRow.jsx";

/* ------------------------ WatchedRow ------------------------ */
import WatchedRow from "./components/WatchedRow.jsx";

/* ------------------------ WishlistRow ------------------------ */
import WishlistRow from "./components/WishlistRow.jsx";

/* ------------------------ SettingsModal ------------------------ */
import SettingsModal from "./components/SettingsModal.jsx";

/* ---------- import/export helpers ------------------------ */
import { handleImportFile, exportWatched, exportWishlist } from "./utils/ImportExport";

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
  // Settings / Keys
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("movieApp_apiKey") || ""
  );
  // Media Store
  const {
    media,
    addMedia,
    updateStatus,
    rateMedia,
    removeMedia,
    importMedia
  } = useMediaStore();
  console.log("Media v2:", media);


  // Discovery / main content
  const [popular, setPopular] = useState([]);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [mainSearch, setMainSearch] = useState("");
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  const [headerSearch, setHeaderSearch] = useState("");
  const [mediaType, setMediaType] = useState("all"); // all | movie | tv



  // Top genres from watched
  const getTopGenres = () => {
    const counts = {};

    watched.forEach(m => {
      (m.genre_ids || []).forEach(gid => {
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

  // Watched/wishlist/ratings
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
  const isWatched = (movieId) => { return watched.some(w => w.id === movieId); };
  const isWishlisted = (movieId) => { return wishlist.some(w => w.id === movieId); };
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
  const [refreshMins, setRefreshMins] = useState(
    () => Number(localStorage.getItem("movieApp_refreshMins") || "30")
  );
  // Exit search mode
  const exitSearchMode = () => {
    setMainSearch("");
    setDiscoverResults([]);
  };


  // Persist to localStorage
  useEffect(() => { localStorage.setItem("movieApp_apiKey", apiKey || "") }, [apiKey]);
  useEffect(() => { localStorage.setItem("movieApp_watched", JSON.stringify(watched)) }, [watched]);
  useEffect(() => { localStorage.setItem("movieApp_wishlist", JSON.stringify(wishlist)) }, [wishlist]);
  useEffect(() => { localStorage.setItem("movieApp_ratings", JSON.stringify(ratings)) }, [ratings]);
  useEffect(() => { localStorage.setItem("movieApp_refreshMins", String(refreshMins)) }, [refreshMins]);

  // Fetch genres (map + array)
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${TMDB_BASE}/genre/movie/list?api_key=${apiKey}`)
      .then(r => r.json())
      .then(data => {
        const map = {};
        const arr = (data.genres || []).map(g => ({ id: g.id, name: g.name }));
        (data.genres || []).forEach(g => map[g.id] = g.name);
        setGenresMap(map);
        setGenresArray(arr);
      })
      .catch(() => { setGenresMap({}); setGenresArray([]); });
  }, [apiKey]);

  // Fetch popular for carousel
  useEffect(() => {
    if (!apiKey) return;
    fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}&page=1`)
      .then(r => r.json())
      .then(data => setPopular(data.results || []))
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
        const url = `${TMDB_BASE}/discover/movie?api_key=${apiKey}&with_genres=${topGenres.join(",")}&sort_by=popularity.desc&page=1`;
        const res = await fetch(url);
        const data = await res.json();

        const filtered = (data.results || []).filter(m =>
          !watched.some(w => w.id === m.id) &&
          !wishlist.some(w => w.id === m.id)
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
    if (!q || q.trim().length === 0) { setDiscoverResults([]); return; }
    setLoadingDiscover(true);
    try {
      const url = `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=1`;
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
  // mark as watched (store some movie data including genre ids so filters can work)
  const markWatched = (m) => {
    if (!watched.some(w => w.id === m.id)) {
      const newItem = {
        id: m.id,
        tmdb_id: m.id,
        title: m.title,
        poster_path: m.poster_path || null,   // ✅ ADD THIS
        release_date: m.release_date || null,
        overview: m.overview || "",
        genre_ids: m.genre_ids || [],
        dateAdded: new Date().toISOString(),
        rating: null
      };

      setWatched(p => [newItem, ...p]);
    }
    // remove from wishlist
    setWishlist(p => p.filter(w => w.id !== m.id));
  };

  // Place near other helpers in App component



  const addWishlist = (m) => {
    if (!wishlist.some(w => w.id === m.id)) {
      const newItem = {
        id: m.id,
        tmdb_id: m.id,
        title: m.title,
        poster_path: m.poster_path || null,   // ✅ ADD THIS
        release_date: m.release_date || null,
        overview: m.overview || "",
        genre_ids: m.genre_ids || [],
        dateAdded: new Date().toISOString()
      };

      setWishlist(p => [newItem, ...p]);
    }
    // Remove from watched if present
    setWatched(p => p.filter(w => w.id !== m.id));
  };

  const removeFromWatched = (id) => setWatched(p => p.filter(x => x.id !== id));
  const removeFromWishlist = (id) => setWishlist(p => p.filter(x => x.id !== id));

  // rating setter
  const setRating = (movieId, value) => {
    setRatings(r => ({ ...r, [movieId]: value === "" ? null : Number(value) }));
  };

  // watchlist build: filter/search/sort
  const buildDisplayedWatchlist = () => {
    let list = [...watched];

    // genre filter (works because we now store genre_ids in watched items)
    if (watchFilterGenre && watchFilterGenre !== "all") {
      const gid = Number(watchFilterGenre);
      list = list.filter(m => Array.isArray(m.genre_ids) && m.genre_ids.indexOf(gid) !== -1);
    }

    // text search
    if (watchSearch && watchSearch.trim()) {
      const q = watchSearch.toLowerCase();
      list = list.filter(m => (m.title || "").toLowerCase().includes(q));
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
    const next = dir === "right" ? el.scrollLeft + amount : el.scrollLeft - amount;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  const isSearchingMain = mainSearch && mainSearch.trim().length > 0;
  const displayedWatchlist = buildDisplayedWatchlist();
  const displayedWishlist = wishlist.filter(w => {
    // genre filter
    if (watchFilterGenre !== "all") {
      const gid = Number(watchFilterGenre);
      if (!Array.isArray(w.genre_ids) || !w.genre_ids.includes(gid)) return false;
    }

    // text search
    if (watchSearch.trim()) {
      return (w.title || "").toLowerCase().includes(watchSearch.toLowerCase());
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
        setActiveTab={setActiveTab}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header
          title="Movie-Log v2"
          search={headerSearch}
          setSearch={setHeaderSearch}
          mediaType={mediaType}
          setMediaType={setMediaType}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "all" && (
            <PageWrapper title="Discover">
              <AllPage
                popular={popular}
                carouselRef={carouselRef}
                scrollCarousel={scrollCarousel}
                isWatched={isWatched}
                isWishlisted={isWishlisted}
                onAddWatched={markWatched}
                onToggleWishlist={(movie) =>
                  isWishlisted(movie.id)
                    ? removeFromWishlist(movie.id)
                    : addWishlist(movie)
                }
              />
            </PageWrapper>
          )}

          {activeTab === "watchlist" && (
            <PageWrapper title="Your Watchlist">
              <WatchlistPage
                watched={displayedWatchlist}
                genresMap={genresMap}
                ratings={ratings}
                onRemove={removeFromWatched}
                onRate={setRating}
                onMoveToWishlist={addWishlist}
              />
            </PageWrapper>
          )}

          {activeTab === "wishlist" && (
            <PageWrapper title="Your Wishlist">
              <WishlistPage
                wishlist={displayedWishlist}
                genresMap={genresMap}
                onRemove={removeFromWishlist}
                onMoveToWatched={markWatched}
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
                  TMDB_BASE
                })
              }
              onExportWatched={() => exportWatched({ watched, ratings })}
              onExportWishlist={() => exportWishlist({ wishlist })}
              onClose={() => setShowSettings(false)}
            />
          )}

        </main>

      </div>
    </div>
  );

}

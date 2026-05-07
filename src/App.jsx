import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { useLibrary } from "./hooks/useLibrary";
import { useLibraryActions } from "./hooks/useLibraryActions";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { useDiscovery } from "./hooks/useDiscovery";
import { useGenres } from "./hooks/useGenres";
import { useMinimumLoading } from "./hooks/useMinimumLoading";

// Layout & Components
import AppShell from "./layouts/AppShell";
import PageWrapper from "./components/PageWrapper";
import SearchResultsGrid from "./components/SearchResultsGrid";
import SettingsModal from "./components/SettingsModal";
import ShowDetailPage from "./components/ShowDetailPage";

// Pages
import AllPage from "./pages/AllPage";
import WatchlistPage from "./pages/WatchlistPage";
import WishlistPage from "./pages/WishlistPage";
import InsightsPage from "./pages/InsightsPage";

// Utils
import { getWatchStats } from "./utils/stats";
import { handleImportFile, exportWatched, exportWishlist } from "./utils/ImportExport";
import { TMDB_BASE } from "./utils/constants";

function AppContent() {
    const { authUser } = useAuth();
    const { library, watched, wishlist, ratings } = useLibrary();
    const actions = useLibraryActions();
    const { 
        search, setSearch, searchResults, isSearching, 
        loading: searchLoading, mediaType: searchFilter, 
        setMediaType: setSearchFilter, clearSearch 
    } = useGlobalSearch();
    const { popular, recommended, loading: discoveryLoading } = useDiscovery();
    const { genresMap } = useGenres();

    // Premium Loading States (with min duration)
    const isDiscoveryLoading = useMinimumLoading(discoveryLoading, 600);
    const isInsightsLoading = useMinimumLoading(false, 400); // Artificial polish for stats calculation

    // App UI State
    const [activeTab, setActiveTab] = useState("all");
    const [viewMode, setViewMode] = useState(() => localStorage.getItem("movieApp_viewMode") || "list");
    const [showSettings, setShowSettings] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const carouselRef = useRef(null);

    // Persist View Mode
    useEffect(() => {
        localStorage.setItem("movieApp_viewMode", viewMode);
    }, [viewMode]);

    // Custom Event Listener for Tab Switching (from CTAs)
    useEffect(() => {
        const handleSwitchTab = (e) => {
            if (e.detail) setActiveTab(e.detail);
        };
        window.addEventListener('switch-tab', handleSwitchTab);
        return () => window.removeEventListener('switch-tab', handleSwitchTab);
    }, []);

    // Helpers
    const isWatched = useCallback((itemOrId) => {
        const id = typeof itemOrId === 'object' ? (itemOrId.tmdb_id || itemOrId.id) : itemOrId;
        const result = watched.some(m => m.tmdb_id === id || m.id === id);
        console.log(`isWatched check: ${id} -> ${result}`);
        return result;
    }, [watched]);

    const isWishlisted = useCallback((itemOrId) => {
        const id = typeof itemOrId === 'object' ? (itemOrId.tmdb_id || itemOrId.id) : itemOrId;
        return wishlist.some(m => m.tmdb_id === id || m.id === id);
    }, [wishlist]);
    
    const scrollCarousel = (dir = "right") => {
        const el = carouselRef.current;
        if (!el) return;
        const amount = Math.round(el.clientWidth * 0.7);
        const next = dir === "right" ? el.scrollLeft + amount : el.scrollLeft - amount;
        el.scrollTo({ left: next, behavior: "smooth" });
    };

    const watchStats = React.useMemo(() => getWatchStats(watched), [watched]);

    return (
        <AppShell
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            search={search}
            setSearch={setSearch}
            mediaType={searchFilter}
            setMediaType={setSearchFilter}
            onOpenSettings={() => setShowSettings(true)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onExitSearch={clearSearch}
        >
            {isSearching ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold text-zinc-100">Search Results</h2>
                        <div className="flex gap-2">
                            {["all", "movie", "tv"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setSearchFilter(t)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                        searchFilter === t
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                                    }`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <SearchResultsGrid
                        viewMode={viewMode}
                        results={React.useMemo(() => 
                            searchResults.filter(item => searchFilter === "all" ? true : item.media_type === searchFilter),
                            [searchResults, searchFilter]
                        )}
                        isInWatchlist={isWatched}
                        isInWishlist={isWishlisted}
                        onAddWatchlist={actions.addToWatchlist}
                        onAddWishlist={actions.addToWishlist}
                        onOpenDetail={setSelectedMedia}
                    />
                </div>
            ) : (
                <>
                    {activeTab === "all" && (
                        <PageWrapper title="Discover">
                            <AllPage
                                viewMode={viewMode}
                                popular={popular}
                                recommended={recommended}
                                loading={isDiscoveryLoading}
                                carouselRef={carouselRef}
                                scrollCarousel={scrollCarousel}
                                isWatched={isWatched}
                                isWishlisted={isWishlisted}
                                onAddWatched={actions.addToWatchlist}
                                onToggleWishlist={(item) => {
                                    if (isWishlisted(item.id)) {
                                        actions.removeFromLibrary(item.id);
                                    } else {
                                        actions.addToWishlist(item);
                                    }
                                }}
                                onOpenDetail={setSelectedMedia}
                            />
                        </PageWrapper>
                    )}

                    {activeTab === "watchlist" && (
                        <PageWrapper title="Watchlist">
                            <WatchlistPage
                                viewMode={viewMode}
                                watched={watched}
                                genresMap={genresMap}
                                ratings={ratings}
                                onRemove={(item) => actions.removeFromLibrary(item.id)}
                                onSetRating={actions.setRating}
                                onMoveToWishlist={(item) => actions.addToWishlist(item)}
                                onSelect={setSelectedMedia}
                            />
                        </PageWrapper>
                    )}

                    {activeTab === "wishlist" && (
                        <PageWrapper title="Wishlist">
                            <WishlistPage
                                viewMode={viewMode}
                                wishlist={wishlist}
                                genresMap={genresMap}
                                onRemove={(item) => actions.removeFromLibrary(item.id)}
                                onMoveToWatched={(item) => actions.addToWatchlist(item)}
                                onSelect={setSelectedMedia}
                            />
                        </PageWrapper>
                    )}

                    {activeTab === "insights" && (
                        <PageWrapper title="Insights">
                            <InsightsPage stats={watchStats} loading={isInsightsLoading} />
                        </PageWrapper>
                    )}
                </>
            )}

            {/* Modals & Overlays */}
            {showSettings && (
                <SettingsModal
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

            {selectedMedia && (
                <ShowDetailPage
                    show={selectedMedia}
                    onClose={() => setSelectedMedia(null)}
                    onUpdateShow={actions.updateItem}
                />
            )}
        </AppShell>
    );
}

export default function App() {
    return (
        <LibraryProvider>
            <AppContent />
        </LibraryProvider>
    );
}

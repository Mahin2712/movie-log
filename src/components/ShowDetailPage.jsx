import React, { useState, useEffect, useMemo } from "react";
import { IMG_BASE, TMDB_BASE } from "../utils/constants";
import { useLibraryActions } from "../hooks/useLibraryActions";

/**
 * ShowDetailPage Component
 * Redesigned for premium aesthetics and mobile-first responsiveness.
 * Supports both TV Shows and Movies.
 */
export default function ShowDetailPage({
    show,
    onClose,
    onUpdateShow,
}) {
    const [activeSeason, setActiveSeason] = useState(1);
    const [loadingSeasons, setLoadingSeasons] = useState(new Set());
    const [ratingHover, setRatingHover] = useState(null);
    const [details, setDetails] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [loadingEpisode, setLoadingEpisode] = useState(null);
    const { removeFromLibrary } = useLibraryActions();

    const getImageUrl = (path, size = "w500") => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    };

    const tmdbId = useMemo(() => {
        if (show.tmdb_id) return Number(show.tmdb_id);
        if (!show.id) return null;
        const idStr = String(show.id);
        if (idStr.includes("_")) {
            const parts = idStr.split("_");
            return Number(parts[1]) || null;
        }
        return Number(show.id) || null;
    }, [show.tmdb_id, show.id]);

    const mediaType = useMemo(() => {
        if (show.media_type) return show.media_type;
        if (show.id && String(show.id).includes("_")) {
            return String(show.id).split("_")[0];
        }
        return show.first_air_date ? "tv" : "movie";
    }, [show.media_type, show.id, show.first_air_date]);

    const isMovie = mediaType === "movie";

    // Combine show properties (from database/parent) and fetched details (from TMDB API)
    const mediaData = useMemo(() => {
        return { ...show, ...details };
    }, [show, details]);

    // Derived TV state
    const seasonList = mediaData.seasonList || [];
    const seasonsData = mediaData.seasonsData || {};

    // Initial fetch of media details
    useEffect(() => {
        if (!tmdbId) return;
        if (isMovie) {
            if (show.runtime === undefined || show.tagline === undefined) {
                import("../services/tmdbClient").then(({ fetchFromTMDB }) => {
                    fetchFromTMDB(`/movie/${tmdbId}`)
                        .then(data => {
                            const movieDetails = {
                                tagline: data.tagline || "",
                                runtime: data.runtime || 0,
                                budget: data.budget || 0,
                                revenue: data.revenue || 0,
                                vote_average: data.vote_average || 0,
                                release_date: data.release_date || "",
                                genres: data.genres || [],
                                overview: data.overview || show.overview || "",
                                backdrop_path: data.backdrop_path || "",
                                poster_path: data.poster_path || ""
                            };
                            setDetails(movieDetails);
                            
                            // Only update parent if the item is already saved in library
                            if (show.status) {
                                onUpdateShow({
                                    ...show,
                                    tmdb_id: tmdbId,
                                    ...movieDetails
                                });
                            }
                        })
                        .catch(err => console.error("Failed to fetch movie details", err));
                });
            }
        } else {
            // TV show details
            if (!show.seasonList) {
                import("../services/tmdbClient").then(({ fetchFromTMDB }) => {
                    fetchFromTMDB(`/tv/${tmdbId}`)
                        .then(data => {
                            const tvDetails = {
                                seasonList: data.seasons || [],
                                production_status: data.status,
                                last_air_date: data.last_air_date,
                                in_production: data.in_production,
                                number_of_episodes: data.number_of_episodes,
                                number_of_seasons: data.number_of_seasons,
                                tagline: data.tagline || "",
                                backdrop_path: data.backdrop_path || "",
                                poster_path: data.poster_path || ""
                            };
                            setDetails(tvDetails);

                            // Only update parent if the item is already saved in library
                            if (show.status) {
                                onUpdateShow({
                                    ...show,
                                    tmdb_id: tmdbId,
                                    ...tvDetails
                                });
                            }
                        })
                        .catch(err => console.error("Failed to fetch show details", err));
                });
            }
        }
    }, [tmdbId, show.seasonList, show.runtime, show.tagline, isMovie, show.status]);

    // Fetch active season episodes automatically
    useEffect(() => {
        if (isMovie || !tmdbId || !activeSeason) return;
        if (!seasonsData[activeSeason] && !loadingSeasons.has(activeSeason)) {
            setLoadingSeasons(prev => {
                const next = new Set(prev);
                next.add(activeSeason);
                return next;
            });
            import("../services/tmdbClient").then(async ({ fetchFromTMDB }) => {
                try {
                    const data = await fetchFromTMDB(`/tv/${tmdbId}/season/${activeSeason}`);
                    const updatedSeasonsData = { ...seasonsData, [activeSeason]: data };
                    
                    setDetails(prev => ({ ...prev, seasonsData: updatedSeasonsData }));

                    if (show.status) {
                        onUpdateShow({
                            ...mediaData,
                            seasonsData: updatedSeasonsData
                        });
                    }
                } catch (e) {
                    console.error("Failed to load season", e);
                } finally {
                    setLoadingSeasons(prev => {
                        const next = new Set(prev);
                        next.delete(activeSeason);
                        return next;
                    });
                }
            });
        }
    }, [tmdbId, activeSeason, seasonsData, isMovie, show.status]);

    const isEpisodeWatched = (seasonNum, epNum) => {
        return mediaData.progress?.watchedItems?.[`${seasonNum}_${epNum}`] === true;
    };

    const toggleEpisode = async (seasonNum, epNum) => {
        const key = `${seasonNum}_${epNum}`;
        setLoadingEpisode(key);
        const currentWatched = mediaData.progress?.watchedItems || {};
        const isWatched = currentWatched[key];

        const newWatchedItems = { ...currentWatched };
        if (isWatched) {
            delete newWatchedItems[key];
        } else {
            newWatchedItems[key] = true;
        }

        // Calculate progress stats
        const totalWatched = Object.keys(newWatchedItems).length;
        const totalEpisodes = mediaData.number_of_episodes || 0;
        const percent = totalEpisodes > 0 ? (totalWatched / totalEpisodes) * 100 : 0;

        try {
            await onUpdateShow({
                ...mediaData,
                status: mediaData.status && mediaData.status !== 'wishlist' ? mediaData.status : 'watching',
                progress: {
                    ...mediaData.progress,
                    watchedItems: newWatchedItems,
                    watchedEpisodes: totalWatched,
                    percentComplete: Math.round(percent)
                }
            });
        } catch (err) {
            console.error("Failed to toggle episode:", err);
        } finally {
            setLoadingEpisode(null);
        }
    };

    const setMovieRating = async (val) => {
        setActionLoading('rating');
        try {
            await onUpdateShow({
                ...mediaData,
                rating: val,
                status: mediaData.status && mediaData.status !== 'wishlist' ? mediaData.status : 'watched',
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Failed to set rating:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const toggleMovieStatus = async () => {
        const newStatus = mediaData.status === 'wishlist' ? 'watched' : 'wishlist';
        setActionLoading('status');
        try {
            await onUpdateShow({
                ...mediaData,
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Failed to toggle status:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async () => {
        if (window.confirm("Are you sure you want to remove this from your library?")) {
            setActionLoading('remove');
            try {
                await removeFromLibrary(mediaData.id || show.id);
                onClose();
            } catch (err) {
                console.error("Failed to remove show:", err);
            } finally {
                setActionLoading(null);
            }
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    // Calculate overall progress (TV only)
    const progressPercent = mediaData.progress?.percentComplete || 0;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#050b18] overflow-y-auto overflow-x-hidden animate-in fade-in duration-300 scroll-smooth">
            {/* Cinematic Hero Section */}
            <div className="relative w-full h-[55vh] md:h-[65vh] shrink-0">
                <img 
                    src={getImageUrl(mediaData.backdrop_path, "original")} 
                    alt={mediaData.title}
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b18] via-[#050b18]/40 to-transparent" />
                
                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-start z-30">
                    <button 
                        onClick={onClose}
                        className="p-3.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <div className="flex gap-2">
                        <span className="px-4 py-1.5 rounded-full bg-blue-600/60 backdrop-blur-lg border border-blue-400/20 text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg">
                            {isMovie ? 'Movie' : (mediaData.production_status || 'TV Show')}
                        </span>
                    </div>
                </div>

                {/* Hero Bottom Info - Centered on Mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col items-center md:items-start text-center md:text-left gap-3 md:gap-4">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-[0.9]">
                        {mediaData.title}
                    </h1>
                    {mediaData.tagline && (
                        <p className="text-zinc-400 text-sm md:text-xl italic max-w-2xl font-medium opacity-80">"{mediaData.tagline}"</p>
                    )}
                    
                    {/* TV Metadata Details */}
                    {!isMovie && (
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 backdrop-blur-md border border-white/5">
                                <span className="text-blue-400 font-black text-sm md:text-base">{mediaData.number_of_seasons || '?'}</span>
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Seasons</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 backdrop-blur-md border border-white/5">
                                <span className="text-green-400 font-black text-sm md:text-base">{mediaData.number_of_episodes || '?'}</span>
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Episodes</span>
                            </div>
                        </div>
                    )}

                    {/* Movie Metadata Details */}
                    {isMovie && (
                        <div className="flex items-center gap-3 mt-2">
                            {mediaData.runtime > 0 && (
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 backdrop-blur-md border border-white/5">
                                    <span className="text-blue-400 font-black text-sm md:text-base">
                                        {Math.floor(mediaData.runtime / 60)}h {mediaData.runtime % 60}m
                                    </span>
                                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Runtime</span>
                                </div>
                            )}
                            {mediaData.release_date && (
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 backdrop-blur-md border border-white/5">
                                    <span className="text-green-400 font-black text-sm md:text-base">
                                        {new Date(mediaData.release_date).getFullYear()}
                                    </span>
                                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Released</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-4 md:p-12 -mt-10 relative z-10 max-w-[1600px] mx-auto w-full">
                {isMovie ? (
                    <>
                        {/* Left Column: Movie Actions & Info */}
                        <div className="w-full md:w-[380px] flex flex-col gap-6 shrink-0">
                            {/* Movie Actions Card */}
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Status</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                            mediaData.status === 'wishlist' 
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                                : mediaData.status 
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-zinc-800/40 text-zinc-500 border border-white/5"
                                        }`}>
                                            {mediaData.status === 'wishlist' ? 'Wishlist' : mediaData.status ? 'Watched' : 'Not Tracked'}
                                        </span>
                                        <button
                                            onClick={toggleMovieStatus}
                                            disabled={actionLoading !== null}
                                            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {actionLoading === 'status' && (
                                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                            )}
                                            Mark as {mediaData.status === 'wishlist' ? 'Watched' : 'Wishlist'}
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-white/5" />

                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Rating</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-3xl font-black text-white flex items-center gap-2">
                                            {actionLoading === 'rating' && (
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            )}
                                            {mediaData.rating ? `${mediaData.rating}/10` : 'Unrated'}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                                <button
                                                    key={val}
                                                    disabled={actionLoading !== null}
                                                    onMouseEnter={() => setRatingHover(val)}
                                                    onMouseLeave={() => setRatingHover(null)}
                                                    onClick={() => setMovieRating(val)}
                                                    className={`w-6 h-8 rounded-md flex items-center justify-center text-[10px] font-black transition-all hover:scale-115 disabled:opacity-50 ${
                                                        (ratingHover !== null ? ratingHover >= val : (mediaData.rating || 0) >= val)
                                                            ? 'text-yellow-500' 
                                                            : 'text-zinc-600 hover:text-zinc-400'
                                                    }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {mediaData.status && (
                                    <>
                                        <div className="w-full h-px bg-white/5" />
                                        <button
                                            onClick={handleRemove}
                                            disabled={actionLoading !== null}
                                            className="w-full py-3.5 rounded-2xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {actionLoading === 'remove' ? (
                                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                            ) : null}
                                            {actionLoading === 'remove' ? 'Removing...' : 'Remove From Library'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Movie Meta Info */}
                            <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 flex flex-col gap-6">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Release Date</h4>
                                    <p className="text-sm font-bold text-zinc-300">
                                        {mediaData.release_date ? new Date(mediaData.release_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                                {mediaData.genres && mediaData.genres.length > 0 && (
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Genres</h4>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {mediaData.genres.map(g => (
                                                <span key={g.id || g} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-medium text-zinc-400">
                                                    {g.name || g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Movie Story & Stats */}
                        <div className="flex-1 flex flex-col gap-8 mt-4 md:mt-0">
                            <div className="flex flex-col gap-4">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
                                    The Story <span className="text-blue-500">.</span>
                                </h2>
                                <p className="text-base md:text-lg text-zinc-300 leading-relaxed font-medium max-w-4xl">
                                    {mediaData.overview || "No overview details available."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">TMDB Rating</span>
                                    <span className="text-xl font-bold text-yellow-500">★ {mediaData.vote_average ? mediaData.vote_average.toFixed(1) : 'N/A'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Budget</span>
                                    <span className="text-xl font-bold text-emerald-400">{formatCurrency(mediaData.budget)}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Revenue</span>
                                    <span className="text-xl font-bold text-blue-400">{formatCurrency(mediaData.revenue)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Left Column: TV Details & Progress */}
                        <div className="w-full md:w-[380px] flex flex-col gap-6 shrink-0 md:sticky md:top-24 h-fit">
                            {/* Progress Card - Glassmorphism */}
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col gap-5">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Progress</span>
                                        <span className="text-3xl font-black text-white">{progressPercent}%</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-blue-400/80 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                                            {mediaData.progress?.watchedEpisodes || 0} / {mediaData.number_of_episodes || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-zinc-800/50 rounded-full overflow-hidden p-[2px]">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                    Complete this series to unlock achievements and update your global stats.
                                </p>
                                
                                {mediaData.status && (
                                    <button
                                        onClick={handleRemove}
                                        disabled={actionLoading !== null}
                                        className="w-full py-3.5 rounded-2xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-black text-xs uppercase tracking-widest transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading === 'remove' ? (
                                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                        ) : null}
                                        {actionLoading === 'remove' ? 'Removing...' : 'Remove From Library'}
                                    </button>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 flex flex-col gap-8">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">The Story</h3>
                                    <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium">{mediaData.overview}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Premiere</h4>
                                        <p className="text-sm font-bold text-zinc-300">{mediaData.first_air_date ? new Date(mediaData.first_air_date).getFullYear() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Status</h4>
                                        <p className="text-sm font-bold text-blue-400">{mediaData.in_production ? 'Ongoing' : 'Finished'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Episodes List & Season Tabs */}
                        <div className="flex-1 flex flex-col gap-8 mt-4 md:mt-0">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
                                    Episodes <span className="text-blue-500">.</span>
                                </h2>
                            </div>

                            {/* Season Selector Tabs */}
                            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                {seasonList.filter(s => s.season_number > 0).map((season) => {
                                    const isSelected = activeSeason === season.season_number;
                                    const seasonData = seasonsData[season.season_number];
                                    const totalEp = season.episode_count;
                                    const watchedEp = seasonData?.episodes
                                        ? seasonData.episodes.filter(ep => isEpisodeWatched(season.season_number, ep.episode_number)).length
                                        : 0;
                                    const isCompleted = totalEp > 0 && watchedEp === totalEp;
                                    
                                    return (
                                        <button
                                            key={season.id}
                                            onClick={() => setActiveSeason(season.season_number)}
                                            className={`relative shrink-0 flex flex-col items-start gap-1 px-5 py-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                                                isSelected
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-[1.03]"
                                                    : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                                            }`}
                                        >
                                            <span className="text-xs font-black uppercase tracking-wider">Season {season.season_number}</span>
                                            <span className="text-[10px] opacity-75 font-semibold">
                                                {watchedEp} / {totalEp} Watched
                                            </span>
                                            {/* Subtle completion indicator dot */}
                                            {isCompleted && (
                                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Season Details Banner */}
                            {seasonsData[activeSeason] && (
                                <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] bg-zinc-900/20 border border-white/5 items-center animate-in fade-in duration-300">
                                    <div className="w-20 h-28 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-md border border-white/5">
                                        {seasonsData[activeSeason].poster_path ? (
                                            <img
                                                src={getImageUrl(seasonsData[activeSeason].poster_path, "w185")}
                                                className="w-full h-full object-cover"
                                                alt={`Season ${activeSeason} Poster`}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold bg-zinc-900">S{activeSeason}</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <h3 className="text-lg font-black text-white uppercase">Season {activeSeason} Overview</h3>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-3">
                                            {seasonsData[activeSeason].overview || `Season ${activeSeason} of ${mediaData.title} premiered on ${seasonsData[activeSeason].air_date ? new Date(seasonsData[activeSeason].air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}.`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Episodes Content (Grid) */}
                            {loadingSeasons.has(activeSeason) ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-black animate-pulse">Syncing Episodes...</span>
                                </div>
                            ) : seasonsData[activeSeason]?.episodes ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                                    {seasonsData[activeSeason].episodes.map((ep) => {
                                        const watched = isEpisodeWatched(activeSeason, ep.episode_number);
                                        const isEpLoading = loadingEpisode === `${activeSeason}_${ep.episode_number}`;
                                        
                                        return (
                                            <div
                                                key={ep.id}
                                                onClick={() => toggleEpisode(activeSeason, ep.episode_number)}
                                                className={`group relative flex flex-col bg-zinc-900/30 border rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 ${
                                                    watched
                                                        ? "border-blue-500/30 bg-blue-950/10 shadow-[0_8px_30px_rgb(59,130,246,0.05)]"
                                                        : "border-white/5 hover:border-white/10 hover:bg-zinc-900/50 hover:shadow-2xl hover:scale-[1.01]"
                                                }`}
                                            >
                                                {/* Episode Still Image / Video Thumbnail */}
                                                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                                                    <img
                                                        src={getImageUrl(ep.still_path, "w300")}
                                                        alt={ep.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    
                                                    {/* Dark Overlay Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                                    {/* Episode Info Badges on Image */}
                                                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                                                        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-black text-zinc-300 uppercase tracking-widest border border-white/5">
                                                            EP {ep.episode_number}
                                                        </span>
                                                        {ep.runtime && (
                                                            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-zinc-400">
                                                                {ep.runtime} min
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Watch Status Overlay */}
                                                    {isEpLoading ? (
                                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                                                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    ) : watched ? (
                                                        <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
                                                            <div className="bg-blue-500 text-white rounded-full p-3 shadow-[0_0_25px_rgba(59,130,246,0.6)] scale-110 animate-in zoom-in-50 duration-300">
                                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Episode Info Body */}
                                                <div className="p-6 flex flex-col gap-2 flex-1">
                                                    <h4 className={`text-base font-bold tracking-tight line-clamp-1 transition-colors ${
                                                        watched ? 'text-blue-400' : 'text-zinc-100 group-hover:text-white'
                                                    }`}>
                                                        {ep.name}
                                                    </h4>
                                                    
                                                    {ep.air_date && (
                                                        <span className="text-[10px] font-medium text-zinc-500">
                                                            Aired: {new Date(ep.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}

                                                    <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3 mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                                        {ep.overview || "No overview available for this episode."}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-zinc-900/10 rounded-[2rem] border border-white/5 border-dashed">
                                    <div className="text-4xl opacity-30">🎬</div>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-black">No Episodes Found</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            
            {/* Safe Area Spacer for Mobile */}
            <div className="h-24 md:hidden shrink-0" />
        </div>
    );
}

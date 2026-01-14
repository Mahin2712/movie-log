import React, { useState, useEffect } from "react";
import { IMG_BASE, TMDB_BASE } from "../utils/constants";

export default function ShowDetailPage({
    show,
    onClose,
    apiKey,
    onUpdateShow, // (updatedShow) => void
}) {
    const [expandedSeasons, setExpandedSeasons] = useState(new Set());
    const [loadingSeasons, setLoadingSeasons] = useState(new Set());

    // Derived state
    const seasons = show.seasonsData || []; // We'll store detailed season data here
    // If show.seasons is a number, we might need to fetch the show details first to get the season list if we don't have it.
    // But usually /tv/{id} gives us 'seasons' array with metadata.

    // Initial fetch of show details (to get season list) if not present
    useEffect(() => {
        if (!show.seasonList && apiKey) {
            // Fetch show details to get the list of seasons
            fetch(`${TMDB_BASE}/tv/${show.tmdb_id}?api_key=${apiKey}`)
                .then(r => r.json())
                .then(data => {
                    const seasonList = data.seasons || [];
                    onUpdateShow({
                        ...show,
                        seasonList, // Metadata: season_number, episode_count, poster_path
                        status: data.status,
                        last_air_date: data.last_air_date,
                        in_production: data.in_production,
                        number_of_episodes: data.number_of_episodes,
                        number_of_seasons: data.number_of_seasons
                    });
                })
                .catch(err => console.error("Failed to fetch show details", err));
        }
    }, [show.tmdb_id, apiKey, show.seasonList]);

    const toggleSeason = async (seasonNum) => {
        const newExpanded = new Set(expandedSeasons);

        if (newExpanded.has(seasonNum)) {
            newExpanded.delete(seasonNum);
            setExpandedSeasons(newExpanded);
            return;
        }

        newExpanded.add(seasonNum);
        setExpandedSeasons(newExpanded);

        // Check if we have episodes for this season
        const hasEpisodes = show.seasonsData && show.seasonsData[seasonNum] && show.seasonsData[seasonNum].episodes;

        if (!hasEpisodes && apiKey) {
            // Lazy load
            setLoadingSeasons(prev => new Set(prev).add(seasonNum));
            try {
                const res = await fetch(`${TMDB_BASE}/tv/${show.tmdb_id}/season/${seasonNum}?api_key=${apiKey}`);
                const data = await res.json();

                // Update show state with new season data
                const currentSeasonsData = show.seasonsData || {};
                const updatedShow = {
                    ...show,
                    seasonsData: {
                        ...currentSeasonsData,
                        [seasonNum]: data // contains episodes array
                    }
                };
                onUpdateShow(updatedShow);
            } catch (e) {
                console.error("Failed to load season", e);
            } finally {
                setLoadingSeasons(prev => {
                    const next = new Set(prev);
                    next.delete(seasonNum);
                    return next;
                });
            }
        }
    };

    const isEpisodeWatched = (seasonNum, epNum) => {
        return show.progress?.watchedItems?.[`${seasonNum}_${epNum}`] === true;
    };

    const toggleEpisode = (seasonNum, epNum) => {
        const key = `${seasonNum}_${epNum}`;
        const currentWatched = show.progress?.watchedItems || {};
        const isWatched = currentWatched[key];

        const newWatchedItems = { ...currentWatched };
        if (isWatched) {
            delete newWatchedItems[key];
        } else {
            newWatchedItems[key] = true;
        }

        // Recalculate stats
        const watchedCount = Object.keys(newWatchedItems).length;
        const totalEpisodes = show.number_of_episodes || 1; // avoid div by 0
        const percent = Math.min(100, Math.round((watchedCount / totalEpisodes) * 100));

        let status = "In Progress";
        if (watchedCount === 0) status = "Not Started";
        if (watchedCount >= totalEpisodes) status = "Completed";

        onUpdateShow({
            ...show,
            status, // Update tracked status based on progress
            progress: {
                ...show.progress,
                watchedItems: newWatchedItems,
                percentage: percent,
                watchedCount
            }
        });
    };

    const markSeasonWatched = (seasonNum, episodes) => {
        const currentWatched = show.progress?.watchedItems || {};
        const newWatchedItems = { ...currentWatched };

        episodes.forEach(ep => {
            newWatchedItems[`${seasonNum}_${ep.episode_number}`] = true;
        });

        const watchedCount = Object.keys(newWatchedItems).length;
        const totalEpisodes = show.number_of_episodes || 1;
        const percent = Math.min(100, Math.round((watchedCount / totalEpisodes) * 100));

        let status = "In Progress";
        if (watchedCount === 0) status = "Not Started";
        if (watchedCount >= totalEpisodes) status = "Completed";

        onUpdateShow({
            ...show,
            status,
            progress: {
                ...show.progress,
                watchedItems: newWatchedItems,
                percentage: percent,
                watchedCount
            }
        });
    };

    const getSeasonProgress = (seasonNum, episodeCount) => {
        if (!episodeCount) return 0;
        const currentWatched = show.progress?.watchedItems || {};
        let count = 0;
        // This is a bit inefficient (O(N)), but fine for typical season sizes
        Object.keys(currentWatched).forEach(k => {
            if (k.startsWith(`${seasonNum}_`)) count++;
        });
        return count;
    };

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header Image Background */}
            <div className="relative h-64 shrink-0">
                <div className="absolute inset-0">
                    <img
                        src={show.backdrop_path ? IMG_BASE + show.backdrop_path : (show.poster_path ? IMG_BASE + show.poster_path : "")}
                        alt="Backdrop"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition"
                >
                    ← Back
                </button>

                <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
                    <img
                        src={show.poster_path ? IMG_BASE + show.poster_path : ""}
                        alt="Poster"
                        className="w-32 rounded-lg shadow-2xl border border-white/10"
                    />
                    <div className="flex-1 mb-1">
                        <h1 className="text-4xl font-bold text-white mb-2">{show.title}</h1>
                        <div className="flex items-center gap-4 text-zinc-400 text-sm">
                            {show.first_air_date && <span>{show.first_air_date.slice(0, 4)}</span>}
                            <span>•</span>
                            <span>{show.number_of_seasons || "?"} Seasons</span>
                            <span>•</span>
                            <span className={show.status === "Ended" ? "text-red-400" : "text-emerald-400"}>
                                {show.status || "Unknown"}
                            </span>
                        </div>

                        {/* Overall Progress */}
                        <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs text-zinc-300 mb-1">
                                <span>Progress</span>
                                <span>{show.progress?.percentage || 0}% ({show.progress?.watchedCount || 0} / {show.number_of_episodes || "?"})</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${show.progress?.percentage || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Seasons */}
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-semibold mb-6">Seasons</h2>

                <div className="space-y-4">
                    {(show.seasonList || []).map((season) => {
                        if (season.season_number === 0) return null; // Hide specials by default as requested

                        const isExpanded = expandedSeasons.has(season.season_number);
                        const isLoading = loadingSeasons.has(season.season_number);
                        const seasonDetail = show.seasonsData?.[season.season_number];
                        const episodes = seasonDetail?.episodes || [];

                        const watchedInSeason = getSeasonProgress(season.season_number, season.episode_count);
                        const isFullyWatched = watchedInSeason === season.episode_count && season.episode_count > 0;

                        return (
                            <div key={season.id} className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
                                <div
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition"
                                    onClick={() => toggleSeason(season.season_number)}
                                >
                                    <div className="w-12 h-16 bg-zinc-800 rounded overflow-hidden shrink-0">
                                        {season.poster_path && (
                                            <img src={IMG_BASE + season.poster_path} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-white">
                                            {season.name} <span className="text-zinc-500 text-sm ml-2">({season.episode_count} eps)</span>
                                        </h3>
                                        <div className="text-sm text-zinc-400 mt-1">
                                            {watchedInSeason} / {season.episode_count} watched
                                        </div>
                                    </div>
                                    <div className="text-zinc-500 transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        ▼
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-white/5 bg-black/20">
                                        {isLoading ? (
                                            <div className="p-8 text-center text-zinc-500">Loading episodes...</div>
                                        ) : (
                                            <div>
                                                {/* Bulk Season Action */}
                                                <div className="p-3 bg-white/5 flex justify-end">
                                                    <button
                                                        onClick={() => markSeasonWatched(season.season_number, episodes)}
                                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium px-3 py-1 rounded hover:bg-white/5 transition"
                                                    >
                                                        Mark Season as Watched
                                                    </button>
                                                </div>

                                                {episodes.map(ep => {
                                                    const isWatched = isEpisodeWatched(season.season_number, ep.episode_number);
                                                    const isAired = new Date(ep.air_date) < new Date();

                                                    // Handle future episodes (cannot mark watched logic)
                                                    // But for now purely UI

                                                    return (
                                                        <div key={ep.id} className={`p-4 border-b border-white/5 flex gap-4 ${isWatched ? 'bg-blue-900/10' : ''}`}>
                                                            <button
                                                                onClick={() => toggleEpisode(season.season_number, ep.episode_number)}
                                                                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isWatched
                                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                                    : 'border-zinc-600 text-transparent hover:border-zinc-400'
                                                                    }`}
                                                                disabled={!isAired && false} // Optional: disable future
                                                            >
                                                                ✓
                                                            </button>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between mb-1">
                                                                    <span className={`font-medium ${isWatched ? 'text-zinc-300' : 'text-white'}`}>
                                                                        {ep.episode_number}. {ep.name}
                                                                    </span>
                                                                    <span className="text-sm text-zinc-500">{ep.air_date}</span>
                                                                </div>
                                                                <p className="text-sm text-zinc-500 line-clamp-2">{ep.overview}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

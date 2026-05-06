import React, { useState, useEffect, useMemo } from "react";
import { IMG_BASE, TMDB_BASE } from "../utils/constants";

/**
 * ShowDetailPage Component
 * Redesigned for premium aesthetics and mobile-first responsiveness.
 * Features:
 * - Cinematic backdrop hero
 * - Adaptive layout (Stacked mobile, Side-layout desktop)
 * - Sticky season headers
 * - Glassmorphism UI elements
 */
export default function ShowDetailPage({
    show,
    onClose,
    onUpdateShow,
}) {
    const [expandedSeasons, setExpandedSeasons] = useState(new Set([1])); // Default expand S1
    const [loadingSeasons, setLoadingSeasons] = useState(new Set());
    const [activeTab, setActiveTab] = useState("seasons"); // "seasons" | "info"

    // Derived state
    const seasonList = show.seasonList || [];
    const seasonsData = show.seasonsData || {};

    // Initial fetch of show details
    useEffect(() => {
        if (!show.seasonList) {
            import("../services/tmdbClient").then(({ fetchFromTMDB }) => {
                fetchFromTMDB(`/tv/${show.tmdb_id}`)
                    .then(data => {
                        onUpdateShow({
                            ...show,
                            seasonList: data.seasons || [],
                            production_status: data.status,
                            last_air_date: data.last_air_date,
                            in_production: data.in_production,
                            number_of_episodes: data.number_of_episodes,
                            number_of_seasons: data.number_of_seasons,
                            tagline: data.tagline,
                        });
                    })
                    .catch(err => console.error("Failed to fetch show details", err));
            });
        }
    }, [show.tmdb_id, show.seasonList]);

    const toggleSeason = async (seasonNum) => {
        const newExpanded = new Set(expandedSeasons);
        if (newExpanded.has(seasonNum)) {
            newExpanded.delete(seasonNum);
            setExpandedSeasons(newExpanded);
            return;
        }

        newExpanded.add(seasonNum);
        setExpandedSeasons(newExpanded);

        if (!seasonsData[seasonNum]) {
            setLoadingSeasons(prev => new Set(prev).add(seasonNum));
            try {
                const { fetchFromTMDB } = await import("../services/tmdbClient");
                const data = await fetchFromTMDB(`/tv/${show.tmdb_id}/season/${seasonNum}`);
                onUpdateShow({
                    ...show,
                    seasonsData: { ...seasonsData, [seasonNum]: data }
                });
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

        // Calculate progress stats
        const totalWatched = Object.keys(newWatchedItems).length;
        const totalEpisodes = show.number_of_episodes || 0;
        const percent = totalEpisodes > 0 ? (totalWatched / totalEpisodes) * 100 : 0;

        onUpdateShow({
            ...show,
            progress: {
                ...show.progress,
                watchedItems: newWatchedItems,
                watchedEpisodes: totalWatched,
                percentComplete: Math.round(percent)
            }
        });
    };

    // Calculate overall progress
    const progressPercent = show.progress?.percentComplete || 0;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#050b18] overflow-y-auto overflow-x-hidden animate-in fade-in duration-300 scroll-smooth">
            {/* Cinematic Hero Section */}
            <div className="relative w-full h-[55vh] md:h-[65vh] shrink-0">
                <img 
                    src={`${IMG_BASE}/original${show.backdrop_path}`} 
                    alt={show.title}
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
                            {show.production_status || 'Series'}
                        </span>
                    </div>
                </div>

                {/* Hero Bottom Info - Centered on Mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col items-center md:items-start text-center md:text-left gap-3 md:gap-4">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-[0.9]">
                        {show.title}
                    </h1>
                    {show.tagline && (
                        <p className="text-zinc-400 text-sm md:text-xl italic max-w-2xl font-medium opacity-80">"{show.tagline}"</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 backdrop-blur-md border border-white/5">
                            <span className="text-blue-400 font-black text-sm md:text-base">{show.number_of_seasons || '?'}</span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Seasons</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/40 backdrop-blur-md border border-white/5">
                            <span className="text-green-400 font-black text-sm md:text-base">{show.number_of_episodes || '?'}</span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Episodes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-4 md:p-12 -mt-10 relative z-10 max-w-[1600px] mx-auto w-full">
                {/* Left Column: Details & Progress */}
                <div className="w-full md:w-[380px] flex flex-col gap-6 shrink-0">
                    {/* Progress Card - Glassmorphism */}
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Your Progress</span>
                                <span className="text-3xl font-black text-white">{progressPercent}%</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-blue-400/80 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                                    {show.progress?.watchedEpisodes || 0} / {show.number_of_episodes || 0}
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
                            Complete this series to unlock hidden achievements and update your global stats.
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 flex flex-col gap-8">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">The Story</h3>
                            <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium">{show.overview}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Premiere</h4>
                                <p className="text-sm font-bold text-zinc-300">{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Status</h4>
                                <p className="text-sm font-bold text-blue-400">{show.in_production ? 'Ongoing' : 'Finished'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Episodes List */}
                <div className="flex-1 flex flex-col gap-8 mt-4 md:mt-0">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
                            Episodes <span className="text-blue-500">.</span>
                        </h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        {seasonList.filter(s => s.season_number > 0).map((season) => {
                            const isExpanded = expandedSeasons.has(season.season_number);
                            const isLoading = loadingSeasons.has(season.season_number);
                            const seasonData = seasonsData[season.season_number];

                            return (
                                <div 
                                    key={season.id} 
                                    className={`rounded-[2rem] transition-all duration-500 ease-out overflow-hidden ${
                                        isExpanded ? "bg-zinc-900/40 ring-1 ring-white/10 shadow-2xl" : "bg-zinc-900/20 hover:bg-zinc-900/40"
                                    }`}
                                >
                                    {/* Sticky Season Header */}
                                    <button 
                                        onClick={() => toggleSeason(season.season_number)}
                                        className="sticky top-0 z-20 w-full flex items-center justify-between p-5 md:p-8 rounded-[2rem] bg-zinc-900/90 backdrop-blur-2xl transition-colors hover:bg-zinc-800/80 active:scale-[0.99]"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-20 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-lg ring-1 ring-white/5">
                                                {season.poster_path ? (
                                                    <img src={`${IMG_BASE}/w92${season.poster_path}`} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900">S{season.season_number}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Season {season.season_number}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                                                        {season.episode_count} Episodes
                                                    </span>
                                                    {seasonData?.episodes && (
                                                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    )}
                                                    {seasonData?.episodes && (
                                                        <span className="text-[10px] text-blue-500 font-bold uppercase">
                                                            {seasonData.episodes.filter(ep => isEpisodeWatched(season.season_number, ep.episode_number)).length} Watched
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-full bg-white/5 transition-all duration-500 ${isExpanded ? 'rotate-180 bg-blue-500/20 text-blue-400' : 'text-zinc-500'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Episodes Content */}
                                    {isExpanded && (
                                        <div className="px-5 pb-8 md:px-8 flex flex-col gap-4 animate-in slide-in-from-top-8 duration-500 ease-out">
                                            {isLoading ? (
                                                <div className="py-16 flex flex-col items-center gap-5">
                                                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Syncing Episodes...</span>
                                                </div>
                                            ) : seasonData?.episodes ? (
                                                seasonData.episodes.map((ep) => {
                                                    const watched = isEpisodeWatched(season.season_number, ep.episode_number);
                                                    return (
                                                        <div 
                                                            key={ep.id}
                                                            onClick={() => toggleEpisode(season.season_number, ep.episode_number)}
                                                            className={`group flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] cursor-pointer transition-all duration-300 min-h-[88px] ${
                                                                watched 
                                                                    ? "bg-blue-500/5 border border-blue-500/20 shadow-inner" 
                                                                    : "bg-zinc-800/20 border border-transparent hover:bg-white/5 hover:border-white/5"
                                                            }`}
                                                        >
                                                            <div className="relative w-28 md:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-md">
                                                                {ep.still_path ? (
                                                                    <img src={`${IMG_BASE}/w300${ep.still_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900 text-2xl">🎬</div>
                                                                )}
                                                                {watched && (
                                                                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center backdrop-blur-[2px] transition-all">
                                                                        <div className="bg-blue-500 text-white rounded-full p-2 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110">
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {!watched && (
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                                <path d="M8 5v14l11-7z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-black text-zinc-600 group-hover:text-blue-500/60 transition-colors uppercase tracking-widest">EP {ep.episode_number}</span>
                                                                    {ep.runtime && <span className="text-[10px] font-bold text-zinc-700 uppercase">{ep.runtime}m</span>}
                                                                </div>
                                                                <h4 className={`text-base md:text-lg font-black truncate tracking-tight transition-colors ${watched ? 'text-blue-400' : 'text-zinc-200 group-hover:text-white'}`}>
                                                                    {ep.name}
                                                                </h4>
                                                                <p className="text-[11px] md:text-xs text-zinc-500 font-medium line-clamp-2 md:line-clamp-3 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                                                    {ep.overview || "Deep into the narrative, this episode unfolds new mysteries and character developments that redefine the journey."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-20 text-center flex flex-col items-center gap-3">
                                                    <div className="text-4xl opacity-20">📭</div>
                                                    <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">Archive Empty</span>
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
            
            {/* Safe Area Spacer for Mobile */}
            <div className="h-24 md:hidden shrink-0" />
        </div>
    );
}

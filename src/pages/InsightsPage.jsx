import React, { useMemo } from "react";
import { InsightsSkeleton } from "../components/Skeleton";

const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

/**
 * InsightsPage Component
 * A premium dashboard for viewing movie and show analytics.
 */
export default function InsightsPage({ stats, loading }) {
  if (loading) return <InsightsSkeleton />;
  if (!stats) return null;

  // Prepare heatmap data (last 7 days)
  const heatmapData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: stats.activityHeatmap?.[key] || 0,
        fullDate: key
      });
    }
    return days;
  }, [stats.activityHeatmap]);

  // Top genres
  const topGenres = useMemo(() => {
    return Object.entries(stats.genreDistribution || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        name: GENRE_MAP[id] || "Other",
        count
      }));
  }, [stats.genreDistribution]);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white leading-[0.8] mb-1">
          Insights <span className="text-blue-500">.</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Your cinematic journey in numbers.</p>
      </header>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Watched", value: stats.allTime, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/10" },
          { label: "This Year", value: stats.thisYear, color: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/10" },
          { label: "This Month", value: stats.thisMonth, color: "from-orange-500 to-red-600", shadow: "shadow-orange-500/10" },
          { label: "This Week", value: stats.thisWeek, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/10" },
        ].map((stat, i) => (
          <div key={i} className={`group relative overflow-hidden p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-3xl transition-all hover:scale-[1.02] hover:bg-zinc-900/60 ${stat.shadow} hover:shadow-xl`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {stat.label}
              </span>
              <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Heatmap Card */}
        <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Weekly Activity</h3>
                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">Engagement across time</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest">Last 7 Days</span>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-40 gap-3">
            {heatmapData.map((day, i) => {
                const maxHeight = Math.max(...heatmapData.map(d => d.count)) || 1;
                const height = Math.max(12, (day.count / maxHeight) * 100);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                        <div className="relative w-full flex-1 flex items-end">
                            <div 
                                className={`w-full rounded-t-2xl transition-all duration-700 ease-out shadow-lg ${
                                    day.count > 0 
                                        ? "bg-gradient-to-t from-blue-600/40 to-blue-400/60 group-hover:from-blue-600 group-hover:to-blue-400 shadow-blue-500/20" 
                                        : "bg-zinc-800/30"
                                }`}
                                style={{ height: `${height}%` }}
                            />
                            {day.count > 0 && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-2xl">
                                    {day.count}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
                            {day.label}
                        </span>
                    </div>
                );
            })}
          </div>
        </div>

        {/* Watch Streak Card */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 via-red-600/5 to-transparent border border-orange-500/10 backdrop-blur-2xl flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M17.66 11.5c-.21 0-.41-.01-.61-.03-.41-.05-.8-.13-1.18-.24l-.17-.05c-.31-.1-.61-.21-.89-.35-.79-.37-1.48-.89-2.04-1.51-.43-.47-.78-.99-1.03-1.56-.25-.57-.4-1.18-.45-1.81-.05-.63.02-1.26.19-1.87l.11-.38c.15-.5.36-1 .62-1.47l.08-.14C11.59 1.41 10.33 1 9 1 5.69 1 3 3.69 3 7c0 1.28.4 2.47 1.08 3.45l.08.12c.31.42.66.8 1.04 1.15l.13.12c.39.34.82.64 1.27.91l.14.08c.55.33 1.14.59 1.76.78l.18.06c.64.19 1.31.3 1.99.34l.33.02c1.4.08 2.65.62 3.61 1.48l.13.12c.86.82 1.48 1.84 1.77 2.97l.04.16c.14.63.19 1.28.16 1.93l-.01.2c-.06 1.1-.39 2.11-.93 2.99l-.09.15c-.56.88-1.31 1.6-2.18 2.11l-.16.09c-.93.51-1.97.81-3.08.88l-.25.01c-3.31 0-6-2.69-6-6 0-1.11.3-2.16.84-3.05l.09-.15c.17-.26.35-.5.56-.73l.13-.15c.24-.26.51-.51.79-.73l.15-.12c.15-.12.3-.23.46-.33l.16-.11c.47-.32.99-.58 1.54-.78l.18-.07c.5-.16 1.02-.27 1.56-.32l.21-.02c.07 0 .14 0 .21.01l.22.02c.41.05.8.14 1.18.25l.17.05c.31.1.61.22.89.36.79.37 1.48.89 2.04 1.51.43.47.78.99 1.03 1.56.25.57.4 1.18.45 1.81.05.63-.02 1.26-.19 1.87l-.11.38c-.15.5-.36 1-.62 1.47l-.08.14c-.69.96-1.95 1.37-3.28 1.37-3.31 0-6-2.69-6-6 0-1.11.3-2.16.84-3.05l.09-.15c.17-.26.35-.5.56-.73l.13-.15c.24-.26.51-.51.79-.73l.15-.12c.15-.12.3-.23.46-.33l.16-.11c.47-.32.99-.58 1.54-.78l.18-.07c.5-.16 1.02-.27 1.56-.32l.21-.02z" />
              </svg>
           </div>
           
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400/80">Current Streak</h3>
           
           <div className="flex items-end gap-3 my-4">
              <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">{stats.streaks?.current || 0}</span>
              <span className="text-sm font-black text-orange-500 mb-3 uppercase tracking-widest">Days</span>
           </div>
           
           <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">All-Time High</span>
                  <span className="text-xs font-black text-zinc-200">{stats.streaks?.best || 0} Days</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-orange-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((stats.streaks?.current || 0) / (stats.streaks?.best || 1)) * 100)}%` }}
                />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TV Completion Card */}
        <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl flex flex-col md:flex-row gap-10 items-center transition-all hover:bg-zinc-900/40">
           <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                 <circle 
                    cx="72" cy="72" r="64" 
                    className="stroke-zinc-800/50 fill-none" 
                    strokeWidth="10"
                 />
                 <circle 
                    cx="72" cy="72" r="64" 
                    className="stroke-blue-500 fill-none transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    strokeWidth="10"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * (stats.tvCompletion?.percent || 0)) / 100}
                    strokeLinecap="round"
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-white tracking-tighter">{stats.tvCompletion?.percent || 0}%</span>
              </div>
           </div>

           <div className="flex flex-col gap-4 text-center md:text-left flex-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Series Completion</h3>
              <div className="flex flex-col gap-2">
                 <p className="text-2xl font-black text-zinc-100">
                   {stats.tvCompletion?.completed || 0} Shows Finished
                 </p>
                 <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide leading-relaxed">
                   Tracking {stats.tvCompletion?.total || 0} titles across your library.
                 </p>
              </div>
              <button className="mt-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 group">
                View Completed Shows
                <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
           </div>
        </div>

        {/* Genre Momentum Card */}
        <div className="p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-2xl flex flex-col gap-8 transition-all hover:bg-zinc-900/40">
           <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Momentum</h3>
                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">Rising tastes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[10px] text-blue-500 uppercase font-black tracking-[0.2em]">Trending</span>
              </div>
           </div>

           <div className="flex flex-wrap gap-3">
              {stats.momentum?.length > 0 ? (
                stats.momentum.map((gid, i) => (
                    <div key={i} className="px-5 py-2.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3 group/chip transition-all hover:bg-blue-500/10 hover:border-blue-500/30">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <span className="text-sm font-black text-zinc-300 group-hover/chip:text-white transition-colors">{GENRE_MAP[gid]}</span>
                    </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-4 gap-2 opacity-30">
                    <span className="text-2xl">⏳</span>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Building taste profile...</p>
                </div>
              )}
           </div>
           
           <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.1em] mt-auto">
              Based on activity from the last 30 days.
           </p>
        </div>
      </div>


      {/* Genres Breakdown */}
      <div className="p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/5 backdrop-blur-3xl">
        <div className="flex flex-col gap-1 mb-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Genre Distribution</h3>
            <span className="text-[10px] text-zinc-700 uppercase font-bold tracking-tighter">Your preferred categories</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
            {topGenres.map((genre, i) => (
                <div key={i} className="flex flex-col gap-4 group">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{genre.name}</span>
                        <span className="text-[10px] font-black text-blue-500">{genre.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden p-[1px]">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            style={{ width: `${Math.min(100, (genre.count / (topGenres[0].count || 1)) * 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

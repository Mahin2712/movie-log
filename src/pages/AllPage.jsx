import React, { useMemo } from "react";
import { IMG_BASE } from "../utils/constants";
import MediaGridCard from "../components/MediaGridCard";
import { AllPageSkeleton } from "../components/Skeleton";

/**
 * AllPage (Discovery)
 * Features a Hero section and horizontal discovery rows.
 */
export default function AllPage({
  viewMode = "list",
  popular = [],
  recommended = [],
  loading = false,
  carouselRef,
  scrollCarousel,
  isWatched,
  isWishlisted,
  onAddWatched,
  onToggleWishlist,
  onOpenDetail,
}) {
  const [pendingHero, setPendingHero] = React.useState(false);
  // Hero movie (pick the first popular item)
  const heroMovie = popular[0];
  
  // Recommended fallback logic
  const displayRecommended = recommended.length > 0 ? recommended : popular.slice(5, 13);
  const recommendedTitle = recommended.length > 0 ? "For You" : "Highly Rated";

  if (loading) return <AllPageSkeleton />;

  return (
    <div className="flex flex-col gap-10 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 🎬 HERO SECTION */}
      {heroMovie && viewMode !== "grid" && (
        <section className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded-[2.5rem] overflow-hidden group shadow-2xl">
          {/* Background Image */}
          <img 
            src={heroMovie.backdrop_path ? `https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}` : ""} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={heroMovie.title}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end gap-2 md:gap-4 max-w-2xl">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/40">Featured</span>
                {heroMovie.vote_average > 0 && (
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">★ {heroMovie.vote_average.toFixed(1)} Rating</span>
                )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.9]">
              {heroMovie.title || heroMovie.name}
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 font-medium leading-relaxed max-w-lg">
                {heroMovie.overview}
            </p>
            <div className="flex items-center gap-3 mt-2 md:mt-4">
                <button 
                    onClick={() => onOpenDetail?.(heroMovie)}
                    className="px-6 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95"
                >
                    View Details
                </button>
                <button 
                    disabled={pendingHero || isWatched(heroMovie.id)}
                    onClick={async () => {
                        setPendingHero(true);
                        try {
                            await onAddWatched(heroMovie);
                        } catch (err) {
                            console.error(err);
                        } finally {
                            setPendingHero(false);
                        }
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                        isWatched(heroMovie.id)
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                    }`}
                >
                    {pendingHero ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isWatched(heroMovie.id) ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <span className="text-sm">+</span>
                    )}
                    {isWatched(heroMovie.id) ? "Watched" : "Watchlist"}
                </button>
            </div>
          </div>
        </section>
      )}

      {/* 📊 GRID VIEW (Alternative) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-6">
          {popular.map((movie) => (
            <MediaGridCard
              key={movie.id}
              item={movie}
              mode="all"
              isInWatchlist={isWatched(movie.id)}
              isInWishlist={isWishlisted(movie.id)}
              onAddToWatchlist={onAddWatched}
              onAddToWishlist={onToggleWishlist}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <>
          {/* 🌊 ROW: TRENDING */}
          <DiscoveryRow 
            title="Trending Now" 
            items={popular.slice(1)} 
            isWatched={isWatched}
            isWishlisted={isWishlisted}
            onAddWatched={onAddWatched}
            onToggleWishlist={onToggleWishlist}
            onOpenDetail={onOpenDetail}
          />

          {/* 🌟 ROW: FOR YOU */}
          <DiscoveryRow 
            title={recommendedTitle}
            items={displayRecommended} 
            isWatched={isWatched}
            isWishlisted={isWishlisted}
            onAddWatched={onAddWatched}
            onToggleWishlist={onToggleWishlist}
            onOpenDetail={onOpenDetail}
          />
        </>
      )}
    </div>
  );
}

/**
 * DiscoveryRow Component
 * A premium horizontal carousel for discovery items.
 */
function DiscoveryRow({ title, items, isWatched, isWishlisted, onAddWatched, onToggleWishlist, onOpenDetail }) {
  const rowRef = React.useRef(null);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col gap-6 group/row">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic">
          {title} <span className="text-blue-500">.</span>
        </h2>
        <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
           <CarouselButton direction="left" onClick={() => scroll('left')} />
           <CarouselButton direction="right" onClick={() => scroll('right')} />
        </div>
      </div>

      <div 
        ref={rowRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x px-2 pb-4"
      >
        {items.map((item) => (
          <div key={item.id} className="w-[160px] md:w-[200px] flex-shrink-0 snap-start">
             <MediaGridCard
                item={item}
                mode="all"
                isInWatchlist={isWatched(item.id)}
                isInWishlist={isWishlisted(item.id)}
                onAddToWatchlist={onAddWatched}
                onAddToWishlist={onToggleWishlist}
                onOpenDetail={onOpenDetail}
              />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Glass Carousel Button
 */
function CarouselButton({ direction, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-zinc-900/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all hover:bg-zinc-800 hover:scale-110 active:scale-95"
      aria-label={`Scroll ${direction}`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'left' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

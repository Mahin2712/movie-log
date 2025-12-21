import { IMG_BASE } from "../utils/constants";

export default function AllPage({
  popular,
  carouselRef,
  scrollCarousel,
  isWatched,
  isWishlisted,
  onAddWatched,
  onToggleWishlist
}) {
  return (
    <section className="carousel-section container-max">
      <h2 className="carousel-title">Popular / Now Playing</h2>

      <div className="carousel-wrapper">
        <button
          className="carousel-arrow left"
          onClick={() => scrollCarousel("left")}
        >
          ◀
        </button>

        <div ref={carouselRef} className="carousel">
          {popular.map(movie => {
            const watched = isWatched(movie.id);
            const wishlisted = isWishlisted(movie.id);

            return (
              <div key={movie.id} className="carousel-card">
                <img
                  src={movie.poster_path ? IMG_BASE + movie.poster_path : ""}
                  alt={movie.title}
                />

                <div className="carousel-card-body">
                  <div className="carousel-card-title">
                    {movie.title}
                  </div>

                  {movie.vote_average > 0 && (
                    <div className="carousel-rating">
                      ★ {movie.vote_average.toFixed(1)}
                    </div>
                  )}

                  <div className="carousel-actions">
                    {/* ADD TO WATCHED */}
                    <button
                      className={`btn ${watched ? "btn-filled" : ""}`}
                      disabled={watched}
                      onClick={() => onAddWatched(movie)}
                    >
                      {watched ? "✓ Watched" : "+ Watchlist"}
                    </button>

                    {/* ADD TO WISHLIST */}
                    <button
                      className={`btn ${wishlisted ? "btn-filled" : ""}`}
                      disabled={watched || wishlisted}
                      onClick={() => onToggleWishlist(movie)}
                    >
                      {wishlisted ? "♥" : "♡"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="carousel-arrow right"
          onClick={() => scrollCarousel("right")}
        >
          ▶
        </button>
      </div>
    </section>
  );
}

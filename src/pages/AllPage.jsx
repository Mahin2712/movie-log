import { IMG_BASE } from "../utils/constants";

export default function AllPage({
  popular,
  carouselRef,
  scrollCarousel
}) {
  return (
    <div className="carousel-section container-max">
      <div className="carousel-title">POPULAR / NOW PLAYING</div>

      <div className="carousel-wrapper">
        <button className="carousel-arrow left" onClick={() => scrollCarousel("left")}>
          ◀
        </button>

        <div ref={carouselRef} className="carousel">
          {popular.map(m => (
            <div key={m.id} className="scroll-card" style={{ minWidth: 180 }}>
              <div style={{ width: 180, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-soft)", background: "#081026" }}>
                <img
                  src={m.poster_path ? IMG_BASE + m.poster_path : ""}
                  alt={m.title}
                  style={{ width: "100%", height: 260, objectFit: "cover" }}
                />
                <div style={{ padding: 8 }}>
                  <div style={{ fontWeight: 700 }}>{m.title}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-arrow right" onClick={() => scrollCarousel("right")}>
          ▶
        </button>
      </div>
    </div>
  );
}

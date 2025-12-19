import WatchedRow from "../components/WatchedRow";

export default function WatchlistPage({
    watched,
    genresMap,
    ratings,
    onRemove,
    onRate,
    onMoveToWishlist
}) {
    return (
        <div className="container-max">
            {watched.map(w => (
                <WatchedRow
                    key={w.id}
                    item={w}
                    genresMap={genresMap}
                    rating={ratings[w.id] || ""}
                    onSetRating={(v) => onRate(w.id, v)}
                    onRemove={() => onRemove(w.id)}
                    onMoveToWishlist={() => onMoveToWishlist(w)}
                />
            ))}
        </div>
    );
}

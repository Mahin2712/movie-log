import WishlistRow from "../components/WishlistRow";

export default function WishlistPage({
    wishlist,
    genresMap,
    onRemove,
    onMoveToWatched
}) {
    return (
        <div className="container-max">
            {wishlist.map(item => (
                <WishlistRow
                    key={item.id}
                    item={item}
                    genresMap={genresMap}
                    onRemove={() => onRemove(item.id)}
                    onMoveToWatched={() => onMoveToWatched(item)}
                />
            ))}
        </div>
    );
}

import React from "react";
import MediaGridCard from "./MediaGridCard";

export default function SearchResultCard({
    item,
    inWatchlist,
    inWishlist,
    onAddWatchlist,
    onAddWishlist,
    onOpenDetail,
}) {
    return (
        <MediaGridCard
            item={item}
            mode="search"
            isInWatchlist={inWatchlist}
            isInWishlist={inWishlist}
            onAddToWatchlist={onAddWatchlist}
            onAddToWishlist={onAddWishlist}
            onOpenDetail={onOpenDetail}
        />
    );
}

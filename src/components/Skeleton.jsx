import React from "react";

/**
 * Base Skeleton Component
 * Provides the pulse animation and base styling.
 */
const SkeletonBase = ({ className = "" }) => (
    <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />
);

/**
 * CardSkeleton
 * Replicates the MediaGridCard structure.
 */
export const CardSkeleton = () => (
    <div className="flex flex-col gap-3">
        <SkeletonBase className="aspect-[2/3] rounded-2xl w-full" />
        <div className="flex flex-col gap-2 px-1">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
        </div>
    </div>
);

/**
 * DetailSkeleton
 * Replicates the ShowDetailPage structure.
 */
export const DetailSkeleton = () => (
    <div className="flex flex-col gap-8 w-full">
        {/* Hero Section Skeleton */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <SkeletonBase className="w-full md:w-64 aspect-[2/3] rounded-3xl flex-shrink-0" />
            <div className="flex flex-col gap-4 flex-1 w-full">
                <SkeletonBase className="h-10 w-3/4 rounded-xl" />
                <div className="flex gap-2">
                    <SkeletonBase className="h-6 w-20 rounded-full" />
                    <SkeletonBase className="h-6 w-20 rounded-full" />
                    <SkeletonBase className="h-6 w-20 rounded-full" />
                </div>
                <SkeletonBase className="h-32 w-full rounded-2xl mt-4" />
                <div className="flex gap-4 mt-4">
                    <SkeletonBase className="h-12 w-32 rounded-xl" />
                    <SkeletonBase className="h-12 w-32 rounded-xl" />
                </div>
            </div>
        </div>

        {/* Seasons Skeleton */}
        <div className="flex flex-col gap-4 mt-8">
            <SkeletonBase className="h-8 w-40 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <SkeletonBase key={i} className="h-24 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    </div>
);

/**
 * InsightsSkeleton
 * Replicates the InsightsPage structure.
 */
export const InsightsSkeleton = () => (
    <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-2">
            <SkeletonBase className="h-12 w-48" />
            <SkeletonBase className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <SkeletonBase key={i} className="h-24 w-full rounded-3xl" />
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonBase className="md:col-span-2 h-64 w-full rounded-3xl" />
            <SkeletonBase className="h-64 w-full rounded-3xl" />
        </div>
    </div>
);

/**
 * GridSkeleton
 * A helper to render multiple card skeletons.
 */
export const GridSkeleton = ({ count = 10, className = "" }) => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

/**
 * AllPageSkeleton
 * Replicates the new Discovery layout (Hero + Two Rows).
 */
export const AllPageSkeleton = () => (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-500">
        {/* Hero Skeleton */}
        <SkeletonBase className="w-full aspect-[21/9] md:aspect-[25/9] rounded-[2.5rem]" />
        
        {/* Rows */}
        {[1, 2].map(row => (
            <div key={row} className="flex flex-col gap-6">
                <SkeletonBase className="h-8 w-48 rounded-lg" />
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-40 md:w-48 flex-shrink-0">
                            <CardSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

/**
 * ListRowSkeleton
 * Replicates the WatchedRow / MediaCard structure.
 */
export const ListRowSkeleton = () => (
    <div className="flex gap-4 p-4 rounded-2xl bg-zinc-900/20 border border-white/5 animate-pulse">
        <SkeletonBase className="w-16 h-24 rounded-lg flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 justify-center">
            <SkeletonBase className="h-5 w-1/3 rounded-md" />
            <SkeletonBase className="h-3 w-1/4 rounded-md" />
            <SkeletonBase className="h-3 w-1/2 rounded-md mt-2" />
        </div>
    </div>
);

export const ListSkeleton = ({ count = 5 }) => (
    <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <ListRowSkeleton key={i} />
        ))}
    </div>
);

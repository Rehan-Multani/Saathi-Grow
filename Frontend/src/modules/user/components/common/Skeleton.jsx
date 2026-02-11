import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md ${className}`}></div>
    );
};

export const ProductCardSkeleton = () => (
    <div className="bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-none md:bg-white md:dark:bg-black rounded-[14px] p-2.5 border border-gray-100 dark:border-white/10 flex flex-col gap-2 h-full">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex flex-col gap-2 p-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-14 rounded-md" />
            </div> 
        </div>
    </div>
);

export const CategorySkeleton = () => (
    <div className="flex flex-col items-center w-24 md:w-32">
        <Skeleton className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[2.2rem]" />
        <Skeleton className="h-3 w-16 mt-3" />
    </div>
);

export const BannerSkeleton = () => (
    <Skeleton className="h-[150px] sm:h-[220px] md:h-[280px] w-full rounded-2xl md:rounded-[2.5rem]" />
);

export const ProductDetailSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-black rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center gap-8">
                <Skeleton className="aspect-square w-full max-w-[400px] rounded-2xl" />
                <div className="flex gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-12 w-32" />
                <div className="space-y-4 mt-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className="flex flex-col gap-2 flex-grow">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const SuggestionSkeleton = () => (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
                <Skeleton className="w-8 h-8 rounded shrink-0" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ))}
    </div>
);

export default Skeleton;

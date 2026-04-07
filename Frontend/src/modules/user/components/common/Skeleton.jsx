import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-zinc-800 rounded-md ${className}`}>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
    );
};

export const ProductCardSkeleton = () => (
    <div className="bg-white dark:bg-[#111111] rounded-lg sm:rounded-xl p-2 sm:p-5 border border-gray-100 dark:border-white/10 flex flex-col gap-1 sm:gap-3 h-full shadow-sm">
        <Skeleton className="aspect-square w-full rounded-md sm:rounded-lg" />
        <div className="flex flex-col gap-2 px-1">
            <Skeleton className="h-3 sm:h-4 w-5/6 rounded" />
            <Skeleton className="h-2 sm:h-3 w-1/2 rounded" />
            <div className="flex justify-between items-center mt-3">
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded" />
                </div>
                <Skeleton className="h-[22px] sm:h-[34px] w-[50px] sm:w-[70px] rounded-full" />
            </div> 
        </div>
    </div>
);

export const CategorySkeleton = () => (
    <div className="flex flex-col group w-[85px] sm:w-36 h-[100px] sm:h-[155px] rounded-xl sm:rounded-[32px] border border-gray-100/50 dark:border-white/5 shadow-sm p-3 items-center justify-center bg-gray-50 dark:bg-white/5">
        <Skeleton className="h-3 w-12 mb-3" />
        <Skeleton className="flex-1 w-full rounded-lg" />
    </div>
);

export const BannerSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-6">
        <Skeleton className="aspect-[16/8.5] sm:aspect-[24/9] w-full rounded-lg sm:rounded-2xl" />
    </div>
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

import React from 'react';

const CategoryLandingSkeleton = () => {
  return (
    <div className="category-landing-page min-h-screen bg-[#f7fbf7] dark:bg-black px-3 py-3 pb-28 sm:px-4 sm:py-4">
      <div className="category-landing-shell max-w-6xl mx-auto space-y-4 sm:space-y-5">
        <div className="h-10 w-full animate-pulse rounded-full bg-white/80 dark:bg-white/5" />
        <div className="h-36 animate-pulse rounded-[28px] bg-white dark:bg-white/5 sm:h-40 sm:rounded-[32px]" />
        <div className="h-20 animate-pulse rounded-[22px] bg-white dark:bg-white/5 sm:h-24 sm:rounded-[28px]" />

        <div className="space-y-2.5 sm:space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-white dark:bg-white/5" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[20px] bg-white dark:bg-white/5 sm:h-28 sm:rounded-[24px]" />
            ))}
          </div>
        </div>

        <div className="h-28 animate-pulse rounded-[22px] bg-white dark:bg-white/5 sm:h-32 sm:rounded-[28px]" />

        <div className="space-y-2.5 sm:space-y-3">
          <div className="h-6 w-36 animate-pulse rounded bg-white dark:bg-white/5" />
          <div className="flex gap-2.5 overflow-hidden sm:gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-48 w-36 flex-shrink-0 animate-pulse rounded-[20px] bg-white dark:bg-white/5 sm:h-56 sm:w-40 sm:rounded-[24px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingSkeleton;

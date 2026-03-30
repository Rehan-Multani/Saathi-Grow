import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryBannerSlider = ({ section }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const banners = section.banners || [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="category-landing-section relative overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f0f0f] sm:rounded-[28px] min-h-[170px] sm:min-h-[240px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <button
            onClick={() => banners[currentIndex].ctaLink && navigate(banners[currentIndex].ctaLink)}
            className="w-full h-full text-left"
          >
            {banners[currentIndex].imageUrl ? (
              <img
                src={window.innerWidth < 640 && banners[currentIndex].mobileImageUrl ? banners[currentIndex].mobileImageUrl : banners[currentIndex].imageUrl}
                alt={banners[currentIndex].title || 'Slide ' + (currentIndex + 1)}
                className="category-landing-banner-image h-full max-h-[170px] w-full object-cover sm:max-h-[240px] transition-opacity duration-500"
                loading="lazy"
              />
            ) : (
              <div className="p-6 sm:p-10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white sm:text-2xl">
                  {banners[currentIndex].title}
                </h3>
                {banners[currentIndex].subtitle && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                        {banners[currentIndex].subtitle}
                    </p>
                )}
              </div>
            )}
          </button>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-[#0c831f]' : 'w-1.5 bg-gray-300'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryBannerSlider;

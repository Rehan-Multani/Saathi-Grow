import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryPromoBanner = ({ section, accentColor = '#0c831f' }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = React.useMemo(() => {
    // 1. Detect if multiple banners exist
    if (Array.isArray(section.banners) && section.banners.length > 0) {
      return section.banners.map(b => ({
        ...b,
        // Inherit section-level CTA if not provided on the slide
        ctaLink: b.ctaLink || section.ctaLink,
        // Inherit title/subtitle if not provided on the slide (defensive)
        title: b.title || section.title,
        subtitle: b.subtitle || section.subtitle
      }));
    }

    // 2. Fallback to single section banner
    if (section.imageUrl || section.title || section.subtitle) {
      return [{
        imageUrl: section.imageUrl,
        ctaLink: section.ctaLink,
        title: section.title,
        subtitle: section.subtitle
      }];
    }
    return [];
  }, [section]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="category-landing-section relative group px-1 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipeThreshold = 50;
            if (offset.x < -swipeThreshold) {
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            } else if (offset.x > swipeThreshold) {
              setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
            }
          }}
          className="w-full touch-pan-y"
        >
          <div
            onClick={() => currentBanner.ctaLink && navigate(currentBanner.ctaLink)}
            className="category-landing-banner relative w-full overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] cursor-pointer transition-all active:scale-[0.98] dark:border-white/10 dark:bg-[#0f0f0f]"
          >
            {currentBanner.imageUrl && (
              <div className="relative h-[155px] sm:h-[220px] w-full">
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title || 'Promotional banner'}
                  className="h-full w-full object-cover transition-opacity duration-700"
                  loading="lazy"
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                  style={{ opacity: 0 }}
                />
              </div>
            )}
            
            {(currentBanner.title || currentBanner.subtitle) && (
              <div className={`category-landing-banner-overlay absolute inset-0 flex flex-col justify-center items-start text-left px-6 py-4 ${currentBanner.imageUrl ? 'bg-gradient-to-r from-black/60 via-black/20 to-transparent' : 'bg-white dark:bg-[#121212]'}`}>
                <div className={`${currentBanner.imageUrl ? 'text-white' : 'text-gray-900 dark:text-white'} text-[18px] font-black leading-tight sm:text-2xl mb-1 max-w-[85%] drop-shadow-sm`}>
                  {currentBanner.title}
                </div>
                {currentBanner.subtitle && (
                  <div className={`${currentBanner.imageUrl ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'} text-[12px] sm:text-[15px] font-bold max-w-[80%] mb-1 line-clamp-2`}>
                    {currentBanner.subtitle}
                  </div>
                )}
                
                {section.ctaLabel && (
                  <div
                    className="category-landing-cta-chip mt-2 flex items-center justify-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg active:scale-95 sm:mt-4 sm:px-6 sm:py-2.5 sm:text-[13px]"
                    style={{ backgroundColor: accentColor }}
                  >
                    {section.ctaLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern carousel indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-7 z-20 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${currentIndex === idx ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>


  );
};

export default CategoryPromoBanner;


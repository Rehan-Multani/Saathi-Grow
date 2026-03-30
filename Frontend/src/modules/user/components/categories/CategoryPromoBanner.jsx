import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryPromoBanner = ({ section, accentColor = '#0c831f' }) => {
  const navigate = useNavigate();

  if (!section.imageUrl && !section.title && !section.subtitle) return null;

  return (
    <section className="category-landing-section">
      <button
        onClick={() => section.ctaLink && navigate(section.ctaLink)}
        className="category-landing-banner w-full overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f0f0f] sm:rounded-[28px]"
      >
        {section.imageUrl ? (
          <img
            src={section.mobileImageUrl || section.imageUrl}
            alt={section.title || 'Promotional banner'}
            className="category-landing-banner-image h-full max-h-[170px] w-full object-cover sm:max-h-[240px]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="category-landing-banner-copy px-4 py-5 text-left sm:px-6 sm:py-8">
            <div className="mb-2 text-lg font-black text-gray-900 dark:text-white sm:text-xl">
              {section.title}
            </div>
            {section.subtitle && (
              <div className="text-[12px] text-gray-600 dark:text-gray-300 sm:text-sm">
                {section.subtitle}
              </div>
            )}
            {section.ctaLabel && (
              <div
                className="category-landing-cta-chip mt-4 inline-flex rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white sm:px-4 sm:text-xs"
                style={{ backgroundColor: accentColor }}
              >
                {section.ctaLabel}
              </div>
            )}
          </div>
        )}
      </button>
    </section>
  );
};

export default CategoryPromoBanner;
